
import React, { useState } from 'react';
import axios from 'axios';

const ChatbotExport = ({ chatbotId }) => {
  const [exportType, setExportType] = useState('json');

  const handleExport = async () => {
    const response = await axios.get(`http://104.156.226.2:6570/api/chatbots/export/${chatbotId}?type=${exportType}`);
    const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chatbot_${chatbotId}.${exportType}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4">
      <h2 className="text-xl font-semibold mb-4">Export Chatbot Data</h2>
      <div className="mb-4">
        <label className="block mb-2">Export Format:</label>
        <select 
          value={exportType} 
          onChange={(e) => setExportType(e.target.value)} 
          className="p-2 border border-gray-300 rounded"
        >
          <option value="json">JSON</option>
          <option value="csv">CSV</option>
          <option value="xml">XML</option>
        </select>
      </div>
      <button onClick={handleExport} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Export</button>
    </div>
  );
};

export default ChatbotExport;