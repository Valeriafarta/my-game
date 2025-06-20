import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, LogIn, Star, TrendingUp, Users, Shield, Smartphone, Plus, Share, X } from "lucide-react";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { HowToPlayStories } from "@/components/HowToPlayStories";
import { useTranslation, type Language } from "@/lib/i18n";
import { useState } from "react";

export default function Landing() {
  const [language, setLanguage] = useState<Language>('ru');
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showInstallInstructions, setShowInstallInstructions] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const t = useTranslation(language);

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    localStorage.setItem('wealth-app-language', newLanguage);
  };

  const handleLogin = () => {
    setIsLoggingIn(true);
    window.location.href = `/api/login?lang=${language}`;
  };

  const features = [
    {
      icon: <TrendingUp className="w-8 h-8 text-red-600" />,
      title: language === 'ru' ? "Прогрессивные накопления" : "Progressive Savings",
      description: language === 'ru' 
        ? "Начните с малого и увеличивайте сумму каждую неделю" 
        : "Start small and increase the amount each week"
    },
    {
      icon: <Star className="w-8 h-8 text-red-600" />,
      title: language === 'ru' ? "Интерактивный интерфейс" : "Interactive Interface",
      description: language === 'ru' 
        ? "Современный дизайн делает накопления увлекательными" 
        : "Modern design makes saving engaging"
    },
    {
      icon: <Users className="w-8 h-8 text-red-600" />,
      title: language === 'ru' ? "Социальный аспект" : "Social Features",
      description: language === 'ru' 
        ? "Делитесь прогрессом и мотивируйте друзей" 
        : "Share progress and motivate friends"
    },
    {
      icon: <Shield className="w-8 h-8 text-red-600" />,
      title: language === 'ru' ? "Безопасность данных" : "Data Security",
      description: language === 'ru' 
        ? "Ваши данные защищены и синхронизируются автоматически" 
        : "Your data is protected and synced automatically"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <LanguageSwitch
        currentLanguage={language}
        onLanguageChange={handleLanguageChange}
      />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 netflix-gradient opacity-20" />
        <div className="relative z-10 px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-8xl mb-8">💰</div>
            <h1 className="text-5xl sm:text-7xl font-black mb-6 text-foreground">
              {t.appTitle}
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
              {language === 'ru' 
                ? "Превратите накопления в захватывающую игру"
                : "Turn savings into an exciting game"
              }
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Button
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="netflix-gradient hover:opacity-90 text-xl px-10 py-6 rounded-full font-bold"
                size="lg"
              >
                <LogIn className="w-6 h-6 mr-3" />
                {isLoggingIn 
                  ? (language === 'ru' ? 'Вход...' : 'Logging in...')
                  : (language === 'ru' ? 'Войти и начать' : 'Login & Start')
                }
              </Button>
              
              <Button
                onClick={() => setShowHowToPlay(true)}
                variant="outline"
                className="border-border hover:bg-card text-xl px-10 py-6 rounded-full font-bold"
                size="lg"
              >
                <Play className="w-6 h-6 mr-3" />
                {t.howToPlay}
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-red-600 mb-2">52</div>
                <div className="text-muted-foreground">
                  {language === 'ru' ? 'недели' : 'weeks'}
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-red-600 mb-2">∞</div>
                <div className="text-muted-foreground">
                  {language === 'ru' ? 'возможностей' : 'possibilities'}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6">
              {language === 'ru' ? 'Почему выбирают нас?' : 'Why Choose Us?'}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {language === 'ru' 
                ? "Уникальный подход к накоплениям с геймификацией и современным дизайном"
                : "Unique approach to savings with gamification and modern design"
              }
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="netflix-card p-6 text-center h-full">
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-4 bg-card/30">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-4xl font-bold mb-6">
            {language === 'ru' ? 'Готовы начать путь к богатству?' : 'Ready to Start Your Wealth Journey?'}
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            {language === 'ru' 
              ? "Начните свой путь к финансовой независимости уже сегодня"
              : "Start your journey to financial independence today"
            }
          </p>
          <Button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="netflix-gradient hover:opacity-90 text-xl px-12 py-6 rounded-full font-bold"
            size="lg"
          >
            <LogIn className="w-6 h-6 mr-3" />
            {isLoggingIn 
              ? (language === 'ru' ? 'Вход...' : 'Logging in...')
              : (language === 'ru' ? 'Начать бесплатно' : 'Start Free')
            }
          </Button>
        </motion.div>
      </div>

      {/* Installation Instructions Section */}
      <div className="py-16 px-4 bg-muted/20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Smartphone className="w-16 h-16 mx-auto mb-6 text-red-600" />
            <h2 className="text-3xl font-bold mb-6">
              {language === 'ru' ? 'Установите приложение на свой телефон' : 'Install App on Your Phone'}
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              {language === 'ru' 
                ? "Добавьте приложение на главный экран для быстрого доступа"
                : "Add the app to your home screen for quick access"
              }
            </p>
            
            <Button
              onClick={() => setShowInstallInstructions(true)}
              variant="outline"
              className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
            >
              <Plus className="w-5 h-5 mr-2" />
              {language === 'ru' ? 'Как установить' : 'How to Install'}
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Install Instructions Modal */}
      {showInstallInstructions && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setShowInstallInstructions(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-card rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">
                {language === 'ru' ? 'Установка приложения' : 'Install App'}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowInstallInstructions(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* iOS Instructions */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  📱 {language === 'ru' ? 'Для iPhone (iOS)' : 'For iPhone (iOS)'}
                </h4>
                <ol className="text-sm space-y-2 text-muted-foreground">
                  <li>1. {language === 'ru' ? 'Откройте Safari и перейдите на сайт' : 'Open Safari and go to the website'}</li>
                  <li>2. {language === 'ru' ? 'Нажмите кнопку "Поделиться"' : 'Tap the "Share" button'} <Share className="w-4 h-4 inline" /></li>
                  <li>3. {language === 'ru' ? 'Выберите "На экран Домой"' : 'Select "Add to Home Screen"'}</li>
                  <li>4. {language === 'ru' ? 'Нажмите "Добавить"' : 'Tap "Add"'}</li>
                </ol>
              </div>

              {/* Android Instructions */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  🤖 {language === 'ru' ? 'Для Android' : 'For Android'}
                </h4>
                <ol className="text-sm space-y-2 text-muted-foreground">
                  <li>1. {language === 'ru' ? 'Откройте Chrome и перейдите на сайт' : 'Open Chrome and go to the website'}</li>
                  <li>2. {language === 'ru' ? 'Нажмите меню (три точки)' : 'Tap menu (three dots)'}</li>
                  <li>3. {language === 'ru' ? 'Выберите "Добавить на главный экран"' : 'Select "Add to Home screen"'}</li>
                  <li>4. {language === 'ru' ? 'Нажмите "Добавить"' : 'Tap "Add"'}</li>
                </ol>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  {language === 'ru' 
                    ? '💡 После установки приложение будет работать как обычное мобильное приложение с иконкой на главном экране'
                    : '💡 After installation, the app will work like a native mobile app with an icon on your home screen'
                  }
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* How to Play Modal */}
      <HowToPlayStories
        isOpen={showHowToPlay}
        onClose={() => setShowHowToPlay(false)}
        language={language}
      />
    </div>
  );
}