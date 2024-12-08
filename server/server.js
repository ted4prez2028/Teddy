import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import chatbotRoutes from './routes/chatbotRoutes.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import multer from 'multer';
import { 
  trainModel, 
  generateResponse, 
  loadModel, 
  saveModel, 
  extractEntities, 
  matchIntent, 
  updateContext, 
  retrieveMemory 
} from './utils/aiUtils.js';

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Multer for file uploads
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/build')));

// MongoDB connection with error handling
mongoose.connect('mongodb+srv://firewire1337:Kp7iP17wF2Pgkfzl@cluster0.lx7ma9a.mongodb.net/myDatabase?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/chatbots', chatbotRoutes);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// Socket.IO setup for handling chatbot communication
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('chat message', async (msg) => {
    try {
      const chatbot = await Chatbot.findById(msg.chatbotId);
      if (!chatbot) return socket.emit('chat response', { error: 'Chatbot not found' });

      const model = await loadModel(chatbot.modelState);
      const entities = extractEntities(msg.userInput, chatbot.entities);
      const intent = matchIntent(msg.userInput, chatbot.intents);
      const context = updateContext(chatbot.context, entities, intent);
      const memory = retrieveMemory(chatbot.memory, context);
      const botResponse = await generateResponse(msg.userInput, model, entities, intent, context, memory);
      
      chatbot.conversationHistory.push({ userInput: msg.userInput, botResponse });
      await chatbot.save();

      socket.emit('chat response', { response: botResponse });
    } catch (err) {
      console.error(err);
      socket.emit('chat response', { error: 'An error occurred while processing the message' });
    }
  });

  socket.on('train', async (data) => {
    try {
      const chatbot = await Chatbot.findById(data.chatbotId);
      if (!chatbot) return socket.emit('train response', { error: 'Chatbot not found' });

      const { newTrainingData, newIntents, newEntities, newFallbackResponses } = data;
      const model = await loadModel(chatbot.modelState);
      await trainModel(model, newTrainingData);
      chatbot.modelState = await saveModel(model);
      chatbot.trainingData = new Map([...chatbot.trainingData, ...newTrainingData]);
      chatbot.intents = [...chatbot.intents, ...newIntents];
      chatbot.entities = [...chatbot.entities, ...newEntities];
      chatbot.fallbackResponses = [...chatbot.fallbackResponses, ...newFallbackResponses];
      chatbot.lastUpdated = new Date();
      await chatbot.save();

      socket.emit('train response', { message: 'Model trained successfully' });
    } catch (err) {
      console.error(err);
      socket.emit('train response', { error: 'An error occurred during training' });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });

  // File import logic
  socket.on('import', upload.single('file'), async (data, callback) => {
    try {
      const chatbot = await Chatbot.findById(data.chatbotId);
      if (!chatbot) return callback({ error: 'Chatbot not found' });

      const file = data.file;
      if (!file) return callback({ error: 'No file uploaded' });

      const fileContent = fs.readFileSync(file.path, 'utf8');
      const importedData = JSON.parse(fileContent);

      chatbot.trainingData = new Map([...chatbot.trainingData, ...importedData.trainingData]);
      chatbot.intents = [...chatbot.intents, ...importedData.intents];
      chatbot.entities = [...chatbot.entities, ...importedData.entities];
      chatbot.fallbackResponses = [...chatbot.fallbackResponses, ...importedData.fallbackResponses];
      chatbot.lastUpdated = new Date();

      await chatbot.save();
      callback({ message: 'Data imported successfully' });
    } catch (err) {
      console.error(err);
      callback({ error: 'An error occurred during import' });
    }
  });

  // File export logic
  socket.on('export', async (data, callback) => {
    try {
      const chatbot = await Chatbot.findById(data.chatbotId);
      if (!chatbot) return callback({ error: 'Chatbot not found' });

      const { type } = data;
      let exportData;

      switch (type) {
        case 'json':
          exportData = JSON.stringify(chatbot.toJSON(), null, 2);
          break;
        case 'csv':
          exportData = json2csv(chatbot.toJSON(), { fields: Object.keys(chatbot.toJSON()) });
          break;
        case 'xml':
          const builder = new xml2js.Builder();
          exportData = builder.buildObject(chatbot.toJSON());
          break;
        default:
          return callback({ error: 'Invalid export type' });
      }

      const filename = `chatbot_${chatbot._id}.${type}`;
      fs.writeFileSync(path.join(__dirname, 'exports', filename), exportData);
      callback({ message: 'Data exported successfully', filename });
    } catch (err) {
      console.error(err);
      callback({ error: 'An error occurred during export' });
    }
  });

  // Visualize chatbot data
  socket.on('visualize', async (data, callback) => {
    try {
      const chatbot = await Chatbot.findById(data.chatbotId);
      if (!chatbot) return callback({ error: 'Chatbot not found' });

      const visualizationData = chatbot.intents.map(intent => ({
        id: intent.intent,
        group: 1,
        links: intent.responses.map(response => ({ target: response, value: 1 }))
      }));

      callback({ data: visualizationData });
    } catch (err) {
      console.error(err);
      callback({ error: 'An error occurred while visualizing data' });
    }
  });
});

// Server setup and port binding
const PORT = process.env.PORT || 6670;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
