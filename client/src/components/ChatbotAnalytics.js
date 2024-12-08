
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ChatbotAnalytics = ({ chatbotId }) => {
  const [analyticsData, setAnalyticsData] = useState({});

  useEffect(() => {
    const fetchAnalytics = async () => {
      const response = await axios.get(`http://104.156.226.2:6570/api/chatbots/analytics/${chatbotId}`);
      setAnalyticsData(response.data);
    };
    fetchAnalytics();
  }, [chatbotId]);

  const data = {
    labels: ['Total Interactions', 'Unique Users', 'Avg Response Time', 'User Satisfaction Rate'],
    datasets: [{
      label: 'Analytics',
      data: [analyticsData.totalInteractions, analyticsData.uniqueUsers, analyticsData.avgResponseTime, analyticsData.userSatisfactionRate],
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)'
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)'
      ],
      borderWidth: 1
    }]
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4">
      <h2 className="text-xl font-semibold mb-4">Chatbot Analytics</h2>
      <Bar data={data} />
    </div>
  );
};

export default ChatbotAnalytics;