import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Trophy, Star, Target, Crown } from "lucide-react";
import type { Language } from "@/lib/i18n";
import type { Goal } from "@shared/schema";

interface FinalCreditsProps {
  goal: Goal;
  totalSaved: number;
  language: Language;
  onComplete: () => void;
}

export function FinalCredits({ goal, totalSaved, language, onComplete }: FinalCreditsProps) {
  const [currentScene, setCurrentScene] = useState(0);
  const [showFire, setShowFire] = useState(false);
  const [showText, setShowText] = useState(false);
  
  const scenes = [
    {
      title: language === 'ru' ? 'ПОЗДРАВЛЯЕМ!' : 'CONGRATULATIONS!',
      content: language === 'ru' ? 'Вы завершили 52-недельный челлендж' : 'You completed the 52-week challenge'
    },
    {
      title: language === 'ru' ? 'ВАШИ ДОСТИЖЕНИЯ' : 'YOUR ACHIEVEMENTS',
      content: language === 'ru' ? `Накоплено: ₽${totalSaved}` : `Saved: ₽${totalSaved}`
    },
    {
      title: language === 'ru' ? 'ЦЕЛЬ ДОСТИГНУТА' : 'GOAL ACHIEVED',
      content: goal.title
    },
    {
      title: language === 'ru' ? 'ДИСЦИПЛИНА = БОГАТСТВО' : 'DISCIPLINE = WEALTH',
      content: language === 'ru' ? 'Вы доказали силу постоянства' : 'You proved the power of consistency'
    }
  ];

  useEffect(() => {
    setShowFire(true);
    
    // Play custom victory sound
    try {
      import('@assets/388d369504aaa1a_1750241422885.mp3').then((audioModule) => {
        const audio = new Audio(audioModule.default);
        audio.volume = 0.5;
        audio.play().catch(console.error);
      });
    } catch (error) {
      console.log('Audio not supported');
    }
    
    setTimeout(() => setShowText(true), 1500);

    const timer = setInterval(() => {
      setCurrentScene(prev => {
        if (prev < scenes.length - 1) {
          return prev + 1;
        } else {
          setTimeout(onComplete, 3000);
          return prev;
        }
      });
    }, 3500);

    return () => clearInterval(timer);
  }, [onComplete, scenes.length]);

  return (
    <motion.div
      className="fixed inset-0 bg-black z-50 flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        background: goal.imageUrl 
          ? `linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.9)), url(${goal.imageUrl})`
          : 'linear-gradient(135deg, #000000 0%, #E50914 50%, #000000 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* iPhone Fitness-style celebration effect */}
      {showFire && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {/* Screen-wide celebration emojis */}
          {[...Array(20)].map((_, i) => {
            const emojis = ['🎉', '✨', '🏆', '👑', '💰', '🌟', '🎊', '💎'];
            const emoji = emojis[i % emojis.length];
            const randomX = 5 + Math.random() * 90; // 5% to 95% of screen width
            const randomY = 5 + Math.random() * 90; // 5% to 95% of screen height
            
            return (
              <motion.div
                key={`celebrate-${i}`}
                className="absolute text-3xl"
                style={{
                  left: `${randomX}%`,
                  top: `${randomY}%`,
                }}
                initial={{
                  scale: 0,
                  rotate: 0,
                  opacity: 0
                }}
                animate={{
                  scale: [0, 1.5, 1],
                  rotate: [0, 360],
                  opacity: [0, 1, 0.8],
                  y: [0, -30, 0]
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.2,
                  repeatDelay: 2
                }}
              >
                {emoji}
              </motion.div>
            );
          })}
          

          

          
          {/* Floating sparkles */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={`float-${i}`}
              className="absolute w-3 h-3 text-lg"
              style={{
                left: `${30 + Math.random() * 40}%`,
                top: `${30 + Math.random() * 40}%`,
              }}
              animate={{
                y: [-20, -100, -20],
                x: [0, Math.random() * 40 - 20, 0],
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5],
                rotate: [0, 360],
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 3
              }}
            >
              ⭐
            </motion.div>
          ))}
        </motion.div>
      )}

      <div className="text-center text-white max-w-4xl px-8 relative z-10">
        <div className="bg-black/70 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
          <motion.div
            key={currentScene}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 1 }}
          >
            <div className="mb-8">
              {currentScene === 0 && <Trophy className="w-24 h-24 mx-auto text-yellow-400 mb-6" />}
              {currentScene === 1 && <Star className="w-24 h-24 mx-auto text-green-400 mb-6" />}
              {currentScene === 2 && <Target className="w-24 h-24 mx-auto text-blue-400 mb-6" />}
              {currentScene === 3 && <Crown className="w-24 h-24 mx-auto text-purple-400 mb-6" />}
            </div>

            <h1 className="text-6xl font-black mb-6" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>
              {scenes[currentScene].title}
            </h1>
            
            <p className="text-2xl font-semibold mb-8">
              {scenes[currentScene].content}
            </p>

            {currentScene === scenes.length - 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="space-y-4 mt-16"
              >
                <div className="text-2xl font-bold text-white">
                  {language === 'ru' ? 'Спасибо за игру!' : 'Thanks for playing!'}
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Progress dots */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {scenes.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index <= currentScene ? 'bg-red-600' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}