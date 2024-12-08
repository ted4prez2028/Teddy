import express from 'express';
import Chatbot from '../models/chatbotModel.js';
import { 
  trainModel, 
  generateResponse, 
  loadModel, 
  saveModel, 
  extractEntities, 
  matchIntent, 
  updateContext, 
  retrieveMemory,
  createModel
  
} from '../utils/aiUtils.js';
import { parse as json2csv } from 'json2csv';
import xml2js from 'xml2js';
import multer from 'multer';
import schedule from 'node-schedule';
import fs from 'fs';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/create', async (req, res) => {
  const chatbot = new Chatbot(req.body);
  const model = await createModel(chatbot);
  chatbot.modelState = await saveModel(model);
  await chatbot.save();
  res.status(201).json(chatbot);
});

router.get('/list', async (req, res) => {
  const chatbots = await Chatbot.find();
  res.json(chatbots);
});

router.put('/update/:id', async (req, res) => {
  const chatbot = await Chatbot.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(chatbot);
});

router.delete('/delete/:id', async (req, res) => {
  await Chatbot.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

router.post('/interact/:id', async (req, res) => {
  const chatbot = await Chatbot.findById(req.params.id);
  if (!chatbot) return res.status(404).send('Chatbot not found');

  const { userInput } = req.body;
  const model = await loadModel(chatbot.modelState);
  const entities = extractEntities(userInput, chatbot.entities);
  const intent = matchIntent(userInput, chatbot.intents);
  const context = updateContext(chatbot.context, entities, intent);
  const memory = retrieveMemory(chatbot.memory, context);
  const botResponse = await generateResponse(userInput, model, entities, intent, context, memory);
  chatbot.conversationHistory.push({ userInput, botResponse });
  chatbot.analytics.totalInteractions += 1;
  chatbot.analytics.avgResponseTime = calculateAvgResponseTime(chatbot.conversationHistory);
  chatbot.analytics.mostCommonIntent = calculateMostCommonIntent(chatbot.conversationHistory);
  chatbot.analytics.lastInteraction = new Date();
  await chatbot.save();

  res.json({ response: botResponse });
});

router.post('/train/:id', async (req, res) => {
  const chatbot = await Chatbot.findById(req.params.id);
  if (!chatbot) return res.status(404).send('Chatbot not found');

  const { newTrainingData, newIntents, newEntities, newFallbackResponses } = req.body;
  const model = await loadModel(chatbot.modelState);
  await trainModel(model, newTrainingData);
  chatbot.modelState = await saveModel(model);
  chatbot.trainingData = new Map([...chatbot.trainingData, ...newTrainingData]);
  chatbot.intents = [...chatbot.intents, ...newIntents];
  chatbot.entities = [...chatbot.entities, ...newEntities];
  chatbot.fallbackResponses = [...chatbot.fallbackResponses, ...newFallbackResponses];
  chatbot.lastUpdated = new Date();
  await chatbot.save();

  res.status(200).json({ message: 'Model trained successfully' });
});

router.get('/history/:id', async (req, res) => {
  const chatbot = await Chatbot.findById(req.params.id);
  if (!chatbot) return res.status(404).send('Chatbot not found');

  res.json(chatbot.conversationHistory);
});

router.post('/feedback/:id', async (req, res) => {
  const chatbot = await Chatbot.findById(req.params.id);
  if (!chatbot) return res.status(404).send('Chatbot not found');

  const { feedback, rating } = req.body;
  chatbot.feedback.push({ feedback, rating });
  chatbot.analytics.userSatisfactionRate = calculateSatisfactionRate(chatbot.feedback);
  await chatbot.save();

  res.status(200).json({ message: 'Feedback received' });
});

router.get('/analytics/:id', async (req, res) => {
  const chatbot = await Chatbot.findById(req.params.id);
  if (!chatbot) return res.status(404).send('Chatbot not found');

  res.json(chatbot.analytics);
});

router.get('/export/:id', async (req, res) => {
  const chatbot = await Chatbot.findById(req.params.id);
  if (!chatbot) return res.status(404).send('Chatbot not found');

  const { type } = req.query;
  let data;

  switch (type) {
    case 'json':
      data = JSON.stringify(chatbot.toJSON(), null, 2);
      res.setHeader('Content-Type', 'application/json');
      break;
    case 'csv':
      data = json2csv(chatbot.toJSON(), { fields: Object.keys(chatbot.toJSON()) });
      res.setHeader('Content-Type', 'text/csv');
      break;
    case 'xml':
      const builder = new xml2js.Builder();
      data = builder.buildObject(chatbot.toJSON());
      res.setHeader('Content-Type', 'application/xml');
      break;
    default:
      return res.status(400).send('Invalid export type');
  }

  res.attachment(`chatbot_${chatbot._id}.${type}`);
  res.send(data);
});

router.post('/import/:id', upload.single('file'), async (req, res) => {
  const chatbot = await Chatbot.findById(req.params.id);
  if (!chatbot) return res.status(404).send('Chatbot not found');

  const file = req.file;
  if (!file) return res.status(400).send('No file uploaded');

  const fileContent = fs.readFileSync(file.path, 'utf8');
  const importedData = JSON.parse(fileContent);

  chatbot.trainingData = new Map([...chatbot.trainingData, ...importedData.trainingData]);
  chatbot.intents = [...chatbot.intents, ...importedData.intents];
  chatbot.entities = [...chatbot.entities, ...importedData.entities];
  chatbot.fallbackResponses = [...chatbot.fallbackResponses, ...importedData.fallbackResponses];
  chatbot.lastUpdated = new Date();

  await chatbot.save();
  res.status(200).json({ message: 'Data imported successfully' });
});

router.get('/visualize/:id', async (req, res) => {
  const chatbot = await Chatbot.findById(req.params.id);
  if (!chatbot) return res.status(404).send('Chatbot not found');

  const data = chatbot.intents.map(intent => ({
    id: intent.intent,
    group: 1,
    links: intent.responses.map(response => ({ target: response, value: 1 }))
  }));

  res.json(data);
});

router.post('/schedule/:id', async (req, res) => {
  const chatbot = await Chatbot.findById(req.params.id);
  if (!chatbot) return res.status(404).send('Chatbot not found');

  const { task, schedule: taskSchedule } = req.body;
  chatbot.scheduledTasks.push({ task, schedule: taskSchedule });
  await chatbot.save();

  schedule.scheduleJob(taskSchedule, async () => {
    console.log(`Executing scheduled task: ${task}`);
  });

  res.status(200).json({ message: 'Task scheduled successfully' });
});

router.post('/plugin/:id', async (req, res) => {
  const chatbot = await Chatbot.findById(req.params.id);
  if (!chatbot) return res.status(404).send('Chatbot not found');

  const { name, endpoint } = req.body;
  chatbot.plugins.push({ name, endpoint });
  await chatbot.save();

  res.status(200).json({ message: 'Plugin added successfully' });
});

function calculateAvgResponseTime(history) {
  // Implementation for calculating average response time
}

function calculateMostCommonIntent(history) {
  // Implementation for finding the most common intent
}

function calculateSatisfactionRate(feedback) {
  // Implementation for calculating user satisfaction rate
}

export default router;
