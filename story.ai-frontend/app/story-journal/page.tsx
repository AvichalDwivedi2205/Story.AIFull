"use client"

import React, { useState, useEffect } from 'react';
import { BookOpen, ChevronRight, Send, ArrowRight, BotIcon, Smile, X } from 'lucide-react';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';

interface Emotion {
  joy: number;
  sadness: number;
  fear: number;
  anger: number;
  surprise: number;
}

interface Sentiment {
  label: string;
  score: number;
}

interface JournalEntry {
  id: string;
  user_id: string;
  content: string;
  sentiment: Sentiment;
  emotions: Emotion;
  insights: string;
  themes: string[];
  growth_indicators: string[];
  cognitive_distortions: string[];
  advice: string;
  reflection_questions: string[];
  created_at: string;
  is_mock?: boolean;
}

export default function StoryJournal() {
  const [activeTab, setActiveTab] = useState('Story Journal');
  const [journals, setJournals] = useState<JournalEntry[]>([]);
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
  const [aiPrompts, setAiPrompts] = useState([
    "Describe a time you felt deeply connected to yourself.",
    "Write a letter to your future self.",
    "What made you smile today?",
    "If today were a chapter in your life story, what would it be titled?",
    "What's one thing you're proud of accomplishing this week?"
  ]);
  const [loading, setLoading] = useState(false);
  const [selectedJournal, setSelectedJournal] = useState<JournalEntry | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  // Get authentication context
  const { currentUser, userData } = useAuth();
  
  // Fetch journals on component mount directly from Firebase
  useEffect(() => {
    const fetchJournals = async () => {
      if (!currentUser) return;
      
      try {
        // Create query for entries from Firebase - using only where clause to avoid index requirements
        const journalQuery = query(
          collection(db, "journal"),
          where("user_id", "==", currentUser.uid)
        );
        
        // Execute the query
        const querySnapshot = await getDocs(journalQuery);
        
        // Process the results
        const fetchedJournals: JournalEntry[] = [];
        querySnapshot.forEach(doc => {
          const data = doc.data();
          fetchedJournals.push({
            id: doc.id,
            user_id: data.user_id,
            content: data.content,
            sentiment: data.sentiment || { label: "neutral", score: 0.5 },
            emotions: data.emotions || { joy: 0.2, sadness: 0.2, fear: 0.2, anger: 0.2, surprise: 0.2 },
            insights: data.insights || "",
            themes: data.themes || [],
            growth_indicators: data.growth_indicators || [],
            cognitive_distortions: data.cognitive_distortions || [],
            advice: data.advice || "",
            reflection_questions: data.reflection_questions || [],
            created_at: data.created_at?.toDate().toISOString() || new Date().toISOString(),
            is_mock: data.is_mock
          });
        });
        
        // Sort the journals by date (newest first) client-side
        fetchedJournals.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        
        // Limit to 5 entries
        const latestJournals = fetchedJournals.slice(0, 5);
        
        // Update state with fetched journals
        setJournals(latestJournals);
        
        // Update mood data based on sentiment from journal entries
        if (latestJournals.length > 0) {
          const lastWeekMood = generateMoodDataFromJournals(latestJournals);
          setMoodData(lastWeekMood);
        }
      } catch (error) {
        console.error("Error fetching journals:", error);
      }
    };
    
    fetchJournals();
  }, [currentUser]);
  
  // Generate mood data from journal entries
  const generateMoodDataFromJournals = (journals: JournalEntry[]) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const moodMap = new Map();
    
    // Initialize with default values
    days.forEach(day => {
      moodMap.set(day, { total: 0, count: 0 });
    });
    
    // Process journal entries
    journals.forEach(journal => {
      const date = new Date(journal.created_at);
      const day = days[date.getDay()];
      const moodValue = journal.sentiment.score * 100;
      
      const current = moodMap.get(day);
      moodMap.set(day, { 
        total: current.total + moodValue, 
        count: current.count + 1 
      });
    });
    
    // Convert to array format
    return days.map(day => {
      const moodData = moodMap.get(day);
      return { 
        day, 
        value: moodData.count > 0 
          ? Math.round(moodData.total / moodData.count) 
          : Math.floor(Math.random() * 30) + 50 // Fallback random value
      };
    });
  };

// Save entry function
  const saveEntry = async () => {
    if (currentEntry.trim() === '' || !currentUser) return;
    
    setLoading(true);
    
    try {
      // Make API call to save the journal entry
      const response = await axios.post('/api/journal', {
        user_id: currentUser.uid,
        content: currentEntry
      });
      
      // Clear the entry field after successful save
      setCurrentEntry('');
      
      // Refresh the page to show the new entry
      window.location.reload();
      
    } catch (error) {
      console.error("Error saving journal entry:", error);
      alert("Failed to save your journal entry. Please try again.");
    } finally {
      setLoading(false);
    }
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
  
  // Open journal details in modal
  const openJournalDetails = (journal: JournalEntry) => {
    setSelectedJournal(journal);
    setShowModal(true);
  };
  
  // Get dominant emotion
  const getDominantEmotion = (emotions: Emotion) => {
    const entries = Object.entries(emotions) as [keyof Emotion, number][];
    const sorted = entries.sort((a, b) => b[1] - a[1]);
    return sorted[0][0];
  };
  
  // Get emoji for sentiment
  const getSentimentEmoji = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive': return '😊';
      case 'negative': return '😔';
      default: return '😐';
    }
  };
  
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
                    <span className="text-white font-semibold">{userData?.username?.charAt(0) || currentUser?.email?.charAt(0) || 'U'}</span>
                  </div>
                  <span className="text-white mr-4">{userData?.username || currentUser?.email?.split('@')[0] || 'User'}</span>
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
                  </div>
                  
                  <textarea
                    id="editor"
                    className="w-full min-h-[200px] bg-slate-800/50 border border-slate-700 rounded-md p-4 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                    placeholder="Write what's on your mind today…"
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
                      className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                      onClick={saveEntry}
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save Entry'} <Send className="ml-2 w-4 h-4" />
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
                {journals.length > 0 
                  ? "Your mood insights are based on your recent journal entries." 
                  : "Start journaling to get personalized mood insights."}
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
                {journals.length > 0 ? (
                  journals.map((journal) => (
                    <div 
                      key={journal.id} 
                      className="bg-slate-800/70 rounded-lg p-5 shadow-lg border border-slate-700 cursor-pointer hover:border-blue-500/30 transition-colors"
                      onClick={() => openJournalDetails(journal)}
                    >
                      <div className="flex justify-between mb-3">
                        <div className="flex items-center">
                          <span className="text-white">
                            {new Date(journal.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          <span className="mx-2 text-slate-600">•</span>
                          <span className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded-md text-xs">
                            {journal.sentiment.label.charAt(0).toUpperCase() + journal.sentiment.label.slice(1)}
                          </span>
                        </div>
                        <button className="text-slate-400 hover:text-white">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <p className="text-slate-300 line-clamp-2 mb-3">
                        {journal.content}
                      </p>
                      
                      {journal.insights && (
                        <div className="flex items-start mt-3 text-xs">
                          <BotIcon className="w-4 h-4 text-blue-400 mr-1 flex-shrink-0 mt-0.5" />
                          <p className="text-blue-400">
                            {typeof journal.insights === 'string' 
                              ? journal.insights 
                              : "AI analysis of your journal entry"}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="bg-slate-800/70 rounded-lg p-8 shadow-lg border border-slate-700 text-center">
                    <p className="text-slate-400">No journal entries yet. Start writing to see your entries here!</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Your Story So Far / AI Insights */}
            <div className="mt-10 mb-12 bg-slate-800/70 rounded-lg p-6 shadow-lg border border-slate-700">
              <h2 className="text-white text-xl font-semibold mb-4">Your Story So Far</h2>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-800/50 p-4 rounded-md border border-slate-700">
                  <h3 className="text-blue-400 font-medium mb-2">Common Themes</h3>
                  <p className="text-slate-300">
                    {journals.length > 0 
                      ? journals[0].themes?.join(", ") || "Personal growth and reflection"
                      : "Start journaling to discover your themes"}
                  </p>
                </div>
                
                <div className="bg-slate-800/50 p-4 rounded-md border border-slate-700">
                  <h3 className="text-blue-400 font-medium mb-2">Key Emotions</h3>
                  <p className="text-slate-300">
                    {journals.length > 0 
                      ? getDominantEmotion(journals[0].emotions) 
                      : "Write entries to track your emotions"}
                  </p>
                </div>
                
                <div className="bg-slate-800/50 p-4 rounded-md border border-slate-700">
                  <h3 className="text-blue-400 font-medium mb-2">Writing Streak</h3>
                  <p className="text-slate-300">You've journaled for {journals.length} days! 🔥</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Journal Details Modal */}
      {showModal && selectedJournal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl w-full max-w-3xl max-h-[80vh] overflow-auto shadow-xl">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-slate-400 text-sm">
                    {new Date(selectedJournal.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric',
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <h2 className="text-2xl font-bold text-white">Journal Entry</h2>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-700/50"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {/* Journal content */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-white mb-3">Your Writing</h3>
                <div className="bg-slate-900/50 p-4 rounded-md border border-slate-700">
                  <p className="text-slate-300 whitespace-pre-wrap">{selectedJournal.content}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  {/* Sentiment */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                      {getSentimentEmoji(selectedJournal.sentiment.label)} Sentiment
                    </h3>
                    <div className="bg-slate-900/50 p-4 rounded-md border border-slate-700">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300">{selectedJournal.sentiment.label.charAt(0).toUpperCase() + selectedJournal.sentiment.label.slice(1)}</span>
                        <span className="text-slate-300">{Math.round(selectedJournal.sentiment.score * 100)}%</span>
                      </div>
                      <div className="w-full bg-slate-700 h-2 rounded-full mt-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${selectedJournal.sentiment.score * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Emotions */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                      🎭 Emotions
                    </h3>
                    <div className="bg-slate-900/50 p-4 rounded-md border border-slate-700">
                      {Object.entries(selectedJournal.emotions).map(([emotion, score]) => (
                        <div key={emotion} className="mb-2 last:mb-0">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-300 capitalize">{emotion}</span>
                            <span className="text-slate-300">{Math.round(score * 100)}%</span>
                          </div>
                          <div className="w-full bg-slate-700 h-1.5 rounded-full mt-1">
                            <div 
                              className="bg-blue-500 h-1.5 rounded-full"
                              style={{ width: `${score * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Key Themes */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                      🧩 Key Themes
                    </h3>
                    <div className="bg-slate-900/50 p-4 rounded-md border border-slate-700">
                      <div className="flex flex-wrap gap-2">
                        {selectedJournal.themes?.map((theme, index) => (
                          <span key={index} className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded-md text-sm">
                            {theme}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  {/* Growth Indicators */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                      🌱 Growth Indicators
                    </h3>
                    <div className="bg-slate-900/50 p-4 rounded-md border border-slate-700">
                      <ul className="list-disc list-inside text-slate-300 space-y-1">
                        {selectedJournal.growth_indicators?.map((indicator, index) => (
                          <li key={index}>{indicator}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  {/* Cognitive Distortions */}
                  {selectedJournal.cognitive_distortions?.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                        🚫 Cognitive Distortions
                      </h3>
                      <div className="bg-slate-900/50 p-4 rounded-md border border-slate-700">
                        <ul className="list-disc list-inside text-slate-300 space-y-1">
                          {selectedJournal.cognitive_distortions?.map((distortion, index) => (
                            <li key={index}>{distortion}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  {/* Advice */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                      💡 Advice
                    </h3>
                    <div className="bg-slate-900/50 p-4 rounded-md border border-slate-700">
                      <p className="text-slate-300">{selectedJournal.advice}</p>
                    </div>
                  </div>
                  
                  {/* Reflection Questions */}
                  <div className="mb-0">
                    <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                      ❓ Reflection Questions
                    </h3>
                    <div className="bg-slate-900/50 p-4 rounded-md border border-slate-700">
                      <ul className="list-disc list-inside text-slate-300 space-y-2">
                        {selectedJournal.reflection_questions?.map((question, index) => (
                          <li key={index}>{question}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}