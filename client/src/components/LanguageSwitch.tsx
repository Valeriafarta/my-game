import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import type { Language } from "@/lib/i18n";

interface LanguageSwitchProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

export function LanguageSwitch({ currentLanguage, onLanguageChange }: LanguageSwitchProps) {
  return (
    <div className="fixed top-4 right-4 z-50">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onLanguageChange(currentLanguage === 'ru' ? 'en' : 'ru')}
        className="bg-card/80 backdrop-blur-sm border-border/50 hover:bg-card"
      >
        <Globe className="w-4 h-4 mr-2" />
        {currentLanguage === 'ru' ? 'EN' : 'RU'}
      </Button>
    </div>
  );
}