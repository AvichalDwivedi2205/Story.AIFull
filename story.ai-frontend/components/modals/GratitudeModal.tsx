"use client"
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HeartHandshake } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

interface GratitudeModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
}

export default function GratitudeModal({ isOpen, onClose, content }: GratitudeModalProps) {
  // Handle escape key press
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscapeKey);
    
    // Lock body scroll when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      window.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-xl max-h-[80vh] overflow-y-auto"
          >
            <div className="bg-gradient-to-br from-blue-900/90 to-purple-900/90 border border-blue-500/30 backdrop-blur-md rounded-2xl p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <HeartHandshake className="h-6 w-6 text-blue-400 mr-2" />
                  <h2 className="text-2xl font-semibold text-blue-200">Gratitude Reflection</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-blue-800/50 transition-colors"
                >
                  <X className="h-5 w-5 text-blue-300" />
                </button>
              </div>
              
              {/* Divider with gradient */}
              <div className="h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent my-4"></div>
              
              {/* Content */}
              <div className="prose prose-invert prose-blue max-w-none">
                <div className="text-slate-200">
                  <ReactMarkdown 
                    rehypePlugins={[rehypeRaw]}
                    remarkPlugins={[remarkGfm]}
                  >
                    {content}
                  </ReactMarkdown>
                </div>
              </div>
              
              {/* Footer */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-5 py-2 bg-blue-600/60 hover:bg-blue-500/70 text-white rounded-lg border border-blue-400/30 transition-colors shadow-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}