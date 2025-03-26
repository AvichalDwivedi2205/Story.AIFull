// pages/self-assessment.tsx
"use client"
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { ArrowRight, BarChart, Clock, CheckCircle, CircleSlash, Loader2 } from 'lucide-react';

// Define test status types
type TestStatus = 'Not Started' | 'In Progress' | 'Completed';

// Define the assessment test interface
interface AssessmentTest {
  id: string;
  name: string;
  description: string;
  estimatedTime: string;
  status: TestStatus;
  questions?: Array<{
    id: string;
    text: string;
    options: Array<{
      value: number;
      label: string;
    }>;
  }>;
  result?: {
    score: number;
    interpretation: string;
    suggestions: string[];
  };
  completedDate?: string;
}

// Sample test data
const testData: AssessmentTest[] = [
  {
    id: 'pss',
    name: 'Stress Level Test',
    description: 'Measures your overall stress levels.',
    estimatedTime: '2 min',
    status: 'Not Started',
    questions: [
      {
        id: 'pss-1',
        text: 'In the last month, how often have you been upset because of something that happened unexpectedly?',
        options: [
          { value: 0, label: 'Never' },
          { value: 1, label: 'Almost Never' },
          { value: 2, label: 'Sometimes' },
          { value: 3, label: 'Fairly Often' },
          { value: 4, label: 'Very Often' },
        ],
      },
      {
        id: 'pss-2',
        text: 'In the last month, how often have you felt that you were unable to control the important things in your life?',
        options: [
          { value: 0, label: 'Never' },
          { value: 1, label: 'Almost Never' },
          { value: 2, label: 'Sometimes' },
          { value: 3, label: 'Fairly Often' },
          { value: 4, label: 'Very Often' },
        ],
      },
      // Additional questions would be added here
    ],
  },
  {
    id: 'mcmi',
    name: 'Personality Type Test',
    description: 'Evaluates personality patterns and emotional functioning.',
    estimatedTime: '3 min',
    status: 'Not Started',
    questions: [
      // Questions would be defined here
    ],
  },
  {
    id: 'gad7',
    name: 'Anxiety Assessment',
    description: 'Assesses anxiety symptoms and their severity.',
    estimatedTime: '3 min',
    status: 'Completed',
    completedDate: '2025-03-05',
    result: {
      score: 8,
      interpretation: 'Mild anxiety symptoms detected.',
      suggestions: [
        'Practice deep breathing exercises for 5 minutes daily',
        'Consider limiting caffeine intake',
        'Establish a regular sleep schedule'
      ]
    }
  },
];

export default function SelfAssessment() {
  const [activeTab, setActiveTab] = useState('Self-Assessment');
  const [selectedTest, setSelectedTest] = useState<AssessmentTest | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [testView, setTestView] = useState<'list' | 'taking' | 'results'>('list');

  // Count completed tests
  const completedTests = testData.filter(test => test.status === 'Completed').length;
  
  // Handle selecting a test to take
  const handleSelectTest = (test: AssessmentTest) => {
    setSelectedTest(test);
    setTestView('taking');
    setCurrentQuestionIndex(0);
    setAnswers({});
  };
  
  // Handle selecting an answer
  const handleSelectAnswer = (questionId: string, value: number) => {
    setAnswers({
      ...answers,
      [questionId]: value
    });
  };
  
  // Handle submitting the current question and moving to the next
  const handleNextQuestion = () => {
    if (!selectedTest || !selectedTest.questions) return;
    
    if (currentQuestionIndex < selectedTest.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Complete the test
      setTestView('results');
      // In a real app, you would calculate the score and update the test status
    }
  };
  
  // Return to test list
  const handleBackToTests = () => {
    setSelectedTest(null);
    setTestView('list');
  };
  
  // Calculate progress percentage for the current test
  const calculateProgress = () => {
    if (!selectedTest || !selectedTest.questions || selectedTest.questions.length === 0) return 0;
    return ((currentQuestionIndex + 1) / selectedTest.questions.length) * 100;
  };

  // Render the appropriate status icon based on test status
  const renderStatusIcon = (status: TestStatus) => {
    switch(status) {
      case 'Completed':
        return <CheckCircle className="h-5 w-5 text-blue-400" />;
      case 'In Progress':
        return <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />;
      default:
        return <CircleSlash className="h-5 w-5 text-slate-400" />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-300">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 overflow-y-auto p-6">
        {testView === 'list' && (
          <>
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white">Self-Assessment Tests</h1>
              <p className="mt-2 text-slate-400">
                Gain insights into your mental health with science-backed assessments.
              </p>
              <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700 flex items-center">
                <BarChart className="h-5 w-5 mr-3 text-blue-400" />
                <span>Your completed tests: <span className="font-bold text-white">{completedTests} / {testData.length}</span></span>
              </div>
            </div>
            
            {/* Test Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {testData.map((test) => (
                <div key={test.id} className="bg-slate-800/70 rounded-lg border border-slate-700 p-6 hover:bg-slate-800 transition">
                  <div className="flex justify-between items-start">
                    <h2 className="text-xl font-semibold text-white">{test.name}</h2>
                    {renderStatusIcon(test.status)}
                  </div>
                  <p className="mt-2 text-slate-400">{test.description}</p>
                  
                  <div className="mt-4 flex items-center text-sm text-slate-400">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{test.estimatedTime}</span>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <span className={`text-sm ${
                      test.status === 'Completed' ? 'text-blue-400' : 
                      test.status === 'In Progress' ? 'text-yellow-400' : 'text-slate-400'
                    }`}>
                      {test.status}
                    </span>
                    
                    <button
                      onClick={() => handleSelectTest(test)}
                      className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      {test.status === 'Completed' ? 'Retake Test' : 'Take Test'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Completed Tests & Insights */}
            {completedTests > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-white mb-4">Your Test History</h2>
                
                <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-6">
                  {testData.filter(test => test.status === 'Completed').map((test) => (
                    <div key={test.id} className="mb-6 last:mb-0">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-white">{test.name}</h3>
                        <span className="text-sm text-slate-400">{test.completedDate}</span>
                      </div>
                      
                      {test.result && (
                        <div className="mt-2">
                          <p className="text-blue-400 font-medium">{test.result.interpretation}</p>
                          <h4 className="text-white mt-3 mb-2">Suggestions:</h4>
                          <ul className="space-y-1">
                            {test.result.suggestions.map((suggestion, index) => (
                              <li key={index} className="text-slate-400 flex items-start">
                                <span className="text-blue-400 mr-2">•</span>
                                <span>{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  <div className="mt-6 pt-6 border-t border-slate-700">
                    <h3 className="text-lg font-medium text-white mb-3">AI Insights</h3>
                    <p className="text-slate-400">
                      Your anxiety levels have improved over the past month. 
                      Continue practicing mindfulness activities and maintaining your sleep schedule.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        
        {testView === 'taking' && selectedTest && selectedTest.questions && (
          <div className="max-w-2xl mx-auto">
            {/* Test Header */}
            <div className="mb-8">
              <button 
                onClick={handleBackToTests}
                className="text-slate-400 hover:text-white mb-4 inline-flex items-center"
              >
                <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                Back to tests
              </button>
              
              <h1 className="text-2xl font-bold text-white">{selectedTest.name}</h1>
              <p className="mt-1 text-slate-400">Question {currentQuestionIndex + 1} of {selectedTest.questions.length}</p>
              
              {/* Progress Bar */}
              <div className="mt-4 w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${calculateProgress()}%` }}
                ></div>
              </div>
            </div>
            
            {/* Current Question */}
            <div className="bg-slate-800/70 rounded-lg border border-slate-700 p-6">
              <h2 className="text-xl font-medium text-white mb-6">
                {selectedTest.questions[currentQuestionIndex].text}
              </h2>
              
              <div className="space-y-3">
                {selectedTest.questions[currentQuestionIndex].options.map((option) => (
                  <div 
                    key={option.value}
                    onClick={() => handleSelectAnswer(selectedTest.questions![currentQuestionIndex].id, option.value)}
                    className={`p-4 rounded-md border cursor-pointer transition-all ${
                      answers[selectedTest.questions![currentQuestionIndex].id] === option.value
                        ? 'border-blue-500 bg-blue-600/20 text-blue-400'
                        : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                    }`}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
              
              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleNextQuestion}
                  disabled={answers[selectedTest.questions[currentQuestionIndex].id] === undefined}
                  className={`inline-flex items-center px-6 py-3 rounded-md text-white font-medium ${
                    answers[selectedTest.questions[currentQuestionIndex].id] === undefined
                      ? 'bg-slate-700 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {currentQuestionIndex < selectedTest.questions.length - 1 ? 'Next Question' : 'Complete Test'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}
        
        {testView === 'results' && selectedTest && (
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <button 
                onClick={handleBackToTests}
                className="text-slate-400 hover:text-white mb-4 inline-flex items-center"
              >
                <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                Back to tests
              </button>
              
              <h1 className="text-2xl font-bold text-white">Your Results</h1>
              <p className="mt-1 text-slate-400">{selectedTest.name}</p>
            </div>
            
            <div className="bg-slate-800/70 rounded-lg border border-slate-700 p-6">
              <div className="flex items-center justify-center mb-8">
                <div className="w-32 h-32 rounded-full bg-blue-600/20 border-4 border-blue-500 flex items-center justify-center">
                  <span className="text-3xl font-bold text-blue-400">12/40</span>
                </div>
              </div>
              
              <h2 className="text-xl font-semibold text-white text-center mb-4">Mild Stress Level</h2>
              
              <p className="text-slate-400 mb-6">
                Your results indicate a mild level of perceived stress. While some stress is normal, 
                there are strategies you can implement to manage it effectively.
              </p>
              
              <h3 className="text-lg font-medium text-white mb-3">AI Suggestions</h3>
              <ul className="space-y-3">
                <li className="bg-slate-800/50 p-4 rounded-md border border-slate-700">
                  <div className="font-medium text-white mb-1">Practice mindfulness meditation</div>
                  <p className="text-slate-400 text-sm">
                    Spending just 5-10 minutes daily on mindfulness exercises can significantly reduce stress levels.
                  </p>
                </li>
                <li className="bg-slate-800/50 p-4 rounded-md border border-slate-700">
                  <div className="font-medium text-white mb-1">Physical activity</div>
                  <p className="text-slate-400 text-sm">
                    Regular exercise, even a short daily walk, releases endorphins that combat stress.
                  </p>
                </li>
                <li className="bg-slate-800/50 p-4 rounded-md border border-slate-700">
                  <div className="font-medium text-white mb-1">Limit screen time before bed</div>
                  <p className="text-slate-400 text-sm">
                    Reducing screen exposure 1-2 hours before sleep can improve sleep quality and reduce stress.
                  </p>
                </li>
              </ul>
              
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleBackToTests}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-medium"
                >
                  Return to Tests
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}