"use client"
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, ArrowRight, ChevronDown, ChevronUp, Loader2, Send, Plus, Sparkles } from 'lucide-react';
import axios from 'axios';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc, updateDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import GratitudeModal from '@/components/modals/GratitudeModal';
import { getLatestJournalEntry, extractGratitudeApiPayload } from '@/utils/journal/getLatestJournal';

interface ExerciseData {
  text: string;
  completed: boolean;
  userInput?: string[];
}

interface ExercisesMap {
  [key: string]: ExerciseData;
}

const DEFAULT_EXERCISES: ExercisesMap = {
  gratitude_exercise: {
    completed: false,
    text: "Finding Calm Amidst the Storm: A Gratitude Exercise for Fear It's completely understandable to feel overwhelmed by fear and anxiety, especially when facing a challenging situation like a big presentation. Today, we'll practice gratitude, a powerful tool that can help shift your focus from what's causing you fear to what's good in your life. Even during difficult times, there are always things to be grateful for, and noticing them can bring a sense of calm and perspective. How Gratitude Helps: Focusing on gratitude can reduce stress hormones, improve sleep, and boost your mood. It reminds you of your strengths and resources, even when fear makes you feel vulnerable. Steps: 1. Acknowledge Your Fear: Take a deep breath and acknowledge the fear you're experiencing. It's okay to feel this way. Writing down your worries, like you did in your journal entry, is a great first step. 2. Find Three Small Gratitudes: Now, let's shift gears. Think of three small things you're grateful for today. These can be anything, no matter how seemingly insignificant. Examples: a warm cup of tea, a sunny moment, a helpful colleague. 3. Struggling to find any? If you're finding it difficult, try these prompts: * What's one thing your body does for you that you appreciate? (e.g., breathing, seeing) * Is there a person in your life you're thankful for? * What's one comfortable or safe thing in your environment right now? 4. Write it Down: Write down your three gratitudes. Next to each one, write a sentence or two explaining why you appreciate it. For example: \"I'm grateful for my colleague's feedback. It helped me improve my presentation and feel more prepared.\" 5. Reflect: Take a moment to reflect on how you feel after focusing on these gratitudes. Do you notice any shift in your mood or perspective? Conclusion: Practicing gratitude regularly, especially during challenging times, can build resilience and help you navigate fear with more ease. Remember, even small moments of gratitude can make a big difference. You've already identified one – your colleague's support. Hold onto that, and continue to seek out the good. You've got this. ",
    userInput: []
  },
  mindfulness_meditation: {
    completed: false,
    text: " # 5-Minute Mindfulness Meditation ## Introduction This simple mindfulness meditation helps you reconnect with the present moment and calm your mind. It takes only 5 minutes and can be done anywhere. ## Steps 1. Find a comfortable seated position. Close your eyes or soften your gaze. 2. Take 3 deep breaths, inhaling through your nose and exhaling through your mouth. 3. Allow your breath to return to its natural rhythm. Notice the sensation of air entering and leaving your body. 4. As thoughts arise, acknowledge them without judgment, then gently return your focus to your breath. 5. Scan your body from head to toe, noticing any areas of tension. Breathe into these areas. 6. For the final minute, expand your awareness to include sounds around you. 7. Gradually wiggle your fingers and toes before opening your eyes. ## Benefits Regular practice can reduce stress, improve focus, and increase emotional regulation. "
  },
  relaxation_techniques: {
    completed: false,
    text: " # Progressive Muscle Relaxation ## Introduction Progressive Muscle Relaxation (PMR) is a technique that helps release physical tension and promotes relaxation through the systematic tensing and releasing of muscle groups. ## Steps 1. Find a quiet, comfortable place to sit or lie down. 2. Start with your feet. Curl your toes tightly for 5-7 seconds, then release completely. 3. Move to your calves and thighs, tensing each muscle group for 5-7 seconds, then releasing. 4. Continue with your hips, abdomen, chest, hands, arms, shoulders, neck, and face. 5. For each area, focus on the contrast between tension and relaxation. 6. After completing the sequence, take a few moments to enjoy the sensation of complete relaxation. ## Benefits PMR can reduce physical symptoms of anxiety, improve sleep quality, and help manage chronic pain. "
  }
};

// Helper function to extract title from markdown content
const extractTitleFromMarkdown = (markdown: string | undefined): string => {
  // Handle undefined or null markdown content
  if (!markdown) return 'Exercise';
  
  // Look for a title in markdown format (# Title or ## Title)
  const titleMatch = markdown.match(/^#+ (.+)$/m);
  if (titleMatch) return titleMatch[1];

  // Look for the first line as a fallback
  const firstLine = markdown.split('\n')[0];
  if (firstLine) return firstLine.replace(/^[#:]+/, '').trim();

  // Default title if nothing found
  return 'Exercise';
};

// Helper function to extract description from markdown
const extractDescriptionFromMarkdown = (markdown: string | undefined): string => {
  // Handle undefined or null markdown content
  if (!markdown) return 'Therapeutic exercise for mental wellness';
  
  // Look for the second line or paragraph
  const lines = markdown.split('\n').filter(line => line.trim() !== '');
  if (lines.length > 1) return lines[1].replace(/^[#:]+/, '').trim();
  
  return 'Therapeutic exercise for mental wellness';
};

export default function DailyExercise() {
  const [activeTab, setActiveTab] = useState('Daily Exercise');
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [exercisesData, setExercisesData] = useState<ExercisesMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [gratitudeInput, setGratitudeInput] = useState<string>('');
  const [gratitudeList, setGratitudeList] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedGratitudes, setGeneratedGratitudes] = useState<string[]>([]);
  // New state for modal
  const [isGratitudeModalOpen, setIsGratitudeModalOpen] = useState(false);
  const [gratitudeModalContent, setGratitudeModalContent] = useState('');
  const [apiError, setApiError] = useState<string | null>(null);
  const { currentUser, userData } = useAuth();

  // Format the exercise ID from snake_case to readable format
  const formatExerciseId = (id: string): string => {
    return id.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Fetch exercises data from Firestore
  useEffect(() => {
    const fetchExercises = async () => {
      // Initialize with default hard-coded exercises
      let exercises = { ...DEFAULT_EXERCISES };
      
      if (!currentUser) {
        setExercisesData(exercises);
        setLoading(false);
        return;
      }

      // Check local storage first
      const cachedData = localStorage.getItem(`exercises_${currentUser.uid}`);
      const cachedTimestamp = localStorage.getItem(`exercises_timestamp_${currentUser.uid}`);
      
      // If we have cached data and it's less than 1 hour old, use it
      if (cachedData && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp);
        if (Date.now() - timestamp < 3600000) { // 1 hour in milliseconds
          const parsedData = JSON.parse(cachedData);
          setExercisesData(parsedData);
          // Extract gratitude list if it exists
          if (parsedData.gratitude_exercise?.userInput) {
            setGratitudeList(parsedData.gratitude_exercise.userInput);
          }
          setLoading(false);
          return;
        }
      }

      try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists() && userDoc.data().exercises) {
          // Merge Firestore exercises with default ones
          const firestoreExercises = userDoc.data().exercises as ExercisesMap;
          
          // Only add non-hardcoded exercises from Firestore
          Object.entries(firestoreExercises).forEach(([key, value]) => {
            if (!DEFAULT_EXERCISES[key]) {
              exercises[key] = value;
            } else {
              // For hard-coded exercises, take the completion status and userInput from Firestore
              exercises[key] = {
                ...DEFAULT_EXERCISES[key],
                completed: firestoreExercises[key]?.completed || false,
                userInput: firestoreExercises[key]?.userInput || []
              };
            }
          });

          // Extract gratitude list if it exists
          if (firestoreExercises.gratitude_exercise?.userInput) {
            setGratitudeList(firestoreExercises.gratitude_exercise.userInput);
          }
        }
      } catch (error) {
        console.error("Error fetching exercises:", error);
      } finally {
        // Cache the merged data
        localStorage.setItem(`exercises_${currentUser.uid}`, JSON.stringify(exercises));
        localStorage.setItem(`exercises_timestamp_${currentUser.uid}`, Date.now().toString());
        
        setExercisesData(exercises);
        setLoading(false);
      }
    };

    fetchExercises();
  }, [currentUser]);

  const toggleExercise = (id: string) => {
    setExpandedExercise(expandedExercise === id ? null : id);
  };

  const handleComplete = async (id: string) => {
    if (!exercisesData) return;

    // Update local state first for immediate feedback
    const updatedExercises = {
      ...exercisesData,
      [id]: {
        ...exercisesData[id],
        completed: true
      }
    };
    
    setExercisesData(updatedExercises);
    
    if (currentUser) {
      // Update localStorage cache
      localStorage.setItem(`exercises_${currentUser.uid}`, JSON.stringify(updatedExercises));
      
      // Then update Firestore
      try {
        const userRef = doc(db, "users", currentUser.uid);
        await updateDoc(userRef, {
          [`exercises.${id}.completed`]: true
        });
      } catch (error) {
        console.error("Error updating exercise completion status:", error);
        
        // Revert local state if the update failed
        setExercisesData(exercisesData);
        if (currentUser) {
          localStorage.setItem(`exercises_${currentUser.uid}`, JSON.stringify(exercisesData));
        }
      }
    }
  };

  // Add a gratitude entry
  const addGratitude = async () => {
    if (!gratitudeInput.trim() || !currentUser || !exercisesData) return;
    
    setIsSaving(true);
    
    try {
      // Update the list in local state
      const newList = [...gratitudeList, gratitudeInput.trim()];
      setGratitudeList(newList);
      
      // Update exercises data
      const updatedExercises = {
        ...exercisesData,
        gratitude_exercise: {
          ...exercisesData.gratitude_exercise,
          userInput: newList
        }
      };
      
      setExercisesData(updatedExercises);
      
      // Update localStorage cache
      localStorage.setItem(`exercises_${currentUser.uid}`, JSON.stringify(updatedExercises));
      
      // Update Firestore
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        'exercises.gratitude_exercise.userInput': newList
      });
      
      // Clear the input field
      setGratitudeInput('');
    } catch (error) {
      console.error("Error saving gratitude:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Generate gratitude suggestions - Using hard-coded response instead of API
  const generateGratitudes = async () => {
    if (!currentUser) return;
    
    setIsGenerating(true);
    setApiError(null);
    
    try {
      // Simulate API loading time for a more natural UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Hard-coded gratitude exercise response
      const hardCodedGratitudeExercise = `
# Finding Light in the Everyday: Your Personalized Gratitude Reflection

## Why Gratitude Matters
When we feel disconnected or mentally foggy, practicing gratitude can be a powerful way to reconnect with ourselves and the world around us. Research shows that focusing on things we're thankful for can reduce stress hormones and help lift our mood, even when we're feeling low.

## Three Things to Consider Being Grateful For Today

### 1. Your Body's Resilience
Even when your mind feels foggy, your body continues to work for you - breathing, moving, sensing the world. Take a moment to appreciate how your body supports you, even on difficult days. Perhaps you can feel gratitude for your lungs drawing breath, or your heart steadily beating.

### 2. Moments of Connection
Think about a small interaction that brought you a moment of connection recently - perhaps someone smiled at you, or you exchanged a few kind words with a stranger. These brief moments remind us we're not alone, even when we feel disconnected.

### 3. Safe Spaces
Consider the physical spaces where you feel most at ease. Maybe it's a comfortable corner of your home, a favorite chair, or even just the feeling of fresh sheets on your bed. Expressing gratitude for these safe harbors can help ground us when we feel adrift.

## A Simple Practice
Tonight before you sleep, try writing down just one thing from today that you appreciate. It doesn't have to be profound - sometimes the simplest things bring the most comfort.

Remember, gratitude isn't about denying difficult feelings. It's about finding small points of light even while acknowledging the shadows. Your emotions are valid, and practicing gratitude alongside them can help create small shifts in perspective.
      `;
      
      // Set the modal content to our hard-coded response
      setGratitudeModalContent(hardCodedGratitudeExercise);
      setIsGratitudeModalOpen(true);
      
      // For the previous implementation that used an array of gratitudes
      // We can also provide some default suggestions
      setGeneratedGratitudes([
        "The comfort of having a safe place to rest at the end of the day",
        "My body's ability to heal and recover, even during stressful times",
        "Small moments of peace found between busy thoughts"
      ]);
      
    } catch (error) {
      console.error("Error in gratitude generation:", error);
      setApiError("Something went wrong. Please try again later.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Use a generated gratitude
  const useGeneratedGratitude = async (gratitude: string) => {
    setGratitudeInput(gratitude);
    // Remove from the generated list
    setGeneratedGratitudes(generatedGratitudes.filter(g => g !== gratitude));
  };

  // Count the number of completed exercises
  const completedCount = exercisesData 
    ? Object.values(exercisesData).filter(exercise => exercise.completed).length 
    : 0;

  // Total number of exercises
  const totalExercises = exercisesData ? Object.keys(exercisesData).length : Object.keys(DEFAULT_EXERCISES).length;

  // Render the Gratitude Exercise content
  const renderGratitudeExercise = () => {
    return (
      <div>
        {/* Display current gratitude list */}
        {gratitudeList.length > 0 && (
          <div className="mb-4">
            <h3 className="text-blue-300 text-lg font-medium mb-2">Your Gratitude List:</h3>
            <ul className="list-disc list-inside bg-slate-900/30 p-4 rounded-lg">
              {gratitudeList.map((item, index) => (
                <li key={index} className="text-slate-300 mb-2">{item}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Input for new gratitude */}
        <div className="mb-4">
          <h3 className="text-blue-300 text-lg font-medium mb-2">Add to Your Gratitude List:</h3>
          <div className="flex">
            <input
              type="text"
              className="flex-grow p-2 rounded-l-lg bg-slate-800 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="I'm grateful for..."
              value={gratitudeInput}
              onChange={(e) => setGratitudeInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addGratitude()}
            />
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-r-lg flex items-center justify-center"
              onClick={addGratitude}
              disabled={isSaving}
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </div>
        
        {/* Generated gratitude suggestions */}
        {generatedGratitudes.length > 0 && (
          <div className="mb-4">
            <h3 className="text-green-300 text-lg font-medium mb-2">Suggested Gratitudes:</h3>
            <div className="grid grid-cols-1 gap-2">
              {generatedGratitudes.map((item, index) => (
                <div 
                  key={index} 
                  className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 hover:border-blue-500 cursor-pointer flex justify-between items-center"
                  onClick={() => useGeneratedGratitude(item)}
                >
                  <span className="text-slate-300">{item}</span>
                  <Plus className="h-4 w-4 text-blue-400" />
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* API error message */}
        {apiError && (
          <div className="mt-4 p-3 bg-red-900/20 border border-red-800/50 rounded-lg text-red-300 text-sm">
            {apiError}
          </div>
        )}
        
        {/* Need help finding gratitude */}
        {gratitudeList.length < 3 && (
          <div className="flex justify-center mt-4">
            <button
              className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              onClick={generateGratitudes}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating reflection...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Help me find things to be grateful for</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-300">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Container */}
      <div className="flex-grow p-6 bg-slate-800/50 rounded-lg border border-slate-700 ml-6 mb-6 mr-6 overflow-y-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-white font-bold text-3xl">Therapeutic Exercises</h1>
            <p className="text-slate-400 mt-2">Complete these exercises to improve your mental wellbeing</p>
          </div>
          <div className="bg-blue-600/20 text-blue-400 border border-blue-500/30 py-2 px-4 rounded-lg flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span>{completedCount}/{totalExercises} Completed</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-10">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-slate-400">Progress</span>
            <span className="text-sm font-medium text-blue-400">
              {totalExercises > 0 ? Math.round((completedCount / totalExercises) * 100) : 0}%
            </span>
          </div>
          <div className="h-2 w-full bg-slate-700 rounded-full">
            <div 
              className="h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${totalExercises > 0 ? (completedCount / totalExercises) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center p-10">
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
            <span className="ml-3 text-slate-400">Loading exercises...</span>
          </div>
        ) : !exercisesData ? (
          <div className="text-center p-10 bg-slate-800/70 rounded-xl border border-slate-700">
            <h3 className="text-xl font-medium text-white">No exercises found</h3>
            <p className="mt-2 text-slate-400">Please check your account or contact support if this persists.</p>
          </div>
        ) : (
          /* Exercises Section */
          <div className="space-y-4">
            {Object.entries(exercisesData).map(([id, exercise]) => {
              const title = extractTitleFromMarkdown(exercise.text);
              const description = extractDescriptionFromMarkdown(exercise.text);
              
              // Determine styling based on completion status
              const cardBg = exercise.completed ? "bg-green-900/20" : "bg-slate-800/70";
              const borderColor = exercise.completed ? "border-green-700" : "border-slate-700";
              const statusText = exercise.completed ? "Completed" : "Pending";
              const statusIcon = exercise.completed ? 
                <CheckCircle className="h-5 w-5 text-green-400" /> : 
                <Clock className="h-5 w-5 text-slate-400" />;
              const textColor = exercise.completed ? "text-green-300" : "text-slate-300";

              return (
                <div 
                  key={id} 
                  className={`${cardBg} rounded-xl border ${borderColor} hover:shadow-lg transition-all duration-300 overflow-hidden`}
                >
                  <div 
                    className={`p-5 cursor-pointer ${expandedExercise === id ? 'border-b border-slate-700/50' : ''}`} 
                    onClick={() => toggleExercise(id)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className={`w-2 h-10 ${exercise.completed ? 'bg-green-400' : 'bg-blue-500'} rounded-full mr-4`}></div>
                        <div>
                          <h3 className={`font-medium text-lg ${exercise.completed ? 'text-green-300' : 'text-white'}`}>
                            {formatExerciseId(id)}
                          </h3>
                          <p className="text-sm text-slate-400 mt-1">{title}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="flex items-center mr-4">
                          <span className={`text-sm mr-2 ${textColor}`}>{statusText}</span>
                          {statusIcon}
                        </div>
                        {expandedExercise === id ? (
                          <ChevronUp className="h-5 w-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {expandedExercise === id && (
                    <div className="p-5 animate-fadeIn">
                      <div className="bg-slate-900/50 p-4 rounded-lg mb-4">
                        <div className="text-slate-300 prose prose-invert max-w-none prose-headings:text-blue-400 prose-a:text-blue-400">
                          <ReactMarkdown 
                            rehypePlugins={[rehypeRaw]}
                            remarkPlugins={[remarkGfm]}
                          >
                            {exercise.text}
                          </ReactMarkdown>
                          
                          {/* Special content for gratitude exercise */}
                          {id === 'gratitude_exercise' && renderGratitudeExercise()}
                        </div>
                      </div>
                      {!exercise.completed && (
                        <div className="flex justify-end mt-4">
                          <button 
                            onClick={() => handleComplete(id)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center transition-colors"
                            disabled={id === 'gratitude_exercise' && gratitudeList.length < 3}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark as Completed
                            {id === 'gratitude_exercise' && gratitudeList.length < 3 && 
                              <span className="ml-2 text-xs">(Add at least 3 gratitudes)</span>
                            }
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Completed Section - Show when all exercises are completed */}
        {exercisesData && completedCount === totalExercises && totalExercises > 0 && (
          <div className="mt-8 p-6 bg-green-900/20 border border-green-700 rounded-xl animate-fadeIn">
            <h3 className="text-xl font-bold text-green-300 mb-2">All Exercises Completed!</h3>
            <p className="text-slate-300">Great job completing all your therapeutic exercises. Your mental wellness journey is progressing well.</p>
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
          
          /* Markdown styling */
          .prose h1, .prose h2, .prose h3 {
            margin-top: 1rem;
            margin-bottom: 0.75rem;
          }
          .prose p {
            margin-top: 0.5rem;
            margin-bottom: 0.5rem;
          }
          .prose ul, .prose ol {
            margin-top: 0.5rem;
            margin-bottom: 0.5rem;
            padding-left: 1.5rem;
          }
          .prose li {
            margin-top: 0.25rem;
            margin-bottom: 0.25rem;
          }
          .prose strong {
            color: #a5b4fc;
            font-weight: 600;
          }
          .prose em {
            color: #d1d5db;
            font-style: italic;
          }
          .prose blockquote {
            border-left: 3px solid #4b5563;
            padding-left: 1rem;
            color: #9ca3af;
            font-style: italic;
          }
          .prose pre {
            background-color: #1e293b;
            padding: 0.75rem;
            border-radius: 0.5rem;
            overflow-x: auto;
          }
          .prose code {
            color: #a5b4fc;
            background-color: rgba(30, 41, 59, 0.5);
            padding: 0.125rem 0.25rem;
            border-radius: 0.25rem;
          }
          .prose table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
          }
          .prose th, .prose td {
            border: 1px solid #374151;
            padding: 0.5rem;
            text-align: left;
          }
          .prose th {
            background-color: #1e293b;
          }
        `}</style>
      </div>

      {/* Gratitude Modal */}
      <GratitudeModal
        isOpen={isGratitudeModalOpen}
        onClose={() => setIsGratitudeModalOpen(false)}
        content={gratitudeModalContent}
      />
    </div>
  );
}
