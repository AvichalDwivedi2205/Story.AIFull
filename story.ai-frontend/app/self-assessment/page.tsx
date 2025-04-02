// pages/self-assessment.tsx
"use client"
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { ArrowRight, BarChart, Clock, CheckCircle, CircleSlash, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { saveAssessmentResult } from '@/config/firebase';
import { stressQuestions, calculateStressScore, StressResult } from '@/questionairres/stress';
import { personalityQuestions, calculatePersonalityType, PersonalityResult } from '@/questionairres/personality';
import { anxietyQuestions, calculateAnxietyScore, AnxietyResult } from '@/questionairres/anxiety';
import { format } from 'date-fns';

// Define test status types
type TestStatus = 'Not Started' | 'In Progress' | 'Completed';
type TestType = 'PSS' | 'Personality' | 'GAD';

// Define the assessment test interface
interface AssessmentTest {
  id: TestType;
  name: string;
  description: string;
  estimatedTime: string;
  status: TestStatus;
  questions: any[];
  result?: any;
  completedDate?: string;
}

export default function SelfAssessment() {
  const { currentUser, userData } = useAuth();
  const [activeTab, setActiveTab] = useState('Self-Assessment');
  const [selectedTest, setSelectedTest] = useState<AssessmentTest | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [testView, setTestView] = useState<'list' | 'taking' | 'results'>('list');
  const [testData, setTestData] = useState<AssessmentTest[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize test data from questionnaires
  useEffect(() => {
    const initialTestData: AssessmentTest[] = [
      {
        id: 'PSS',
        name: 'Stress Level Test',
        description: 'Measures your overall stress levels.',
        estimatedTime: '5 min',
        status: 'Not Started',
        questions: stressQuestions,
      },
      {
        id: 'Personality',
        name: 'Personality Type Test',
        description: 'Evaluates personality patterns and emotional functioning.',
        estimatedTime: '10 min',
        status: 'Not Started',
        questions: personalityQuestions,
      },
      {
        id: 'GAD',
        name: 'Anxiety Assessment',
        description: 'Assesses anxiety symptoms and their severity.',
        estimatedTime: '3 min',
        status: 'Not Started',
        questions: anxietyQuestions,
      },
    ];

    // Update test statuses based on userData if available
    if (userData && userData.assessment) {
      const updatedTestData = initialTestData.map(test => {
        const assessmentData = userData.assessment[test.id];
        if (assessmentData) {
          const completionDate = assessmentData.time?.toDate 
            ? format(assessmentData.time.toDate(), 'MMMM dd, yyyy')
            : format(new Date(), 'MMMM dd, yyyy');

          return {
                ...test,
                status: 'Completed' as TestStatus,
                completedDate: completionDate,
                result: test.id === 'Personality' 
                  ? { type: assessmentData.type, scores: assessmentData.scores, interpretation: assessmentData.interpretation } 
                  : { score: assessmentData.score, level: assessmentData.level, interpretation: assessmentData.interpretation, suggestions: assessmentData.suggestions }
              } as AssessmentTest;
        }
        return test;
      });

      setTestData(updatedTestData);
    } else {
      setTestData(initialTestData);
    }
  }, [userData]);

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
      // Complete the test and calculate results
      calculateAndSaveResults();
    }
  };

  // Calculate and save test results
  const calculateAndSaveResults = async () => {
    if (!selectedTest || !currentUser) return;

    setIsSubmitting(true);
    
    let result;
    
    switch (selectedTest.id) {
      case 'PSS':
        result = calculateStressScore(answers);
        break;
      case 'Personality':
        result = calculatePersonalityType(answers);
        break;
      case 'GAD':
        result = calculateAnxietyScore(answers);
        break;
      default:
        result = null;
    }
    
    if (result) {
      // Save to Firebase
      try {
        await saveAssessmentResult(currentUser.uid, selectedTest.id, result);
        
        // Update test data with results
        setTestData(prevData => 
          prevData.map(test => 
            test.id === selectedTest.id 
              ? {
                  ...test,
                  status: 'Completed',
                  completedDate: format(new Date(), 'MMMM dd, yyyy'),
                  result
                }
              : test
          )
        );
        
        // Update selected test with results
        setSelectedTest({
          ...selectedTest,
          status: 'Completed',
          completedDate: format(new Date(), 'MMMM dd, yyyy'),
          result
        });
        
        // Show results view
        setTestView('results');
      } catch (error) {
        console.error('Error saving test results:', error);
      }
    }
    
    setIsSubmitting(false);
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

  // Render options based on the selected test type
  const renderOptions = (question: any) => {
    return question.options.map((option: any) => (
      <div 
        key={option.value}
        onClick={() => handleSelectAnswer(question.id, option.value)}
        className={`p-4 rounded-md border cursor-pointer transition-all ${
          answers[question.id] === option.value
            ? 'border-blue-500 bg-blue-600/20 text-blue-400'
            : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
        }`}
      >
        {option.label}
      </div>
    ));
  };

  // Render test results based on test type
  const renderTestResults = () => {
    if (!selectedTest || !selectedTest.result) return null;

    switch (selectedTest.id) {
      case 'PSS':
        const stressResult = selectedTest.result as StressResult;
        return (
          <>
            <div className="flex items-center justify-center mb-8">
              <div className="w-32 h-32 rounded-full bg-blue-600/20 border-4 border-blue-500 flex items-center justify-center">
                <span className="text-3xl font-bold text-blue-400">{stressResult.score}/40</span>
              </div>
            </div>
            
            <h2 className="text-xl font-semibold text-white text-center mb-4">{stressResult.level} Stress Level</h2>
            
            <p className="text-slate-400 mb-6">{stressResult.interpretation}</p>
            
            <h3 className="text-lg font-medium text-white mb-3">Suggestions</h3>
            <ul className="space-y-3">
              {stressResult.suggestions.map((suggestion, idx) => (
                <li key={idx} className="bg-slate-800/50 p-4 rounded-md border border-slate-700">
                  <div className="text-slate-400">{suggestion}</div>
                </li>
              ))}
            </ul>
          </>
        );

      case 'Personality':
        const personalityResult = selectedTest.result as PersonalityResult;
        const { type, scores, interpretation } = personalityResult;
        return (
          <>
            <div className="flex items-center justify-center mb-8">
              <div className="w-32 h-32 rounded-full bg-blue-600/20 border-4 border-blue-500 flex items-center justify-center">
                <span className="text-3xl font-bold text-blue-400">{type}</span>
              </div>
            </div>
            
            <h2 className="text-xl font-semibold text-white text-center mb-4">{interpretation}</h2>
            
            <h3 className="text-lg font-medium text-white mb-3">Your Dimension Scores</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-800/50 p-4 rounded-md border border-slate-700">
                <div className="font-medium text-white mb-1">Extraversion (E): {scores.E}</div>
                <div className="font-medium text-white mb-1">Introversion (I): {scores.I}</div>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-md border border-slate-700">
                <div className="font-medium text-white mb-1">Sensing (S): {scores.S}</div>
                <div className="font-medium text-white mb-1">Intuition (N): {scores.N}</div>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-md border border-slate-700">
                <div className="font-medium text-white mb-1">Thinking (T): {scores.T}</div>
                <div className="font-medium text-white mb-1">Feeling (F): {scores.F}</div>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-md border border-slate-700">
                <div className="font-medium text-white mb-1">Judging (J): {scores.J}</div>
                <div className="font-medium text-white mb-1">Perceiving (P): {scores.P}</div>
              </div>
            </div>
          </>
        );

      case 'GAD':
        const anxietyResult = selectedTest.result as AnxietyResult;
        return (
          <>
            <div className="flex items-center justify-center mb-8">
              <div className="w-32 h-32 rounded-full bg-blue-600/20 border-4 border-blue-500 flex items-center justify-center">
                <span className="text-3xl font-bold text-blue-400">{anxietyResult.score}/21</span>
              </div>
            </div>
            
            <h2 className="text-xl font-semibold text-white text-center mb-4">{anxietyResult.level} Anxiety Level</h2>
            
            <p className="text-slate-400 mb-6">{anxietyResult.interpretation}</p>
            
            <h3 className="text-lg font-medium text-white mb-3">Suggestions</h3>
            <ul className="space-y-3">
              {anxietyResult.suggestions.map((suggestion, idx) => (
                <li key={idx} className="bg-slate-800/50 p-4 rounded-md border border-slate-700">
                  <div className="text-slate-400">{suggestion}</div>
                </li>
              ))}
            </ul>
          </>
        );

      default:
        return null;
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
                      {test.completedDate && ` on ${test.completedDate}`}
                    </span>
                    
                    <button
                      onClick={() => handleSelectTest(test)}
                      className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                      disabled={!currentUser}
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
                          {test.id === 'Personality' ? (
                            <p className="text-blue-400 font-medium">
                              Type: {test.result.type} - {test.result.interpretation}
                            </p>
                          ) : (
                            <>
                              <p className="text-blue-400 font-medium">{test.result.interpretation}</p>
                              <h4 className="text-white mt-3 mb-2">Suggestions:</h4>
                              <ul className="space-y-1">
                                {test.result.suggestions.map((suggestion: string, index: number) => (
                                  <li key={index} className="text-slate-400 flex items-start">
                                    <span className="text-blue-400 mr-2">•</span>
                                    <span>{suggestion}</span>
                                  </li>
                                ))}
                              </ul>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {completedTests >= 2 && (
                    <div className="mt-6 pt-6 border-t border-slate-700">
                      <h3 className="text-lg font-medium text-white mb-3">AI Insights</h3>
                      <p className="text-slate-400">
                        Based on your assessment results, you might benefit from regular mindfulness 
                        practices and establishing clear boundaries between work and personal time.
                        Continue practicing self-care routines that align with your personality type.
                      </p>
                    </div>
                  )}
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
                {renderOptions(selectedTest.questions[currentQuestionIndex])}
              </div>
              
              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleNextQuestion}
                  disabled={answers[selectedTest.questions[currentQuestionIndex].id] === undefined || isSubmitting}
                  className={`inline-flex items-center px-6 py-3 rounded-md text-white font-medium ${
                    answers[selectedTest.questions[currentQuestionIndex].id] === undefined || isSubmitting
                      ? 'bg-slate-700 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : currentQuestionIndex < selectedTest.questions.length - 1 ? (
                    <>
                      Next Question
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  ) : (
                    <>
                      Complete Test
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
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
              {renderTestResults()}
              
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