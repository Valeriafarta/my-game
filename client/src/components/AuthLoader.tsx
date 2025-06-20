import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useTranslation, type Language } from "@/lib/i18n";

interface AuthLoaderProps {
  language: Language;
}

export function AuthLoader({ language }: AuthLoaderProps) {
  const t = useTranslation(language);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="text-6xl mb-6">💰</div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mb-6"
        >
          <Loader2 className="w-8 h-8 mx-auto text-red-600" />
        </motion.div>
        <h2 className="text-2xl font-bold mb-2">
          {language === 'ru' ? 'Вход в систему...' : 'Logging in...'}
        </h2>
        <p className="text-muted-foreground">
          {language === 'ru' 
            ? 'Проверяем ваши данные для входа'
            : 'Verifying your login credentials'
          }
        </p>
      </motion.div>
    </div>
  );
}