import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';

interface JournalEntry {
  content: string;
  dominant_emotion?: string;
  emotions?: {
    anger?: number;
    disgust?: number;
    fear?: number;
    joy?: number;
    neutral?: number;
    sadness?: number;
    surprise?: number;
  };
  insights?: {
    actionable_advice?: string[];
    cognitive_distortions?: string[];
    growth_indicators?: string[];
    key_themes?: string[];
    reflection_questions?: string[];
    summary?: string;
  };
  sentiment?: {
    label?: string;
    score?: number;
  };
  timestamp: string;
  user_id: string;
}

// Dummy journal entry to use as fallback when no entries are found
const DUMMY_JOURNAL_ENTRY: JournalEntry = {
  content: "Today was a mix of ups and downs. I managed to complete some tasks I've been putting off, which felt good. But I also found myself getting distracted and feeling a bit overwhelmed at times. I'm trying to be more present and appreciate small victories, even on challenging days.",
  dominant_emotion: "neutral",
  emotions: {
    anger: 0.05,
    disgust: 0.02,
    fear: 0.15,
    joy: 0.25,
    neutral: 0.35,
    sadness: 0.15,
    surprise: 0.03
  },
  insights: {
    key_themes: ["Productivity", "Distraction", "Self-awareness", "Growth"]
  },
  timestamp: new Date().toISOString(),
  user_id: "dummy_user_id"
};

/**
 * Fetches the latest journal entry for a user from Firestore
 * @param userId - The ID of the user whose journal to fetch
 * @param useFallback - Whether to return a dummy entry if none exists (default: true)
 * @returns The latest journal entry or a dummy entry if none exists and useFallback is true
 */
export async function getLatestJournalEntry(
  userId: string, 
  useFallback: boolean = true
): Promise<JournalEntry | null> {
  try {
    // Create a reference to the journal collection for this user
    const journalRef = collection(db, "users", userId, "journal");
    
    // Create a query to get the most recent entry
    const journalQuery = query(journalRef, orderBy("timestamp", "desc"), limit(1));
    
    // Execute the query
    const journalSnapshot = await getDocs(journalQuery);
    
    // If no journal entries exist, return fallback or null
    if (journalSnapshot.empty) {
      console.log("No journal entries found for user:", userId);
      return useFallback ? { ...DUMMY_JOURNAL_ENTRY, user_id: userId } : null;
    }
    
    // Return the data from the first (most recent) document
    return journalSnapshot.docs[0].data() as JournalEntry;
  } catch (error) {
    console.error("Error fetching latest journal entry:", error);
    
    // If there's an error and fallback is enabled, return the dummy entry
    if (useFallback) {
      console.log("Using fallback journal entry due to error");
      return { ...DUMMY_JOURNAL_ENTRY, user_id: userId };
    }
    throw error;
  }
}

/**
 * Extracts the necessary details for the gratitude API from a journal entry
 * @param journal - The journal entry to extract from
 * @returns An object with the properties needed for the gratitude API
 */
export function extractGratitudeApiPayload(journal: JournalEntry, userId: string): {
  user_id: string;
  journal_text: string;
  key_themes: string[];
  dominant_emotion: string;
} {
  return {
    user_id: userId,
    journal_text: journal.content,
    key_themes: journal.insights?.key_themes || [],
    dominant_emotion: journal.dominant_emotion || "neutral"
  };
}