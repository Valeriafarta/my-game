import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface NetflixLoaderProps {
  onLoadComplete: () => void;
}

export function NetflixLoader({ onLoadComplete }: NetflixLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [showEmojis, setShowEmojis] = useState(false);

  useEffect(() => {
    // Play Netflix-style sound effect with original twist
    const playNetflixSound = () => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        const createTone = (frequency: number, duration: number, startTime: number, volume = 0.12, waveType: OscillatorType = 'sine') => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.type = waveType;
          oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime + startTime);
          gainNode.gain.setValueAtTime(0, audioContext.currentTime + startTime);
          gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + startTime + 0.05);
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + startTime + duration);
          
          oscillator.start(audioContext.currentTime + startTime);
          oscillator.stop(audioContext.currentTime + startTime + duration);
        };

        // Enhanced musical sequence with wealth-themed progression
        createTone(523.25, 0.4, 0, 0.08, 'sine');     // C5 - smooth start
        createTone(659.25, 0.4, 0.2, 0.1, 'triangle'); // E5 - wealth building
        createTone(783.99, 0.5, 0.4, 0.12, 'sine');    // G5 - progress
        createTone(1046.5, 0.6, 0.6, 0.14, 'triangle'); // C6 - success
        createTone(1318.5, 0.4, 1.0, 0.1, 'sine');     // E6 - achievement
        createTone(1567.98, 0.8, 1.2, 0.16, 'triangle'); // G6 - triumph
        
        // Add wealth-themed sound effects
        setTimeout(() => {
          // Coin drop effect
          createTone(800, 0.1, 0, 0.08, 'square');
          createTone(600, 0.1, 0.05, 0.06, 'square');
          createTone(400, 0.1, 0.1, 0.04, 'square');
        }, 1500);
        
        setTimeout(() => {
          // Success chime
          createTone(1200, 0.3, 0, 0.1, 'sine');
          createTone(1600, 0.3, 0.1, 0.08, 'sine');
          createTone(2000, 0.4, 0.2, 0.06, 'sine');
        }, 2500);
        
      } catch (error) {
        console.log('Audio not supported');
      }
    };

    playNetflixSound();
    setTimeout(() => setShowEmojis(true), 800);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onLoadComplete, 500);
          return 100;
        }
        return prev + 1.5;
      });
    }, 60);

    return () => clearInterval(timer);
  }, [onLoadComplete]);

  return (
    <motion.div
      className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Netflix-style logo animation */}
      <motion.div
        className="text-center mb-12"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <motion.div
          className="text-8xl font-black text-red-600 mb-4"
          style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
          animate={{ 
            textShadow: [
              "0 0 20px rgba(229, 9, 20, 0.5)",
              "0 0 40px rgba(229, 9, 20, 0.8)",
              "0 0 20px rgba(229, 9, 20, 0.5)"
            ]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          52
        </motion.div>
        <motion.div
          className="text-2xl font-bold text-white tracking-wider"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          НЕДЕЛИ БОГАТСТВА
        </motion.div>
        <motion.div
          className="w-32 h-1 bg-red-600 mx-auto mt-4"
          initial={{ width: 0 }}
          animate={{ width: 128 }}
          transition={{ delay: 1, duration: 1 }}
        />
      </motion.div>

      {/* Loading progress bar */}
      <div className="w-80 mb-8">
        <motion.div
          className="w-full bg-gray-800 rounded-full h-2 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full"
            style={{ width: `${progress}%` }}
            transition={{ ease: "easeOut" }}
          />
        </motion.div>
        <motion.div
          className="text-center text-white text-sm mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          Загрузка эпизодов... {progress}%
        </motion.div>
      </div>

      {/* Animated Netflix-style emojis */}
      {showEmojis && (
        <motion.div 
          className="flex justify-center items-center gap-6 mb-8"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.3, 1]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="text-6xl filter drop-shadow-lg"
          >
            💰
          </motion.div>
          <motion.div
            animate={{ 
              y: [0, -25, 0],
              rotate: [0, 15, -15, 0]
            }}
            transition={{ 
              duration: 1.8, 
              repeat: Infinity,
              delay: 0.3
            }}
            className="text-5xl filter drop-shadow-lg"
          >
            💎
          </motion.div>
          <motion.div
            animate={{ 
              scale: [1, 1.4, 1],
              rotate: [0, -360]
            }}
            transition={{ 
              duration: 2.5, 
              repeat: Infinity,
              delay: 0.6
            }}
            className="text-4xl filter drop-shadow-lg"
          >
            🎯
          </motion.div>
          <motion.div
            animate={{ 
              x: [0, 15, -15, 0],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              delay: 0.9
            }}
            className="text-5xl filter drop-shadow-lg"
          >
            ✨
          </motion.div>
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              y: [0, -20, 0]
            }}
            transition={{ 
              duration: 2.2, 
              repeat: Infinity,
              delay: 1.2
            }}
            className="text-6xl filter drop-shadow-lg"
          >
            🚀
          </motion.div>
          <motion.div
            animate={{ 
              rotate: [0, 180, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              delay: 1.5
            }}
            className="text-4xl filter drop-shadow-lg"
          >
            🎬
          </motion.div>
        </motion.div>
      )}

      {/* Netflix-style dots animation */}
      <div className="flex space-x-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-3 h-3 bg-red-600 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}