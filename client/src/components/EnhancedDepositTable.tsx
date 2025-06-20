import { motion } from "framer-motion";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import type { WeeklyProgress } from "@shared/schema";
import type { Language } from "@/lib/i18n";

interface EnhancedDepositTableProps {
  progress: WeeklyProgress[];
  currency: string;
  language: Language;
  onCellClick?: (weekNumber: number) => void;
  goalImageUrl?: string;
  goalTitle?: string;
}

export function EnhancedDepositTable({ progress, currency, language, onCellClick, goalImageUrl, goalTitle }: EnhancedDepositTableProps) {
  const getCurrencySymbol = () => {
    switch (currency) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'RUB': return '₽';
      default: return '₽';
    }
  };

  // Get smart image styles for different orientations
  const getImageStyles = () => {
    return {
      position: 'absolute' as const,
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      objectFit: 'contain' as const,
      objectPosition: 'center' as const,
      opacity: 0.25,
      zIndex: 0
    };
  };

  // Group progress into rows of 4 (weeks 1-4, 5-8, etc.)
  const rows = [];
  for (let i = 0; i < progress.length; i += 4) {
    rows.push(progress.slice(i, i + 4));
  }

  return (
    <div>
      {/* Normal view for interface */}
      <Card className="netflix-card p-4 mx-4 mb-6">
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold text-white mb-2">
            {language === 'ru' ? 'Таблица пополнений' : 'Deposit Table'}
          </h3>
          
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-gray-400 rounded"></div>
              <span className="text-gray-400">
                {language === 'ru' ? 'Пополнить' : 'To Deposit'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-br from-rose-300 to-amber-200 rounded"></div>
              <span className="text-rose-300">
                {language === 'ru' ? 'Накоплено' : 'Saved'}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-4 gap-1">
              {row.map((weekProgress) => {
                const isCompleted = weekProgress.isCompleted;
                const amount = weekProgress.amount;
                
                return (
                  <motion.div
                    key={weekProgress.weekNumber}
                    className={`
                      relative p-3 rounded border transition-all duration-300 h-12 w-full flex items-center justify-center
                      ${isCompleted 
                        ? 'bg-gradient-to-br from-rose-300 to-amber-200 border-rose-300 text-gray-800' 
                        : 'bg-gray-800 border-gray-600 text-gray-300'
                      }
                    `}
                    layout
                    onClick={() => onCellClick?.(weekProgress.weekNumber)}
                    style={{ cursor: onCellClick ? 'pointer' : 'default' }}
                  >
                    <div className="text-xs font-bold">
                      {amount}
                    </div>
                    
                    {isCompleted && (
                      <motion.div
                        className="absolute inset-0 bg-purple-400/20 rounded-lg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </motion.div>
                );
              })}
              
              {/* Fill empty cells in the last row */}
              {row.length < 4 && rowIndex === rows.length - 1 && (
                Array.from({ length: 4 - row.length }).map((_, index) => (
                  <div key={`empty-${index}`} className="p-3 opacity-0"></div>
                ))
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 text-center text-sm text-gray-400">
          {language === 'ru' 
            ? `Общая сумма: ${getCurrencySymbol()}${progress.reduce((sum, p) => sum + (p.isCompleted ? p.amount : 0), 0)}`
            : `Total saved: ${getCurrencySymbol()}${progress.reduce((sum, p) => sum + (p.isCompleted ? p.amount : 0), 0)}`
          }
        </div>
      </Card>

      {/* Compact print version - hidden normally, only for saving */}
      <div 
        id="savings-table"
        style={{ 
          position: 'absolute',
          left: '-9999px',
          top: '-9999px',
          width: '794px', 
          height: '1123px',
          backgroundColor: 'white',
          color: 'black',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          fontSize: '14px',
          padding: '40px',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
      >
        {/* No background image here - handled by canvas compositing */}

        {/* Netflix-style decorative emojis positioned around A4 content */}
        {/* Top row */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '24px', opacity: 0.3, zIndex: 5 }}>💰</div>
        <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '24px', opacity: 0.3, zIndex: 5 }}>🎯</div>
        <div style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', fontSize: '20px', opacity: 0.25, zIndex: 5 }}>📈</div>
        <div style={{ position: 'absolute', top: '10px', left: '25%', transform: 'translateX(-50%)', fontSize: '18px', opacity: 0.2, zIndex: 5 }}>💎</div>
        <div style={{ position: 'absolute', top: '10px', left: '75%', transform: 'translateX(-50%)', fontSize: '18px', opacity: 0.2, zIndex: 5 }}>⭐</div>
        
        {/* Left side - distributed vertically */}
        <div style={{ position: 'absolute', top: '180px', left: '5px', fontSize: '18px', opacity: 0.25, zIndex: 5 }}>🚀</div>
        <div style={{ position: 'absolute', top: '280px', left: '5px', fontSize: '16px', opacity: 0.2, zIndex: 5 }}>💪</div>
        <div style={{ position: 'absolute', top: '380px', left: '5px', fontSize: '18px', opacity: 0.25, zIndex: 5 }}>✨</div>
        <div style={{ position: 'absolute', top: '480px', left: '5px', fontSize: '16px', opacity: 0.2, zIndex: 5 }}>🌟</div>
        <div style={{ position: 'absolute', top: '580px', left: '5px', fontSize: '18px', opacity: 0.25, zIndex: 5 }}>🔥</div>
        <div style={{ position: 'absolute', top: '680px', left: '5px', fontSize: '16px', opacity: 0.2, zIndex: 5 }}>💝</div>
        <div style={{ position: 'absolute', top: '780px', left: '5px', fontSize: '18px', opacity: 0.25, zIndex: 5 }}>🎁</div>
        <div style={{ position: 'absolute', top: '880px', left: '5px', fontSize: '16px', opacity: 0.2, zIndex: 5 }}>🌈</div>
        <div style={{ position: 'absolute', top: '980px', left: '5px', fontSize: '18px', opacity: 0.25, zIndex: 5 }}>💫</div>
        
        {/* Right side - distributed vertically */}
        <div style={{ position: 'absolute', top: '180px', right: '5px', fontSize: '18px', opacity: 0.25, zIndex: 5 }}>⚡</div>
        <div style={{ position: 'absolute', top: '280px', right: '5px', fontSize: '16px', opacity: 0.2, zIndex: 5 }}>🎊</div>
        <div style={{ position: 'absolute', top: '380px', right: '5px', fontSize: '18px', opacity: 0.25, zIndex: 5 }}>🎭</div>
        <div style={{ position: 'absolute', top: '480px', right: '5px', fontSize: '16px', opacity: 0.2, zIndex: 5 }}>🎪</div>
        <div style={{ position: 'absolute', top: '580px', right: '5px', fontSize: '18px', opacity: 0.25, zIndex: 5 }}>🎨</div>
        <div style={{ position: 'absolute', top: '680px', right: '5px', fontSize: '16px', opacity: 0.2, zIndex: 5 }}>🎬</div>
        <div style={{ position: 'absolute', top: '780px', right: '5px', fontSize: '18px', opacity: 0.25, zIndex: 5 }}>🎵</div>
        <div style={{ position: 'absolute', top: '880px', right: '5px', fontSize: '16px', opacity: 0.2, zIndex: 5 }}>🎶</div>
        <div style={{ position: 'absolute', top: '980px', right: '5px', fontSize: '18px', opacity: 0.25, zIndex: 5 }}>🎯</div>
        
        {/* Bottom row */}
        <div style={{ position: 'absolute', bottom: '10px', left: '10px', fontSize: '22px', opacity: 0.3, zIndex: 5 }}>🏆</div>
        <div style={{ position: 'absolute', bottom: '10px', right: '10px', fontSize: '22px', opacity: 0.3, zIndex: 5 }}>🎉</div>
        <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', fontSize: '18px', opacity: 0.25, zIndex: 5 }}>👑</div>
        <div style={{ position: 'absolute', bottom: '10px', left: '25%', transform: 'translateX(-50%)', fontSize: '16px', opacity: 0.2, zIndex: 5 }}>🎖️</div>
        <div style={{ position: 'absolute', bottom: '10px', left: '75%', transform: 'translateX(-50%)', fontSize: '16px', opacity: 0.2, zIndex: 5 }}>🥇</div>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px', position: 'relative', zIndex: 10 }}>
          <h1 style={{ fontSize: '40px', fontWeight: 'bold', color: '#dc2626', marginBottom: '20px', margin: '0' }}>
            52 НЕДЕЛИ БОГАТСТВА
          </h1>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#000', marginBottom: '25px', margin: '20px 0' }}>
            {progress[0]?.amount ? `Цель: ${getCurrencySymbol()}${progress.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}` : 'ТАБЛИЦА НАКОПЛЕНИЙ'}
          </h2>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '50px', fontSize: '16px', marginBottom: '20px' }}>
            <span style={{ color: '#666' }}>Дата начала: {new Date().toLocaleDateString('ru-RU')}</span>
            <span style={{ color: '#666' }}>Дата окончания: {new Date(Date.now() + 52 * 7 * 24 * 60 * 60 * 1000).toLocaleDateString('ru-RU')}</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', fontSize: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '16px', height: '16px', border: '2px solid #999', backgroundColor: 'white' }}></div>
              <span style={{ color: '#666' }}>Пополнить</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '16px', height: '16px', background: 'linear-gradient(135deg, #fca5a5, #fcd34d)' }}></div>
              <span style={{ color: '#dc2626' }}>Накоплено</span>
            </div>
          </div>
        </div>

        {/* A4 optimized table - 4 columns by 13 rows for vertical layout */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gridTemplateRows: 'repeat(13, 1fr)',
          gap: '5px', 
          marginBottom: '30px', 
          position: 'relative', 
          zIndex: 10,
          width: '500px',
          height: '650px',
          margin: '0 auto 30px auto'
        }}>
          {progress.map((weekProgress) => {
            const isCompleted = weekProgress.isCompleted;
            const amount = weekProgress.amount;
            
            return (
              <div
                key={weekProgress.weekNumber}
                style={{
                  padding: '6px',
                  border: '2px solid #ccc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  backgroundColor: isCompleted ? '#fcd34d' : 'white',
                  color: isCompleted ? '#000' : '#333',
                  textAlign: 'center',
                  lineHeight: '1',
                  borderRadius: '6px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                {amount}
              </div>
            );
          })}
        </div>

        {/* Bottom motto */}
        <div style={{ 
          paddingTop: '30px', 
          textAlign: 'center', 
          position: 'relative', 
          zIndex: 10,
          margin: '0 auto'
        }}>
          <div style={{ 
            fontSize: '32px', 
            color: '#dc2626', 
            fontWeight: 'bold',
            textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
            letterSpacing: '1px'
          }}>
            Отмечай пополнения и отслеживай прогресс!
          </div>
        </div>
      </div>
    </div>
  );
}