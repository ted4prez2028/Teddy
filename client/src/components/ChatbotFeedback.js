
import React, { useState } from 'react';
import axios from 'axios';

const ChatbotFeedback = ({ chatbotId }) => {
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(5); // Default rating

  const handleSubmit = async (event) => {
    event.preventDefault();
    await axios.post(`http://104.156.226.2:6570/api/chatbots/feedback/${chatbotId}`, { feedback, rating });
    setFeedback('');
    setRating(5); // Reset rating
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4">
      <h2 className="text-xl font-semibold mb-4">Feedback</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea 
          value={feedback} 
          onChange={(e) => setFeedback(e.target.value)} 
          placeholder="Provide your feedback here..." 
          className="w-full p-2 border border-gray-300 rounded"
        />
        <div>
          <label className="block mb-2">Rating:</label>
          <select 
            value={rating} 
            onChange={(e) => setRating(parseInt(e.target.value))} 
            className="p-2 border border-gray-300 rounded"
          >
            {[1, 2, 3, 4, 5].map((num) => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Submit Feedback</button>
      </form>
    </div>
  );
};

export default ChatbotFeedback;