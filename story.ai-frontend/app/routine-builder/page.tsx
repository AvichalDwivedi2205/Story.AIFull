"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, BookOpen, Plus, Search, Brain, Edit, Trash2,
  MoveHorizontal, CheckCircle, Calendar1, Settings, X, Info, AlertTriangle, Trash
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { db } from '@/config/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, deleteDoc, updateDoc, getDocs } from 'firebase/firestore';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useAuth } from '@/context/AuthContext';

interface RoutineActivity {
  id: string;
  userId: string;
  title: string;
  category: 'journal' | 'exercise' | 'challenge' | 'therapy' | 'custom';
  startTime: string;
  endTime: string;
  dayOfWeek: number;
  color: string;
  isRecurring: boolean;
  notes?: string;
  createdAt: any;
  updatedAt: any;
  duration?: number; // Add duration field
}

interface RecommendedActivity {
  id: string;
  title: string;
  category: 'journal' | 'exercise' | 'challenge' | 'therapy' | 'custom';
  description: string;
  defaultDuration: number;
}

interface ActivityCardProps {
  activity: RecommendedActivity;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'activity',
    item: { activity },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  // Connect drag to ref
  drag(ref);

  const getBgColor = (category: string): string => {
    switch (category) {
      case 'journal': return 'bg-indigo-900/20 border-indigo-800/30';
      case 'exercise': return 'bg-emerald-900/20 border-emerald-800/30';
      case 'challenge': return 'bg-amber-900/20 border-amber-800/30';
      case 'therapy': return 'bg-blue-900/20 border-blue-800/30';
      default: return 'bg-slate-800/70 border-slate-700';
    }
  };

  const getIconColor = (category: string): string => {
    switch (category) {
      case 'journal': return 'text-indigo-400';
      case 'exercise': return 'text-emerald-400';
      case 'challenge': return 'text-amber-400';
      case 'therapy': return 'text-blue-400';
      default: return 'text-slate-400';
    }
  };

  const getIcon = (category: string): React.ReactNode => {
    switch (category) {
      case 'journal': return <BookOpen className={`h-5 w-5 ${getIconColor(category)}`} />;
      case 'exercise': return <Settings className={`h-5 w-5 ${getIconColor(category)}`} />;
      case 'challenge': return <Brain className={`h-5 w-5 ${getIconColor(category)}`} />;
      case 'therapy': return <Calendar1 className={`h-5 w-5 ${getIconColor(category)}`} />;
      default: return <Calendar className={`h-5 w-5 ${getIconColor(category)}`} />;
    }
  };

  const getIconBgClass = (category: string): string => {
    switch (category) {
      case 'journal': return 'bg-indigo-600/20';
      case 'exercise': return 'bg-emerald-600/20';
      case 'challenge': return 'bg-amber-600/20';
      case 'therapy': return 'bg-blue-600/20';
      default: return 'bg-slate-600/20';
    }
  };

  return (
    <div 
      ref={ref}
      className={`${getBgColor(activity.category)} border rounded-lg p-4 cursor-grab ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      <div className="flex items-start">
        <div className={`p-2 rounded-md mr-3 ${getIconBgClass(activity.category)}`}>
          {getIcon(activity.category)}
        </div>
        <div>
          <h4 className="font-medium text-white">{activity.title}</h4>
          <p className="text-sm text-slate-400">{activity.description}</p>
        </div>
      </div>
    </div>
  );
};

interface TimeSlotProps {
  day: number;
  hour: number;
  activities: RoutineActivity[];
  onDrop: (day: number, hour: number, activity: RecommendedActivity) => void;
  onSlotClick: (day: number, hour: number, activities: RoutineActivity[]) => void;
}

const TimeSlot: React.FC<TimeSlotProps> = ({ day, hour, activities, onDrop, onSlotClick }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'activity',
    drop: (item: { activity: RecommendedActivity }) => onDrop(day, hour, item.activity),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  // Connect drop to ref
  drop(ref);

  // Filter all activities that overlap with this hour
  const slotActivities = activities.filter(a => {
    const startHour = new Date(a.startTime).getHours();
    const endHour = new Date(a.endTime).getHours();
    // Handle activities within the same hour
    if (startHour === endHour) {
      return a.dayOfWeek === day && startHour === hour;
    }
    // Handle activities that span multiple hours
    return a.dayOfWeek === day && startHour <= hour && endHour > hour;
  });

  const hasActivities = slotActivities.length > 0;
  
  // Use the first activity's color if there are activities, or default
  const bgColor = hasActivities ? slotActivities[0].color : 'bg-slate-800/30';

  return (
    <div 
      ref={ref}
      className={`border border-slate-700 h-16 relative ${
        isOver ? 'bg-blue-800/30' : bgColor
      } cursor-pointer hover:opacity-80`}
      onClick={() => onSlotClick(day, hour, slotActivities)}
    >
      {hasActivities && (
        <div className="p-2 h-full overflow-hidden">
          <div className="text-xs font-medium">
            {slotActivities[0].title}
            {slotActivities.length > 1 && (
              <span className="bg-blue-500 text-white text-xs px-1 rounded-full ml-1">
                +{slotActivities.length - 1}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function RoutineBuilderPage() {
  const [activeTab, setActiveTab] = useState('Routine Builder');
  const [routineActivities, setRoutineActivities] = useState<RoutineActivity[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [newActivity, setNewActivity] = useState({
    title: '',
    category: 'custom' as 'journal' | 'exercise' | 'challenge' | 'therapy' | 'custom',
    startTime: '',
    duration: 30, // in minutes, default to 30
    dayOfWeek: 0,
    color: 'bg-blue-900/20',
    isRecurring: false,
    notes: ''
  });
  const { currentUser, isAuthenticated } = useAuth();
  const [hasActivities, setHasActivities] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{day: number, hour: number, activities: RoutineActivity[]} | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<RoutineActivity | null>(null);

  const recommendedActivities: RecommendedActivity[] = [
    {
      id: 'rec-1',
      title: 'Morning Journal',
      category: 'journal',
      description: '15-minute reflection to start your day',
      defaultDuration: 15
    },
    {
      id: 'rec-2',
      title: 'Breathing Exercise',
      category: 'exercise',
      description: '5-minute deep breathing technique',
      defaultDuration: 5
    },
    {
      id: 'rec-3',
      title: 'Cognitive Challenge',
      category: 'challenge',
      description: '10-minute mental exercise',
      defaultDuration: 10
    },
    {
      id: 'rec-4',
      title: 'Weekly Therapy Chat',
      category: 'therapy',
      description: '30-minute session with AI therapist',
      defaultDuration: 30
    },
    {
      id: 'rec-5',
      title: 'Gratitude Practice',
      category: 'journal',
      description: '5-minute gratitude reflection',
      defaultDuration: 5
    },
    {
      id: 'rec-6',
      title: 'Mindfulness Meditation',
      category: 'exercise',
      description: '10-minute guided meditation',
      defaultDuration: 10
    }
  ];

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 16 }, (_, i) => i + 6);

  useEffect(() => {
    if (!currentUser) return;
    
    // Use user's subcollection for routines
    const userRoutinesRef = collection(db, 'users', currentUser.uid, 'routines');
    const unsubscribeSnapshot = onSnapshot(userRoutinesRef, (snapshot) => {
      const routineData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as RoutineActivity[];
      setRoutineActivities(routineData);
      setHasActivities(routineData.length > 0);
    });
    
    return () => unsubscribeSnapshot();
  }, [currentUser]);

  // Helper function to calculate total minutes used in an hour
  const calculateHourUsage = (activities: RoutineActivity[], day: number, hour: number): number => {
    let totalMinutes = 0;
    
    activities.forEach(activity => {
      const startDate = new Date(activity.startTime);
      const endDate = new Date(activity.endTime);
      
      // Skip if different day
      if (activity.dayOfWeek !== day) return;
      
      const activityStartHour = startDate.getHours();
      const activityEndHour = endDate.getHours();
      
      // If the activity is in the target hour
      if (activityStartHour <= hour && activityEndHour >= hour) {
        // Calculate minutes in the target hour
        const startMinutesInHour = activityStartHour === hour ? startDate.getMinutes() : 0;
        const endMinutesInHour = activityEndHour === hour ? endDate.getMinutes() : 60;
        
        totalMinutes += endMinutesInHour - startMinutesInHour;
      }
    });
    
    return totalMinutes;
  };
  
  // Function to find next available slot after a given time
  const findNextAvailableSlot = (day: number, startDate: Date, duration: number) => {
    // Create a sorted list of all activities for this day
    const activitiesForDay = routineActivities
      .filter(a => a.dayOfWeek === day)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    
    let proposedStart = new Date(startDate);
    let proposedEnd = new Date(proposedStart);
    proposedEnd.setMinutes(proposedEnd.getMinutes() + duration);
    
    // Check if the proposed time slot overlaps with any existing activity
    let hasOverlap = true;
    let iterations = 0;
    const maxIterations = 48; // Safety limit to prevent infinite loops
    
    while (hasOverlap && iterations < maxIterations) {
      iterations++;
      hasOverlap = false;
      
      for (const activity of activitiesForDay) {
        const activityStart = new Date(activity.startTime);
        const activityEnd = new Date(activity.endTime);
        
        // Check if there's an overlap
        if (proposedStart < activityEnd && proposedEnd > activityStart) {
          // Overlap found, reschedule to start after this activity
          proposedStart = new Date(activityEnd);
          proposedEnd = new Date(proposedStart);
          proposedEnd.setMinutes(proposedEnd.getMinutes() + duration);
          hasOverlap = true;
          break;
        }
      }
      
      // Also check hour limit
      const hourOfProposedStart = proposedStart.getHours();
      const minutesInHour = calculateHourUsage(routineActivities, day, hourOfProposedStart);
      
      // Calculate how many minutes of this activity fall in the current hour
      const startMinute = proposedStart.getMinutes();
      const endMinute = Math.min(startMinute + duration, 60);
      const activityMinutesInHour = endMinute - startMinute;
      
      if (minutesInHour + activityMinutesInHour > 60) {
        // Move to next hour
        proposedStart.setHours(hourOfProposedStart + 1, 0, 0, 0);
        proposedEnd = new Date(proposedStart);
        proposedEnd.setMinutes(proposedEnd.getMinutes() + duration);
        hasOverlap = true;
      }
    }
    
    return proposedStart;
  };

  // Function to clear all activities
  const handleClearAll = async () => {
    if (!currentUser) return;
    
    if (!confirm("Are you sure you want to clear your entire schedule? This cannot be undone.")) {
      return;
    }
    
    try {
      const userRoutinesRef = collection(db, 'users', currentUser.uid, 'routines');
      const snapshot = await getDocs(userRoutinesRef);
      
      // Delete all documents
      const deletePromises = snapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      
      await Promise.all(deletePromises);
      
      // More descriptive message
      setSuccessMessage(`All activities cleared successfully! You can add new activities to rebuild your schedule.`);
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Error clearing activities:', error);
    }
  };

  const handleDrop = async (day: number, hour: number, activity: RecommendedActivity) => {
    if (!currentUser) return;

    const duration = activity.defaultDuration || 30;
    
    // Create initial start time
    const startTime = new Date();
    startTime.setHours(hour, 0, 0, 0);
    
    // Check for overlaps and find the next available slot
    // This will automatically handle both overlap resolution and hour limits
    const adjustedStartTime = findNextAvailableSlot(day, startTime, duration);
    const endTime = new Date(adjustedStartTime);
    endTime.setMinutes(endTime.getMinutes() + duration);
    
    const wasRescheduled = startTime.getTime() !== adjustedStartTime.getTime();

    try {
      // Save to user's routines subcollection
      const userRoutinesRef = collection(db, 'users', currentUser.uid, 'routines');
      await addDoc(userRoutinesRef, {
        userId: currentUser.uid,
        title: activity.title,
        category: activity.category,
        startTime: adjustedStartTime.toISOString(),
        endTime: endTime.toISOString(),
        dayOfWeek: day,
        duration: duration,
        color: activity.category === 'journal' ? 'bg-indigo-900/20' :
               activity.category === 'exercise' ? 'bg-emerald-900/20' :
               activity.category === 'challenge' ? 'bg-amber-900/20' : 'bg-blue-900/20',
        isRecurring: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Show success message
      if (wasRescheduled) {
        const adjustedHour = adjustedStartTime.getHours();
        const adjustedMinutes = adjustedStartTime.getMinutes();
        setSuccessMessage(
          `${activity.title} was automatically rescheduled to ${adjustedStartTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} due to a schedule conflict`
        );
      } else {
        setSuccessMessage(`${activity.title} added to your routine!`);
      }
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error adding activity:', error);
    }
  };

  const handleAddActivity = async () => {
    if (!currentUser) return;
    
    if (!newActivity.title || !newActivity.startTime) {
      alert('Please fill in all required fields');
      return;
    }
  
    try {
      // Create a base date object for today
      const today = new Date();
      
      // Parse start time
      let startDate = new Date(today);
      if (newActivity.startTime) {
        const [hours, minutes] = newActivity.startTime.split(':').map(Number);
        startDate.setHours(hours, minutes, 0, 0);
      }
      
      // Find the next available slot considering conflicts and time limits
      // This will automatically handle both overlap resolution and hour limits
      const adjustedStartDate = findNextAvailableSlot(
        newActivity.dayOfWeek, 
        startDate, 
        newActivity.duration
      );
      
      // Calculate end time based on duration
      let endDate = new Date(adjustedStartDate);
      endDate.setMinutes(endDate.getMinutes() + newActivity.duration);
      
      const wasRescheduled = startDate.getTime() !== adjustedStartDate.getTime();
      
      // Color based on category
      const color = 
        newActivity.category === 'journal' ? 'bg-indigo-900/20' :
        newActivity.category === 'exercise' ? 'bg-emerald-900/20' :
        newActivity.category === 'challenge' ? 'bg-amber-900/20' : 
        newActivity.category === 'therapy' ? 'bg-blue-900/20' : 'bg-blue-900/20';
  
      // Save to user's routines subcollection
      const userRoutinesRef = collection(db, 'users', currentUser.uid, 'routines');
      await addDoc(userRoutinesRef, {
        userId: currentUser.uid,
        title: newActivity.title,
        category: newActivity.category,
        startTime: adjustedStartDate.toISOString(),
        endTime: endDate.toISOString(),
        dayOfWeek: newActivity.dayOfWeek,
        duration: newActivity.duration,
        color: color,
        isRecurring: newActivity.isRecurring,
        notes: newActivity.notes,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      setIsModalOpen(false);
      
      // Notify if rescheduled with more detailed message
      if (wasRescheduled) {
        setSuccessMessage(
          `Activity automatically rescheduled to ${adjustedStartDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} due to a schedule conflict or time limit`
        );
      } else {
        setSuccessMessage('Activity added successfully!');
      }
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Reset form
      setNewActivity({
        title: '',
        category: 'custom',
        startTime: '',
        duration: 30,
        dayOfWeek: 0,
        color: 'bg-blue-900/20',
        isRecurring: false,
        notes: ''
      });
    } catch (error) {
      console.error('Error adding custom activity:', error);
    }
  };

  const handleSlotClick = (day: number, hour: number, activities: RoutineActivity[]) => {
    setSelectedSlot({ day, hour, activities });
    setIsDetailsModalOpen(true);
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (!currentUser) return;
    
    try {
      const activityRef = doc(db, 'users', currentUser.uid, 'routines', activityId);
      await deleteDoc(activityRef);
      
      // Show success message
      setSuccessMessage('Activity deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Close details modal if open
      if (isDetailsModalOpen) {
        setIsDetailsModalOpen(false);
      }
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
  };

  const handleEditActivity = (activity: RoutineActivity) => {
    // Convert ISO timestamps to time inputs (HH:MM format)
    const startDate = new Date(activity.startTime);
    
    const formatTimeForInput = (date: Date) => {
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    };
    
    // Calculate duration from start and end times
    const endDate = new Date(activity.endTime);
    const durationMs = endDate.getTime() - startDate.getTime();
    const durationMinutes = Math.round(durationMs / 60000);
    
    setEditingActivity(activity);
    setNewActivity({
      title: activity.title,
      category: activity.category,
      startTime: formatTimeForInput(startDate),
      duration: activity.duration || durationMinutes,
      dayOfWeek: activity.dayOfWeek,
      color: activity.color,
      isRecurring: activity.isRecurring,
      notes: activity.notes || ''
    });
    
    setIsDetailsModalOpen(false);
    setIsModalOpen(true);
  };

  const handleUpdateActivity = async () => {
    if (!currentUser || !editingActivity) return;
    
    if (!newActivity.title || !newActivity.startTime) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      // Create a base date object for today
      const today = new Date();
      
      // Parse start time
      let startDate = new Date(today);
      if (newActivity.startTime) {
        const [hours, minutes] = newActivity.startTime.split(':').map(Number);
        startDate.setHours(hours, minutes, 0, 0);
      }
      
      // Calculate end time based on duration
      let endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + newActivity.duration);
      
      // Color based on category
      const color = 
        newActivity.category === 'journal' ? 'bg-indigo-900/20' :
        newActivity.category === 'exercise' ? 'bg-emerald-900/20' :
        newActivity.category === 'challenge' ? 'bg-amber-900/20' : 
        newActivity.category === 'therapy' ? 'bg-blue-900/20' : 'bg-blue-900/20';
  
      // Update the existing activity
      const activityRef = doc(db, 'users', currentUser.uid, 'routines', editingActivity.id);
      await updateDoc(activityRef, {
        userId: currentUser.uid,
        title: newActivity.title,
        category: newActivity.category,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        dayOfWeek: newActivity.dayOfWeek,
        duration: newActivity.duration,
        color: color,
        isRecurring: newActivity.isRecurring,
        notes: newActivity.notes,
        updatedAt: serverTimestamp()
      });
      
      setIsModalOpen(false);
      setEditingActivity(null);
      // Reset form
      setNewActivity({
        title: '',
        category: 'custom',
        startTime: '',
        duration: 30,
        dayOfWeek: 0,
        color: 'bg-blue-900/20',
        isRecurring: false,
        notes: ''
      });
      
      // Show success message
      setSuccessMessage('Activity updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating activity:', error);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-screen bg-slate-900 text-slate-300">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="flex-1 overflow-y-auto p-6 relative">
          {/* Success Message Notification */}
          {successMessage && (
            <div className="fixed top-6 right-6 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg flex items-center z-50">
              <CheckCircle className="h-5 w-5 mr-2" />
              {successMessage}
              <button onClick={() => setSuccessMessage('')} className="ml-2">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Routine Builder</h1>
            <p className="mt-2 text-slate-400">
              Design your personalized mental wellness schedule with activities that work for you.
            </p>
          </div>
          
          <div className="bg-slate-800/70 rounded-lg border border-slate-700 p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Recommended Activities</h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search activities..."
                    className="bg-slate-900/50 border border-slate-700 rounded-md py-1 px-3 pl-8 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <Search className="absolute left-2 top-1.5 h-4 w-4 text-slate-500" />
                </div>
                
                {/* Add Activity Button - More visible in the header */}
                <button 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm flex items-center"
                  onClick={() => setIsModalOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Activity
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendedActivities.map((activity) => (
                <ActivityCard 
                  key={activity.id} 
                  activity={activity} 
                />
              ))}
            </div>
          </div>
          
          {hasActivities ? (
            <div className="bg-slate-800/70 rounded-lg border border-slate-700 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white">Your Weekly Schedule</h3>
                <div className="flex space-x-2">
                  <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded-md text-sm">
                    Today
                  </button>
                  <button 
                    className="bg-red-600/30 hover:bg-red-600/50 text-red-300 px-3 py-1 rounded-md text-sm flex items-center"
                    onClick={handleClearAll}
                  >
                    <Trash className="h-4 w-4 mr-1" />
                    Clear All
                  </button>
                </div>
              </div>
              
              <div className="relative overflow-x-auto">
                <div className="grid grid-cols-8 gap-1">
                  <div className="col-span-1">
                    <div className="h-10 mb-1"></div>
                    {hours.map(hour => (
                      <div key={`hour-${hour}`} className="h-16 pr-2 flex items-center justify-end text-sm text-slate-500">
                        {hour % 12 === 0 ? '12' : hour % 12}:00 {hour >= 12 ? 'PM' : 'AM'}
                      </div>
                    ))}
                  </div>
                  
                  {days.map((day, dayIndex) => (
                    <div key={`day-${dayIndex}`} className="col-span-1">
                      <div className="h-10 flex items-center justify-center text-sm font-medium mb-1 bg-slate-800 rounded-t-md">
                        {day}
                      </div>
                      {hours.map(hour => (
                        <TimeSlot
                          key={`slot-${dayIndex}-${hour}`}
                          day={dayIndex}
                          hour={hour}
                          activities={routineActivities}
                          onDrop={handleDrop}
                          onSlotClick={handleSlotClick}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 bg-slate-800/30 rounded-lg border border-dashed border-slate-700 p-6">
              <Calendar className="h-12 w-12 text-slate-500 mb-4" />
              <h3 className="text-lg font-medium text-white">Create Your First Routine</h3>
              <p className="text-center text-slate-400 mt-2 max-w-md">
                Drag activities from the recommended section or create your own to build a routine that supports your mental wellness journey.
              </p>
              <button 
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm flex items-center"
                onClick={() => setIsModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Activity
              </button>
            </div>
          )}
          
          {/* Removed floating button since we added the button in the header */}
          
          {isDetailsModalOpen && selectedSlot && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
              <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    {days[selectedSlot.day]} at {selectedSlot.hour % 12 === 0 ? '12' : selectedSlot.hour % 12}:00 {selectedSlot.hour >= 12 ? 'PM' : 'AM'}
                  </h3>
                  <button 
                    onClick={() => setIsDetailsModalOpen(false)} 
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                {selectedSlot.activities.length === 0 ? (
                  <div className="text-center py-6 text-slate-400">
                    <Calendar className="h-12 w-12 mx-auto mb-2" />
                    <p>No activities scheduled for this time slot.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedSlot.activities.map((activity) => (
                      <div 
                        key={activity.id} 
                        className="bg-slate-700/50 border border-slate-600 rounded-md p-4"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-white">{activity.title}</h4>
                            <p className="text-sm text-slate-400">
                              {new Date(activity.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                              {new Date(activity.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            {activity.notes && (
                              <p className="mt-2 text-sm text-slate-300">{activity.notes}</p>
                            )}
                          </div>
                          <div className="flex space-x-1">
                            <button 
                              onClick={() => handleEditActivity(activity)}
                              className="p-1 text-slate-400 hover:text-blue-400"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteActivity(activity.id)}
                              className="p-1 text-slate-400 hover:text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center mt-2">
                          <span className="text-xs bg-slate-600/50 text-slate-300 px-2 py-0.5 rounded">
                            {activity.category}
                          </span>
                          {activity.isRecurring && (
                            <span className="text-xs bg-blue-600/30 text-blue-300 px-2 py-0.5 rounded ml-2">
                              Recurring
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {isModalOpen && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
              <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    {editingActivity ? 'Edit Activity' : 'Create Activity'}
                  </h3>
                  <button 
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingActivity(null);
                      setNewActivity({
                        title: '',
                        category: 'custom',
                        startTime: '',
                        duration: 30,
                        dayOfWeek: 0,
                        color: 'bg-blue-900/20',
                        isRecurring: false,
                        notes: ''
                      });
                    }} 
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Activity Name</label>
                    <input 
                      type="text"
                      className="w-full bg-slate-900 border border-slate-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={newActivity.title}
                      onChange={(e) => setNewActivity({...newActivity, title: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Category</label>
                    <select 
                      className="w-full bg-slate-900 border border-slate-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={newActivity.category}
                      onChange={(e) => setNewActivity({
                        ...newActivity, 
                        category: e.target.value as 'journal' | 'exercise' | 'challenge' | 'therapy' | 'custom'
                      })}
                    >
                      <option value="journal">Journaling</option>
                      <option value="exercise">Exercise</option>
                      <option value="challenge">Mental Challenge</option>
                      <option value="therapy">Therapy</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-slate-400 mb-1">Day</label>
                      <select 
                        className="w-full bg-slate-900 border border-slate-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={newActivity.dayOfWeek}
                        onChange={(e) => setNewActivity({...newActivity, dayOfWeek: parseInt(e.target.value)})}
                      >
                        {days.map((day, index) => (
                          <option key={index} value={index}>{day}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-slate-400 mb-1">Recurring</label>
                      <div className="flex items-center mt-3">
                        <input 
                          type="checkbox" 
                          id="recurring"
                          className="h-4 w-4 rounded border-slate-700 text-blue-600 focus:ring-blue-600"
                          checked={newActivity.isRecurring}
                          onChange={(e) => setNewActivity({...newActivity, isRecurring: e.target.checked})}
                        />
                        <label htmlFor="recurring" className="ml-2 text-sm text-slate-300">Weekly</label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-slate-400 mb-1">Start Time</label>
                      <input 
                        type="time"
                        className="w-full bg-slate-900 border border-slate-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 dark-time-picker"
                        value={newActivity.startTime}
                        onChange={(e) => setNewActivity({...newActivity, startTime: e.target.value})}
                        />
                    </div>
                    
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-slate-400 mb-1">Duration (minutes)</label>
                      <input 
                        type="number"
                        min="5"
                        max="240"
                        step="5"
                        className="w-full bg-slate-900 border border-slate-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={newActivity.duration}
                        onChange={(e) => setNewActivity({...newActivity, duration: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Notes</label>
                    <textarea 
                      className="w-full bg-slate-900 border border-slate-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      rows={3}
                      value={newActivity.notes}
                      onChange={(e) => setNewActivity({...newActivity, notes: e.target.value})}
                    ></textarea>
                  </div>
                </div>
                
                <div className="flex justify-end mt-6 space-x-2">
                  <button 
                    className="px-4 py-2 border border-slate-600 text-slate-300 rounded-md hover:bg-slate-700"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingActivity(null);
                      setNewActivity({
                        title: '',
                        category: 'custom',
                        startTime: '',
                        duration: 30,
                        dayOfWeek: 0,
                        color: 'bg-blue-900/20',
                        isRecurring: false,
                        notes: ''
                      });
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center"
                    onClick={editingActivity ? handleUpdateActivity : handleAddActivity}
                  >
                    {editingActivity ? (
                      <>
                        <Edit className="h-4 w-4 mr-1" />
                        Update Activity
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Activity
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </DndProvider>
  );
}