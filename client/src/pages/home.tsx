import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, HelpCircle, PlusCircle, User, LogOut } from "lucide-react";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { HowToPlayStories } from "@/components/HowToPlayStories";
import { GoalCreation } from "@/components/GoalCreation";
import { ProgressTracker } from "@/components/ProgressTracker";
import { AutoScrollCards } from "@/components/AutoScrollCards";
import { NetflixLoader } from "@/components/NetflixLoader";
import { GenreQuiz, type Genre } from "@/components/GenreQuiz";
import { ProfileSetup } from "@/components/ProfileSetup";
import { useTranslation, type Language } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import type { Goal } from "@shared/schema";

export default function Home() {
  const [language, setLanguage] = useState<Language>('ru');
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showGoalCreation, setShowGoalCreation] = useState(false);
  const [currentGoalId, setCurrentGoalId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNetflixLoader, setShowNetflixLoader] = useState(true);
  const [showGenreQuiz, setShowGenreQuiz] = useState(false);
  const [userGenre, setUserGenre] = useState<Genre | null>(null);
  
  const t = useTranslation(language);
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // Load language and genre from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('wealth-app-language') as Language;
    if (savedLanguage && (savedLanguage === 'ru' || savedLanguage === 'en')) {
      setLanguage(savedLanguage);
    }
    
    const savedGenre = localStorage.getItem('user-genre') as Genre;
    if (savedGenre && ['drama', 'comedy', 'reality', 'thriller'].includes(savedGenre)) {
      setUserGenre(savedGenre);
    }
  }, []);

  // Save language to localStorage when changed
  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    localStorage.setItem('wealth-app-language', newLanguage);
  };

  // Fetch existing goals
  const { data: goalsData = [] } = useQuery({
    queryKey: ["/api/goals"],
    queryFn: async () => {
      const response = await fetch("/api/goals", {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token') || 'dev-token-123'}`
        }
      });
      if (!response.ok) throw new Error("Failed to fetch goals");
      return response.json();
    },
    enabled: isAuthenticated && !!user,
  });

  // Check if user needs to set up their profile
  const needsProfileSetup = user && !(user as any).displayName;

  // Sort goals by creation date - newest first
  const goals = [...goalsData].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  const handleGoalCreated = (goalId: number) => {
    setCurrentGoalId(goalId);
    setShowGoalCreation(false);
  };

  const handleGoalSelect = (goalId: number) => {
    if (!userGenre) {
      setShowGenreQuiz(true);
      setCurrentGoalId(goalId); // Store the goal ID to use after genre selection
    } else {
      setCurrentGoalId(goalId);
    }
  };

  const handleGenreSelect = (genre: Genre) => {
    setUserGenre(genre);
    setShowGenreQuiz(false);
    localStorage.setItem('user-genre', genre);
    
    // If we have a stored goal ID (from goal selection), go to progress tracker
    // Otherwise, show goal creation
    if (currentGoalId) {
      // Goal already selected, proceed to progress tracker
    } else {
      setShowGoalCreation(true);
    }
  };

  const handleNewGoal = () => {
    if (!userGenre) {
      setShowGenreQuiz(true);
    } else {
      setShowGoalCreation(true);
    }
  };

  const handleBackToHome = () => {
    setCurrentGoalId(null);
  };

  // If viewing a specific goal, show the progress tracker
  if (currentGoalId) {
    return (
      <ProgressTracker
        goalId={currentGoalId}
        onBack={handleBackToHome}
        language={language}
      />
    );
  }

  // Show Netflix loading screen only for first-time users or when no goals exist
  if (showNetflixLoader && goals.length === 0) {
    return (
      <NetflixLoader onLoadComplete={() => setShowNetflixLoader(false)} />
    );
  }

  // Show profile setup if user needs to enter their name
  if (needsProfileSetup) {
    return <ProfileSetup language={language} onComplete={() => window.location.reload()} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with user info and controls */}
      <div className="flex justify-between items-center p-4 border-b border-border">
        <LanguageSwitch
          currentLanguage={language}
          onLanguageChange={handleLanguageChange}
        />
        
{isAuthenticated && user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {user.profileImageUrl ? (
                <img 
                  src={user.profileImageUrl} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
              <span className="text-sm font-medium">
                {user.displayName || user.firstName || user.email || 'Пользователь'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/api/logout'}
              className="text-muted-foreground hover:text-foreground"
              title={language === 'ru' ? 'Выйти' : 'Logout'}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 netflix-gradient opacity-20" />
        <div className="relative z-10 px-4 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl sm:text-6xl font-bold mb-4 text-foreground">
              {t.appTitle}
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              {t.appSubtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={() => setShowGoalCreation(true)}
                className="netflix-gradient hover:opacity-90 text-lg px-8 py-4 rounded-full"
                size="lg"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                {t.newGame}
              </Button>
              
              <Button
                onClick={() => setShowHowToPlay(true)}
                variant="outline"
                className="border-border hover:bg-card text-lg px-8 py-4 rounded-full"
                size="lg"
              >
                <HelpCircle className="w-5 h-5 mr-2" />
                {t.howToPlay}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* How it Works Section - Moved here */}
      <div className="px-4 pb-16">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8 text-foreground">
            {t.howItWorksTitle}
          </h2>
          
          <AutoScrollCards language={language} />
        </div>
      </div>

      {/* Existing Goals Section */}
      {goals.length > 0 && (
        <div className="px-4 pb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-foreground">
              {language === 'ru' ? 'Ваши цели' : 'Your Goals'}
            </h2>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {goals.map((goal: any) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    className="netflix-card p-4 cursor-pointer hover:bg-card/80 transition-colors"
                    onClick={() => handleGoalSelect(goal.id)}
                  >
                    {goal.imageUrl && (
                      <div
                        className="h-32 bg-cover bg-center rounded-lg mb-3"
                        style={{ backgroundImage: `url(${goal.imageUrl})` }}
                      />
                    )}
                    <h3 className="font-semibold text-foreground mb-2">
                      {goal.title}
                    </h3>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{new Date(goal.createdAt).toLocaleDateString()}</span>
                      <Button size="sm" variant="ghost">
                        <Play className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <HowToPlayStories
        isOpen={showHowToPlay}
        onClose={() => setShowHowToPlay(false)}
        language={language}
      />

      <GoalCreation
        isOpen={showGoalCreation}
        onClose={() => setShowGoalCreation(false)}
        onGoalCreated={handleGoalCreated}
        language={language}
      />

      {showGenreQuiz && (
        <GenreQuiz
          onGenreSelect={handleGenreSelect}
          language={language}
        />
      )}
    </div>
  );
}
