```javascript
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ChatbotList from './components/ChatbotList';
import ChatbotInteraction from './components/ChatbotInteraction';
import ChatbotCreation from './components/ChatbotCreation';
import 'tailwindcss/tailwind.css';
import './index.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<ChatbotList />} />
          <Route path="/chatbot/:id" element={<ChatbotInteraction />} />
          <Route path="/create" element={<ChatbotCreation />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;