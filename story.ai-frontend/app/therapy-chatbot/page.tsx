"use client"

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import TherapyChatbot from '@/components/TherapyChatbot';

export default function TherapyChatbotPage() {
  const [activeTab, setActiveTab] = useState('Therapy Chatbot');

  return (
    <div className="flex h-screen bg-slate-900">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <TherapyChatbot />
    </div>
  );
}