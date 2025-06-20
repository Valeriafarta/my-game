import { motion } from "framer-motion";
import { Play, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Language } from "@/lib/i18n";

interface NetflixEpisodeCardProps {
  episodeNumber: number;
  amount: number;
  isCompleted: boolean;
  currency: string;
  onToggle: () => void;
  language: Language;
}

const getEpisodeTitle = (episodeNumber: number, language: Language) => {
  const titles = {
    ru: [
      "Первый шаг", "Удвоение силы", "Тройная мощь", "Четверная уверенность", "Пятерка побед",
      "Шестеренка богатства", "Семь удач", "Восьмерка изобилия", "Девятка достатка", "Десятка триумфа",
      "Одиннадцать звезд", "Дюжина успеха", "Тринадцать удач", "Четырнадцать побед", "Пятнадцать достижений",
      "Шестнадцать целей", "Семнадцать мечтаний", "Восемнадцать надежд", "Девятнадцать стремлений", "Двадцать амбиций",
      "Двадцать одна возможность", "Двадцать два пути", "Двадцать три шанса", "Двадцать четыре недели силы", "Четверть века мудрости",
      "Двадцать шесть недель роста", "Двадцать семь недель перемен", "Двадцать восемь моментов истины", "Двадцать девять шагов вперед", "Тридцать недель триумфа",
      "Тридцать одна победа", "Тридцать два достижения", "Тридцать три мечты", "Тридцать четыре цели", "Тридцать пять надежд",
      "Тридцать шесть стремлений", "Тридцать семь амбиций", "Тридцать восемь возможностей", "Тридцать девять путей", "Сорок шансов",
      "Сорок одна неделя силы", "Сорок два недели мудрости", "Сорок три момента роста", "Сорок четыре недели перемен", "Сорок пять недель истины",
      "Сорок шесть недель триумфа", "Сорок семь побед", "Сорок восемь достижений", "Сорок девять мечтаний", "Пятьдесят целей", 
      "Пятьдесят один прорыв", "Великий финал"
    ],
    en: [
      "First Step", "Double Power", "Triple Might", "Quad Confidence", "Five Victories",
      "Wealth Gear", "Seven Fortunes", "Eight Abundance", "Nine Prosperity", "Ten Triumph",
      "Eleven Stars", "Dozen Success", "Thirteen Luck", "Fourteen Wins", "Fifteen Achievements",
      "Sixteen Goals", "Seventeen Dreams", "Eighteen Hopes", "Nineteen Aspirations", "Twenty Ambitions",
      "Twenty-One Opportunities", "Twenty-Two Paths", "Twenty-Three Chances", "Twenty-Four Week Power", "Quarter Century Wisdom",
      "Twenty-Six Weeks Growth", "Twenty-Seven Week Changes", "Twenty-Eight Truth Moments", "Twenty-Nine Steps Forward", "Thirty Week Triumph",
      "Thirty-One Victory", "Thirty-Two Achievement", "Thirty-Three Dreams", "Thirty-Four Goals", "Thirty-Five Hopes",
      "Thirty-Six Aspirations", "Thirty-Seven Ambitions", "Thirty-Eight Opportunities", "Thirty-Nine Paths", "Forty Chances",
      "Forty-One Week Power", "Forty-Two Week Wisdom", "Forty-Three Growth Moments", "Forty-Four Week Changes", "Forty-Five Week Truth",
      "Forty-Six Week Triumph", "Forty-Seven Victories", "Forty-Eight Achievements", "Forty-Nine Dreams", "Fifty Goals", 
      "Fifty-One Breakthrough", "Grand Finale"
    ]
  };
  
  return titles[language][episodeNumber - 1] || `Episode ${episodeNumber}`;
};

const getEpisodeDescription = (episodeNumber: number, amount: number, currency: string, language: Language) => {
  const currencySymbol = currency === 'RUB' ? '₽' : currency === 'USD' ? '$' : '€';
  
  if (language === 'ru') {
    return `На этой неделе вы откладываете ${currencySymbol}${amount}. Каждый рубль приближает вас к цели. Дисциплина - ключ к богатству.`;
  } else {
    return `This week you save ${currencySymbol}${amount}. Every coin brings you closer to your goal. Discipline is the key to wealth.`;
  }
};

export function NetflixEpisodeCard({ 
  episodeNumber, 
  amount, 
  isCompleted, 
  currency, 
  onToggle, 
  language 
}: NetflixEpisodeCardProps) {
  const currencySymbol = currency === 'RUB' ? '₽' : currency === 'USD' ? '$' : '€';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: episodeNumber * 0.02 }}
    >
      <Card 
        className={`netflix-episode-card p-4 cursor-pointer ${isCompleted ? 'border-green-500' : ''}`}
        onClick={onToggle}
      >
        <div className="flex items-start gap-4">
          {/* Episode Number */}
          <div className="flex-shrink-0">
            <div className="text-4xl font-bold text-muted-foreground">
              {episodeNumber.toString().padStart(2, '0')}
            </div>
          </div>
          
          {/* Episode Content */}
          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold truncate">
                {getEpisodeTitle(episodeNumber, language)}
              </h3>
              {isCompleted && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <motion.div
                    key={`money-${episodeNumber}`}
                    animate={{
                      rotate: [0, 360, 0],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="text-2xl"
                  >
                    💰
                  </motion.div>
                </div>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {getEpisodeDescription(episodeNumber, amount, currency, language)}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold text-netflix-red">
                {currencySymbol}{amount}
              </div>
              
              <Button
                size="sm"
                variant={isCompleted ? "secondary" : "default"}
                className={isCompleted ? "" : "netflix-gradient"}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle();
                }}
              >
                {isCompleted ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-1" />
                    {language === 'ru' ? 'Завершено' : 'Completed'}
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-1" />
                    {language === 'ru' ? 'Начать' : 'Start'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}