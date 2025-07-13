
import React, { useState, useEffect } from 'react';
import { BookOpen, Star, Sparkles } from 'lucide-react';

const TypewriterHero: React.FC = () => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  
  const words = ['Topshot Bookstore', 'Your Reading Paradise', 'Literary Adventures'];
  const typingSpeed = 100;
  const deletingSpeed = 50;
  const pauseTime = 2000;

  useEffect(() => {
    const currentWord = words[wordIndex];
    
    const timer = setTimeout(() => {
      if (!isDeleting) {
        if (currentIndex < currentWord.length) {
          setDisplayText(currentWord.substring(0, currentIndex + 1));
          setCurrentIndex(currentIndex + 1);
        } else {
          setTimeout(() => setIsDeleting(true), pauseTime);
        }
      } else {
        if (currentIndex > 0) {
          setDisplayText(currentWord.substring(0, currentIndex - 1));
          setCurrentIndex(currentIndex - 1);
        } else {
          setIsDeleting(false);
          setWordIndex((wordIndex + 1) % words.length);
        }
      }
    }, isDeleting ? deletingSpeed : typingSpeed);

    return () => clearTimeout(timer);
  }, [currentIndex, isDeleting, wordIndex, words]);

  return (
    <div className="relative text-center mb-8">
      {/* Floating elements */}
      <div className="absolute -top-4 -left-4 animate-bounce">
        <div className="bg-gradient-to-r from-amber-400 to-orange-500 p-2 rounded-full shadow-lg">
          <BookOpen className="w-4 h-4 text-white" />
        </div>
      </div>
      
      <div className="absolute -top-2 -right-8 animate-pulse">
        <div className="bg-gradient-to-r from-purple-400 to-pink-500 p-2 rounded-full shadow-lg">
          <Star className="w-4 h-4 text-white fill-current" />
        </div>
      </div>
      
      <div className="absolute top-4 left-1/4 animate-bounce delay-300">
        <div className="bg-gradient-to-r from-blue-400 to-indigo-500 p-1.5 rounded-full shadow-lg">
          <Sparkles className="w-3 h-3 text-white" />
        </div>
      </div>

      {/* Main typing text */}
      <div className="relative">
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-amber-600 via-orange-500 to-red-500 bg-clip-text text-transparent mb-2">
          {displayText}
          <span className="animate-pulse text-amber-600">|</span>
        </h1>
        
        {/* Subtle glow effect */}
        <div className="absolute inset-0 text-2xl md:text-4xl lg:text-5xl font-bold text-amber-500/20 blur-sm -z-10">
          {displayText}
        </div>
      </div>
      
      {/* Decorative line */}
      <div className="flex items-center justify-center mt-4">
        <div className="h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent w-32"></div>
        <div className="mx-4 bg-gradient-to-r from-amber-500 to-orange-500 p-1 rounded-full">
          <BookOpen className="w-3 h-3 text-white" />
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent w-32"></div>
      </div>
    </div>
  );
};

export default TypewriterHero;
