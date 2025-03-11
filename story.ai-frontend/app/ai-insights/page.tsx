// pages/AIInsights.tsx
"use client"
import React, { useState } from 'react';
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp, Sliders } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function AIInsights() {
  const [activeTab, setActiveTab] = useState('AI Insights');
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  // Expanded sample data for key metrics from multiple model analyses
  const keyMetrics = [
    { name: "Anxiety Level", value: "75% of entries indicate high anxiety", increasing: true },
    { name: "Top Moods", value: "Joy, anger ", increasing: false },
    { name: "Positive Sentiment", value: "28% of content", increasing: true },
    { name: "Cognitive Distortions", value: "Reduced by 35% compared to last month", increasing: false },
    { name: "Therapy Chatbot Engagement", value: "Increased by 20%", increasing: true },
  ];

  // Expanded sample insights from different AI models
  const insights = [
    {
      id: "anxiety-stress",
      title: "Anxiety & Stress Analysis",
      summary: "High anxiety detected in work-related entries.",
      details: "Our Anxiety & Stress Detection model identified that 75% of your entries contain markers of high anxiety, primarily related to work pressures. Consider scheduling short breaks and using breathing exercises during high-stress periods."
    },
    {
      id: "mood-sentiment",
      title: "Overall Mood & Sentiment",
      summary: "Your sentiment trend shows an upward curve in positivity.",
      details: "The Sentiment Analysis model shows a gradual increase in positive sentiment over the past week, although mood variability remains high. Regular mindfulness sessions may help in stabilizing these fluctuations."
    },
    {
      id: "cognitive-distortion",
      title: "Cognitive Distortion Detection",
      summary: "Reduction in negative thought patterns observed.",
      details: "Our Cognitive Distortion Detection model indicates a 35% decrease in catastrophic thinking. Keep using the cognitive restructuring techniques discussed during therapy to maintain this positive trend."
    },
    {
      id: "journaling-insights",
      title: "Journaling Insights",
      summary: "Key themes extracted from your journal entries.",
      details: "Analysis of your journal entries highlights recurring themes such as work stress and social connections. Recognizing these patterns can help you better manage triggers and reinforce positive habits."
    },
    // {
    //   id: "sleep-patterns",
    //   title: "Sleep & Insomnia Patterns",
    //   summary: "Inconsistent sleep references noted.",
    //   details: "The Sleep Pattern Detection model detected 8 instances of insomnia-related references. Consider integrating a relaxing nighttime routine to improve sleep quality."
    // }
  ];

  // Sample recommendations incorporating multi-model analysis
  const recommendations = [
    "Engage in a 5-minute breathing exercise during work breaks.",
    "Schedule a daily mindfulness session to stabilize mood variability.",
    "Use thought challenging techniques when negative patterns arise.",
    "Consider a consistent bedtime routine to improve sleep quality.",
    "Follow up with our Therapy Chatbot for personalized coping strategies."
  ];

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-300">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Container */}
      <div className="flex-grow p-6 bg-slate-800/50 rounded-lg border border-slate-700 ml-6 mb-6">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-white font-bold text-3xl">Your Mental Health Trends</h1>
            <p className="text-slate-400 mt-2">AI-powered insights from your journal entries and interactions</p>
          </div>
          <div className="relative">
            <select className="bg-slate-800/70 border border-slate-700 rounded-md py-2 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
            </select>
            <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {keyMetrics.map((metric, index) => (
            <div key={index} className="bg-slate-800/70 p-5 rounded-xl border border-slate-700 hover:border-blue-500/40 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-slate-400 text-sm mb-1">{metric.name}</h3>
                  <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                    {metric.value}
                  </div>
                </div>
                {metric.increasing ? (
                  <TrendingUp className="h-6 w-6 text-blue-400 mt-1" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-slate-400 mt-1" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Analysis Section */}
        <div className="space-y-6 mb-10">
          <h2 className="text-2xl font-bold text-white mb-6">Detailed Analysis</h2>
          
          {insights.map(insight => (
            <div key={insight.id} className="group bg-slate-800/70 rounded-lg border border-slate-700 hover:border-blue-500/30 transition-colors">
              <div 
                className="flex justify-between items-center p-5 cursor-pointer"
                onClick={() => toggleSection(insight.id)}
              >
                <div>
                  <h3 className="text-lg font-semibold text-white">{insight.title}</h3>
                  <p className="text-slate-300 mt-1 text-sm">{insight.summary}</p>
                </div>
                {expandedSections.includes(insight.id) ? (
                  <ChevronUp className="h-5 w-5 text-slate-400 transform transition-transform" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-400 transform transition-transform" />
                )}
              </div>
              
              {expandedSections.includes(insight.id) && (
                <div className="p-5 pt-0 border-t border-slate-700/50">
                  <p className="text-slate-300 leading-relaxed">{insight.details}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Recommendations Section */}
        <div className="bg-gradient-to-br from-blue-600/30 to-blue-500/20 p-6 rounded-xl border border-blue-500/30">
          <h2 className="text-2xl font-bold text-white mb-5">Personalized Recommendations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {recommendations.map((rec, index) => (
              <div key={index} className="flex items-start p-4 bg-slate-800/50 rounded-lg">
                <div className="flex-shrink-0 mt-1 mr-3 text-blue-400">{index + 1}.</div>
                <p className="text-slate-300">{rec}</p>
              </div>
            ))}
          </div>
          <button className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2">
            <Sliders className="h-5 w-5" />
            Generate Custom Exercise Plan
          </button>
        </div>
      </div>
    </div>
  );
}
