import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { User, Sparkles } from "lucide-react";
import type { Language } from "@/lib/i18n";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ProfileSetupProps {
  language: Language;
  onComplete: () => void;
}

export function ProfileSetup({ language, onComplete }: ProfileSetupProps) {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: { name: string }) => {
      console.log('Submitting profile data:', profileData);
      const response = await apiRequest('PATCH', '/api/profile', profileData);
      return response.json();
    },
    onSuccess: (data) => {
      console.log('Profile updated successfully:', data);
      // Update cached user data in localStorage
      localStorage.setItem('userData', JSON.stringify(data));
      setIsSubmitting(false);
      onComplete();
    },
    onError: (error) => {
      console.error('Failed to update profile:', error);
      setIsSubmitting(false);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with name:', name);
    
    if (name.trim().length < 2) {
      console.log('Name too short, not submitting');
      return;
    }
    
    setIsSubmitting(true);
    console.log('Setting isSubmitting to true');
    
    try {
      await updateProfileMutation.mutateAsync({ name: name.trim() });
    } catch (error) {
      console.error('Submit error:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-red-900/20 flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 bg-black/80 backdrop-blur-sm border-red-800">
          <div className="text-center mb-8">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block mb-4"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center mx-auto">
                <User className="w-10 h-10 text-white" />
              </div>
            </motion.div>
            
            <h1 className="text-3xl font-bold text-white mb-2">
              {language === 'ru' ? 'Добро пожаловать!' : 'Welcome!'}
            </h1>
            <p className="text-gray-300">
              {language === 'ru' 
                ? 'Как к вам обращаться?' 
                : 'What should we call you?'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-white font-medium">
                {language === 'ru' ? 'Ваше имя' : 'Your name'}
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={language === 'ru' ? 'Введите ваше имя' : 'Enter your name'}
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                maxLength={50}
                required
                autoFocus
              />
            </div>

            <Button
              type="submit"
              disabled={name.trim().length < 2 || isSubmitting}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3"
            >
              {isSubmitting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-5 h-5" />
                </motion.div>
              ) : (
                language === 'ru' ? 'Продолжить' : 'Continue'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              {language === 'ru' 
                ? 'Ваши данные защищены и видны только вам' 
                : 'Your data is secure and visible only to you'
              }
            </p>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}