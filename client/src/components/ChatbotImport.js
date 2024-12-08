
import React, { useState } from 'react';
import axios from 'axios';

const ChatbotImport = ({ chatbotId }) => {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleImport = async () => {
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      await axios.post(`http://104.156.226.2:6570/api/chatbots/import/${chatbotId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setFile(null);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4">
      <h2 className="text-xl font-semibold mb-4">Import Chatbot Data</h2>
      <input type="file" onChange={handleFileChange} className="mb-4" />
      <button onClick={handleImport} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Import</button>
    </div>
  );
};

export default ChatbotImport;