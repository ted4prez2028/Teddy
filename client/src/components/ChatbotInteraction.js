
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import ChatbotSettings from './ChatbotSettings';
import ChatbotFeedback from './ChatbotFeedback';
import ChatbotAnalytics from './ChatbotAnalytics';
import ChatbotVoice from './ChatbotVoice';
import ChatbotExport from './ChatbotExport';
import ChatbotImport from './ChatbotImport';
import ChatbotVisualizer from './ChatbotVisualizer';

const ChatbotInteraction = () => {
  const [userInput, setUserInput] = useState('');
  const [botResponse, setBotResponse] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isVisualizerOpen, setIsVisualizerOpen] = useState(false);
  const { id } = useParams();
  const chatHistoryRef = useRef(null);

  useEffect(() => {
    const fetchChatHistory = async () => {
      const response = await axios.get(`http://104.156.226.2:6570/api/chatbots/history/${id}`);
      setChatHistory(response.data);
    };
    fetchChatHistory();
  }, [id]);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const response = await axios.post(`http://104.156.226.2:6570/api/chatbots/interact/${id}`, { userInput });
    setBotResponse(response.data.response);
    setChatHistory([...chatHistory, { user: userInput, bot: response.data.response }]);
    setUserInput('');
  };

  const handleTrain = async () => {
    const newTrainingData = new Map([['Hello', 'Hi there!'], ['Goodbye', 'See you later!']]);
    const newIntents = [{ intent: 'greeting', responses: ['Hello!', 'Hi there!'], confidenceThreshold: 0.8 }];
    const newEntities = [{ entity: 'name', synonyms: ['name', 'username'], regex: '^[A-Za-z]+$' }];
    const newFallbackResponses = ['I am not sure what you mean. Can you rephrase?'];
    await axios.post(`http://104.156.226.2:6570/api/chatbots/train/${id}`, { newTrainingData, newIntents, newEntities, newFallbackResponses });
  };

  const toggleSettings = () => setIsSettingsOpen(!isSettingsOpen);
  const toggleFeedback = () => setIsFeedbackOpen(!isFeedbackOpen);
  const toggleAnalytics = () => setIsAnalyticsOpen(!isAnalyticsOpen);
  const toggleVoice = () => setIsVoiceOpen(!isVoiceOpen);
  const toggleExport = () => setIsExportOpen(!isExportOpen);
  const toggleImport = () => setIsImportOpen(!isImportOpen);
  const toggleVisualizer = () => setIsVisualizerOpen(!isVisualizerOpen);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Chatbot Interaction</h1>
      <div className="flex flex-wrap space-x-2 mb-4">
        <button onClick={toggleSettings} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Settings</button>
        <button onClick={toggleFeedback} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">Feedback</button>
        <button onClick={toggleAnalytics} className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">Analytics</button>
        <button onClick={toggleVoice} className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">Voice</button>
        <button onClick={toggleExport} className="bg-teal-500 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded">Export</button>
        <button onClick={toggleImport} className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded">Import</button>
        <button onClick={toggleVisualizer} className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded">Visualizer</button>
      </div>
      {isSettingsOpen && <ChatbotSettings chatbotId={id} />}
      {isFeedbackOpen && <ChatbotFeedback chatbotId={id} />}
      {isAnalyticsOpen && <ChatbotAnalytics chatbotId={id} />}
      {isVoiceOpen && <ChatbotVoice chatbotId={id} />}
      {isExportOpen && <ChatbotExport chatbotId={id} />}
      {isImportOpen && <ChatbotImport chatbotId={id} />}
      {isVisualizerOpen && <ChatbotVisualizer chatbotId={id} />}
      <div ref={chatHistoryRef} className="mb-4 h-64 overflow-y-auto border border-gray-300 rounded p-2">
        {chatHistory.map((chat, index) => (
          <div key={index} className="mb-2">
            <p className="text-blue-500">User: {chat.user}</p>
            <p className="text-green-500">Bot: {chat.bot}</p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="mb-4">
        <input 
          type="text" 
          value={userInput} 
          onChange={(e) => setUserInput(e.target.value)} 
          placeholder="Type your message" 
          className="w-full p-2 border border-gray-300 rounded"
        />
        <button type="submit" className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Send</button>
      </form>
      <button onClick={handleTrain} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Train Chatbot</button>
      {botResponse && <p className="mt-4 p-4 bg-gray-200 rounded">{botResponse}</p>}
    </div>
  );
};

export default ChatbotInteraction;