import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import type { Language } from "@/lib/i18n";

interface AutoScrollCardsProps {
  language: Language;
}

export function AutoScrollCards({ language }: AutoScrollCardsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const cards = [
    {
      step: "1",
      title: language === 'ru' ? "Визуализируй цель" : "Visualize Goal",
      description: language === 'ru' ? "Добавь фото своей мечты" : "Add a photo of your dream",
      icon: "🎯"
    },
    {
      step: "2", 
      title: language === 'ru' ? "Откладывай деньги" : "Save Money",
      description: language === 'ru' ? "Каждую неделю сумму = номеру недели" : "Each week save amount = week number",
      icon: "💵"
    },
    {
      step: "3",
      title: language === 'ru' ? "Отмечай прогресс" : "Track Progress", 
      description: language === 'ru' ? "Следи за достижениями" : "Monitor your achievements",
      icon: "✅"
    },
    {
      step: "4",
      title: language === 'ru' ? "Поделись успехом" : "Share Success",
      description: language === 'ru' ? "Покажи друзьям результат" : "Show friends your results",
      icon: "🎉"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [cards.length]);

  return (
    <div className="relative overflow-hidden">
      {/* Progress indicators */}
      <div className="flex justify-center mb-6 gap-2">
        {cards.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              index === currentIndex ? "bg-primary" : "bg-muted-foreground/30"
            }`}
          />
        ))}
      </div>

      {/* Cards container */}
      <div className="relative h-48">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Card className="netflix-card p-6 h-full flex flex-col items-center justify-center text-center">
              <div className="text-4xl mb-4">{cards[currentIndex].icon}</div>
              <div className="text-lg font-semibold text-primary mb-2">
                {cards[currentIndex].step}. {cards[currentIndex].title}
              </div>
              <p className="text-sm text-muted-foreground">
                {cards[currentIndex].description}
              </p>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation dots (clickable) */}
      <div className="flex justify-center mt-4 gap-3">
        {cards.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? "bg-primary scale-110" 
                : "bg-muted-foreground/50 hover:bg-muted-foreground/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
}