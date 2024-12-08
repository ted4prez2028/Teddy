
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ChatbotCreation = () => {
  const [formData, setFormData] = useState({
    name: '',
    version: '',
    capabilities: '',
    intents: '',
    entities: '',
    fallbackResponses: '',
    modelType: 'transformer',
    hyperparameters: {
      hiddenLayers: 2,
      neuronsPerLayer: 128,
      dropoutRate: 0.2,
      attentionHeads: 8,
      embeddingSize: 512,
      maxSequenceLength: 100,
      learningRateDecay: 0.99,
      batchSize: 32
    }
  });
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const capabilitiesArray = formData.capabilities.split(',').map(item => item.trim());
    const intentsArray = formData.intents.split(',').map(item => ({ intent: item.trim(), responses: [] }));
    const entitiesArray = formData.entities.split(',').map(item => ({ entity: item.trim(), synonyms: [], regex: '' }));
    const fallbackResponsesArray = formData.fallbackResponses.split(',').map(item => item.trim());

    const chatbotData = {
      ...formData,
      capabilities: capabilitiesArray,
      intents: intentsArray,
      entities: entitiesArray,
      fallbackResponses: fallbackResponsesArray
    };

    try {
      await axios.post('http://104.156.226.2:6570/api/chatbots/create', chatbotData);
      toast.success('Chatbot created successfully!');
      navigate('/');
    } catch (error) {
      toast.error('Failed to create chatbot. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Create New Chatbot</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          type="text" 
          value={formData.name} 
          onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
          placeholder="Chatbot Name" 
          className="w-full p-2 border border-gray-300 rounded"
          required
        />
        <input 
          type="text" 
          value={formData.version} 
          onChange={(e) => setFormData({ ...formData, version: e.target.value })} 
          placeholder="Version" 
          className="w-full p-2 border border-gray-300 rounded"
          required
        />
        <input 
          type="text" 
          value={formData.capabilities} 
          onChange={(e) => setFormData({ ...formData, capabilities: e.target.value })} 
          placeholder="Capabilities (comma separated)" 
          className="w-full p-2 border border-gray-300 rounded"
          required
        />
        <input 
          type="text" 
          value={formData.intents} 
          onChange={(e) => setFormData({ ...formData, intents: e.target.value })} 
          placeholder="Intents (comma separated)" 
          className="w-full p-2 border border-gray-300 rounded"
          required
        />
        <input 
          type="text" 
          value={formData.entities} 
          onChange={(e) => setFormData({ ...formData, entities: e.target.value })} 
          placeholder="Entities (comma separated)" 
          className="w-full p-2 border border-gray-300 rounded"
          required
        />
        <input 
          type="text" 
          value={formData.fallbackResponses} 
          onChange={(e) => setFormData({ ...formData, fallbackResponses: e.target.value })} 
          placeholder="Fallback Responses (comma separated)" 
          className="w-full p-2 border border-gray-300 rounded"
          required
        />
        <select 
          value={formData.modelType} 
          onChange={(e) => setFormData({ ...formData, modelType: e.target.value })} 
          className="w-full p-2 border border-gray-300 rounded"
        >
          <option value="transformer">Transformer</option>
          <option value="lstm">LSTM</option>
          <option value="gru">GRU</option>
        </select>
        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Create Chatbot</button>
      </form>
    </div>
  );
};

export default ChatbotCreation;