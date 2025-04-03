"use client"
import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Plus, Calendar, Clock, Trash2, Edit, Check, X, Filter, Moon, Coffee, Zap } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { collection, addDoc, updateDoc, deleteDoc, getDocs, doc, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useRouter } from 'next/navigation';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface Activity {
  id: string;
  title: string;
  description: string;
  category: 'Journal' | 'Exercise' | 'Challenge' | 'Therapy' | 'Custom' | 'Sleep' | 'Rest';
  day: string | string[]; // Updated to support multiple days
  startTime: string;
  endTime: string;
  completed: boolean;
  userId: string;
  createdAt: any;
  isAutoScheduled?: boolean;
  isSleepActivity?: boolean; // Added to identify sleep activities
}

// Category color mapping
const categoryColors: Record<string, string> = {
  Journal: 'bg-indigo-900/20 border-indigo-700/30',
  Exercise: 'bg-emerald-900/20 border-emerald-700/30',
  Challenge: 'bg-amber-900/20 border-amber-700/30',
  Therapy: 'bg-blue-900/20 border-blue-700/30',
  Custom: 'bg-purple-900/20 border-purple-700/30',
  Sleep: 'bg-slate-900/30 border-slate-700/40',
  Rest: 'bg-pink-900/20 border-pink-700/30',
};

const categoryTextColors: Record<string, string> = {
  Journal: 'bg-indigo-700/40 text-indigo-300',
  Exercise: 'bg-emerald-700/40 text-emerald-300',
  Challenge: 'bg-amber-700/40 text-amber-300',
  Therapy: 'bg-blue-700/40 text-blue-300',
  Custom: 'bg-purple-700/40 text-purple-300',
  Sleep: 'bg-slate-700/40 text-slate-300',
  Rest: 'bg-pink-700/40 text-pink-300',
};

const categoryIcons: Record<string, React.ReactNode> = {
  Journal: <Edit className="h-4 w-4 mr-1" />,
  Exercise: <Zap className="h-4 w-4 mr-1" />,
  Challenge: <Calendar className="h-4 w-4 mr-1" />,
  Therapy: <Check className="h-4 w-4 mr-1" />,
  Custom: <Filter className="h-4 w-4 mr-1" />,
  Sleep: <Moon className="h-4 w-4 mr-1" />,
  Rest: <Coffee className="h-4 w-4 mr-1" />,
};

// Days of the week
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Predefined exercises
const predefinedExercises = [
  {
    title: 'Morning Reflection',
    description: 'Reflect on how you feel and set intentions for the day ahead.',
    category: 'Journal',
    duration: '5 min'
  },
  {
    title: 'Gratitude Exercise',
    description: 'List three things you are grateful for today.',
    category: 'Journal',
    duration: '3 min'
  },
  {
    title: 'Mindfulness Meditation',
    description: 'A short breathing exercise to center yourself and reduce stress.',
    category: 'Therapy',
    duration: '7 min'
  },
  {
    title: 'CBT Exercise: Thought Challenging',
    description: 'Identify and reframe negative thought patterns using cognitive-behavioral techniques.',
    category: 'Therapy',
    duration: '10 min'
  },
  {
    title: 'Relaxation Technique',
    description: 'Progressive muscle relaxation to release physical tension.',
    category: 'Therapy',
    duration: '8 min'
  }
];

// Time slots for the timetable (all 24 hours with 3-hour intervals)
const timeSlots = Array.from({ length: 9 }, (_, i) => {
  const hour = i * 3; // 0, 3, 6, 9, 12, 15, 18, 21
  return `${hour < 10 ? '0' + hour : hour}:00`;
});

// Activity Item component for drag & drop functionality
// Define interface for drag item
interface ActivityDragItem {
  index: number;
}

const ActivityItem = ({ 
  activity, 
  index, 
  moveActivity, 
  editActivity, 
  deleteActivity, 
  toggleActivityCompletion 
}: {
  activity: Activity;
  index: number;
  moveActivity: (dragIndex: number, hoverIndex: number) => void;
  editActivity: (activity: Activity) => void;
  deleteActivity: (activityId: string) => void;
  toggleActivityCompletion: (activityId: string, currentStatus: boolean) => void;
}) => {
  const ref = useRef(null);
  
  const [{ isDragging }, drag] = useDrag<ActivityDragItem, unknown, { isDragging: boolean }>({
    type: 'activity',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  
  const [, drop] = useDrop<ActivityDragItem, unknown, {}>({
    accept: 'activity',
    hover: (item, monitor) => {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      
      if (dragIndex === hoverIndex) {
        return;
      }
      
      moveActivity(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });
  
  drag(drop(ref));
  
  // Use the same formatting logic as in the main component
  function formatTime(timeStr: string): string {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    
    if (hour === 0 || hour === 24) {
      return `12:${minutes || '00'} AM`;
    } else if (hour === 12) {
      return `12:${minutes || '00'} PM`;
    } else if (hour > 12) {
      return `${hour - 12}:${minutes || '00'} PM`;
    } else {
      return `${hour}:${minutes || '00'} AM`;
    }
  }

  return (
    <div 
      ref={ref}
      className={`p-4 ${categoryColors[activity.category]} hover:bg-slate-800/40 transition-colors ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
      style={{ cursor: 'move' }}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded text-xs font-medium flex items-center ${categoryTextColors[activity.category]}`}>
              {categoryIcons[activity.category]}
              {activity.category}
            </span>
            <span className="text-slate-400 text-sm">
              {typeof activity.day === 'string' 
                ? activity.day 
                : activity.day.join(', ')}
              : {formatTime(activity.startTime)} - {formatTime(activity.endTime)}
            </span>
          </div>
          <h4 className="font-medium text-white">{activity.title}</h4>
          {activity.description && (
            <p className="text-slate-300 text-sm mt-1">{activity.description}</p>
          )}
        </div>
        
        <div className="flex gap-1">
          <button 
            onClick={() => toggleActivityCompletion(activity.id, activity.completed)}
            className={`p-1.5 rounded-md transition-colors ${
              activity.completed 
                ? 'bg-green-700/20 text-green-400 hover:bg-green-700/30' 
                : 'bg-slate-700/20 text-slate-400 hover:bg-slate-700/30'
            }`}
          >
            <Check className="h-4 w-4" />
          </button>
          <button 
            onClick={() => editActivity(activity)}
            className="p-1.5 rounded-md bg-slate-700/20 text-slate-400 hover:bg-slate-700/30 transition-colors"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button 
            onClick={() => deleteActivity(activity.id)}
            className="p-1.5 rounded-md bg-red-900/20 text-red-400 hover:bg-red-900/30 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function WeeklyTimetable() {
  const [activeTab, setActiveTab] = useState('Routine Builder');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<Partial<Activity> | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterDay, setFilterDay] = useState<string>('All');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{day: string, startTime: string} | null>(null);
  const [sleepSchedule, setSleepSchedule] = useState<{wakeUpTime: string, sleepTime: string} | null>(null);
  const [isSleepPromptOpen, setIsSleepPromptOpen] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  
  const formRef = useRef<HTMLDivElement>(null);
  const { currentUser, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Fetch activities and sleep schedule from Firestore
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;

      try {
        // Fetch activities
        const activitiesQuery = query(
          collection(db, "timetable"), 
          where("userId", "==", currentUser.uid)
        );
        
        const querySnapshot = await getDocs(activitiesQuery);
        const fetchedActivities: Activity[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data() as Omit<Activity, 'id'>;
          fetchedActivities.push({
            ...data,
            id: doc.id
          } as Activity);
        });

        setActivities(fetchedActivities);
        setFilteredActivities(fetchedActivities);
        
        // Extract sleep schedule from activities
        const sleepActivities = fetchedActivities.filter(a => a.isSleepActivity && a.category === 'Sleep');
        
        if (sleepActivities.length > 0) {
          // Use the first sleep activity to determine sleep schedule
          const sleepActivity = sleepActivities[0];
          setSleepSchedule({
            sleepTime: sleepActivity.startTime,
            wakeUpTime: sleepActivity.endTime
          });
        } else {
          // If no sleep activities are found, prompt user to set sleep schedule
          setIsSleepPromptOpen(true);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  // Filter activities when category or day filter changes
  useEffect(() => {
    let filtered = [...activities];
    
    if (filterCategory !== 'All') {
      filtered = filtered.filter(activity => activity.category === filterCategory);
    }
    
    if (filterDay !== 'All') {
      filtered = filtered.filter(activity => 
        typeof activity.day === 'string' 
          ? activity.day === filterDay 
          : activity.day.includes(filterDay)
      );
    }
    
    setFilteredActivities(filtered);
  }, [filterCategory, filterDay, activities]);

  // Auto-schedule specific exercises based on sleep schedule
  useEffect(() => {
    if (!sleepSchedule || !currentUser) return;
    
    const scheduleSpecificExercises = async () => {
      try {
        // Check if auto-scheduled activities already exist
        const existingAutoScheduled = activities.filter(a => a.isAutoScheduled);
        if (existingAutoScheduled.length > 0) return;
        
        // Calculate times based on sleep schedule
        const wakeUpHour = parseInt(sleepSchedule.wakeUpTime.split(':')[0]);
        const wakeUpMinutes = parseInt(sleepSchedule.wakeUpTime.split(':')[1]);
        
        const sleepHour = parseInt(sleepSchedule.sleepTime.split(':')[0]);
        const sleepMinutes = parseInt(sleepSchedule.sleepTime.split(':')[1]);
        
        // 30 minutes after wake up
        const morningHour = wakeUpHour;
        const morningMinutes = wakeUpMinutes + 30;
        let adjustedMorningHour = morningHour;
        let adjustedMorningMinutes = morningMinutes;
        
        if (morningMinutes >= 60) {
          adjustedMorningHour = morningHour + Math.floor(morningMinutes / 60);
          adjustedMorningMinutes = morningMinutes % 60;
        }
        
        // 45 minutes before sleep
        let eveningHour = sleepHour;
        let eveningMinutes = sleepMinutes - 45;
        
        if (eveningMinutes < 0) {
          eveningHour = eveningHour - 1 + Math.floor(eveningMinutes / 60);
          eveningMinutes = (eveningMinutes % 60 + 60) % 60;
        }
        
        const morningTime = `${String(adjustedMorningHour).padStart(2, '0')}:${String(adjustedMorningMinutes).padStart(2, '0')}`;
        const eveningTime = `${String(eveningHour).padStart(2, '0')}:${String(eveningMinutes).padStart(2, '0')}`;
        
        // Create Morning Reflection exercise
        const morningExercise = {
          title: 'Morning Reflection',
          description: 'Reflect on how you feel and set intentions for the day.',
          category: 'Journal' as const,
          day: daysOfWeek, // All days
          startTime: morningTime,
          endTime: `${String(adjustedMorningHour).padStart(2, '0')}:${String(adjustedMorningMinutes + 5).padStart(2, '0')}`,
          completed: false,
          userId: currentUser.uid,
          isAutoScheduled: true,
          createdAt: serverTimestamp()
        };
        
        // Create Relaxation Technique exercise
        const eveningExercise = {
          title: 'Relaxation Technique',
          description: 'Progressive muscle relaxation to release physical tension before sleep.',
          category: 'Therapy' as const,
          day: daysOfWeek, // All days
          startTime: eveningTime,
          endTime: `${String(eveningHour).padStart(2, '0')}:${String(eveningMinutes + 8).padStart(2, '0')}`,
          completed: false,
          userId: currentUser.uid,
          isAutoScheduled: true,
          createdAt: serverTimestamp()
        };
        
        // Add to Firestore
        const morningRef = await addDoc(collection(db, "timetable"), morningExercise);
        const eveningRef = await addDoc(collection(db, "timetable"), eveningExercise);
        
        // Add to local state
        setActivities(prev => [
          ...prev, 
          { ...morningExercise, id: morningRef.id }, 
          { ...eveningExercise, id: eveningRef.id }
        ]);
        
        setSuccessMessage("Auto-scheduled activities based on your sleep schedule");
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (error) {
        console.error("Error auto-scheduling exercises:", error);
      }
    };
    
    scheduleSpecificExercises();
  }, [sleepSchedule, currentUser, activities]);

  // Check if a new activity time overlaps with existing activities
  const checkActivityOverlap = (day: string | string[], startTime: string, endTime: string, activityId?: string): boolean => {
    // Convert start/end times to minutes for easier comparison
    const newStartMinutes = convertTimeToMinutes(startTime);
    const newEndMinutes = convertTimeToMinutes(endTime);
    
    return activities.some(activity => {
      if (activity.id === activityId) return false;
      
      // Check if days overlap
      const activityDays = Array.isArray(activity.day) ? activity.day : [activity.day];
      const newDays = Array.isArray(day) ? day : [day];
      
      const daysOverlap = activityDays.some(d => newDays.includes(d));
      if (!daysOverlap) return false;
      
      const existingStartMinutes = convertTimeToMinutes(activity.startTime);
      const existingEndMinutes = convertTimeToMinutes(activity.endTime);
      
      // Check if there's any overlap
      return (
        (newStartMinutes >= existingStartMinutes && newStartMinutes < existingEndMinutes) || 
        (newEndMinutes > existingStartMinutes && newEndMinutes <= existingEndMinutes) ||
        (newStartMinutes <= existingStartMinutes && newEndMinutes >= existingEndMinutes)
      );
    });
  };

  // Convert time string (HH:MM) to minutes
  const convertTimeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + (minutes || 0);
  };

  // Handle form submission for creating or updating activity
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser || !currentActivity || !currentActivity.title || !currentActivity.day || !currentActivity.startTime || !currentActivity.endTime) {
      setFormError("Please fill in all required fields");
      return;
    }
    
    // Validate times
    if (currentActivity.startTime >= currentActivity.endTime) {
      setFormError("Start time must be before end time");
      return;
    }

    // Check for time conflicts (skip for Sleep and Rest categories)
    if (currentActivity.category !== 'Sleep' && currentActivity.category !== 'Rest') {
      if (checkActivityOverlap(
        currentActivity.day, 
        currentActivity.startTime, 
        currentActivity.endTime, 
        isEditing ? currentActivity.id : undefined
      )) {
        setFormError("This time slot conflicts with an existing activity");
        return;
      }
    }

    try {
      if (isEditing && currentActivity.id) {
        // Update existing activity
        const activityRef = doc(db, "timetable", currentActivity.id);
        const { id, ...activityData } = currentActivity as Activity;
        
        await updateDoc(activityRef, {
          ...activityData,
          updatedAt: serverTimestamp()
        });

        setActivities(prev => prev.map(activity => 
          activity.id === currentActivity.id ? { ...activity, ...currentActivity } as Activity : activity
        ));
        setSuccessMessage("Activity updated successfully");
      } else {
        // Create new activity
        const newActivity = {
          ...currentActivity,
          userId: currentUser.uid,
          completed: false,
          createdAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, "timetable"), newActivity);
        
        setActivities(prev => [...prev, { ...newActivity, id: docRef.id } as Activity]);
        setSuccessMessage("Activity added successfully");
      }

      // Reset form
      setCurrentActivity(null);
      setIsFormOpen(false);
      setIsEditing(false);
      setFormError(null);
      setSelectedDays([]);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error("Error saving activity:", error);
      setFormError("Failed to save activity. Please try again.");
    }
  };

  // Save sleep schedule - Updated to create activities in the timetable collection
  const saveSleepSchedule = async (wakeUpTime: string, sleepTime: string) => {
    if (!currentUser) return;
    
    try {
      // First check if sleep activities already exist
      const existingSleepActivities = activities.filter(a => a.isSleepActivity && a.category === 'Sleep');
      
      if (existingSleepActivities.length > 0) {
        // Delete existing sleep activities
        for (const activity of existingSleepActivities) {
          await deleteDoc(doc(db, "timetable", activity.id));
        }
        
        // Remove from local state
        setActivities(prev => prev.filter(a => !a.isSleepActivity));
      }
      
      // Create sleep activity for each day of the week
      const sleepStartMinutes = convertTimeToMinutes(sleepTime);
      const wakeUpMinutes = convertTimeToMinutes(wakeUpTime);
      const isSleepSpanningDays = sleepStartMinutes > wakeUpMinutes;
      
      // Create sleep activities for all days of the week
      for (const day of daysOfWeek) {
        // For each day, create a sleep activity
        const nextDay = daysOfWeek[(daysOfWeek.indexOf(day) + 1) % 7];
        
        const sleepActivity = {
          title: `Sleep (${formatTime(sleepTime)} - ${formatTime(wakeUpTime)})`,
          description: 'Regular sleep schedule',
          category: 'Sleep' as const,
          day: isSleepSpanningDays ? [day, nextDay] : day, // If sleep spans across days, include both days
          startTime: sleepTime,
          endTime: wakeUpTime,
          completed: false,
          userId: currentUser.uid,
          isSleepActivity: true,
          createdAt: serverTimestamp()
        };
        
        // Add to Firestore
        const docRef = await addDoc(collection(db, "timetable"), sleepActivity);
        
        // Add to local state
        setActivities(prev => [...prev, { ...sleepActivity, id: docRef.id }]);
      }
      
      setSleepSchedule({ wakeUpTime, sleepTime });
      setIsSleepPromptOpen(false);
      setSuccessMessage("Sleep schedule saved successfully");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Error saving sleep schedule:", error);
      setFormError("Failed to save sleep schedule");
    }
  };

  // Toggle activity completion status
  const toggleActivityCompletion = async (activityId: string, currentStatus: boolean) => {
    try {
      const activityRef = doc(db, "timetable", activityId);
      await updateDoc(activityRef, {
        completed: !currentStatus,
        updatedAt: serverTimestamp()
      });

      setActivities(prev => prev.map(activity => 
        activity.id === activityId ? { ...activity, completed: !currentStatus } : activity
      ));
    } catch (error) {
      console.error("Error updating activity status:", error);
    }
  };

  // Delete an activity
  const deleteActivity = async (activityId: string) => {
    try {
      await deleteDoc(doc(db, "timetable", activityId));
      setActivities(prev => prev.filter(activity => activity.id !== activityId));
      setSuccessMessage("Activity deleted successfully");
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error("Error deleting activity:", error);
    }
  };

  // Edit an activity
  const editActivity = (activity: Activity) => {
    // Convert single day string to array for form consistency
    const dayValue = typeof activity.day === 'string' ? [activity.day] : activity.day;
    setSelectedDays(dayValue);
    
    setCurrentActivity({
      ...activity,
      day: dayValue
    });
    setIsEditing(true);
    setIsFormOpen(true);
    setFormError(null);
  };

  // Move activity (for drag and drop)
  const moveActivity = (dragIndex: number, hoverIndex: number) => {
    const dragActivity = filteredActivities[dragIndex];
    
    // Create new array with reordered activities
    const newActivities = [...filteredActivities];
    newActivities.splice(dragIndex, 1);
    newActivities.splice(hoverIndex, 0, dragActivity);
    
    setFilteredActivities(newActivities);
  };

  // Handle day selection for multi-select
  const handleDaySelection = (day: string) => {
    if (day === 'All') {
      setSelectedDays(daysOfWeek);
      if (currentActivity) {
        setCurrentActivity({ ...currentActivity, day: daysOfWeek });
      }
      return;
    }
    
    if (selectedDays.includes(day)) {
      const newSelectedDays = selectedDays.filter(d => d !== day);
      setSelectedDays(newSelectedDays);
      if (currentActivity) {
        setCurrentActivity({ ...currentActivity, day: newSelectedDays });
      }
    } else {
      const newSelectedDays = [...selectedDays, day];
      setSelectedDays(newSelectedDays);
      if (currentActivity) {
        setCurrentActivity({ ...currentActivity, day: newSelectedDays });
      }
    }
  };

  // Get activities for a specific 3-hour time block
  const getActivitiesForTimeBlock = (day: string, blockStartTime: string): Activity[] => {
    // Get the current block's start time in minutes
    const blockStartMinutes = convertTimeToMinutes(blockStartTime);
    
    // Calculate the end time of the block (3 hours later)
    const blockEndHour = parseInt(blockStartTime.split(':')[0]) + 3;
    const blockEndTime = `${blockEndHour < 10 ? '0' + blockEndHour : blockEndHour}:00`;
    const blockEndMinutes = convertTimeToMinutes(blockEndTime);
    
    // Find all activities that overlap with this time block
    return activities.filter(activity => {
      // Check if the activity is for this day
      const activityDays = Array.isArray(activity.day) ? activity.day : [activity.day];
      if (!activityDays.includes(day)) return false;
      
      const activityStartMinutes = convertTimeToMinutes(activity.startTime);
      const activityEndMinutes = convertTimeToMinutes(activity.endTime);
      
      // Handle activities that span across midnight
      if (activity.isSleepActivity && activityStartMinutes > activityEndMinutes) {
        // For the first day of sleep activity
        if (day === activityDays[0]) {
          // Show if block starts after or at sleep start time
          return blockStartMinutes >= activityStartMinutes || 
                 (blockStartMinutes < activityStartMinutes && blockEndMinutes > activityStartMinutes);
        } 
        // For the second day (waking up day)
        else if (activityDays.length > 1 && day === activityDays[1]) {
          // Show if block ends before or at wake up time
          return blockEndMinutes <= activityEndMinutes || 
                 (blockStartMinutes < activityEndMinutes && blockEndMinutes > activityEndMinutes);
        }
      }
      
      // Regular check for activities within the time block
      return (
        // Activity starts during the block
        (activityStartMinutes >= blockStartMinutes && activityStartMinutes < blockEndMinutes) ||
        // Activity ends during the block
        (activityEndMinutes > blockStartMinutes && activityEndMinutes <= blockEndMinutes) ||
        // Activity spans the entire block
        (activityStartMinutes <= blockStartMinutes && activityEndMinutes >= blockEndMinutes)
      );
    });
  };

  // Format time for display
  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    
    if (hour === 0 || hour === 24) {
      return `12:${minutes || '00'} AM`;
    } else if (hour === 12) {
      return `12:${minutes || '00'} PM`;
    } else if (hour > 12) {
      return `${hour - 12}:${minutes || '00'} PM`;
    } else {
      return `${hour}:${minutes || '00'} AM`;
    }
  };

  // Handle click on a time block
  const handleTimeBlockClick = (day: string, startTime: string) => {
    setSelectedTimeSlot({ day, startTime });
  };

  // Load preset exercise
  const loadPresetExercise = (preset: any) => {
    const endTimeHour = parseInt(currentActivity?.startTime?.split(':')[0] || '9') + 
                        Math.floor(parseInt(preset.duration) / 60);
    const endTimeMinutes = (parseInt(currentActivity?.startTime?.split(':')[1] || '0') + 
                           parseInt(preset.duration) % 60) % 60;
    
    setCurrentActivity({
      ...currentActivity,
      title: preset.title,
      description: preset.description,
      category: preset.category as any
    });
  };

  // Generate visual indicator of activities in a time block
  const getTimeBlockContent = (day: string, startTime: string) => {
    const activitiesInBlock = getActivitiesForTimeBlock(day, startTime);
    
    if (activitiesInBlock.length === 0) {
      return null;
    }
    
    // Group by category for color-coding
    const categories = [...new Set(activitiesInBlock.map(a => a.category))];
    
    // Show dots for each activity, up to 3, then a +X indicator
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex gap-1">
          {categories.slice(0, 3).map((category, idx) => (
            <div 
              key={idx} 
              className={`w-2 h-2 rounded-full ${
                category === 'Journal' ? 'bg-indigo-500' : 
                category === 'Exercise' ? 'bg-emerald-500' :
                category === 'Challenge' ? 'bg-amber-500' :
                category === 'Therapy' ? 'bg-blue-500' :
                category === 'Sleep' ? 'bg-slate-500' :
                category === 'Rest' ? 'bg-pink-500' :
                'bg-purple-500'
              }`}
            ></div>
          ))}
          {activitiesInBlock.length > 3 && (
            <span className="text-xs text-slate-300 ml-1">+{activitiesInBlock.length - 3}</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex min-h-screen bg-slate-900 text-slate-300">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content Container */}
        <div className="flex-grow p-6 bg-slate-800/50 rounded-lg border border-slate-700 ml-6 mb-6 overflow-x-auto">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-white font-bold text-3xl">Weekly Timetable</h1>
              <p className="text-slate-400 mt-2">Organize your week with a structured schedule</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex gap-2 p-1 bg-slate-800 rounded-md">
                <button 
                  onClick={() => setViewMode('grid')} 
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-blue-700 text-white' 
                      : 'text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Grid View
                </button>
                <button 
                  onClick={() => setViewMode('list')} 
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-blue-700 text-white' 
                      : 'text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  List View
                </button>
              </div>
              
              {/* Only show filters in list view */}
              {viewMode === 'list' && (
                <div className="flex gap-2">
                  <div className="relative">
                    <select 
                      className="bg-slate-800/70 border border-slate-700 rounded-md py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={filterDay}
                      onChange={(e) => setFilterDay(e.target.value)}
                    >
                      <option value="All">All Days</option>
                      {daysOfWeek.map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="relative">
                    <select 
                      className="bg-slate-800/70 border border-slate-700 rounded-md py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                    >
                      <option value="All">All Categories</option>
                      <option value="Journal">Journal</option>
                      <option value="Exercise">Exercise</option>
                      <option value="Challenge">Challenge</option>
                      <option value="Therapy">Therapy</option>
                      <option value="Custom">Custom</option>
                      <option value="Sleep">Sleep</option>
                      <option value="Rest">Rest</option>
                    </select>
                  </div>
                </div>
              )}
              
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-md py-2 px-4 flex items-center gap-2 transition-colors"
                onClick={() => {
                  setIsFormOpen(true);
                  setCurrentActivity({
                    title: '',
                    description: '',
                    category: 'Journal',
                    day: [],
                    startTime: '09:00',
                    endTime: '10:00'
                  });
                  setSelectedDays([]);
                  setIsEditing(false);
                  setFormError(null);
                }}
              >
                <Plus className="h-5 w-5" />
                Add Activity
              </button>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 bg-green-900/30 border border-green-700/50 text-green-300 py-3 px-4 rounded-md flex items-center justify-between">
              <span>{successMessage}</span>
              <button onClick={() => setSuccessMessage(null)}>
                <X className="h-5 w-5" />
              </button>
            </div>
          )}

          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Calendar className="h-16 w-16 text-slate-600 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Your timetable is empty</h3>
              <p className="text-slate-400 mb-6 max-w-md">
                Start organizing your week by adding activities to your timetable.
              </p>
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-md py-2.5 px-5 flex items-center gap-2 transition-colors"
                onClick={() => {
                  setIsFormOpen(true);
                  setCurrentActivity({
                    title: '',
                    description: '',
                    category: 'Journal',
                    day: [],
                    startTime: '09:00',
                    endTime: '10:00'
                  });
                  setSelectedDays([]);
                  setIsEditing(false);
                }}
              >
                <Plus className="h-5 w-5" />
                Add First Activity
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            // GRID VIEW - Updated with 3-hour blocks and 24-hour coverage
            <div className="mb-8 overflow-x-auto">
              <div className="min-w-[1000px] border border-slate-700 rounded-xl overflow-hidden">
                {/* Day header row */}
                <div className="grid grid-cols-8 bg-slate-800">
                  <div className="p-3 border-r border-slate-700 text-slate-400 font-medium text-sm">
                    Time
                  </div>
                  {daysOfWeek.map(day => (
                    <div key={day} className="p-3 border-r border-slate-700 text-center text-white font-medium">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Time slots - Updated to 3-hour blocks */}
                {timeSlots.map((time, index) => (
                  <div key={time} className="grid grid-cols-8 border-t border-slate-700">
                    {/* Time column */}
                    <div className="p-2 border-r border-slate-700 text-center text-sm text-slate-400 flex flex-col items-center justify-center">
                      <span>{formatTime(time)}</span>
                      <span className="text-xs text-slate-500">to</span>
                      <span>
                        {formatTime(`${(parseInt(time.split(':')[0]) + 3) % 24}:00`)}
                      </span>
                    </div>
                    
                    {/* Day columns */}
                    {daysOfWeek.map(day => (
                      <div 
                        key={`${day}-${time}`} 
                        className={`relative border-r border-slate-700 min-h-[90px] cursor-pointer hover:bg-slate-800/80 transition-colors ${
                          index % 2 === 0 ? 'bg-slate-800/30' : 'bg-slate-800/50'
                        }`}
                        onClick={() => handleTimeBlockClick(day, time)}
                      >
                        {/* Indicator for activities in this block */}
                        {getTimeBlockContent(day, time)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // LIST VIEW - Updated with drag & drop
            <div className="space-y-4 mb-10">
              {daysOfWeek.map(day => {
                const dayActivities = filteredActivities.filter(a => 
                  typeof a.day === 'string' 
                    ? a.day === day || filterDay === 'All'
                    : a.day.includes(day) || filterDay === 'All'
                );
                
                if (filterDay !== 'All' && filterDay !== day) {
                  return null;
                }
                
                return dayActivities.length > 0 && (
                  <div key={day} className="border border-slate-700 rounded-xl overflow-hidden">
                    <div className="bg-slate-800 p-3 font-medium text-white">
                      {filterDay === 'All' ? day : 'Activities'}
                    </div>
                    
                    <div className="divide-y divide-slate-700/50">
                      {dayActivities
                        .filter(a => typeof a.day === 'string' ? a.day === day : a.day.includes(day))
                        .sort((a, b) => a.startTime.localeCompare(b.startTime))
                        .map((activity, index) => (
                          <ActivityItem
                            key={activity.id}
                            activity={activity}
                            index={index}
                            moveActivity={moveActivity}
                            editActivity={editActivity}
                            deleteActivity={deleteActivity}
                            toggleActivityCompletion={toggleActivityCompletion}
                          />
                        ))}
                    </div>
                  </div>
                );
              })}

              {filteredActivities.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <p className="text-slate-400">No activities match your filters.</p>
                </div>
              )}
            </div>
          )}

          {/* Sleep Schedule Prompt Modal */}
          {isSleepPromptOpen && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md animate-fadeIn">
                <h2 className="text-xl font-bold text-white mb-2">Set Your Sleep Schedule</h2>
                <p className="text-slate-400 mb-5">
                  To optimize your routine, please provide your regular sleep schedule. This will be added to your timetable.
                </p>
                
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const wakeUpTime = (e.target as any).wakeUpTime.value;
                  const sleepTime = (e.target as any).sleepTime.value;
                  saveSleepSchedule(wakeUpTime, sleepTime);
                }}>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-slate-300 text-sm font-medium mb-2">
                        Wake Up Time
                      </label>
                      <input
                        type="time"
                        name="wakeUpTime"
                        defaultValue="07:00"
                        className="w-full bg-slate-900/70 border border-slate-700 rounded-md py-2.5 px-4 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-slate-300 text-sm font-medium mb-2">
                        Sleep Time
                      </label>
                      <input
                        type="time"
                        name="sleepTime"
                        defaultValue="23:00"
                        className="w-full bg-slate-900/70 border border-slate-700 rounded-md py-2.5 px-4 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Save Sleep Schedule
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Time Block Modal */}
          {selectedTimeSlot && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setSelectedTimeSlot(null)}>
              <div 
                className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md animate-fadeIn"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-xl font-bold text-white">
                    {selectedTimeSlot.day}: {formatTime(selectedTimeSlot.startTime)} - {formatTime(`${(parseInt(selectedTimeSlot.startTime.split(':')[0]) + 3) % 24}:00`)}
                  </h2>
                  <button 
                    className="p-1.5 rounded-md bg-slate-700/30 hover:bg-slate-700/50 text-slate-400"
                    onClick={() => setSelectedTimeSlot(null)}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                  {getActivitiesForTimeBlock(selectedTimeSlot.day, selectedTimeSlot.startTime).length > 0 ? (
                    getActivitiesForTimeBlock(selectedTimeSlot.day, selectedTimeSlot.startTime)
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map(activity => (
                        <div 
                          key={activity.id} 
                          className={`${categoryColors[activity.category]} border rounded-lg p-4`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium flex items-center ${categoryTextColors[activity.category]}`}>
                                  {categoryIcons[activity.category]}
                                  {activity.category}
                                </span>
                                <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                                  activity.completed ? 'bg-green-900/30 text-green-400' : 'bg-slate-700/30 text-slate-400'
                                }`}>
                                  {activity.completed ? 'Completed' : 'Pending'}
                                </span>
                              </div>
                              <h4 className="font-medium text-white">{activity.title}</h4>
                              <div className="text-slate-400 text-sm mt-1">
                                {formatTime(activity.startTime)} - {formatTime(activity.endTime)}
                              </div>
                              {activity.description && (
                                <p className="text-slate-300 text-sm mt-2">{activity.description}</p>
                              )}
                            </div>
                            
                            <div className="flex gap-1">
                              <button 
                                onClick={() => toggleActivityCompletion(activity.id, activity.completed)}
                                className={`p-1.5 rounded-md transition-colors ${
                                  activity.completed 
                                    ? 'bg-green-700/20 text-green-400 hover:bg-green-700/30' 
                                    : 'bg-slate-700/20 text-slate-400 hover:bg-slate-700/30'
                                }`}
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => {
                                  editActivity(activity);
                                  setSelectedTimeSlot(null);
                                }}
                                className="p-1.5 rounded-md bg-slate-700/20 text-slate-400 hover:bg-slate-700/30 transition-colors"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => {
                                  deleteActivity(activity.id);
                                  setSelectedTimeSlot(null);
                                }}
                                className="p-1.5 rounded-md bg-red-900/20 text-red-400 hover:bg-red-900/30 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <p className="text-slate-400 mb-4">No activities scheduled for this time block.</p>
                      <button 
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center gap-2 transition-colors"
                        onClick={() => {
                          setIsFormOpen(true);
                          setCurrentActivity({
                            title: '',
                            description: '',
                            category: 'Journal',
                            day: [selectedTimeSlot.day],
                            startTime: selectedTimeSlot.startTime,
                            endTime: `${(parseInt(selectedTimeSlot.startTime.split(':')[0]) + 1).toString().padStart(2, '0')}:00`
                          });
                          setSelectedDays([selectedTimeSlot.day]);
                          setIsEditing(false);
                          setSelectedTimeSlot(null);
                        }}
                      >
                        <Plus className="h-4 w-4" />
                        Add Activity
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 flex justify-center">
                  <button 
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center gap-2 transition-colors"
                    onClick={() => {
                      setIsFormOpen(true);
                      setCurrentActivity({
                        title: '',
                        description: '',
                        category: 'Journal',
                        day: [selectedTimeSlot.day],
                        startTime: selectedTimeSlot.startTime,
                        endTime: `${(parseInt(selectedTimeSlot.startTime.split(':')[0]) + 1).toString().padStart(2, '0')}:00`
                      });
                      setSelectedDays([selectedTimeSlot.day]);
                      setIsEditing(false);
                      setSelectedTimeSlot(null);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Add Activity to This Time Block
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Activity Form Modal */}
          {isFormOpen && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
              <div 
                ref={formRef}
                className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md animate-fadeIn"
              >
                <h2 className="text-xl font-bold text-white mb-5">
                  {isEditing ? 'Edit Activity' : 'Add New Activity'}
                </h2>
                
                {formError && (
                  <div className="mb-4 p-3 bg-red-900/20 border border-red-700/30 text-red-300 rounded-md text-sm">
                    {formError}
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={currentActivity?.title || ''}
                      onChange={(e) => setCurrentActivity(prev => ({ ...prev!, title: e.target.value }))}
                      className="w-full bg-slate-900/70 border border-slate-700 rounded-md py-2.5 px-4 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Enter activity title"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Description
                    </label>
                    <textarea
                      value={currentActivity?.description || ''}
                      onChange={(e) => setCurrentActivity(prev => ({ ...prev!, description: e.target.value }))}
                      className="w-full bg-slate-900/70 border border-slate-700 rounded-md py-2.5 px-4 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[80px]"
                      placeholder="Enter activity description"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Category
                    </label>
                    <select
                      value={currentActivity?.category || 'Journal'}
                      onChange={(e) => setCurrentActivity(prev => ({ ...prev!, category: e.target.value as any }))}
                      className="w-full bg-slate-900/70 border border-slate-700 rounded-md py-2.5 px-4 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Journal">Journal</option>
                      <option value="Exercise">Exercise</option>
                      <option value="Challenge">Challenge</option>
                      <option value="Therapy">Therapy</option>
                      <option value="Custom">Custom</option>
                      <option value="Sleep">Sleep</option>
                      <option value="Rest">Rest</option>
                    </select>
                  </div>
                  
                  {/* Preset exercises selector */}
                  {(currentActivity?.category === 'Journal' || currentActivity?.category === 'Therapy' || currentActivity?.category === 'Exercise') && (
                    <div className="mb-4">
                      <label className="block text-slate-300 text-sm font-medium mb-2">
                        Preset Exercises
                      </label>
                      <div className="grid grid-cols-1 gap-2">
                        {predefinedExercises
                          .filter(ex => ex.category === currentActivity?.category)
                          .map((exercise, idx) => (
                            <button
                              key={idx}
                              type="button"
                              className="text-left px-3 py-2 bg-slate-900/50 hover:bg-slate-900 border border-slate-700 rounded-md transition-colors"
                              onClick={() => loadPresetExercise(exercise)}
                            >
                              <div className="font-medium text-white">{exercise.title}</div>
                              <div className="text-xs text-slate-400 mt-1">{exercise.description}</div>
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Day(s) * <span className="text-xs text-slate-400">(select multiple if needed)</span>
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      <button
                        type="button"
                        className={`px-2 py-1.5 text-sm rounded ${
                          selectedDays.length === daysOfWeek.length 
                            ? 'bg-blue-700/70 text-blue-100' 
                            : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'
                        }`}
                        onClick={() => handleDaySelection('All')}
                      >
                        All days
                      </button>
                      {daysOfWeek.map(day => (
                        <button
                          key={day}
                          type="button"
                          className={`px-2 py-1.5 text-sm rounded ${
                            selectedDays.includes(day)
                              ? 'bg-blue-700/70 text-blue-100'
                              : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'
                          }`}
                          onClick={() => handleDaySelection(day)}
                        >
                          {day.substring(0, 3)}
                        </button>
                      ))}
                    </div>
                    {selectedDays.length === 0 && (
                      <p className="text-red-400 text-xs mt-1">Please select at least one day</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-slate-300 text-sm font-medium mb-2">
                        Start Time *
                      </label>
                      <input
                        type="time"
                        value={currentActivity?.startTime || '09:00'}
                        onChange={(e) => setCurrentActivity(prev => ({ ...prev!, startTime: e.target.value }))}
                        className="w-full bg-slate-900/70 border border-slate-700 rounded-md py-2.5 px-4 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-slate-300 text-sm font-medium mb-2">
                        End Time *
                      </label>
                      <input
                        type="time"
                        value={currentActivity?.endTime || '10:00'}
                        onChange={(e) => setCurrentActivity(prev => ({ ...prev!, endTime: e.target.value }))}
                        className="w-full bg-slate-900/70 border border-slate-700 rounded-md py-2.5 px-4 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsFormOpen(false);
                        setSelectedDays([]);
                      }}
                      className="px-4 py-2.5 border border-slate-600 text-slate-300 rounded-md hover:bg-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      disabled={selectedDays.length === 0}
                    >
                      {isEditing ? 'Update' : 'Add'} Activity
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </DndProvider>
  );
}
