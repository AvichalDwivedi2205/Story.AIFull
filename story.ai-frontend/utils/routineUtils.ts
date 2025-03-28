import { collection, addDoc, updateDoc, deleteDoc, getDocs, doc, query, where, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';

// Routine interface
export interface Routine {
  id: string;
  title: string;
  description: string;
  category: 'Journal' | 'Exercise' | 'Challenge' | 'Therapy' | 'Custom';
  frequency: 'Daily' | 'Weekly' | 'Monthly';
  time: string;
  completed: boolean;
  userId: string;
  createdAt: any;
}

// Get all routines for a user
export const getUserRoutines = async (userId: string): Promise<Routine[]> => {
  try {
    const routinesQuery = query(
      collection(db, "routines"),
      where("userId", "==", userId)
    );
    
    const querySnapshot = await getDocs(routinesQuery);
    const routines: Routine[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as Omit<Routine, 'id'>;
      routines.push({
        ...data,
        id: doc.id
      } as Routine);
    });
    
    return routines;
  } catch (error) {
    console.error("Error fetching routines:", error);
    throw error;
  }
};

// Create a new routine
export const createRoutine = async (routineData: Omit<Routine, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, "routines"), {
      ...routineData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating routine:", error);
    throw error;
  }
};

// Update an existing routine
export const updateRoutine = async (routineId: string, routineData: Partial<Routine>): Promise<void> => {
  try {
    const routineRef = doc(db, "routines", routineId);
    await updateDoc(routineRef, {
      ...routineData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating routine:", error);
    throw error;
  }
};

// Delete a routine
export const deleteRoutine = async (routineId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "routines", routineId));
  } catch (error) {
    console.error("Error deleting routine:", error);
    throw error;
  }
};

// Toggle routine completion
export const toggleRoutineCompletion = async (routineId: string, currentStatus: boolean): Promise<void> => {
  try {
    const routineRef = doc(db, "routines", routineId);
    await updateDoc(routineRef, {
      completed: !currentStatus,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating routine status:", error);
    throw error;
  }
};

// Check if a routine time overlaps with existing routines
export const checkTimeOverlap = (
  routines: Routine[], 
  newTime: string, 
  frequency: string, 
  excludeRoutineId?: string
): boolean => {
  return routines.some(routine => 
    routine.time === newTime && 
    routine.frequency === frequency &&
    routine.id !== excludeRoutineId
  );
};
