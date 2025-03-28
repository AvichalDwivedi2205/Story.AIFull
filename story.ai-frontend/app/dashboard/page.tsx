"use client"
import React, { useState } from 'react';
import { Calendar, Clock, BookOpen, Brain, Settings, Home, BarChart, Edit, CheckCircle, BotIcon } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';


const AuthStateChecker = () => {
  const { currentUser, userData, loading, isAuthenticated } = useAuth();
  
  if (loading) {
    return (
      <div className="p-4 bg-yellow-500/20 border border-yellow-500 rounded-md text-yellow-200 mb-4">
        <p className="font-medium">Authentication Status: Loading...</p>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <div className="p-4 bg-red-500/20 border border-red-500 rounded-md text-red-200 mb-4">
        <p className="font-medium">Authentication Status: Not Authenticated</p>
        <p className="text-sm mt-1">You should be redirected to login soon.</p>
      </div>
    );
  }
  
  return (
    <div className="p-4 bg-green-500/20 border border-green-500 rounded-md text-green-200 mb-4">
      <p className="font-medium">Authentication Status: Authenticated</p>
      <div className="mt-2 text-sm">
        <p>Email: {currentUser?.email}</p>
        <p>Name: {userData?.firstName} {userData?.lastName}</p>
        <p>Username: {userData?.username}</p>
      </div>
    </div>
  );
};

const DashboardUI = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  
  const moodData = [
    { day: 'Mon', value: 7 },
    { day: 'Tue', value: 6 },
    { day: 'Wed', value: 8 },
    { day: 'Thu', value: 5 },
    { day: 'Fri', value: 7 },
    { day: 'Sat', value: 9 },
    { day: 'Sun', value: 8 }
  ];
  
  const tasks = {
    morning: [
      { id: 1, title: 'Morning Reflection', completed: true },
      { id: 2, title: 'Gratitude Exercise', completed: true },
      { id: 3, title: 'Mindfulness Meditation', completed: false }
    ],
    midday: [
      { id: 4, title: 'CBT Exercise: Thought Challenging', completed: true },
      { id: 5, title: 'Self-Reflection Questions', completed: false }
    ],
    night: [
      { id: 6, title: 'Daily Journaling', completed: false },
      { id: 7, title: 'Relaxation Technique', completed: false }
    ]
  };
  
  const weekData = [
    { day: 'Mon', completed: 3, total: 3 },
    { day: 'Tue', completed: 4, total: 5 },
    { day: 'Wed', completed: 5, total: 5 },
    { day: 'Thu', completed: 2, total: 5 },
    { day: 'Fri', completed: 3, total: 5 },
    { day: 'Sat', completed: 1, total: 3 },
    { day: 'Sun', completed: 0, total: 3 }
  ];

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-300">
      <AuthStateChecker />
     <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 p-6 overflow-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">Your Dashboard</h1>
          <div className="flex items-center">
            <div className="mr-4 text-right">
              <p className="text-sm text-slate-300">Welcome back,</p>
              <p className="font-medium text-white">Avichal Dwivedi</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
              AD
            </div>
          </div>
        </header>
        
        <section className="mb-8 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Your Mental Health Snapshot</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/70 rounded-lg p-4 border border-slate-700">
              <h3 className="font-medium text-white mb-2">Weekly Mood</h3>
              <div className="flex justify-between items-end h-32">
                {moodData.map((day, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className="w-6 bg-blue-600 rounded-t-sm" 
                      style={{ height: `${day.value * 8}px` }}
                    ></div>
                    <span className="text-xs mt-2 text-slate-400">{day.day}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-slate-800/70 rounded-lg p-4 border border-slate-700">
              <h3 className="font-medium text-white mb-2">AI Insights</h3>
              <p className="text-sm text-slate-300">
                Your journaling shows improved emotional regulation this week. 
                Continue practicing mindfulness exercises.
              </p>
              <button className="mt-3 text-sm text-blue-400 hover:underline flex items-center">
                <span>View detailed analysis</span>
                <BarChart className="ml-1 h-4 w-4" />
              </button>
            </div>
            
            <div className="bg-slate-800/70 rounded-lg p-4 border border-slate-700">
              <h3 className="font-medium text-white mb-2">Wellness Score</h3>
              <div className="flex items-center justify-center h-24">
                <div className="relative">
                  <svg height="100" width="100" viewBox="0 0 100 100">
                    <circle 
                      cx="50" cy="50" r="45" 
                      stroke="#334155" 
                      strokeWidth="8" 
                      fill="none"
                    />
                    <circle 
                      cx="50" cy="50" r="45" 
                      stroke="#2563eb" 
                      strokeWidth="8" 
                      fill="none" 
                      strokeDasharray="283" 
                      strokeDashoffset="70"
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">75%</span>
                  </div>
                </div>
              </div>
              <p className="text-center text-xs text-slate-400 mt-2">15% improvement from last week</p>
            </div>
          </div>
        </section>
        
        <section className="mb-8 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Therapy Routine & Daily Check-ins</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/70 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 mr-2">
                  <Clock className="h-4 w-4" />
                </div>
                <h3 className="font-medium text-white">Morning Routine</h3>
              </div>
              <ul className="space-y-2">
                {tasks.morning.map(task => (
                  <li key={task.id} className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={task.completed} 
                      className="h-4 w-4 rounded border-slate-600 text-blue-600 focus:ring-blue-500 bg-slate-800"
                      readOnly
                    />
                    <span className={`ml-2 text-sm ${task.completed ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                      {task.title}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-slate-800/70 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 mr-2">
                  <Brain className="h-4 w-4" />
                </div>
                <h3 className="font-medium text-white">Midday Challenges</h3>
              </div>
              <ul className="space-y-2">
                {tasks.midday.map(task => (
                  <li key={task.id} className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={task.completed} 
                      className="h-4 w-4 rounded border-slate-600 text-blue-600 focus:ring-blue-500 bg-slate-800"
                      readOnly
                    />
                    <span className={`ml-2 text-sm ${task.completed ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                      {task.title}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-slate-800/70 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 mr-2">
                  <BookOpen className="h-4 w-4" />
                </div>
                <h3 className="font-medium text-white">Nighttime Debrief</h3>
              </div>
              <ul className="space-y-2">
                {tasks.night.map(task => (
                  <li key={task.id} className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={task.completed} 
                      className="h-4 w-4 rounded border-slate-600 text-blue-600 focus:ring-blue-500 bg-slate-800"
                      readOnly
                    />
                    <span className={`ml-2 text-sm ${task.completed ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                      {task.title}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4">AI-Guided Journaling</h2>
            <div className="bg-slate-800/70 rounded-lg p-4 border border-slate-700 mb-4">
              <p className="text-sm text-slate-300 mb-4">What's on your mind today? Our AI is ready to guide your reflection.</p>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-medium transition-colors flex items-center justify-center">
                <Edit className="h-5 w-5 mr-2" />
                Write Your Story
              </button>
            </div>
            <div className="space-y-2">
              <button className="w-full text-left p-3 bg-slate-800/40 hover:bg-slate-800/70 rounded-md text-sm transition-colors">
                Reframe a negative thought today...
              </button>
              <button className="w-full text-left p-3 bg-slate-800/40 hover:bg-slate-800/70 rounded-md text-sm transition-colors">
                What are you grateful for right now?
              </button>
            </div>
          </section>
          
          <section className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Routine Calendar & Milestones</h2>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {weekData.map((day, index) => (
                <div key={index} className="flex flex-col items-center">
                  <span className="text-xs text-slate-400 mb-1">{day.day}</span>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    day.completed === day.total 
                      ? 'bg-blue-600 text-white' 
                      : day.completed > 0 
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}>
                    {day.completed > 0 ? `${day.completed}/${day.total}` : '-'}
                  </div>
                </div>
              ))}
            </div>
            
            <h3 className="font-medium text-white mb-2">Milestones</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white mr-3">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-white text-sm">7-Day Streak</p>
                  <p className="text-xs text-slate-400">Completed 7 days ago</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 mr-3">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-white text-sm">14-Day Streak</p>
                  <p className="text-xs text-slate-400">2 days remaining</p>
                </div>
                <div className="ml-auto w-16 bg-slate-700 rounded-full h-1.5">
                  <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DashboardUI;