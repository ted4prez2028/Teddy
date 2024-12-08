
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ChatbotList = () => {
  const [chatbots, setChatbots] = useState([]);

  useEffect(() => {
    const fetchChatbots = async () => {
      const result = await axios.get('http://104.156.226.2:6570/api/chatbots/list');
      setChatbots(result.data);
    };
    fetchChatbots();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Chatbots</h1>
      <Link to="/create" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4 inline-block">Create New Chatbot</Link>
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {chatbots.map(chatbot => (
          <li key={chatbot._id} className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-xl font-semibold">{chatbot.name}</h2>
            <p className="text-gray-600">Version: {chatbot.version}</p>
            <Link to={`/chatbot/${chatbot._id}`} className="text-blue-500 hover:underline">Interact</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatbotList;