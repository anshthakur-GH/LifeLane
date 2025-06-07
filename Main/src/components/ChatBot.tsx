import React, { useState, useRef, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import BotLogo from '../assets/Bot-Logo.png';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasWelcomed = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send welcome message when chat is opened
  useEffect(() => {
    if (isOpen && !hasWelcomed.current) {
      setMessages([
        {
          role: 'assistant',
          content: "Hi there! I'm LifeLaneBot. How can I help you today?"
        }
      ]);
      hasWelcomed.current = true;
    }
    if (!isOpen) {
      hasWelcomed.current = false;
      setMessages([]);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage, { role: 'assistant', content: 'Replying...' }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage]
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      setMessages(prev => {
        // Replace the last assistant message ("Replying...") with the real reply
        const updated = [...prev];
        const lastIndex = updated.map(m => m.role).lastIndexOf('assistant');
        if (lastIndex !== -1 && updated[lastIndex].content === 'Replying...') {
          updated[lastIndex] = { role: 'assistant', content: data.message.content || 'Sorry, I could not process your request.' };
        } else {
          updated.push({ role: 'assistant', content: data.message.content || 'Sorry, I could not process your request.' });
        }
        return updated;
      });
    } catch (error) {
      setMessages(prev => {
        // Replace the last assistant message ("Replying...") with the error
        const updated = [...prev];
        const lastIndex = updated.map(m => m.role).lastIndexOf('assistant');
        if (lastIndex !== -1 && updated[lastIndex].content === 'Replying...') {
          updated[lastIndex] = { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' };
        } else {
          updated.push({ role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' });
        }
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary text-white p-4 rounded-full shadow-lg hover:bg-opacity-90 transition-all flex items-center justify-center w-16 h-16"
        >
          <img src={BotLogo} alt="Bot Logo" className="w-12 h-12 object-contain" />
        </button>
      ) : (
        <div className="bg-white rounded-lg shadow-xl w-96 h-[500px] flex flex-col">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold text-header">LifeLane Assistant</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="bg-primary text-white p-2 rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}; 