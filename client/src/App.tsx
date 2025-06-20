import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { AuthLoader } from "@/components/AuthLoader";
import Home from "@/pages/home";
import Landing from "@/pages/landing";
import NotFound from "@/pages/not-found";
import { useState, useEffect } from "react";
import { type Language } from "@/lib/i18n";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [language, setLanguage] = useState<Language>('ru');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('wealth-app-language') as Language;
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  if (isLoading) {
    return <AuthLoader language={language} />;
  }

  return (
    <Switch>
      <Route path="/">
        {isAuthenticated ? <Home /> : <Landing />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
