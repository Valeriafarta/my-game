import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Share2, Download, Camera, Calendar, Plus } from "lucide-react";
import { useTranslation, type Language } from "@/lib/i18n";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DepositPicker } from "@/components/DepositPicker";
import { NetflixEpisodeCard } from "@/components/NetflixEpisodeCard";
import { EnhancedDepositTable } from "@/components/EnhancedDepositTable";
import { WeekCompletionCelebration } from "@/components/WeekCompletionCelebration";
import { FinalCredits } from "@/components/FinalCredits";
import type { Goal, WeeklyProgress } from "@shared/schema";

interface ProgressTrackerProps {
  goalId: number;
  onBack: () => void;
  language: Language;
}

export function ProgressTracker({ goalId, onBack, language }: ProgressTrackerProps) {
  const [showDepositPicker, setShowDepositPicker] = useState(false);
  const [celebrationWeek, setCelebrationWeek] = useState<{ weekNumber: number; amount: number } | null>(null);
  const [showFinalCredits, setShowFinalCredits] = useState(false);
  const celebrationInProgress = useRef<Set<number>>(new Set());
  const t = useTranslation(language);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: goal, isLoading: goalLoading } = useQuery({
    queryKey: ["/api/goals", goalId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/goals/${goalId}`);
      return response.json();
    },
  });

  const { data: progress = [], isLoading: progressLoading } = useQuery({
    queryKey: ["/api/goals", goalId, "progress"],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/goals/${goalId}/progress`);
      return response.json();
    },
  });

  const updateProgressMutation = useMutation({
    mutationFn: async ({ weekNumber, isCompleted }: { weekNumber: number; isCompleted: boolean }) => {
      const response = await apiRequest("PATCH", `/api/goals/${goalId}/progress/${weekNumber}`, { isCompleted });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals", goalId, "progress"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update progress. Please try again.",
        variant: "destructive",
      });
    }
  });

  const toggleWeek = (weekNumber: number) => {
    const weekProgress = progress.find((p: WeeklyProgress) => p.weekNumber === weekNumber);
    
    if (weekProgress && !weekProgress.isCompleted) {
      console.log('Completing week:', weekNumber, 'amount:', weekProgress.amount);
      
      // Prevent multiple celebrations using ref
      if (celebrationInProgress.current.has(weekNumber)) {
        console.log('Celebration already in progress for week', weekNumber, 'ignoring');
        return;
      }
      
      // Mark this week as celebrating
      celebrationInProgress.current.add(weekNumber);
      
      // Show celebration animation
      setCelebrationWeek({
        weekNumber,
        amount: weekProgress.amount
      });
      
      updateProgressMutation.mutate({
        weekNumber,
        isCompleted: true
      });

      // Check if all weeks are completed for final credits
      const completedCount = progress.filter((p: WeeklyProgress) => p.isCompleted).length;
      if (completedCount === 51) { // This will be the 52nd completion
        setTimeout(() => {
          setShowFinalCredits(true);
        }, 3000);
      }
    } else if (weekProgress && weekProgress.isCompleted) {
      // Allow unchecking
      updateProgressMutation.mutate({
        weekNumber,
        isCompleted: false
      });
    }
  };

  const getCurrencySymbol = () => {
    switch (goal?.currency) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'RUB': return '₽';
      default: return '₽';
    }
  };

  const calculateStats = () => {
    const completedWeeks = progress.filter((p: WeeklyProgress) => p.isCompleted);
    const totalSaved = completedWeeks.reduce((sum: number, p: WeeklyProgress) => sum + p.amount, 0);
    const totalPossible = goal?.targetAmount || 1378;
    const progressPercentage = (completedWeeks.length / 52) * 100;
    const nextWeek = Math.min(completedWeeks.length + 1, 52);
    const nextAmount = nextWeek <= 52 ? progress.find((p: WeeklyProgress) => p.weekNumber === nextWeek)?.amount : null;
    
    return {
      completedCount: completedWeeks.length,
      totalSaved,
      remaining: totalPossible - totalSaved,
      progressPercentage,
      nextWeek,
      nextAmount
    };
  };

  const getAvailableAmounts = () => {
    const uncompletedWeeks = progress.filter((p: WeeklyProgress) => !p.isCompleted);
    return uncompletedWeeks.map((p: WeeklyProgress) => p.amount);
  };

  const handleDeposit = (amount: number) => {
    const weekToComplete = progress.find((p: WeeklyProgress) => p.amount === amount && !p.isCompleted);
    if (weekToComplete) {
      // Use existing toggleWeek logic to avoid duplication
      toggleWeek(weekToComplete.weekNumber);
    }
  };



  const shareProgress = async () => {
    const stats = calculateStats();
    
    try {
      const html2canvas = (await import("html2canvas")).default;
      
      // Create high-quality canvas in 9:16 Instagram Stories format
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d');
      
      // Enable high-quality rendering
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
      }
      
      if (!ctx) {
        throw new Error("Canvas context not available");
      }
      
      // Apply the exact gradient from the page: bg-gradient-to-br from-red-900 via-red-800 to-gray-900
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#7f1d1d'); // from-red-900
      gradient.addColorStop(0.5, '#991b1b'); // via-red-800  
      gradient.addColorStop(1, '#111827'); // to-gray-900
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Load and draw goal image as background if available
      if (goal?.imageUrl) {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = goal.imageUrl;
          });
          
          // Draw background image with proper scaling and low opacity
          const imgAspect = img.width / img.height;
          const canvasAspect = canvas.width / canvas.height;
          
          let drawWidth, drawHeight, drawX, drawY;
          
          if (imgAspect > canvasAspect) {
            drawHeight = canvas.height;
            drawWidth = drawHeight * imgAspect;
            drawX = (canvas.width - drawWidth) / 2;
            drawY = 0;
          } else {
            drawWidth = canvas.width;
            drawHeight = drawWidth / imgAspect;
            drawX = 0;
            drawY = (canvas.height - drawHeight) / 2;
          }
          
          ctx.globalAlpha = 0.3; // Make background image more visible
          ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
          ctx.globalAlpha = 1.0;
          
          // Add subtle dark overlay to maintain readability
          const darkOverlay = ctx.createLinearGradient(0, 0, 0, canvas.height);
          darkOverlay.addColorStop(0, 'rgba(20, 20, 20, 0.5)');
          darkOverlay.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
          ctx.fillStyle = darkOverlay;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
        } catch (error) {
          console.error('Failed to load goal image:', error);
        }
      }
      
      // Header with Netflix-style typography
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 4;
      
      // Large "52" number - Netflix style
      ctx.font = 'bold 140px -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif';
      ctx.fillText('52', canvas.width / 2, 200);
      
      // "НЕДЕЛИ БОГАТСТВА" subtitle with Netflix typography
      ctx.font = 'bold 52px -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif';
      ctx.fillText('НЕДЕЛИ БОГАТСТВА', canvas.width / 2, 280);
      
      // Netflix red underline for the title
      const titleWidth = ctx.measureText('НЕДЕЛИ БОГАТСТВА').width;
      const underlineWidth = titleWidth * 0.5;
      const underlineX = (canvas.width - underlineWidth) / 2;
      const underlineY = 295;
      
      ctx.fillStyle = '#E50914'; // Netflix red
      ctx.fillRect(underlineX, underlineY, underlineWidth, 8);
      
      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      
      // Circular progress bar positioned higher on screen
      const centerX = canvas.width / 2;
      const circleRadius = 140;
      const circleX = centerX;
      const circleY = 580;
      const lineWidth = 24;
      
      // Background circle with Netflix gray
      ctx.beginPath();
      ctx.arc(circleX, circleY, circleRadius, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(51, 51, 51, 0.4)';
      ctx.lineWidth = lineWidth;
      ctx.stroke();
      
      // Progress arc with rose-sand color
      const progressAngle = (stats.progressPercentage / 100) * 2 * Math.PI;
      ctx.beginPath();
      ctx.arc(circleX, circleY, circleRadius, -Math.PI / 2, -Math.PI / 2 + progressAngle);
      ctx.strokeStyle = '#D4B5A0'; // Rose-sand color
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.stroke();
      
      // Percentage text inside circle
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 60px -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 2;
      ctx.fillText(`${Math.round(stats.progressPercentage)}%`, circleX, circleY + 20);
      
      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      
      // Semi-transparent dark card positioned in center below progress
      const cardY = 800;
      const cardWidth = 900;
      const cardHeight = 400;
      const cardX = (canvas.width - cardWidth) / 2;
      
      // Very transparent card
      ctx.fillStyle = 'rgba(31, 31, 31, 0.15)';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 10;
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardWidth, cardHeight, 24);
      ctx.fill();
      
      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      
      // Goal title in card
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.font = 'bold 48px -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 2;
      ctx.fillText(goal?.title?.toLowerCase() || 'моя цель', centerX, cardY + 80);
      
      // Two stats positioned below title
      const leftStatX = centerX - 220;
      const rightStatX = centerX + 220;
      const statsY = cardY + 200;
      
      // Left stat - weeks completed
      ctx.fillStyle = '#10B981'; // Emerald green
      ctx.font = 'bold 64px -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif';
      ctx.fillText(`${stats.completedCount}`, leftStatX, statsY);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif';
      ctx.fillText('НЕДЕЛЬ ЗАВЕРШЕНО', leftStatX, statsY + 40);
      
      // Right stat - amount saved
      ctx.fillStyle = '#F59E0B'; // Amber
      ctx.font = 'bold 64px -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif';
      ctx.fillText(`₽${stats.totalSaved}`, rightStatX, statsY);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif';
      ctx.fillText('НАКОПЛЕНО', rightStatX, statsY + 40);
      
      // Remove the progress text from card
      
      // Bottom text - Netflix style positioning
      const bottomTextY = canvas.height - 300;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'; // Darker and more transparent
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 3;
      
      // Main bottom message with Netflix typography
      ctx.font = 'bold 40px -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif';
      ctx.fillText('Дисциплина ведет к богатству', centerX, bottomTextY);
      
      // More transparent signature
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '32px -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif';
      ctx.fillText('@valeriafarta', centerX, bottomTextY + 70);
      
      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      
      // Download the image
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.download = `wealth-journey-${goal?.title || 'progress'}.png`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
      
      toast({
        title: language === 'ru' ? "Изображение сохранено!" : "Image saved!",
        description: language === 'ru' ? "Стильное изображение для Instagram готово" : "Stylish Instagram image ready",
      });
      
    } catch (error) {
      console.error('Share error:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать изображение для шеринга.",
        variant: "destructive",
      });
    }
  };

  const saveTableAsImage = async () => {
    try {
      const html2canvas = (await import("html2canvas")).default;
      
      // Create a custom canvas with background image
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = 794 * 2; // Scale factor
      finalCanvas.height = 1123 * 2;
      const ctx = finalCanvas.getContext('2d');
      
      if (!ctx) {
        throw new Error("Canvas context not available");
      }
      
      // Fill with white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
      
      // Draw background image if available
      if (goal?.imageUrl) {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          
          await new Promise((resolve, reject) => {
            img.onload = () => {
              console.log('Image loaded:', img.width, 'x', img.height);
              
              // Calculate how to fit image without stretching (like object-fit: contain)
              const canvasRatio = finalCanvas.width / finalCanvas.height;
              const imgRatio = img.width / img.height;
              
              let drawWidth, drawHeight, drawX, drawY;
              
              // Simple contain logic - always fit without stretching
              if (imgRatio > canvasRatio) {
                // Image is wider - fit to canvas width
                drawWidth = finalCanvas.width * 0.9;
                drawHeight = drawWidth / imgRatio;
                drawX = (finalCanvas.width - drawWidth) / 2;
                drawY = (finalCanvas.height - drawHeight) / 2;
              } else {
                // Image is taller - fit to canvas height  
                drawHeight = finalCanvas.height * 0.9;
                drawWidth = drawHeight * imgRatio;
                drawX = (finalCanvas.width - drawWidth) / 2;
                drawY = (finalCanvas.height - drawHeight) / 2;
              }
              
              console.log('Drawing image:', drawX, drawY, drawWidth, drawHeight);
              
              // Draw background image with opacity
              ctx.globalAlpha = 0.3;
              ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
              ctx.globalAlpha = 1.0;
              
              resolve(null);
            };
            
            img.onerror = (error) => {
              console.error('Image failed to load:', error);
              resolve(null); // Continue without image
            };
            
            img.src = goal.imageUrl;
          });
        } catch (error) {
          console.error('Error loading background image:', error);
        }
      }
      
      // Add semi-transparent white overlay
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
      
      // Draw content directly on canvas for better text rendering
      const scale = 2;
      
      // Draw main title
      ctx.fillStyle = '#dc2626';
      ctx.font = `bold ${48 * scale}px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('52 НЕДЕЛИ БОГАТСТВА', finalCanvas.width / 2, 80 * scale);
      
      // Draw subtitle
      ctx.fillStyle = '#000000';
      ctx.font = `bold ${28 * scale}px Arial, sans-serif`;
      ctx.fillText('Таблица накоплений', finalCanvas.width / 2, 120 * scale);
      
      // Draw dates with actual goal dates
      const startDate = goal?.createdAt ? new Date(goal.createdAt) : new Date();
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + (52 * 7)); // Add 52 weeks
      
      const formatDate = (date: Date) => {
        return date.toLocaleDateString('ru-RU', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        });
      };
      
      ctx.textAlign = 'left';
      ctx.fillStyle = '#666666';
      ctx.font = `${18 * scale}px Arial, sans-serif`;
      ctx.fillText(`Дата начала: ${formatDate(startDate)}`, 100 * scale, 160 * scale);
      
      ctx.textAlign = 'right';
      ctx.fillText(`Дата окончания: ${formatDate(endDate)}`, finalCanvas.width - 100 * scale, 160 * scale);
      
      // Draw legend centered with proper spacing
      const legendY = 190 * scale;
      const legendHeight = 20 * scale;
      const legendSquareSize = 16 * scale;
      const legendSpacing = 120 * scale; // Medium spacing
      const legendCenterX = finalCanvas.width / 2;
      
      // Empty legend
      const emptyLegendX = legendCenterX - legendSpacing;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(emptyLegendX - legendSquareSize/2, legendY, legendSquareSize, legendSquareSize);
      ctx.strokeStyle = '#999999';
      ctx.lineWidth = 2 * scale;
      ctx.strokeRect(emptyLegendX - legendSquareSize/2, legendY, legendSquareSize, legendSquareSize);
      
      ctx.fillStyle = '#666666';
      ctx.font = `${18 * scale}px Arial, sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText('Пополнить', emptyLegendX + legendSquareSize, legendY + 14 * scale);
      
      // Completed legend - proper distance from first legend
      const filledLegendX = legendCenterX + 40 * scale;
      const gradient = ctx.createLinearGradient(filledLegendX, legendY, filledLegendX + legendSquareSize, legendY + legendSquareSize);
      gradient.addColorStop(0, '#fca5a5');
      gradient.addColorStop(1, '#fcd34d');
      ctx.fillStyle = gradient;
      ctx.fillRect(filledLegendX, legendY, legendSquareSize, legendSquareSize);
      
      ctx.fillStyle = '#dc2626';
      ctx.fillText('Накоплено', filledLegendX + legendSquareSize + 10 * scale, legendY + 14 * scale);
      
      // Draw grid
      const gridStartX = 147 * scale;
      const gridStartY = 260 * scale;
      const cellWidth = 125 * scale;
      const cellHeight = 50 * scale;
      
      progress.forEach((weekProgress: WeeklyProgress, index: number) => {
        const col = index % 4;
        const row = Math.floor(index / 4);
        const x = gridStartX + col * cellWidth;
        const y = gridStartY + row * cellHeight;
        
        // Draw cell background
        if (weekProgress.isCompleted) {
          ctx.fillStyle = '#fcd34d';
        } else {
          ctx.fillStyle = '#ffffff';
        }
        ctx.fillRect(x, y, cellWidth - 5 * scale, cellHeight - 5 * scale);
        
        // Draw cell border
        ctx.strokeStyle = '#cccccc';
        ctx.lineWidth = 2 * scale;
        ctx.strokeRect(x, y, cellWidth - 5 * scale, cellHeight - 5 * scale);
        
        // Draw amount text
        ctx.fillStyle = weekProgress.isCompleted ? '#000000' : '#333333';
        ctx.font = `bold ${15 * scale}px Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(
          weekProgress.amount.toString(),
          x + (cellWidth - 5 * scale) / 2,
          y + (cellHeight - 5 * scale) / 2 + 6 * scale
        );
      });
      
      // Draw bottom motto
      ctx.fillStyle = '#dc2626';
      ctx.font = `bold ${32 * scale}px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('Отмечай пополнения и отслеживай прогресс!', finalCanvas.width / 2, finalCanvas.height - 60 * scale);
      
      // Download the final image
      const link = document.createElement("a");
      link.download = `52-weeks-table-${goal?.title || 'progress'}.png`;
      link.href = finalCanvas.toDataURL('image/png', 1.0);
      link.click();
      
      toast({
        title: language === 'ru' ? "Таблица сохранена!" : "Table saved!",
        description: language === 'ru' ? "Таблица с фоновым изображением сохранена" : "Table with background image saved",
      });
    } catch (error) {
      console.error("Error saving table:", error);
      toast({
        title: language === 'ru' ? "Ошибка" : "Error",
        description: language === 'ru' ? `Не удалось сохранить таблицу: ${error}` : `Failed to save table: ${error}`,
        variant: "destructive",
      });
    }
  };

  const addToCalendar = () => {
    if (!goal) return;

    const reminderDay = goal.reminderDay || 'monday';
    const dayNumbers = {
      'monday': 1,
      'tuesday': 2,
      'wednesday': 3,
      'thursday': 4,
      'friday': 5,
      'saturday': 6,
      'sunday': 0
    };

    // Create calendar event data
    const eventTitle = language === 'ru' 
      ? `52 недели богатства - ${goal.title}` 
      : `52 Week Wealth Challenge - ${goal.title}`;
    
    const eventDescription = language === 'ru'
      ? `Время пополнить накопления! Цель: ${goal.targetAmount} ${goal.currency}`
      : `Time to make a deposit! Goal: ${goal.targetAmount} ${goal.currency}`;

    // Calculate next occurrence of the selected day
    const today = new Date();
    const targetDay = dayNumbers[reminderDay as keyof typeof dayNumbers];
    let nextDate = new Date(today);
    
    // Find next occurrence of the selected weekday
    const daysUntilTarget = (targetDay - today.getDay() + 7) % 7;
    nextDate.setDate(today.getDate() + (daysUntilTarget === 0 ? 7 : daysUntilTarget));
    nextDate.setHours(10, 0, 0, 0); // Set to 10:00 AM

    // Create ICS format for calendar
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const endDate = new Date(nextDate);
    endDate.setHours(11, 0, 0, 0); // 1 hour duration

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//52 Week Wealth Challenge//EN',
      'BEGIN:VEVENT',
      `DTSTART:${formatDate(nextDate)}`,
      `DTEND:${formatDate(endDate)}`,
      `SUMMARY:${eventTitle}`,
      `DESCRIPTION:${eventDescription}`,
      'RRULE:FREQ=WEEKLY;COUNT=52',
      'BEGIN:VALARM',
      'TRIGGER:-PT1H',
      'DESCRIPTION:Reminder',
      'ACTION:DISPLAY',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    // Create downloadable ICS file
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `52-weeks-reminder-${goal.title.replace(/\s+/g, '-')}.ics`;
    link.click();

    toast({
      title: language === 'ru' ? "Напоминания добавлены!" : "Reminders added!",
      description: language === 'ru' 
        ? "Календарный файл загружен. Откройте его для добавления в календарь" 
        : "Calendar file downloaded. Open it to add to your calendar",
    });
  };

  const saveAsImage = async () => {
    try {
      const html2canvas = (await import("html2canvas")).default;
      const element = document.getElementById("progress-capture");
      if (element) {
        const canvas = await html2canvas(element, {
          backgroundColor: "#141414",
          scale: 2,
        });
        
        const link = document.createElement("a");
        link.download = `${goal?.title || 'wealth-challenge'}-progress.png`;
        link.href = canvas.toDataURL();
        link.click();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save image. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (goalLoading || progressLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t.loading}</p>
        </div>
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-gray-900">
      {/* Netflix color accents */}
      <div className="fixed inset-0 z-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-red-900/20"></div>
      </div>
      
      {/* Hero Header with Image */}
      {goal?.imageUrl && (
        <div className="relative z-20 h-64 bg-cover bg-center overflow-hidden" 
             style={{ backgroundImage: `url(${goal.imageUrl})` }}>
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/90" />
          <div className="absolute top-4 left-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </div>
          <div className="absolute bottom-6 left-4 right-4 text-white">
            <h1 className="text-3xl font-bold mb-2">{goal?.title}</h1>
            <p className="text-lg opacity-90">
              {language === 'ru' 
                ? `Цель: ${getCurrencySymbol()}${goal.targetAmount}` 
                : `Goal: ${getCurrencySymbol()}${goal.targetAmount}`
              }
            </p>
            <div className="text-sm opacity-75 mt-1">
              {stats.completedCount}/52 недели • {getCurrencySymbol()}{stats.totalSaved} накоплено
            </div>
          </div>
        </div>
      )}
      
      {/* Fixed Header (fallback if no image) */}
      {!goal?.imageUrl && (
        <div className="fixed top-0 left-0 right-0 z-40 h-20 bg-black/90 backdrop-blur-sm border-b border-gray-800">
          <div className="flex items-center justify-between p-4 h-full">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div className="text-center text-white">
              <h1 className="text-lg font-bold">{goal?.title}</h1>
              <div className="text-sm opacity-75">
                {stats.completedCount}/52 • {getCurrencySymbol()}{stats.totalSaved}
              </div>
            </div>
            
            <div className="w-10" />
          </div>
        </div>
      )}

      {/* Scrollable content */}
      <div className={`${goal?.imageUrl ? 'pt-0' : 'pt-20'} relative z-10`}>
        {/* Progress Stats */}
      <div className="px-4 mt-4 relative z-10">
        <Card className="netflix-card p-6 mb-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gradient-to-br from-rose-300 to-amber-200 rounded-xl p-4 text-gray-800">
              <div className="text-center">
                <div className="text-2xl font-bold">{getCurrencySymbol()}{stats.totalSaved}</div>
                <div className="text-sm text-rose-700">{language === 'ru' ? 'Накоплено' : 'Saved'}</div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-rose-300 to-amber-200 rounded-xl p-4 text-gray-800">
              <div className="text-center">
                <div className="text-2xl font-bold">{getCurrencySymbol()}{stats.remaining}</div>
                <div className="text-sm text-rose-700">{language === 'ru' ? 'Осталось' : 'Remaining'}</div>
              </div>
            </div>
          </div>
          
          <Progress value={stats.progressPercentage} className="mb-2" />
          <div className="text-center text-sm text-muted-foreground">
            {stats.progressPercentage.toFixed(1)}% {t.completed}
          </div>

          {stats.nextWeek <= 52 && (
            <div className="mt-4 p-3 bg-primary/10 rounded-lg text-center">
              <div className="text-sm text-primary">
                {t.nextWeekTip} {getCurrencySymbol()}{stats.nextAmount}
              </div>
            </div>
          )}
        </Card>
      </div>

        {/* Week Grid - Hidden for now, replaced with compact table */}
        

        {/* Enhanced Deposit Table */}
        <EnhancedDepositTable
          progress={progress}
          currency={goal?.currency || 'RUB'}
          language={language}
          goalImageUrl={goal?.imageUrl}
          goalTitle={goal?.title}
        />

        {/* Action Buttons */}
        <Card className="netflix-card p-4 mx-4 mb-6">
          <div className="space-y-3">
            <Button
              onClick={() => setShowDepositPicker(true)}
              className="w-full netflix-gradient hover:opacity-90"
              disabled={getAvailableAmounts().length === 0}
            >
              <Plus className="w-4 h-4 mr-2" />
              {t.deposit}
            </Button>
            
            <Button
              onClick={addToCalendar}
              variant="outline"
              className="w-full border-border hover:bg-card"
            >
              <Calendar className="w-4 h-4 mr-2" />
              {t.addToCalendar}
            </Button>
            
            <Button
              onClick={saveTableAsImage}
              variant="outline"
              className="w-full border-border hover:bg-card"
            >
              <Download className="w-4 h-4 mr-2" />
              {t.saveTable}
            </Button>
          </div>
        </Card>

        {/* Share Progress Button */}
        <div className="px-4 pb-6">
          <Button
            onClick={shareProgress}
            className="w-full netflix-gradient hover:opacity-90"
          >
            <Share2 className="w-4 h-4 mr-2" />
            {t.shareProgress}
          </Button>
        </div>

        {/* Hidden sharing image with Netflix style */}
        <div 
          id="share-image" 
          className="fixed -top-[9999px] left-0 w-[600px] h-[800px] overflow-hidden"
          style={{
            background: goal?.imageUrl 
              ? `linear-gradient(135deg, rgba(20,20,20,0.9) 0%, rgba(229,9,20,0.8) 50%, rgba(20,20,20,0.9) 100%), url(${goal.imageUrl})`
              : 'linear-gradient(135deg, #141414 0%, #E50914 30%, #B20710 70%, #141414 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="relative h-full p-8 flex flex-col justify-between text-white">
            {/* Netflix-style top section */}
            <div className="text-center">
              <div className="text-6xl font-black mb-4" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>
                52
              </div>
              <div className="text-2xl font-bold mb-2">
                {language === 'ru' ? 'НЕДЕЛИ БОГАТСТВА' : 'WEEKS OF WEALTH'}
              </div>
              <div className="w-20 h-1 bg-red-600 mx-auto mb-6"></div>
            </div>

            {/* Progress stats */}
            <div className="bg-black/40 backdrop-blur-sm rounded-lg p-6 space-y-4">
              <div className="text-center mb-4">
                <h2 className="text-3xl font-bold">{goal?.title}</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-6 text-center">
                <div className="space-y-2">
                  <div className="text-4xl font-black text-green-400">{stats.completedCount}</div>
                  <div className="text-sm uppercase tracking-wide">
                    {language === 'ru' ? 'Недель завершено' : 'Weeks completed'}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl font-black text-yellow-400">{getCurrencySymbol()}{stats.totalSaved}</div>
                  <div className="text-sm uppercase tracking-wide">
                    {language === 'ru' ? 'Накоплено' : 'Saved'}
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <div className="text-lg font-semibold mb-2">
                  {Math.round(stats.progressPercentage)}% {language === 'ru' ? 'завершено' : 'complete'}
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-red-600 to-red-400 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${stats.progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Bottom branding */}
            <div className="text-center">
              <div className="text-sm opacity-75 mb-2">
                {language === 'ru' ? 'Дисциплина ведет к богатству' : 'Discipline leads to wealth'}
              </div>
              <div className="text-xs opacity-50">
                @valeriafarta
              </div>
            </div>
          </div>
        </div>

        {/* Hidden table export element - A4 format */}
        <div 
          id="table-for-export" 
          className="fixed -top-[9999px] left-0 w-[794px] h-[1123px] p-12 bg-white text-black"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-red-600 mb-4">
              52 НЕДЕЛИ БОГАТСТВА
            </h1>
            <h2 className="text-2xl font-bold mb-6">{goal?.title}</h2>
            
            {/* Dates */}
            <div className="flex justify-between text-lg mb-8">
              <div>
                <span className="font-semibold">Дата начала: </span>
                <span>{new Date().toLocaleDateString('ru-RU')}</span>
              </div>
              <div>
                <span className="font-semibold">Дата окончания: </span>
                <span>{new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('ru-RU')}</span>
              </div>
            </div>
          </div>

          {/* Table with margin for decorative elements */}
          <div className="relative mx-auto" style={{ width: '500px', padding: '60px 0' }}>
            {/* Netflix decorative emojis around the table - not overlapping */}
            {/* Left margin */}
            <div className="absolute left-2 top-16 text-4xl opacity-15 text-red-600">🎬</div>
            <div className="absolute left-8 top-40 text-3xl opacity-12 text-red-500">🍿</div>
            <div className="absolute left-4 top-64 text-4xl opacity-15 text-red-600">🎭</div>
            <div className="absolute left-0 top-88 text-3xl opacity-12 text-red-500">📺</div>
            <div className="absolute left-6 top-112 text-4xl opacity-15 text-red-600">🎪</div>
            <div className="absolute left-2 top-136 text-3xl opacity-12 text-red-500">🎨</div>
            <div className="absolute left-8 top-160 text-5xl opacity-15 text-red-600">💰</div>
            <div className="absolute left-4 top-184 text-3xl opacity-12 text-red-500">💎</div>
            <div className="absolute left-0 top-208 text-4xl opacity-15 text-red-600">🏆</div>
            <div className="absolute left-6 top-232 text-3xl opacity-12 text-red-500">⭐</div>
            <div className="absolute left-2 top-256 text-4xl opacity-15 text-red-600">🎯</div>
            <div className="absolute left-8 top-280 text-3xl opacity-12 text-red-500">🌟</div>
            
            {/* Right margin */}
            <div className="absolute right-2 top-20 text-4xl opacity-15 text-red-600">💵</div>
            <div className="absolute right-8 top-44 text-3xl opacity-12 text-red-500">🎉</div>
            <div className="absolute right-4 top-68 text-4xl opacity-15 text-red-600">🔥</div>
            <div className="absolute right-0 top-92 text-3xl opacity-12 text-red-500">✨</div>
            <div className="absolute right-6 top-116 text-5xl opacity-15 text-red-600">💸</div>
            <div className="absolute right-2 top-140 text-3xl opacity-12 text-red-500">🚀</div>
            <div className="absolute right-8 top-164 text-4xl opacity-15 text-red-600">🎊</div>
            <div className="absolute right-4 top-188 text-3xl opacity-12 text-red-500">🔮</div>
            <div className="absolute right-0 top-212 text-4xl opacity-15 text-red-600">🎪</div>
            <div className="absolute right-6 top-236 text-3xl opacity-12 text-red-500">📺</div>
            <div className="absolute right-2 top-260 text-4xl opacity-15 text-red-600">🎨</div>
            <div className="absolute right-8 top-284 text-3xl opacity-12 text-red-500">💰</div>
            
            {/* Top margin */}
            <div className="absolute left-16 top-4 text-4xl opacity-12 text-red-600">💲</div>
            <div className="absolute left-32 top-8 text-3xl opacity-15 text-red-500">🎬</div>
            <div className="absolute left-48 top-4 text-4xl opacity-12 text-red-600">🎭</div>
            <div className="absolute right-48 top-8 text-3xl opacity-15 text-red-500">🍿</div>
            <div className="absolute right-32 top-4 text-4xl opacity-12 text-red-600">📺</div>
            <div className="absolute right-16 top-8 text-3xl opacity-15 text-red-500">🎪</div>
            
            {/* Bottom margin */}
            <div className="absolute left-20 bottom-8 text-4xl opacity-12 text-red-600">🎨</div>
            <div className="absolute left-36 bottom-4 text-3xl opacity-15 text-red-500">🏆</div>
            <div className="absolute left-52 bottom-8 text-4xl opacity-12 text-red-600">⭐</div>
            <div className="absolute right-52 bottom-4 text-3xl opacity-15 text-red-500">🎯</div>
            <div className="absolute right-36 bottom-8 text-4xl opacity-12 text-red-600">🌟</div>
            <div className="absolute right-20 bottom-4 text-3xl opacity-15 text-red-500">💵</div>
            
            {/* Compact table in center */}
            <div className="mx-auto" style={{ width: '400px' }}>
              <div className="space-y-3">
                {Array.from({ length: 13 }, (_, rowIndex) => (
                  <div key={rowIndex} className="grid grid-cols-4 gap-3">
                    {Array.from({ length: 4 }, (_, colIndex) => {
                      const weekNumber = rowIndex * 4 + colIndex + 1;
                      if (weekNumber > 52) return <div key={colIndex} className="w-24 h-14" />;
                      
                      const weekProgress = progress.find((p: WeeklyProgress) => p.weekNumber === weekNumber);
                      if (!weekProgress) return <div key={colIndex} className="w-24 h-14" />;
                      
                      return (
                        <div
                          key={colIndex}
                          className={`
                            w-24 h-14 border-2 flex items-center justify-center rounded-lg shadow-sm
                            ${weekProgress.isCompleted 
                              ? 'bg-gradient-to-br from-rose-300 to-amber-200 border-rose-400' 
                              : 'bg-gray-100 border-gray-400'
                            }
                          `}
                        >
                          <div className="text-sm font-bold">
                            {weekProgress.amount}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quote and signature */}
          <div className="text-center mt-auto">
            <div className="text-xl italic text-gray-700 mb-4">
              «Богатство начинается с уважения к 100 рублям»
            </div>
            <div className="text-lg font-semibold text-gray-600">
              @valeriafarta
            </div>
          </div>
        </div>
      </div>

      {/* Week Completion Celebration */}
      {celebrationWeek && (
        <WeekCompletionCelebration
          weekNumber={celebrationWeek.weekNumber}
          amount={celebrationWeek.amount}
          currency={goal?.currency || 'RUB'}
          isVisible={!!celebrationWeek}
          onComplete={() => {
            // Clear the celebration state and ref
            setCelebrationWeek(null);
            if (celebrationWeek) {
              celebrationInProgress.current.delete(celebrationWeek.weekNumber);
              console.log('Celebration completed for week', celebrationWeek.weekNumber);
            }
          }}
          language={language}
        />
      )}

      {/* Final Credits */}
      {showFinalCredits && goal && (
        <FinalCredits
          goal={goal}
          totalSaved={stats.totalSaved}
          language={language}
          onComplete={() => setShowFinalCredits(false)}
        />
      )}

      {/* Deposit Picker Modal */}
      <DepositPicker
        isOpen={showDepositPicker}
        onClose={() => setShowDepositPicker(false)}
        onDeposit={handleDeposit}
        availableAmounts={getAvailableAmounts()}
        currency={goal?.currency || 'RUB'}
        language={language}
      />
    </div>
  );
}