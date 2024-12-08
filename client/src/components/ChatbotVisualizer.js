
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as d3 from 'd3';

const ChatbotVisualizer = ({ chatbotId }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get(`http://104.156.226.2:6570/api/chatbots/visualize/${chatbotId}`);
      setData(response.data);
    };
    fetchData();
  }, [chatbotId]);

  useEffect(() => {
    if (data.length > 0) {
      const svg = d3.select("#visualization").append("svg")
        .attr("width", 800)
        .attr("height", 600);

      const nodes = data.map(d => ({ id: d.id, group: d.group }));
      const links = data.flatMap(d => d.links.map(l => ({ source: d.id, target: l })));

      const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(400, 300));

      const link = svg.append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke-width", d => Math.sqrt(d.value));

      const node = svg.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", 5)
        .attr("fill", d => d3.schemeCategory10[d.group]);

      node.append("title")
        .text(d => d.id);

      simulation.on("tick", () => {
        link
          .attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y);

        node
          .attr("cx", d => d.x)
          .attr("cy", d => d.y);
      });
    }
  }, [data]);

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4">
      <h2 className="text-xl font-semibold mb-4">Chatbot Visualization</h2>
      <div id="visualization"></div>
    </div>
  );
};

export default ChatbotVisualizer;