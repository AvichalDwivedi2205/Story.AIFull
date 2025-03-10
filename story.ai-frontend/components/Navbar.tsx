// components/Navbar.tsx
"use client"
import React from 'react';
import { Calendar, Home, BookOpen, Brain, Settings, BotIcon, ClipboardList } from 'lucide-react';
import Link from 'next/link';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  return (
    <div className="w-64 bg-slate-800/50 backdrop-blur-sm border-r border-slate-700 p-4 flex flex-col">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Story.ai</h1>
        <p className="text-sm text-slate-400">Your mental wellness companion</p>
      </div>

      {/* Navigation Links */}
      <nav className="space-y-1 flex-1">
        {[
          { name: 'Dashboard', icon: <Home className="h-5 w-5" /> },
          { name: 'Story Journal', icon: <BookOpen className="h-5 w-5" /> },
          { name: 'AI Insights', icon: <Brain className="h-5 w-5" /> },
          { name: 'Therapy Chatbot', icon: <BotIcon className="h-5 w-5" /> },
          { name: 'Self-Assessment', icon: <ClipboardList className="h-5 w-5" /> },
          { name: 'Settings', icon: <Settings className="h-5 w-5" /> },
        ].map((item) => (
          <Link
            href={`/${item.name.toLowerCase().replace(' ', '-')}`}
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
          </Link>
        ))}

        {/* Streak Section */}
        <div className="mt-8 p-4 bg-slate-800/70 rounded-lg border border-slate-700">
          <h3 className="font-medium text-white">Current Streak</h3>
          <div className="flex items-center mt-2">
            <span className="text-2xl font-bold text-blue-400">12</span>
            <span className="ml-2 text-slate-400">days</span>
          </div>
          <div className="mt-2 w-full bg-slate-700 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '70%' }}></div>
          </div>
          <p className="mt-2 text-xs text-slate-400">5 more days to reach your best</p>
        </div>
      </nav>
    </div>
  );
};