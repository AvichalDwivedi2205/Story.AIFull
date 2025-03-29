"use client"
import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function DailyExercise() {
  const [activeTab, setActiveTab] = useState('Daily Exercise');
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [exerciseStatus, setExerciseStatus] = useState<{[key: string]: 'pending' | 'completed' | 'skipped'}>({
    'morning-reflection': 'pending',
    'gratitude-exercise': 'pending',
    'mindfulness-meditation': 'pending',
    'thought-challenging': 'pending',
    'relaxation-technique': 'pending',
  });

  // Sample exercises data
  const exercises = [
    {
      id: 'morning-reflection',
      title: 'Morning Reflection',
      description: 'Take a moment to reflect on how you feel today and set intentions for the day ahead.',
      duration: '5 min',
      content: 'Take a few minutes to consider the following questions and jot down your responses:\n\n1. How are you feeling physically and emotionally today?\n2. What are your top priorities for today?\n3. What might challenge you today, and how will you handle it?\n4. What is one small thing you can do today to take care of yourself?'
    },
    {
      id: 'gratitude-exercise',
      title: 'Gratitude Exercise',
      description: 'Practice gratitude by noting three things you are thankful for today.',
      duration: '3 min',
      content: 'Research shows that regularly practicing gratitude can improve mental well-being and outlook.\n\nWrite down three things you feel grateful for today. They can be big or small, from a delicious cup of coffee to a meaningful relationship.\n\n1.\n2.\n3.'
    },
    {
      id: 'mindfulness-meditation',
      title: 'Mindfulness Meditation',
      description: 'A short guided breathing exercise to center yourself and reduce stress.',
      duration: '7 min',
      content: 'Find a comfortable position and follow these steps:\n\n1. Close your eyes and bring awareness to your body\n2. Notice the sensation of your breath without trying to change it\n3. When your mind wanders, gently bring your focus back to your breath\n4. Continue this practice, observing each breath with curiosity'
    },
    {
      id: 'thought-challenging',
      title: 'CBT Exercise: Thought Challenging',
      description: 'Identify and reframe negative thought patterns using cognitive-behavioral techniques.',
      duration: '10 min',
      content: 'Follow these steps to challenge negative thoughts:\n\n1. Identify a negative thought you have had recently\n2. What evidence supports this thought?\n3. What evidence contradicts this thought?\n4. What would you tell a friend who had this thought?\n5. What is a more balanced or helpful way to think about the situation?'
    },
    {
      id: 'relaxation-technique',
      title: 'Relaxation Technique',
      description: 'A guided progressive muscle relaxation to release physical tension.',
      duration: '8 min',
      content: 'Find a quiet place to sit or lie down comfortably.\n\n1. Start by tensing the muscles in your feet for 5 seconds, then release\n2. Move upward through your body, tensing and releasing each muscle group\n3. Notice the difference between tension and relaxation\n4. End by taking three deep breaths and noticing how your body feels'
    },
  ];

  const toggleExercise = (id: string) => {
    setExpandedExercise(expandedExercise === id ? null : id);
  };

  const handleComplete = (id: string) => {
    setExerciseStatus({...exerciseStatus, [id]: 'completed'});
    setExpandedExercise(null);
  };

  const handleSkip = (id: string) => {
    setExerciseStatus({...exerciseStatus, [id]: 'skipped'});
    setExpandedExercise(null);
  };

  // Count completed exercises
  const completedCount = Object.values(exerciseStatus).filter(status => status === 'completed').length;

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-300">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Container */}
      <div className="flex-grow p-6 bg-slate-800/50 rounded-lg border border-slate-700 ml-6 mb-6 mr-6 overflow-y-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-white font-bold text-3xl">Daily Mental Wellness Exercises</h1>
            <p className="text-slate-400 mt-2">Complete these exercises to improve your mental wellbeing</p>
          </div>
          <div className="bg-blue-600/20 text-blue-400 border border-blue-500/30 py-2 px-4 rounded-lg flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span>{completedCount}/5 Completed</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-10">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-slate-400">Today's Progress</span>
            <span className="text-sm font-medium text-blue-400">{completedCount * 20}%</span>
          </div>
          <div className="h-2 w-full bg-slate-700 rounded-full">
            <div 
              className="h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${completedCount * 20}%` }}
            ></div>
          </div>
        </div>

        {/* Exercises Section */}
        <div className="space-y-4">
          {exercises.map((exercise) => {
            const status = exerciseStatus[exercise.id];
            let cardBg = "bg-slate-800/70";
            let borderColor = "border-slate-700";
            let statusText = "Pending";
            let statusIcon = <Clock className="h-5 w-5 text-slate-400" />;
            let textColor = "text-slate-300";

            if (status === 'completed') {
              cardBg = "bg-green-900/20";
              borderColor = "border-green-700";
              statusText = "Completed";
              statusIcon = <CheckCircle className="h-5 w-5 text-green-400" />;
              textColor = "text-green-300";
            } else if (status === 'skipped') {
              cardBg = "bg-red-900/20";
              borderColor = "border-red-800";
              statusText = "Skipped";
              statusIcon = <XCircle className="h-5 w-5 text-red-400" />;
              textColor = "text-red-300";
            }

            return (
              <div 
                key={exercise.id} 
                className={`${cardBg} rounded-xl border ${borderColor} hover:shadow-lg transition-all duration-300 overflow-hidden`}
              >
                <div 
                  className={`p-5 cursor-pointer ${expandedExercise === exercise.id ? 'border-b border-slate-700/50' : ''}`} 
                  onClick={() => toggleExercise(exercise.id)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className={`w-2 h-10 ${status === 'completed' ? 'bg-green-400' : status === 'skipped' ? 'bg-red-400' : 'bg-blue-500'} rounded-full mr-4`}></div>
                      <div>
                        <h3 className={`font-medium text-lg ${status === 'completed' ? 'text-green-300' : status === 'skipped' ? 'text-red-300' : 'text-white'}`}>{exercise.title}</h3>
                        <p className="text-sm text-slate-400 mt-1">{exercise.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="flex items-center mr-4">
                        <span className={`text-sm mr-2 ${textColor}`}>{statusText}</span>
                        {statusIcon}
                      </div>
                      <div className="bg-slate-700/50 rounded-md px-2 py-1 text-xs text-slate-400 mr-3">
                        {exercise.duration}
                      </div>
                      {expandedExercise === exercise.id ? (
                        <ChevronUp className="h-5 w-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-slate-400" />
                      )}
                    </div>
                  </div>
                </div>

                {expandedExercise === exercise.id && (
                  <div className="p-5 animate-fadeIn">
                    <div className="bg-slate-900/50 p-4 rounded-lg mb-4">
                      <pre className="text-slate-300 whitespace-pre-wrap font-sans">{exercise.content}</pre>
                    </div>
                    <div className="flex justify-end space-x-3 mt-4">
                      <button 
                        onClick={() => handleSkip(exercise.id)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center transition-colors"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Skip
                      </button>
                      <button 
                        onClick={() => handleComplete(exercise.id)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center transition-colors"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Complete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Completed Section */}
        {completedCount === 5 && (
          <div className="mt-8 p-6 bg-green-900/20 border border-green-700 rounded-xl animate-fadeIn">
            <h3 className="text-xl font-bold text-green-300 mb-2">All Exercises Completed!</h3>
            <p className="text-slate-300">Great job completing all of today's exercises. Your mental wellness journey is progressing well.</p>
            <button className="mt-4 px-6 py-3 bg-green-700 hover:bg-green-600 text-white rounded-lg flex items-center transition-colors">
              <ArrowRight className="h-5 w-5 mr-2" />
              View Your Progress Report
            </button>
          </div>
        )}

        {/* Custom Styles for Animation */}
        <style jsx global>{`
          @keyframes fadeIn {
            from { opacity: 0; height: 0; }
            to { opacity: 1; height: auto; }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out forwards;
          }
        `}</style>
      </div>
    </div>
  );
}
