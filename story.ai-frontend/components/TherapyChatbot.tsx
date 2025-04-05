"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Settings, Paperclip, Mic, Send } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export default function TherapyChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your AI therapy companion. How are you feeling today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [selectedTone, setSelectedTone] = useState<'Supportive' | 'Neutral' | 'Deep Reflection'>('Supportive');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const suggestedStarters = [
    "What's on your mind today?",
    "Would you like help reframing a negative thought?",
    "How did your day go?"
  ];

  const quickReplies = [
    { label: "I need guidance", icon: "🧠" },
    { label: "I want to journal", icon: "📖" },
    { label: "Help me relax", icon: "🌿" }
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const simulateAiResponse = (userMessage: string) => {
    setIsAiTyping(true);
    
    const containsNegativeWords = /sad|anxious|stressed|depressed|worried|upset/i.test(userMessage);
    const containsReflectiveWords = /think|reflect|wonder|consider|understand|learn/i.test(userMessage);
    
    setTimeout(() => {
      let response = '';
      
      if (containsNegativeWords) {
        response = "I notice you might be feeling down. Would it help to take a moment and practice some mindfulness? Try taking three deep breaths with me.";
      } else if (containsReflectiveWords) {
        response = "That's a thoughtful perspective. What led you to this insight? How does this relate to your experiences from the past week?";
      } else {
        const responses = [
          "Thank you for sharing that with me. Could you tell me more about how that makes you feel?",
          "I appreciate your openness. How has this been affecting your daily life?",
          "That's interesting. What thoughts come up for you when you consider this situation?"
        ];
        response = responses[Math.floor(Math.random() * responses.length)];
      }
      
      setMessages(prev => [...prev, {
        id: prev.length + 2,
        text: response,
        sender: 'ai',
        timestamp: new Date()
      }]);
      
      setIsAiTyping(false);
      setShowSuggestions(false);
    }, 1500);
  };

  const handleSendMessage = () => {
    if (inputText.trim() === '') return;
    
    const newMessage: Message = {
      id: messages.length + 1,
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    simulateAiResponse(inputText);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    const newMessage: Message = {
      id: messages.length + 1,
      text: suggestion,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    simulateAiResponse(suggestion);
  };

  const handleQuickReplyClick = (reply: string) => {
    const newMessage: Message = {
      id: messages.length + 1,
      text: reply,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    simulateAiResponse(reply);
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-slate-900">
      <div className="p-4 border-b border-slate-700 bg-slate-800/70 backdrop-blur-sm">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">Your AI Therapy Companion</h2>
            <p className="text-sm text-slate-400">A safe space to talk, reflect, and gain insights</p>
          </div>
          <div className="relative group">
            <button className="p-2 rounded-full hover:bg-slate-700/50 text-slate-300">
              <Settings className="h-5 w-5" />
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-md shadow-lg p-2 hidden group-hover:block z-10 border border-slate-700">
              <p className="text-sm font-medium text-white mb-2">AI Tone:</p>
              {(['Supportive', 'Neutral', 'Deep Reflection'] as const).map((tone) => (
                <div 
                  key={tone} 
                  className={`p-2 rounded-md cursor-pointer ${selectedTone === tone ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-300 hover:bg-slate-700/50'}`}
                  onClick={() => setSelectedTone(tone)}
                >
                  {tone}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
          >
            <div 
              className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl rounded-lg p-3 ${
                message.sender === 'user' 
                  ? 'bg-slate-800/70 text-slate-300' 
                  : 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              }`}
            >
              {message.text}
              <div className="text-xs text-slate-400 mt-1">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        
        {isAiTyping && (
          <div className="flex justify-start">
            <div className="bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg p-3 max-w-xs">
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        {showSuggestions && messages.length < 3 && (
          <div className="my-4">
            <p className="text-slate-400 text-sm mb-2">Not sure where to start? Try one of these:</p>
            <div className="space-y-2">
              {suggestedStarters.map((starter, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleSuggestionClick(starter)}
                  className="p-2 rounded-md bg-slate-800/50 border border-slate-700 text-slate-300 cursor-pointer hover:bg-slate-700/50 transition-colors"
                >
                  {starter}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {!isAiTyping && messages.length > 1 && messages.length < 5 && (
          <div className="flex flex-wrap gap-2 my-4">
            {quickReplies.map((reply, idx) => (
              <button 
                key={idx}
                onClick={() => handleQuickReplyClick(reply.label)}
                className="px-3 py-2 bg-slate-800/50 rounded-full border border-slate-700 text-slate-300 hover:bg-slate-700/50 transition-colors"
              >
                {reply.icon} {reply.label}
              </button>
            ))}
          </div>
        )}
        
        <div ref={chatEndRef} />
      </div>
      
      <div className="p-4 border-t border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <div className="flex items-center">
          <button className="p-2 rounded-full hover:bg-slate-700/50 text-slate-300 mr-2">
            <Paperclip className="h-5 w-5" />
          </button>
          <button className="p-2 rounded-full hover:bg-slate-700/50 text-slate-300 mr-2">
            <Mic className="h-5 w-5" />
          </button>
          <div className="flex-1 bg-slate-800/70 rounded-xl border border-slate-700">
            <textarea
              className="w-full bg-transparent text-slate-300 p-3 rounded-xl resize-none focus:outline-none focus:ring-1 focus:ring-blue-500/30"
              placeholder="Type your message here..."
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
            />
          </div>
          <button 
            className="p-2 ml-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSendMessage}
            disabled={inputText.trim() === '' || isAiTyping}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}