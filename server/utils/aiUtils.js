import '@tensorflow/tfjs-node';
import * as Transformers from '@xenova/transformers';
import natural from 'natural';
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;
const stopwords = natural.stopwords;

async function createModel(chatbot) {
  const model = new Transformers({
    vocabSize: 10000,
    dModel: chatbot.hyperparameters.embeddingSize,
    nHeads: chatbot.hyperparameters.attentionHeads,
    dff: chatbot.hyperparameters.neuronsPerLayer * 4,
    nLayers: chatbot.hyperparameters.hiddenLayers,
    dropoutRate: chatbot.hyperparameters.dropoutRate,
    maxSequenceLength: chatbot.hyperparameters.maxSequenceLength
  });
  return model;
}

async function trainModel(model, newTrainingData) {
  const { inputs, labels } = prepareTrainingData(newTrainingData);
  await model.fit(inputs, labels, {
    epochs: 10,
    batchSize: chatbot.hyperparameters.batchSize,
    validationSplit: 0.2,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        console.log(`Epoch ${epoch}: loss = ${logs.loss}`);
      }
    }
  });
}

async function generateResponse(userInput, model, entities, intent, context, memory) {
  const inputTensor = tf.tensor2d([processInput(userInput)]);
  const prediction = model.predict(inputTensor);
  let response = decodeOutput(prediction);
  if (intent) {
    response = replacePlaceholders(response, entities, intent, context, memory);
  } else {
    response = selectFallbackResponse(chatbot.fallbackResponses);
  }
  return response;
}

function prepareTrainingData(data) {
  const inputs = [];
  const labels = [];

  for (let [input, output] of data) {
    inputs.push(processInput(input));
    labels.push(processOutput(output));
  }

  return { inputs, labels };
}

function processInput(input) {
  const tokens = tokenizer.tokenize(input.toLowerCase());
  const stemmedTokens = tokens.map(token => stemmer.stem(token));
  const filteredTokens = stemmedTokens.filter(token => !stopwords.includes(token));
  return filteredTokens;
}

function processOutput(output) {
  return tokenizer.tokenize(output.toLowerCase());
}

function decodeOutput(output) {
  return output.dataSync().map(index => String.fromCharCode(index + 32)).join('');
}

function extractEntities(input, entities) {
  const extracted = {};
  for (let entity of entities) {
    const regex = new RegExp(entity.regex, 'i');
    const match = input.match(regex);
    if (match) {
      extracted[entity.entity] = match[0];
    }
  }
  return extracted;
}

function matchIntent(input, intents) {
  const processedInput = processInput(input);
  let bestMatch = null;
  let highestConfidence = 0;

  for (let intent of intents) {
    const confidence = calculateIntentConfidence(processedInput, intent);
    if (confidence > highestConfidence) {
      highestConfidence = confidence;
      bestMatch = intent;
    }
  }

  if (highestConfidence >= bestMatch.confidenceThreshold) {
    return bestMatch;
  }
  return null;
}

function calculateIntentConfidence(input, intent) {
  const intentTokens = processInput(intent.intent);
  const intersection = input.filter(token => intentTokens.includes(token));
  return intersection.length / Math.max(input.length, intentTokens.length);
}

function replacePlaceholders(response, entities, intent, context, memory) {
  let modifiedResponse = response;
  for (let [key, value] of Object.entries(entities)) {
    modifiedResponse = modifiedResponse.replace(`{${key}}`, value);
  }
  for (let [key, value] of context) {
    modifiedResponse = modifiedResponse.replace(`{${key}}`, value);
  }
  for (let [key, value] of memory) {
    modifiedResponse = modifiedResponse.replace(`{${key}}`, value);
  }
  return modifiedResponse;
}

function updateContext(context, entities, intent) {
  for (let [key, value] of Object.entries(entities)) {
    context.set(key, value);
  }
  if (intent) {
    context.set('lastIntent', intent.intent);
  }
  return context;
}

function retrieveMemory(memory, context) {
  const relevantMemory = new Map();
  for (let [key, value] of context) {
    if (memory.has(key)) {
      relevantMemory.set(key, memory.get(key));
    }
  }
  return relevantMemory;
}

function selectFallbackResponse(fallbackResponses) {
  return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
}

async function saveModel(model) {
  return await model.save('file://./model');
}

async function loadModel(modelState) {
  return await tf.loadLayersModel(tf.io.browserFiles([modelState]));
}

export { 
  trainModel, 
  generateResponse, 
  createModel, 
  saveModel, 
  loadModel, 
  extractEntities, 
  matchIntent, 
  updateContext, 
  retrieveMemory 
};
