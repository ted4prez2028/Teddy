import mongoose from 'mongoose';

const ChatbotSchema = new mongoose.Schema({
  name: { type: String, required: true },
  version: { type: String, required: true },
  capabilities: [String],
  trainingData: {
    type: Map,
    of: String
  },
  lastUpdated: { type: Date, default: Date.now },
  conversationHistory: [{
    userInput: String,
    botResponse: String,
    timestamp: { type: Date, default: Date.now }
  }],
  active: { type: Boolean, default: true },
  learningRate: { type: Number, default: 0.01 },
  modelType: { type: String, enum: ['transformer', 'lstm', 'gru'], default: 'transformer' },
  hyperparameters: {
    hiddenLayers: { type: Number, default: 2 },
    neuronsPerLayer: { type: Number, default: 128 },
    dropoutRate: { type: Number, default: 0.2 },
    attentionHeads: { type: Number, default: 8 },
    embeddingSize: { type: Number, default: 512 },
    maxSequenceLength: { type: Number, default: 100 },
    learningRateDecay: { type: Number, default: 0.99 },
    batchSize: { type: Number, default: 32 }
  },
  modelState: {
    type: Buffer,
    required: true
  },
  intents: [{
    intent: String,
    responses: [String],
    confidenceThreshold: { type: Number, default: 0.7 }
  }],
  entities: [{
    entity: String,
    synonyms: [String],
    regex: String
  }],
  fallbackResponses: [String],
  context: {
    type: Map,
    of: String
  },
  memory: {
    type: Map,
    of: String
  },
  feedback: [{
    feedback: String,
    rating: Number,
    timestamp: { type: Date, default: Date.now }
  }],
  analytics: {
    totalInteractions: { type: Number, default: 0 },
    uniqueUsers: { type: Number, default: 0 },
    avgResponseTime: { type: Number, default: 0 },
    mostCommonIntent: { type: String, default: '' },
    userSatisfactionRate: { type: Number, default: 0 },
    lastInteraction: { type: Date, default: Date.now }
  },
  scheduledTasks: [{
    task: String,
    schedule: String,
    lastRun: { type: Date, default: Date.now }
  }],
  plugins: [{
    name: String,
    endpoint: String,
    active: { type: Boolean, default: true }
  }]
});

const Chatbot = mongoose.model('Chatbot', ChatbotSchema);

export default Chatbot;
