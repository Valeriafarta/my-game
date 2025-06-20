import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, ArrowLeft } from "lucide-react";
import { useTranslation, type Language } from "@/lib/i18n";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { InsertGoal } from "@shared/schema";

interface GoalCreationProps {
  isOpen: boolean;
  onClose: () => void;
  onGoalCreated: (goalId: number) => void;
  language: Language;
}

export function GoalCreation({ isOpen, onClose, onGoalCreated, language }: GoalCreationProps) {
  const [goalTitle, setGoalTitle] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currency, setCurrency] = useState("RUB");
  const [targetAmount, setTargetAmount] = useState<number | "">("");
  const [startingAmount, setStartingAmount] = useState(50);
  const [reminderDay, setReminderDay] = useState("monday");
  const t = useTranslation(language);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const currencies = [
    { value: "RUB", label: "RUB" },
    { value: "USD", label: "USD" },
    { value: "EUR", label: "EUR" }
  ];

  const startingAmounts = [50, 100, 150, 200];
  
  const weekDays = [
    { value: "monday", label: "Пн" },
    { value: "tuesday", label: "Вт" },
    { value: "wednesday", label: "Ср" },
    { value: "thursday", label: "Чт" },
    { value: "friday", label: "Пт" },
    { value: "saturday", label: "Сб" },
    { value: "sunday", label: "Вс" }
  ];

  const createGoalMutation = useMutation({
    mutationFn: async (data: InsertGoal) => {
      const response = await apiRequest("POST", "/api/goals", data);
      return response.json();
    },
    onSuccess: (goal) => {
      toast({
        title: t.goalCreated,
        description: t.goalCreatedDesc,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      onGoalCreated(goal.id);
      resetForm();
    },
    onError: () => {
      toast({
        title: t.error,
        description: t.failedCreateGoal,
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setGoalTitle("");
    setSelectedImage(null);
    setCurrency("RUB");
    setTargetAmount("");
    setStartingAmount(50);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;

    createGoalMutation.mutate({
      title: goalTitle.trim(),
      imageUrl: selectedImage,
      language: language,
      currency: currency,
      targetAmount: typeof targetAmount === 'number' ? targetAmount : 0,
      startingAmount: startingAmount,
      reminderDay: reminderDay,
      genre: 'drama' // Default genre, will be set by quiz
    });
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background overflow-y-auto flex items-start justify-center p-4 py-8"
    >
      <Card className="w-full max-w-md p-6 netflix-card my-auto">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-xl font-semibold">{t.visualizeGoal}</h2>
          <div className="w-10" /> {/* Spacer */}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-2">
            
            {selectedImage ? (
              <div className="relative">
                <img
                  src={selectedImage}
                  alt="Goal visualization"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground text-center px-4">
                  {t.addPhoto}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Goal Title */}
          <div className="space-y-2">
            <Label htmlFor="goalTitle">{t.visualizeGoal}</Label>
            <Input
              id="goalTitle"
              type="text"
              placeholder={t.goalNamePlaceholder}
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
              className="bg-input border-border"
              required
            />
          </div>

          {/* Currency Selection */}
          <div className="space-y-2">
            <Label>{t.selectCurrency}</Label>
            <Select value={currency} onValueChange={handleCurrencyChange}>
              <SelectTrigger className="bg-input border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((curr) => (
                  <SelectItem key={curr.value} value={curr.value}>
                    {curr.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Target Amount Selection */}
          <div className="space-y-2">
            <Label>{t.enterAmount}</Label>
            <input
              type="number"
              placeholder="0"
              value={targetAmount === "" ? "" : targetAmount}
              onChange={(e) => {
                const value = e.target.value === "" ? "" : parseInt(e.target.value) || 0;
                setTargetAmount(value);
              }}
              className="w-full h-12 px-4 text-lg font-semibold bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-center"
              min="1"
            />
            <p className="text-sm text-muted-foreground text-center">
              {language === 'ru' 
                ? 'Введите желаемую сумму накоплений' 
                : 'Enter your desired savings amount'
              }
            </p>
          </div>

          {/* Reminder Day Selection */}
          <div className="space-y-3">
            <Label>
              {t.reminderDay}
            </Label>
            <div className="flex flex-wrap gap-2 justify-center">
              {weekDays.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => setReminderDay(day.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    reminderDay === day.value
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/25'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground text-center">
              {language === 'ru' 
                ? 'Выберите день недели для напоминаний о пополнении' 
                : 'Choose the day of the week for deposit reminders'
              }
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full netflix-gradient hover:opacity-90 transition-opacity"
            disabled={!goalTitle.trim() || createGoalMutation.isPending}
          >
            {createGoalMutation.isPending ? t.loading : t.startChallenge}
          </Button>
        </form>
      </Card>
    </motion.div>
  );
}