// pages/profile.tsx
"use client"
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { 
  Camera, 
  Calendar, 
  TrendingUp, 
  Award, 
  FileText, 
  Edit, 
  Heart, 
  ArrowRight, 
  Mail, 
  MapPin,
  User,
  CheckCircle
} from 'lucide-react';
import Image from 'next/image';

// Interface for mood data points
interface MoodDataPoint {
  date: string;
  value: number;
  mood: 'Excellent' | 'Good' | 'Neutral' | 'Low' | 'Very Low';
}

// Interface for recent sessions
interface Session {
  id: string;
  type: 'Journal' | 'Assessment' | 'Therapy Chat' | 'Meditation';
  title: string;
  date: string;
  summary?: string;
}

// Interface for achievements/milestones
interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  icon: JSX.Element;
  completed: boolean;
}

export default function Profile() {
  const [activeTab, setActiveTab] = useState('Settings');
  
  // Sample user data
  const userData = {
    name: "Alex Johnson",
    username: "alex_j",
    joinDate: "November 12, 2024",
    avatar: "/placeholder/150/150", // Placeholder for avatar
    email: "alex@example.com",
    location: "Seattle, WA",
    currentMood: "Good",
    journeyStage: "Building Resilience",
    journeyProgress: 65, // Percentage complete
    focusArea: "Anxiety Management",
    streakDays: 18,
    totalSessions: 42,
  };
  
  // Sample mood data for the chart
  const moodData: MoodDataPoint[] = [
    { date: "Mar 3", value: 4, mood: "Excellent" },
    { date: "Mar 4", value: 3, mood: "Good" },
    { date: "Mar 5", value: 3, mood: "Good" },
    { date: "Mar 6", value: 2, mood: "Neutral" },
    { date: "Mar 7", value: 1, mood: "Low" },
    { date: "Mar 8", value: 2, mood: "Neutral" },
    { date: "Mar 9", value: 3, mood: "Good" },
    { date: "Mar 10", value: 4, mood: "Excellent" },
  ];
  
  // Sample recent sessions
  const recentSessions: Session[] = [
    {
      id: "sess-001",
      type: "Journal",
      title: "Processing my work stress",
      date: "Mar 10, 2025",
      summary: "Explored feelings about team dynamics and identified boundary-setting opportunities."
    },
    {
      id: "sess-002",
      type: "Assessment",
      title: "Anxiety Check-in",
      date: "Mar 8, 2025",
      summary: "Moderate anxiety levels detected. Suggested breathing exercises."
    },
    {
      id: "sess-003",
      type: "Therapy Chat",
      title: "Relationship patterns",
      date: "Mar 6, 2025",
      summary: "Discussed communication styles and identified patterns from past relationships."
    },
    {
      id: "sess-004",
      type: "Meditation",
      title: "5-minute Grounding",
      date: "Mar 5, 2025",
    }
  ];
  
  // Sample achievements
  const achievements: Achievement[] = [
    {
      id: "ach-001",
      title: "7-Day Streak",
      description: "Used Story.ai for 7 consecutive days",
      date: "Feb 28, 2025",
      icon: <Calendar className="h-6 w-6 text-blue-400" />,
      completed: true
    },
    {
      id: "ach-002",
      title: "Journal Master",
      description: "Completed 10 journal entries",
      date: "Mar 5, 2025",
      icon: <FileText className="h-6 w-6 text-blue-400" />,
      completed: true
    },
    {
      id: "ach-003",
      title: "Emotion Explorer",
      description: "Identified and processed 5 different emotions",
      date: "Mar 8, 2025",
      icon: <Heart className="h-6 w-6 text-blue-400" />,
      completed: true
    },
    {
      id: "ach-004",
      title: "Assessment Ace",
      description: "Complete all available self-assessments",
      date: "",
      icon: <Award className="h-6 w-6 text-slate-500" />,
      completed: false
    },
  ];
  
  // Journal themes identified by AI
  const journalThemes = [
    {
      theme: "Work-Life Balance",
      frequency: "Mentioned in 7 entries",
      suggestion: "Try exploring how different aspects of work fulfill or drain you."
    },
    {
      theme: "Family Relationships", 
      frequency: "Mentioned in 5 entries",
      suggestion: "Consider reflecting on how your family dynamics influence your current relationships."
    },
    {
      theme: "Sleep Quality",
      frequency: "Mentioned in 3 entries",
      suggestion: "What patterns have you noticed about your sleep and daily energy levels?"
    }
  ];

  return (
    <div className="flex h-screen bg-slate-900 text-slate-300">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 overflow-y-auto p-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Your Profile</h1>
          <p className="mt-2 text-slate-400">
            Review your journey and insights from your Story.ai experience.
          </p>
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Column 1: User Profile Card */}
          <div className="xl:col-span-1 space-y-6">
            {/* User Overview Card */}
            <div className="bg-slate-800/70 rounded-lg border border-slate-700 p-6">
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="w-24 h-24 rounded-full bg-blue-600/20 flex items-center justify-center overflow-hidden">
                    <Image 
                      src={userData.avatar} 
                      alt="Profile avatar" 
                      width={96} 
                      height={96} 
                      className="rounded-full object-cover" 
                    />
                  </div>
                  <button className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 rounded-full p-1">
                    <Camera className="h-4 w-4 text-white" />
                  </button>
                </div>
                
                <h2 className="text-xl font-bold text-white">{userData.name}</h2>
                <p className="text-slate-400">@{userData.username}</p>
                
                <div className="mt-4 w-full">
                  <div className="flex items-center py-2 text-sm">
                    <Mail className="h-4 w-4 mr-2 text-slate-400" />
                    <span>{userData.email}</span>
                  </div>
                  <div className="flex items-center py-2 text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                    <span>{userData.location}</span>
                  </div>
                  <div className="flex items-center py-2 text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                    <span>Joined {userData.joinDate}</span>
                  </div>
                </div>
                
                <button className="mt-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-4 py-2 rounded-md text-sm flex items-center">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </button>
              </div>
            </div>
            
            {/* Current Mood & Journey Status */}
            <div className="bg-slate-800/70 rounded-lg border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Mental Health Journey</h3>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-400">Current Stage</span>
                  <span className="text-blue-400 font-medium">{userData.journeyStage}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${userData.journeyProgress}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Current Mood</span>
                  <span className="text-blue-400 font-medium">{userData.currentMood}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Focus Area</span>
                  <span className="text-blue-400 font-medium">{userData.focusArea}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Current Streak</span>
                  <span className="text-blue-400 font-medium">{userData.streakDays} days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Total Sessions</span>
                  <span className="text-blue-400 font-medium">{userData.totalSessions}</span>
                </div>
              </div>
            </div>
            
            {/* Achievements & Milestones */}
            <div className="bg-slate-800/70 rounded-lg border border-slate-700 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Achievements</h3>
                <button className="text-blue-400 text-sm hover:text-blue-300">View All</button>
              </div>
              
              <div className="space-y-4">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-start">
                    <div className={`p-2 rounded-md mr-3 ${achievement.completed ? 'bg-blue-600/20' : 'bg-slate-800'}`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h4 className={`font-medium ${achievement.completed ? 'text-white' : 'text-slate-500'}`}>
                          {achievement.title}
                        </h4>
                        {achievement.completed && (
                          <CheckCircle className="h-4 w-4 text-blue-400 ml-2" />
                        )}
                      </div>
                      <p className={`text-sm ${achievement.completed ? 'text-slate-400' : 'text-slate-500'}`}>
                        {achievement.description}
                      </p>
                      {achievement.completed && achievement.date && (
                        <p className="text-xs text-slate-500 mt-1">
                          Achieved on {achievement.date}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Column 2-3: Activity & Insights */}
          <div className="xl:col-span-2 space-y-6">
            {/* Mood Trends Chart */}
            <div className="bg-slate-800/70 rounded-lg border border-slate-700 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Mood Trends</h3>
                <select className="bg-slate-800 border border-slate-700 rounded-md text-sm p-2 text-slate-300">
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 3 months</option>
                </select>
              </div>
              
              <div className="h-64 mt-4">
                {/* Simplified mood chart visualization */}
                <div className="h-full flex items-end">
                  {moodData.map((data, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full max-w-10 mx-1 rounded-t-sm transition-all duration-300" 
                        style={{ 
                          height: `${data.value * 20}%`,
                          backgroundColor: data.value >= 4 ? '#3b82f6' : // blue-500
                                          data.value === 3 ? '#60a5fa' : // blue-400
                                          data.value === 2 ? '#93c5fd' : // blue-300
                                          data.value === 1 ? '#bfdbfe' : // blue-200
                                                          '#dbeafe'  // blue-100
                        }}
                      ></div>
                      <div className="text-xs text-slate-400 mt-2 transform -rotate-45 origin-top-left translate-y-6">
                        {data.date}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-8 flex justify-between items-center">
                <div className="flex">
                  {['Very Low', 'Low', 'Neutral', 'Good', 'Excellent'].map((mood, index) => (
                    <div key={mood} className="flex items-center mr-4">
                      <div 
                        className="w-3 h-3 rounded-full mr-1"
                        style={{
                          backgroundColor: index === 4 ? '#3b82f6' : // blue-500
                                          index === 3 ? '#60a5fa' : // blue-400
                                          index === 2 ? '#93c5fd' : // blue-300
                                          index === 1 ? '#bfdbfe' : // blue-200
                                                        '#dbeafe'  // blue-100
                        }}
                      ></div>
                      <span className="text-xs text-slate-400">{mood}</span>
                    </div>
                  ))}
                </div>
                
                {/* <button className="text-sm text-blue-400 hover:text-blue-300">Export Data</button> */}
              </div>
            </div>
            
            {/* Recent Sessions */}
            <div className="bg-slate-800/70 rounded-lg border border-slate-700 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Recent Sessions</h3>
                <button className="text-blue-400 text-sm hover:text-blue-300">View All</button>
              </div>
              
              <div className="space-y-4">
                {recentSessions.map((session) => (
                  <div key={session.id} className="border-b border-slate-700 pb-4 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <span className="text-xs px-2 py-1 bg-blue-600/20 text-blue-400 rounded">
                            {session.type}
                          </span>
                          <span className="ml-2 text-sm text-slate-400">{session.date}</span>
                        </div>
                        <h4 className="font-medium text-white mt-1">{session.title}</h4>
                      </div>
                      
                      <button className="p-1 text-slate-400 hover:text-white">
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                    
                    {session.summary && (
                      <p className="text-sm text-slate-400 mt-2">{session.summary}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Journal Themes & Insights */}
            {/* <div className="bg-slate-800/70 rounded-lg border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">AI-Generated Insights</h3>
              
              <div className="mb-4">
                <p className="text-slate-400">
                  Based on your journal entries, here are the key themes and patterns we've identified:
                </p>
              </div>
              
              <div className="space-y-4">
                {journalThemes.map((theme, index) => (
                  <div key={index} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="flex justify-between">
                      <h4 className="font-medium text-white">{theme.theme}</h4>
                      <span className="text-xs text-slate-400">{theme.frequency}</span>
                    </div>
                    <p className="text-sm text-slate-400 mt-2">{theme.suggestion}</p>
                    <button className="mt-3 text-sm text-blue-400 flex items-center hover:text-blue-300">
                      Explore this theme
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-700">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-white">Suggested Journal Prompts</h4>
                  <button className="text-blue-400 text-sm hover:text-blue-300">View All</button>
                </div>
                
                <div className="mt-3 space-y-2">
                  <p className="text-slate-400 text-sm">• How has your perspective on work-life balance shifted in the last month?</p>
                  <p className="text-slate-400 text-sm">• What family dynamics do you notice affecting your current relationships?</p>
                  <p className="text-slate-400 text-sm">• How might improving your sleep routine impact other areas of your life?</p>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </main>
    </div>
  );
}