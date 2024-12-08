
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ChatbotVoice = ({ chatbotId }) => {
  const [isListening, setIsListening] = useState(false);
  const [voiceInput, setVoiceInput] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            setVoiceInput(event.results[i][0].transcript);
          }
        }
      };
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleVoiceSubmit = async () => {
    if (voiceInput) {
      const response = await axios.post(`http://104.156.226.2:6570/api/chatbots/interact/${chatbotId}`, { userInput: voiceInput });
      // Here you would typically update the chat history or display the response
      setVoiceInput('');
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4">
      <h2 className="text-xl font-semibold mb-4">Voice Interaction</h2>
      <div className="mb-4">
        <button 
          onClick={isListening ? stopListening : startListening} 
          className={`bg-${isListening ? 'red' : 'green'}-500 hover:bg-${isListening ? 'red' : 'green'}-700 text-white font-bold py-2 px-4 rounded`}
        >
          {isListening ? 'Stop Listening' : 'Start Listening'}
        </button>
      </div>
      <p className="mb-2">Voice Input: {voiceInput}</p>
      <button onClick={handleVoiceSubmit} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Submit Voice Input</button>
    </div>
  );
};

export default ChatbotVoice;