"use client"
import React from 'react';
import { Calendar, Home, BookOpen, Brain, Settings, BotIcon } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar ({ activeTab, setActiveTab }: NavbarProps) {
  return (
      
      <nav className="space-y-1">
        {[
          { name: 'Dashboard', icon: <Home className="h-5 w-5" /> },
          { name: 'Story Journal', icon: <BookOpen className="h-5 w-5" /> },
          
          { name: 'AI Insights', icon: <Brain className="h-5 w-5" /> },
          { name: 'Settings', icon: <Settings className="h-5 w-5" /> },
          { name: 'Therapy Chatbot', icon: <BotIcon className="h-5 w-5" /> }
        ].map((item) => (
          <button
            key={item.name}
            onClick={() => setActiveTab(item.name)}
            className={`flex items-center w-full p-3 rounded-md ${
              activeTab === item.name 
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                : 'hover:bg-slate-700/50 text-slate-300'
            }`}
          >
            <span className="mr-3">{item.icon}</span>
            {item.name}
          </button>
        ))}
      </nav>
  );
};