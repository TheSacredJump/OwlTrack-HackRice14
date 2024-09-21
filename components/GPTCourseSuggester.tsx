import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaSpinner } from 'react-icons/fa';

const GPTCourseSuggester = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Replace this with your actual API call to the GPT model
      const response = await fetch('/api/gpt-course-suggester', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      const botMessage = { text: data.message, sender: 'bot' };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = { text: 'Sorry, I encountered an error. Please try again.', sender: 'bot' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full mx-auto bg-navy rounded-lg overflow-hidden">
      <div className="bg-modal border-b border-outline/50 p-4">
        <h2 className="text-2xl font-bold text-milk">AI Course Suggester and Academic/Career Chatbot</h2>
      </div>
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-3/4 p-3 rounded-lg ${message.sender === 'user' ? 'bg-navy text-milk' : 'bg-modal border border-outline/50 text-owl'}`}>
              {message.text}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-4 bg-navy">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about future course reccomendations or any academic/career question you have..."
            className="flex-grow p-2 rounded-lg bg-highlight border border-outline/50 text-milk focus:outline-none focus:ring-2 focus:ring-highlight"
          />
          <button 
            type="submit" 
            className="p-2 bg-highlight text-owl rounded-lg hover:bg-highlight/80 focus:outline-none focus:ring-2 focus:ring-highlight"
            disabled={isLoading}
          >
            {isLoading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GPTCourseSuggester;