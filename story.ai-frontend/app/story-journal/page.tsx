"use client"

import React, { useState, useEffect } from 'react';
import { BookOpen, Smile, Search, Calendar, ChevronRight, Send, Mic, Image, Save, ArrowRight, BotIcon } from 'lucide-react';
import Navbar from '@/components/Navbar';

interface Entry {
  id: string;
  date: Date;
  content: string;
  mood: string;
  aiInsight?: string;
}

export default function StoryJournal() {
  const [activeTab, setActiveTab] = useState('Story Journal');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [currentEntry, setCurrentEntry] = useState('');
  const [showAIPanel, setShowAIPanel] = useState(true);
  const [moodData, setMoodData] = useState([
    { day: 'Mon', value: 70 },
    { day: 'Tue', value: 60 },
    { day: 'Wed', value: 85 },
    { day: 'Thu', value: 75 },
    { day: 'Fri', value: 90 },
    { day: 'Sat', value: 65 },
    { day: 'Sun', value: 80 },
  ]);
  const [username, setUsername] = useState('Sarah Johnson');
  const [aiPrompts, setAiPrompts] = useState([
    "Describe a time you felt deeply connected to yourself.",
    "Write a letter to your future self.",
    "What made you smile today?",
    "If today were a chapter in your life story, what would it be titled?",
    "What's one thing you're proud of accomplishing this week?"
  ]);
  
  // Mock data for recent entries
  useEffect(() => {
    setEntries([
      {
        id: '1',
        date: new Date(2025, 2, 9),
        content: "Today I started a new project at work. I felt both excited and nervous about the challenges ahead...",
        mood: "Hopeful",
        aiInsight: "You approach new beginnings with optimism."
      },
      {
        id: '2',
        date: new Date(2025, 2, 7),
        content: "I had a conflict with my colleague today. Initially I was upset, but after talking it through...",
        mood: "Reflective",
        aiInsight: "You're growing in conflict resolution skills."
      },
      {
        id: '3',
        date: new Date(2025, 2, 5),
        content: "Went hiking at Sunset Ridge. The views were incredible, and I felt so at peace with nature...",
        mood: "Peaceful",
        aiInsight: "Nature experiences boost your mood significantly."
      }
    ]);
  }, []);

  // Save entry function
  const saveEntry = () => {
    if (currentEntry.trim() === '') return;
    
    const newEntry: Entry = {
      id: Date.now().toString(),
      date: new Date(),
      content: currentEntry,
      mood: detectMood(currentEntry),
      aiInsight: generateAIInsight(currentEntry)
    };
    
    setEntries([newEntry, ...entries]);
    setCurrentEntry('');
  };
  
  // Mock AI functions
  const detectMood = (text: string): string => {
    const moods = ["Happy", "Reflective", "Anxious", "Peaceful", "Energetic", "Hopeful"];
    return moods[Math.floor(Math.random() * moods.length)];
  };
  
  const generateAIInsight = (text: string): string => {
    const insights = [
      "You're showing personal growth in how you approach challenges.",
      "You seem to value deep connections with others.",
      "Your writing shows increased self-awareness compared to earlier entries.",
      "There's a pattern of finding joy in simple moments.",
      "You're developing more compassionate self-talk."
    ];
    return insights[Math.floor(Math.random() * insights.length)];
  };
  
  // Get reframe suggestion
  const getReframeSuggestion = (text: string): string | null => {
    if (text.includes("fail") || text.includes("can't")) {
      return text.includes("fail") 
        ? "I face challenges, but I learn and grow through them." 
        : "I'm working on this skill and improving with each attempt.";
    }
    return null;
  };
  
  const reframeSuggestion = getReframeSuggestion(currentEntry);
  
  return (
    <div className="flex h-screen bg-slate-900 text-slate-300">
      {/* Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'Story Journal' && (
          <div className="p-6 max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Your Story Journal</h1>
                  <p className="text-slate-400">Every thought is a step toward self-discovery. Let's write your story today!</p>
                </div>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center mr-3">
                    <span className="text-white font-semibold">{username.charAt(0)}</span>
                  </div>
                  <span className="text-white mr-4">{username}</span>
                </div>
              </div>
              
              <button 
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md flex items-center shadow-lg shadow-blue-600/20"
                onClick={() => document.getElementById('editor')?.focus()}
              >
                Start Writing <ArrowRight className="ml-2 w-4 h-4" />
              </button>
            </div>
            
            {/* Writing Area */}
            <div className="flex gap-6">
              <div className="flex-1">
                <div className="bg-slate-800/70 rounded-lg p-6 shadow-lg border border-slate-700">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-white text-xl font-semibold">New Entry</h2>
                    <div className="flex space-x-2">
                      <button className="p-2 rounded-md hover:bg-slate-700">
                        <Mic className="w-5 h-5 text-slate-400" />
                      </button>
                      <button className="p-2 rounded-md hover:bg-slate-700">
                        <Image className="w-5 h-5 text-slate-400" />
                      </button>
                      <button className="p-2 rounded-md hover:bg-slate-700">
                        <Save className="w-5 h-5 text-slate-400" />
                      </button>
                    </div>
                  </div>
                  
                  <textarea
                    id="editor"
                    className="w-full h-64 bg-slate-800/50 border border-slate-700 rounded-md p-4 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                    placeholder="How are you feeling today?"
                    value={currentEntry}
                    onChange={(e) => setCurrentEntry(e.target.value)}
                  />
                  
                  {reframeSuggestion && (
                    <div className="mt-4 p-3 bg-blue-600/20 border border-blue-500/30 rounded-md flex items-start">
                      <BotIcon className="w-5 h-5 text-blue-400 mr-2 mt-1" />
                      <div>
                        <p className="text-blue-400 font-medium mb-1">Reframe Suggestion</p>
                        <p className="text-slate-300">{reframeSuggestion}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4 flex justify-end">
                    <button 
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
                      onClick={saveEntry}
                    >
                      Save Entry <Send className="ml-2 w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* AI Assistance Panel */}
              {showAIPanel && (
                <div className="w-80">
                  <div className="bg-slate-800/70 rounded-lg p-6 shadow-lg border border-slate-700">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-white text-lg font-semibold flex items-center">
                        <BotIcon className="w-5 h-5 mr-2 text-blue-400" />
                        AI Writing Companion
                      </h2>
                      <button onClick={() => setShowAIPanel(false)} className="text-slate-400 hover:text-white">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-white text-sm font-medium mb-3">Writing Prompts</h3>
                      <div className="space-y-2">
                        {aiPrompts.map((prompt, index) => (
                          <div 
                            key={index} 
                            className="p-3 bg-slate-800/50 hover:bg-blue-600/10 rounded-md border border-slate-700 cursor-pointer"
                            onClick={() => setCurrentEntry(prompt)}
                          >
                            {prompt}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-white text-sm font-medium mb-3">AI Insights</h3>
                      <div className="p-3 bg-slate-800/50 rounded-md border border-slate-700">
                        <p className="text-slate-400 text-sm">
                          Start writing or select a prompt to get personalized AI insights and suggestions.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Mood Tracker */}
            <div className="mt-10 bg-slate-800/70 rounded-lg p-6 shadow-lg border border-slate-700">
              <h2 className="text-white text-xl font-semibold mb-6 flex items-center">
                <Smile className="w-5 h-5 mr-2 text-blue-400" />
                Weekly Mood Tracker
              </h2>
              
              <div className="flex items-end h-40 justify-between">
                {moodData.map((day, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className="w-10 bg-blue-600 rounded-t-md" 
                      style={{ height: `${day.value}%`, maxHeight: "140px" }}
                    ></div>
                    <span className="mt-2 text-sm">{day.day}</span>
                  </div>
                ))}
              </div>
              
              <p className="mt-4 text-blue-400 text-sm">
                <BotIcon className="w-4 h-4 inline mr-1" />
                Your mood tends to be highest on Fridays and after outdoor activities.
              </p>
            </div>
            
            {/* Recent Entries */}
            <div className="mt-10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-white text-xl font-semibold">Recent Entries</h2>
                <button className="text-blue-400 flex items-center hover:underline">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {entries.map((entry) => (
                  <div key={entry.id} className="bg-slate-800/70 rounded-lg p-5 shadow-lg border border-slate-700">
                    <div className="flex justify-between mb-3">
                      <div className="flex items-center">
                        <span className="text-white">
                          {entry.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="mx-2 text-slate-600">•</span>
                        <span className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded-md text-xs">
                          {entry.mood}
                        </span>
                      </div>
                      <button className="text-slate-400 hover:text-white">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <p className="text-slate-300 line-clamp-2 mb-3">
                      {entry.content}
                    </p>
                    
                    {entry.aiInsight && (
                      <div className="flex items-start mt-3 text-xs">
                        <BotIcon className="w-4 h-4 text-blue-400 mr-1 flex-shrink-0 mt-0.5" />
                        <p className="text-blue-400">{entry.aiInsight}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Your Story So Far / AI Insights */}
            <div className="mt-10 mb-12 bg-slate-800/70 rounded-lg p-6 shadow-lg border border-slate-700">
              <h2 className="text-white text-xl font-semibold mb-4">Your Story So Far</h2>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-800/50 p-4 rounded-md border border-slate-700">
                  <h3 className="text-blue-400 font-medium mb-2">Common Themes</h3>
                  <p className="text-slate-300">You often reflect on personal growth and relationships</p>
                </div>
                
                <div className="bg-slate-800/50 p-4 rounded-md border border-slate-700">
                  <h3 className="text-blue-400 font-medium mb-2">Key Emotions</h3>
                  <p className="text-slate-300">Hopefulness and curiosity appear most frequently</p>
                </div>
                
                <div className="bg-slate-800/50 p-4 rounded-md border border-slate-700">
                  <h3 className="text-blue-400 font-medium mb-2">Writing Streak</h3>
                  <p className="text-slate-300">You've journaled for 5 days in a row! 🔥</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}