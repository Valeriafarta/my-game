import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Drama, Laugh, Users, Zap } from "lucide-react";
import type { Language } from "@/lib/i18n";

export type Genre = 'drama' | 'comedy' | 'reality' | 'thriller';

interface GenreQuizProps {
  onGenreSelect: (genre: Genre) => void;
  language: Language;
}

const genres = {
  drama: {
    icon: Drama,
    title: { ru: 'Драма', en: 'Drama' },
    description: { ru: 'Эмоциональный путь с глубокими размышлениями', en: 'Emotional journey with deep reflections' },
    style: { ru: 'Медленное, вдумчивое накопление', en: 'Slow, thoughtful accumulation' },
    color: 'from-purple-600 to-purple-800',
    bgColor: 'bg-purple-900/20'
  },
  comedy: {
    icon: Laugh,
    title: { ru: 'Комедия', en: 'Comedy' },
    description: { ru: 'Легкий и веселый подход к деньгам', en: 'Light and fun approach to money' },
    style: { ru: 'Игровое накопление с юмором', en: 'Playful saving with humor' },
    color: 'from-yellow-600 to-orange-600',
    bgColor: 'bg-yellow-900/20'
  },
  reality: {
    icon: Users,
    title: { ru: 'Реалити', en: 'Reality' },
    description: { ru: 'Практичный подход к финансам', en: 'Practical approach to finances' },
    style: { ru: 'Реалистичные цели и планы', en: 'Realistic goals and plans' },
    color: 'from-green-600 to-green-800',
    bgColor: 'bg-green-900/20'
  },
  thriller: {
    icon: Zap,
    title: { ru: 'Триллер', en: 'Thriller' },
    description: { ru: 'Интенсивные вызовы и достижения', en: 'Intense challenges and achievements' },
    style: { ru: 'Агрессивное накопление', en: 'Aggressive accumulation' },
    color: 'from-red-600 to-red-800',
    bgColor: 'bg-red-900/20'
  }
};

export function GenreQuiz({ onGenreSelect, language }: GenreQuizProps) {
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);

  const handleGenreSelect = (genre: Genre) => {
    setSelectedGenre(genre);
    setTimeout(() => onGenreSelect(genre), 800);
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black z-50 flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="max-w-4xl w-full"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="text-center mb-8">
          <motion.h1
            className="text-4xl font-black text-white mb-4"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {language === 'ru' ? 'Какой ты жанр?' : 'What\'s your genre?'}
          </motion.h1>
          <motion.p
            className="text-lg text-gray-300"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {language === 'ru' 
              ? 'Выбери стиль прохождения твоего финансового путешествия'
              : 'Choose your financial journey style'
            }
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(genres).map(([key, genre], index) => {
            const Icon = genre.icon;
            const isSelected = selectedGenre === key;
            
            return (
              <motion.div
                key={key}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 + index * 0.1 }}
              >
                <Card
                  className={`p-6 cursor-pointer transition-all duration-300 border-2 ${
                    isSelected 
                      ? 'border-red-500 scale-105' 
                      : 'border-gray-700 hover:border-gray-500'
                  } ${genre.bgColor} backdrop-blur-sm`}
                  onClick={() => handleGenreSelect(key as Genre)}
                >
                  <div className="text-center space-y-4">
                    <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${genre.color} flex items-center justify-center`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white">
                      {genre.title[language]}
                    </h3>
                    
                    <p className="text-gray-300">
                      {genre.description[language]}
                    </p>
                    
                    <div className="bg-black/30 rounded-lg p-3">
                      <p className="text-sm text-gray-400">
                        {genre.style[language]}
                      </p>
                    </div>

                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-green-400 font-semibold"
                        >
                          {language === 'ru' ? 'Выбрано!' : 'Selected!'}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}