import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, content } = body;
    
    if (!user_id || !content) {
      return NextResponse.json(
        { error: 'Missing user_id or content' },
        { status: 400 }
      );
    }
    
    // The external FastAPI backend URL
    const apiUrl = 'http://localhost:8000';
    
    try {
      // Call the FastAPI backend for analysis
      const apiResponse = await axios.post(`http://localhost:8000/api/journal/analyze`, {
        user_id,
        content
      });
      
      // Get the nested data from the FastAPI response
      const responseData = apiResponse.data;
      
      if (!responseData.success) {
        throw new Error(responseData.message || 'Analysis failed');
      }
      
      const analysisData = responseData.data;
      
      // Build journal entry from the response
      const journalEntry = {
        user_id,
        content,
        sentiment: analysisData.sentiment_analysis,
        emotions: analysisData.emotion_analysis.emotions,
        dominant_emotion: analysisData.emotion_analysis.dominant_emotion,
        insights: analysisData.insights.summary,
        themes: analysisData.insights.key_themes,
        growth_indicators: analysisData.insights.growth_indicators,
        cognitive_distortions: analysisData.insights.cognitive_distortions,
        advice: analysisData.insights.actionable_advice,
        reflection_questions: analysisData.insights.reflection_questions,
        created_at: serverTimestamp(),
      };
      
      // Add to Firestore
      const docRef = await addDoc(collection(db, "journal"), journalEntry);
      
      // Return the response with the document ID
      return NextResponse.json({
        id: docRef.id,
        ...journalEntry,
        created_at: new Date().toISOString(), // Convert timestamp for JSON response
      });
      
    } catch (apiError: any) {
      console.error('Error calling backend API:', apiError);
      
      // If API is not available, create a simplified journal entry with mock analysis
      const mockAnalysis = generateMockAnalysis(content);
      const journalEntry = {
        user_id,
        content,
        ...mockAnalysis,
        created_at: serverTimestamp(),
        is_mock: true,
      };
      
      // Save to Firestore even with mock data
      const docRef = await addDoc(collection(db, "journal"), journalEntry);
      
      return NextResponse.json({
        id: docRef.id,
        ...journalEntry,
        created_at: new Date().toISOString(), // Convert timestamp for JSON response
      });
    }
  } catch (error) {
    console.error('Error processing journal request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateMockAnalysis(content: string) {
  // Detect sentiment based on keywords
  let sentiment = { label: "neutral", score: 0.5 };
  if (/happy|joy|excited|wonderful|great|love|amazing/i.test(content)) {
    sentiment = { label: "positive", score: 0.85 };
  } else if (/sad|unhappy|depressed|anxious|worried|stressed|angry/i.test(content)) {
    sentiment = { label: "negative", score: 0.25 };
  }
  
  // Detect dominant emotion
  let emotions = { joy: 0.2, sadness: 0.2, fear: 0.2, anger: 0.2, surprise: 0.2 };
  let dominant_emotion = "neutral";
  if (sentiment.label === "positive") {
    emotions = { joy: 0.7, sadness: 0.05, fear: 0.05, anger: 0.05, surprise: 0.15 };
    dominant_emotion = "joy";
  } else if (sentiment.label === "negative") {
    emotions = { joy: 0.05, sadness: 0.6, fear: 0.2, anger: 0.1, surprise: 0.05 };
    dominant_emotion = "sadness";
  }
  
  return {
    sentiment,
    emotions,
    dominant_emotion,
    insights: "Based on your writing, you seem to be reflecting on your experiences in a thoughtful way.",
    themes: ["self-reflection", "personal growth", "daily experiences"],
    growth_indicators: ["awareness of emotions", "ability to articulate thoughts"],
    cognitive_distortions: content.length > 200 ? ["black and white thinking"] : [],
    advice: ["Continue to journal regularly to track your emotional patterns."],
    reflection_questions: [
      "What emotions were most present during this experience?",
      "How might this experience shape your future actions?"
    ]
  };
}