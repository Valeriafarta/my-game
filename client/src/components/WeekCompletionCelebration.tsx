import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Trophy, Star, Sparkles, TrendingUp } from "lucide-react";
import type { Language } from "@/lib/i18n";

interface WeekCompletionCelebrationProps {
  weekNumber: number;
  amount: number;
  currency: string;
  isVisible: boolean;
  onComplete: () => void;
  language: Language;
}

export function WeekCompletionCelebration({ 
  weekNumber, 
  amount, 
  currency, 
  isVisible, 
  onComplete, 
  language 
}: WeekCompletionCelebrationProps) {
  const [animationPhase, setAnimationPhase] = useState(0);
  
  const getCurrencySymbol = () => {
    switch (currency) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'RUB': return '₽';
      default: return '₽';
    }
  };

  const getEpisodeTitle = () => {
    const titles = {
      ru: [
        "Первый шаг", "Удвоение силы", "Тройная мощь", "Четверная уверенность", "Пятерка побед",
        "Шестеренка богатства", "Семь удач", "Восьмерка изобилия", "Девятка достатка", "Десятка триумфа",
        "Одиннадцать звезд", "Дюжина успеха", "Тринадцать удач", "Четырнадцать побед", "Пятнадцать достижений",
        "Шестнадцать целей", "Семнадцать мечтаний", "Восемнадцать надежд", "Девятнадцать стремлений", "Двадцать амбиций",
        "Двадцать одна возможность", "Двадцать два пути", "Двадцать три шанса", "Двадцать четыре часа силы", "Четверть века мудрости",
        "Двадцать шесть недель роста", "Двадцать семь дней перемен", "Двадцать восемь моментов истины", "Двадцать девять шагов вперед", "Тридцать дней триумфа",
        "Тридцать одна победа", "Тридцать два достижения", "Тридцать три мечты", "Тридцать четыре цели", "Тридцать пять надежд",
        "Тридцать шесть стремлений", "Тридцать семь амбиций", "Тридцать восемь возможностей", "Тридцать девять путей", "Сорок шансов",
        "Сорок одна неделя силы", "Сорок два дня мудрости", "Сорок три момента роста", "Сорок четыре часа перемен", "Сорок пять минут истины",
        "Сорок шесть секунд триумфа", "Сорок семь побед", "Сорок восемь достижений", "Сорок девять мечтаний", "Пятьдесят целей", 
        "Пятьдесят один прорыв", "Великий финал"
      ],
      en: [
        "First Step", "Double Power", "Triple Might", "Quad Confidence", "Five Victories",
        "Wealth Gear", "Seven Fortunes", "Eight Abundance", "Nine Prosperity", "Ten Triumph",
        "Eleven Stars", "Dozen Success", "Thirteen Luck", "Fourteen Wins", "Fifteen Achievements",
        "Sixteen Goals", "Seventeen Dreams", "Eighteen Hopes", "Nineteen Aspirations", "Twenty Ambitions",
        "Twenty-One Opportunities", "Twenty-Two Paths", "Twenty-Three Chances", "Twenty-Four Hour Power", "Quarter Century Wisdom",
        "Twenty-Six Weeks Growth", "Twenty-Seven Days Change", "Twenty-Eight Truth Moments", "Twenty-Nine Steps Forward", "Thirty Days Triumph",
        "Thirty-One Victory", "Thirty-Two Achievement", "Thirty-Three Dreams", "Thirty-Four Goals", "Thirty-Five Hopes",
        "Thirty-Six Aspirations", "Thirty-Seven Ambitions", "Thirty-Eight Opportunities", "Thirty-Nine Paths", "Forty Chances",
        "Forty-One Week Power", "Forty-Two Day Wisdom", "Forty-Three Growth Moments", "Forty-Four Hour Changes", "Forty-Five Truth Minutes",
        "Forty-Six Triumph Seconds", "Forty-Seven Victories", "Forty-Eight Achievements", "Forty-Nine Dreams", "Fifty Goals", 
        "Fifty-One Breakthrough", "Grand Finale"
      ]
    };
    
    return titles[language][weekNumber - 1] || `Episode ${weekNumber}`;
  };

  useEffect(() => {
    if (!isVisible) {
      setAnimationPhase(0); // Reset animation phase when not visible
      return;
    }

    // Prevent multiple executions by using a ref-like approach
    let hasExecuted = false;

    // Play celebration sound effect
    const playCelebrationSound = () => {
      if (hasExecuted) return;
      hasExecuted = true;
      
      try {
        // Create audio context with user interaction requirement
        let audioContext: AudioContext;
        
        const initAudio = async () => {
          audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          
          // Resume context if suspended
          if (audioContext.state === 'suspended') {
            await audioContext.resume();
          }
        };
        
        const createTone = (frequency: number, duration: number, startTime: number, volume = 0.08, waveType: OscillatorType = 'sine') => {
          if (!audioContext || audioContext.state !== 'running') return;
          
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime + startTime);
          oscillator.type = waveType;
          
          gainNode.gain.setValueAtTime(0, audioContext.currentTime + startTime);
          gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + startTime + 0.02);
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + startTime + duration);
          
          oscillator.start(audioContext.currentTime + startTime);
          oscillator.stop(audioContext.currentTime + startTime + duration);
        };

        // Initialize and play sounds
        initAudio().then(() => {
          // Very gentle and pleasant sound sequence
          createTone(330, 0.4, 0, 0.05, 'sine');        // E4 - soft start
          createTone(415.3, 0.4, 0.15, 0.06, 'sine');   // G#4 - gentle harmony
          createTone(523.25, 0.5, 0.3, 0.07, 'sine');   // C5 - warm middle
          createTone(659.25, 0.6, 0.5, 0.08, 'sine');   // E5 - celebration peak
          
          // Very soft completion chime
          setTimeout(() => {
            createTone(783.99, 0.3, 0, 0.04, 'sine');   // G5 - gentle end
          }, 700);
        }).catch(error => {
          console.log('Audio initialization failed:', error);
        });
        
      } catch (error) {
        console.log('Audio playback failed:', error);
      }
    };

    playCelebrationSound();

    const sequence = [
      () => setAnimationPhase(1), // Title animation
      () => setAnimationPhase(2), // Amount celebration
      () => {
        setAnimationPhase(0); // Reset for next time
        onComplete();
      }
    ];

    let timeouts: NodeJS.Timeout[] = [];
    
    // More readable timing: 0ms, 800ms, 2200ms
    const timings = [0, 800, 2200];
    sequence.forEach((fn, index) => {
      timeouts.push(setTimeout(fn, timings[index]));
    });

    return () => {
      timeouts.forEach(clearTimeout);
      hasExecuted = false;
    };
  }, [isVisible, weekNumber, amount]); // Added weekNumber and amount as dependencies

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="text-center text-white max-w-md">
          {/* Episode Title */}
          <AnimatePresence mode="wait">
            {animationPhase >= 1 && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", damping: 15, duration: 0.8 }}
              >
                <div className="text-6xl font-black mb-4 bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
                  {weekNumber.toString().padStart(2, '0')}
                </div>
                <h1 className="text-2xl font-bold mb-6">
                  {getEpisodeTitle()}
                </h1>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Amount Celebration */}
          <AnimatePresence mode="wait">
            {animationPhase >= 2 && (
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                transition={{ type: "spring", stiffness: 80, damping: 12, duration: 0.6 }}
                className="space-y-4"
              >
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 0.8, repeat: 1, ease: "easeInOut" }}
                  className="relative"
                >
                  <Trophy className="w-16 h-16 mx-auto text-yellow-400 mb-4" />
                  
                  {/* Floating celebration emojis */}
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {['🎉', '✨', '🏆', '💎', '⭐'].map((emoji, index) => (
                      <motion.span
                        key={`${weekNumber}-${amount}-${index}`} // Unique key to prevent duplication
                        className="absolute text-2xl"
                        style={{
                          left: `${20 + index * 15}%`,
                          top: `${10 + (index % 2) * 20}%`
                        }}
                        animate={{
                          y: [-10, -30, -10],
                          rotate: [0, 15, -15, 0],
                          scale: [0.8, 1.2, 0.8]
                        }}
                        transition={{
                          duration: 2,
                          delay: index * 0.1,
                          repeat: 1,
                          ease: "easeInOut"
                        }}
                      >
                        {emoji}
                      </motion.span>
                    ))}
                  </motion.div>
                </motion.div>
                
                <div className="text-4xl font-bold">
                  {getCurrencySymbol()}{amount}
                </div>
                
                <div className="text-lg text-gray-300">
                  {language === 'ru' ? 'Эпизод завершен!' : 'Episode completed!'}
                </div>
              </motion.div>
            )}
          </AnimatePresence>


        </div>
      </motion.div>
    </AnimatePresence>
  );
}