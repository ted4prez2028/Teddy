
import React, { useState } from 'react';
import axios from 'axios';

const ChatbotSettings = ({ chatbotId }) => {
  const [formData, setFormData] = useState({
    learningRate: 0.01,
    dropoutRate: 0.2,
    batchSize: 32,
    maxSequenceLength: 100
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    await axios.put(`http://104.156.226.2:6570/api/chatbots/update/${chatbotId}`, formData);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4">
      <h2 className="text-xl font-semibold mb-4">Chatbot Settings</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          type="number" 
          value={formData.learningRate} 
          onChange={(e) => setFormData({ ...formData, learningRate: parseFloat(e.target.value) })} 
          placeholder="Learning Rate" 
          className="w-full p-2 border border-gray-300 rounded"
        />
        <input 
          type="number" 
          value={formData.dropoutRate} 
          onChange={(e) => setFormData({ ...formData, dropoutRate: parseFloat(e.target.value) })} 
          placeholder="Dropout Rate" 
          className="w-full p-2 border border-gray-300 rounded"
        />
        <input 
          type="number" 
          value={formData.batchSize} 
          onChange={(e) => setFormData({ ...formData, batchSize: parseInt(e.target.value) })} 
          placeholder="Batch Size" 
          className="w-full p-2 border border-gray-300 rounded"
        />
        <input 
          type="number" 
          value={formData.maxSequenceLength} 
          onChange={(e) => setFormData({ ...formData, maxSequenceLength: parseInt(e.target.value) })} 
          placeholder="Max Sequence Length" 
          className="w-full p-2 border border-gray-300 rounded"
        />
        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Update Settings</button>
      </form>
    </div>
  );
};

export default ChatbotSettings;