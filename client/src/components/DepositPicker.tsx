import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import { useTranslation, type Language } from "@/lib/i18n";

interface DepositPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onDeposit: (amount: number) => void;
  availableAmounts: number[];
  currency: string;
  language: Language;
}

export function DepositPicker({ 
  isOpen, 
  onClose, 
  onDeposit, 
  availableAmounts, 
  currency, 
  language 
}: DepositPickerProps) {
  const [selectedAmount, setSelectedAmount] = useState(0);
  
  // Update selected amount when availableAmounts changes
  useEffect(() => {
    if (availableAmounts.length > 0 && !availableAmounts.includes(selectedAmount)) {
      setSelectedAmount(availableAmounts[0]);
    }
  }, [availableAmounts, selectedAmount]);
  const t = useTranslation(language);

  const getCurrencySymbol = () => {
    switch (currency) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'RUB': return '₽';
      default: return '₽';
    }
  };

  const handleDeposit = () => {
    onDeposit(selectedAmount);
    onClose();
  };

  const handleAmountChange = (direction: 'up' | 'down') => {
    const currentIndex = availableAmounts.indexOf(selectedAmount);
    if (direction === 'up' && currentIndex < availableAmounts.length - 1) {
      setSelectedAmount(availableAmounts[currentIndex + 1]);
    } else if (direction === 'down' && currentIndex > 0) {
      setSelectedAmount(availableAmounts[currentIndex - 1]);
    }
  };

  // Touch handling for mobile scroll
  const handleTouchStart = (e: React.TouchEvent) => {
    const startY = e.touches[0].clientY;
    
    const handleTouchMove = (moveEvent: TouchEvent) => {
      const currentY = moveEvent.touches[0].clientY;
      const diff = startY - currentY;
      
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          handleAmountChange('up');
        } else {
          handleAmountChange('down');
        }
        document.removeEventListener('touchmove', handleTouchMove);
      }
    };

    document.addEventListener('touchmove', handleTouchMove);
    
    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
    
    document.addEventListener('touchend', handleTouchEnd);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="netflix-card p-6 w-80">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">
              {t.selectDepositAmount}
            </h3>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div 
            className="text-center py-8"
            onTouchStart={handleTouchStart}
          >
            <div className="relative">
              {/* Up arrow */}
              <button
                onClick={() => handleAmountChange('up')}
                className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-muted-foreground hover:text-foreground"
                disabled={availableAmounts.indexOf(selectedAmount) === availableAmounts.length - 1}
              >
                ▲
              </button>

              {/* Amount display */}
              <div className="text-4xl font-bold text-primary mb-4">
                {selectedAmount === 0 ? '0' : `${getCurrencySymbol()}${selectedAmount}`}
              </div>

              {/* Down arrow */}
              <button
                onClick={() => handleAmountChange('down')}
                className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-muted-foreground hover:text-foreground"
                disabled={availableAmounts.indexOf(selectedAmount) === 0}
              >
                ▼
              </button>
            </div>

            <p className="text-sm text-muted-foreground mt-8">
              Проведите пальцем вверх/вниз для изменения суммы
            </p>
          </div>

          <Button
            onClick={handleDeposit}
            className="w-full netflix-gradient hover:opacity-90"
          >
            {t.deposit}
          </Button>
        </Card>
      </motion.div>
    </motion.div>
  );
}