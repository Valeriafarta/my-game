import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation, type Language } from "@/lib/i18n";

interface HowToPlayStoriesProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export function HowToPlayStories({ isOpen, onClose, language }: HowToPlayStoriesProps) {
  const [currentStory, setCurrentStory] = useState(0);
  const [progress, setProgress] = useState(0);
  const t = useTranslation(language);

  const stories = [
    {
      title: language === 'ru' ? "Добро пожаловать в игру!" : "Welcome to the game!",
      content: language === 'ru' ? "52 недели богатства - это простая и эффективная система накоплений" : "52 Weeks of Wealth - a simple and effective savings system",
      image: "💰"
    },
    {
      title: language === 'ru' ? "Как это работает?" : "How does it work?",
      content: language === 'ru' ? "Каждую неделю вы откладываете небольшую сумму, которая постепенно увеличивается. Вносить пополнения можно открыв накопительный счет в своем банке и пополнять его на такие же суммы" : "Each week you save a small amount that gradually increases. You can make deposits by opening a savings account at your bank and adding the same amounts",
      image: "📈"
    },
    {
      title: language === 'ru' ? "Установите цель" : "Set Your Goal",
      content: language === 'ru' ? "Выберите сумму, которую хотите накопить за 52 недели" : "Choose the amount you want to save over 52 weeks",
      image: "🎯"
    },
    {
      title: language === 'ru' ? "Выберите день" : "Choose Day",
      content: language === 'ru' ? "Укажите день недели для напоминаний о накоплениях" : "Set the day of the week for savings reminders",
      image: "📅"
    },
    {
      title: language === 'ru' ? "Отмечайте прогресс" : "Track Progress",
      content: language === 'ru' ? "Каждую неделю отмечайте выполненные накопления в таблице" : "Each week mark completed savings in the table",
      image: "✅"
    },
    {
      title: language === 'ru' ? "Достигните цели!" : "Reach Your Goal!",
      content: language === 'ru' ? "За 52 недели вы накопите желаемую сумму и обретете финансовую дисциплину" : "In 52 weeks you'll save your desired amount and gain financial discipline",
      image: "🎉"
    }
  ];

  useEffect(() => {
    if (!isOpen) {
      setCurrentStory(0);
      setProgress(0);
      return;
    }

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentStory < stories.length - 1) {
            setTimeout(() => {
              setCurrentStory(curr => curr + 1);
            }, 0);
            return 0;
          } else {
            setTimeout(() => {
              onClose();
            }, 0);
            return 0;
          }
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [isOpen, currentStory, stories.length, onClose]);

  const nextStory = () => {
    if (currentStory < stories.length - 1) {
      setCurrentStory(currentStory + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const prevStory = () => {
    if (currentStory > 0) {
      setCurrentStory(currentStory - 1);
      setProgress(0);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
    >
      {/* Progress bars */}
      <div className="absolute top-4 left-4 right-4 flex gap-1">
        {stories.map((_, index) => (
          <div key={index} className="flex-1 h-1 bg-white/30 rounded">
            <div
              className="h-full bg-primary rounded transition-all duration-100"
              style={{
                width: index < currentStory ? '100%' : index === currentStory ? `${progress}%` : '0%'
              }}
            />
          </div>
        ))}
      </div>

      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-4 right-4 text-white hover:bg-white/10 z-10"
      >
        <X className="w-5 h-5" />
      </Button>

      {/* Story content */}
      <div className="px-8 py-16 text-center max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-6xl mb-8">{stories[currentStory].image}</div>
            <h2 className="text-2xl font-bold text-white mb-4">
              {stories[currentStory].title}
            </h2>
            <p className="text-white/80 text-lg leading-relaxed">
              {stories[currentStory].content}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="absolute bottom-8 left-4 right-4 flex justify-between">
        <Button
          variant="ghost"
          onClick={prevStory}
          disabled={currentStory === 0}
          className="text-white hover:bg-white/10 disabled:opacity-30"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          {t.back}
        </Button>
        
        <Button
          variant="ghost"
          onClick={nextStory}
          className="text-white hover:bg-white/10"
        >
          {currentStory === stories.length - 1 ? t.done : t.next}
          {currentStory !== stories.length - 1 && <ChevronRight className="w-5 h-5 ml-1" />}
        </Button>
      </div>

      {/* Tap areas for mobile */}
      <div className="absolute inset-0 flex">
        <div className="flex-1" onClick={prevStory} />
        <div className="flex-1" onClick={nextStory} />
      </div>
    </motion.div>
  );
}