"use client"
import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Plus, Calendar, Clock, Trash2, Edit, Check, X, Filter } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { collection, addDoc, updateDoc, deleteDoc, getDocs, doc, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useRouter } from 'next/navigation';

// Define types for our timetable activities
interface Activity {
  id: string;
  title: string;
  description: string;
  category: 'Journal' | 'Exercise' | 'Challenge' | 'Therapy' | 'Custom';
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string;
  endTime: string;
  completed: boolean;
  userId: string;
  createdAt: any;
}


// Category color mapping
const categoryColors: Record<string, string> = {
  Journal: 'bg-indigo-900/20 border-indigo-700/30',
  Exercise: 'bg-emerald-900/20 border-emerald-700/30',
  Challenge: 'bg-amber-900/20 border-amber-700/30',
  Therapy: 'bg-blue-900/20 border-blue-700/30',
  Custom: 'bg-purple-900/20 border-purple-700/30',
};

const categoryTextColors: Record<string, string> = {
  Journal: 'bg-indigo-700/40 text-indigo-300',
  Exercise: 'bg-emerald-700/40 text-emerald-300',
  Challenge: 'bg-amber-700/40 text-amber-300',
  Therapy: 'bg-blue-700/40 text-blue-300',
  Custom: 'bg-purple-700/40 text-purple-300',
};

// Days of the week
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Time slots for the timetable (all 24 hours with 3-hour intervals)
const timeSlots = Array.from({ length: 9 }, (_, i) => {
  const hour = i * 3; // 0, 3, 6, 9, 12, 15, 18, 21
  return `${hour < 10 ? '0' + hour : hour}:00`;
});

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
  
  const formRef = useRef<HTMLDivElement>(null);
  const { currentUser, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Fetch activities from Firestore
  useEffect(() => {
    const fetchActivities = async () => {
      if (!currentUser) return;

      try {
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
      } catch (error) {
        console.error("Error fetching timetable activities:", error);
      }
    };

    if (currentUser) {
      fetchActivities();
    }
  }, [currentUser]);

  // Filter activities when category or day filter changes
  useEffect(() => {
    let filtered = [...activities];
    
    if (filterCategory !== 'All') {
      filtered = filtered.filter(activity => activity.category === filterCategory);
    }
    
    if (filterDay !== 'All') {
      filtered = filtered.filter(activity => activity.day === filterDay);
    }
    
    setFilteredActivities(filtered);
  }, [filterCategory, filterDay, activities]);

  // Check if a new activity time overlaps with existing activities
  const checkActivityOverlap = (day: string, startTime: string, endTime: string, activityId?: string): boolean => {
    // Convert start/end times to minutes for easier comparison
    const newStartMinutes = convertTimeToMinutes(startTime);
    const newEndMinutes = convertTimeToMinutes(endTime);
    
    return activities.some(activity => {
      if (activity.id === activityId || activity.day !== day) return false;
      
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

    // Check for time conflicts
    if (checkActivityOverlap(
      currentActivity.day, 
      currentActivity.startTime, 
      currentActivity.endTime, 
      isEditing ? currentActivity.id : undefined
    )) {
      setFormError("This time slot conflicts with an existing activity");
      return;
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

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error("Error saving activity:", error);
      setFormError("Failed to save activity. Please try again.");
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
    setCurrentActivity(activity);
    setIsEditing(true);
    setIsFormOpen(true);
    setFormError(null);
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
      if (activity.day !== day) return false;
      
      const activityStartMinutes = convertTimeToMinutes(activity.startTime);
      const activityEndMinutes = convertTimeToMinutes(activity.endTime);
      
      // Check if the activity overlaps with the time block
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
              className={`w-2 h-2 rounded-full ${category === 'Journal' ? 'bg-indigo-500' : 
                          category === 'Exercise' ? 'bg-emerald-500' :
                          category === 'Challenge' ? 'bg-amber-500' :
                          category === 'Therapy' ? 'bg-blue-500' :
                          'bg-purple-500'}`}
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
                <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
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
                </select>
                <Filter className="absolute right-2 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
            
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-md py-2 px-4 flex items-center gap-2 transition-colors"
              onClick={() => {
                setIsFormOpen(true);
                setCurrentActivity({
                  title: '',
                  description: '',
                  category: 'Journal',
                  day: 'Monday',
                  startTime: '09:00',
                  endTime: '10:00'
                });
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
                  day: 'Monday',
                  startTime: '09:00',
                  endTime: '10:00'
                });
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
          // LIST VIEW - No changes needed
          <div className="space-y-4 mb-10">
            {daysOfWeek.map(day => {
              const dayActivities = filteredActivities.filter(a => a.day === day || filterDay === 'All');
              
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
                      .filter(a => a.day === day)
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map(activity => (
                        <div 
                          key={activity.id} 
                          className={`p-4 ${categoryColors[activity.category]} hover:bg-slate-800/40 transition-colors`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${categoryTextColors[activity.category]}`}>
                                  {activity.category}
                                </span>
                                <span className="text-slate-400 text-sm">
                                  {formatTime(activity.startTime)} - {formatTime(activity.endTime)}
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
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${categoryTextColors[activity.category]}`}>
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
                          day: selectedTimeSlot.day as 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday',
                          startTime: selectedTimeSlot.startTime,
                          endTime: `${(parseInt(selectedTimeSlot.startTime.split(':')[0]) + 1).toString().padStart(2, '0')}:00`
                        });
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
                      day: selectedTimeSlot.day as 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday',
                      startTime: selectedTimeSlot.startTime,
                      endTime: `${(parseInt(selectedTimeSlot.startTime.split(':')[0]) + 1).toString().padStart(2, '0')}:00`
                    });
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
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
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
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Day *
                    </label>
                    <select
                      value={currentActivity?.day || 'Monday'}
                      onChange={(e) => setCurrentActivity(prev => ({ ...prev!, day: e.target.value as any }))}
                      className="w-full bg-slate-900/70 border border-slate-700 rounded-md py-2.5 px-4 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    >
                      {daysOfWeek.map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>
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
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2.5 border border-slate-600 text-slate-300 rounded-md hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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
  );
}
