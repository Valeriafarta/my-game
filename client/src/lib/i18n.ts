export type Language = 'ru' | 'en';

export const translations = {
  ru: {
    // App Title
    appTitle: "52 Недели Богатства",
    appSubtitle: "Маленькие шаги - к большим деньгам",
    
    // Navigation
    languageSwitch: "Язык",
    howToPlay: "Как играть",
    newGame: "Новая игра",
    
    // How to Play Stories
    welcomeTitle: "Добро пожаловать в игру!",
    welcomeText: "52 недели богатства - это простая и эффективная система накоплений",
    howItWorksTitle: "Как это работает?",
    howItWorksText: "Каждую неделю откладывай сумму, равную номеру недели. Неделя 1 = $1, Неделя 2 = $2...",
    trackProgressTitle: "Отслеживай прогресс",
    trackProgressText: "Отмечай выполненные недели и следи за своими достижениями",
    shareResultsTitle: "Поделись результатами!",
    shareResultsText: "Сохрани свой прогресс и покажи друзьям в социальных сетях",
    
    // Goal Creation
    visualizeGoal: "Визуализируй свою цель",
    addPhoto: "Добавь фото или картинку с галереи телефона",
    goalNamePlaceholder: "Название цели (например: Отпуск в Европе)",
    startChallenge: "Начать челлендж",
    selectCurrency: "Выберите валюту",
    enterAmount: "Введите сумму накоплений",
    
    // Progress Screen
    week: "Неделя",
    completed: "завершено",
    saved: "Накоплено",
    remaining: "Осталось",
    total: "Всего",
    nextWeekTip: "На следующей неделе отложи",
    shareProgress: "Поделиться прогрессом",
    saveImage: "Сохранить как картинку",
    depositTable: "Таблица пополнений",
    deposit: "Пополнить",
    addToCalendar: "Добавить в календарь",
    saveTable: "Сохранить таблицу",
    selectDepositAmount: "Выберите сумму пополнения",
    discipline: "Дисциплина",
    wealth: "Богатство",
    goalPurpose: "Цель игры",
    yourGoals: "Ваши цели",
    
    // Additional translations
    reminderDay: "День напоминаний",
    startWeekChallenge: "Начать челлендж",
    goalCreated: "Цель создана!",
    goalCreatedDesc: "Ваш 52-недельный челлендж начался.",
    error: "Ошибка",
    failedCreateGoal: "Не удалось создать цель. Попробуйте снова.",
    toDeposit: "Пополнить",
    imageSaved: "Изображение сохранено!",
    progressSaved: "Прогресс сохранен как изображение",
    tableSaved: "Таблица сохранена!",
    tableDepositSaved: "Таблица пополнений сохранена",
    failedSaveTable: "Не удалось сохранить таблицу.",
    failedCreateImage: "Не удалось создать изображение для шеринга.",
    noAvailableAmounts: "Все недели завершены!",
    
    // Common
    back: "Назад",
    next: "Далее",
    done: "Готово",
    loading: "Загрузка...",
  },
  
  en: {
    // App Title
    appTitle: "52 Weeks of Wealth",
    appSubtitle: "Small steps - to big money",
    
    // Navigation
    languageSwitch: "Language",
    howToPlay: "How to Play",
    newGame: "New Game",
    
    // How to Play Stories
    welcomeTitle: "Welcome to the game!",
    welcomeText: "52 weeks of wealth is a simple and effective savings system",
    howItWorksTitle: "How does it work?",
    howItWorksText: "Each week, save an amount equal to the week number. Week 1 = $1, Week 2 = $2...",
    trackProgressTitle: "Track your progress",
    trackProgressText: "Mark completed weeks and monitor your achievements",
    shareResultsTitle: "Share your results!",
    shareResultsText: "Save your progress and show it to friends on social media",
    
    // Goal Creation
    visualizeGoal: "Visualize your goal",
    addPhoto: "Add a photo or picture from your phone gallery",
    goalNamePlaceholder: "Goal name (e.g., European Vacation)",
    startChallenge: "Start Challenge",
    selectCurrency: "Select currency",
    enterAmount: "Enter savings amount",
    
    // Progress Screen
    week: "Week",
    completed: "completed",
    saved: "Saved",
    remaining: "Remaining",
    total: "Total",
    nextWeekTip: "Next week save",
    shareProgress: "Share Progress",
    saveImage: "Save as Image",
    depositTable: "Deposit Table",
    deposit: "Deposit",
    addToCalendar: "Add to Calendar",
    saveTable: "Save Table",
    selectDepositAmount: "Select deposit amount",
    discipline: "Discipline",
    wealth: "Wealth",
    goalPurpose: "Game Goal",
    yourGoals: "Your Goals",
    
    // Additional translations
    reminderDay: "Reminder Day",
    startWeekChallenge: "Start Challenge",
    goalCreated: "Goal created!",
    goalCreatedDesc: "Your 52-week challenge has started.",
    error: "Error",
    failedCreateGoal: "Failed to create goal. Please try again.",
    toDeposit: "To Deposit",
    imageSaved: "Image saved!",
    progressSaved: "Progress saved as image",
    tableSaved: "Table saved!",
    tableDepositSaved: "Deposit table saved",
    failedSaveTable: "Failed to save table.",
    failedCreateImage: "Failed to create sharing image.",
    noAvailableAmounts: "All weeks completed!",
    
    // Common
    back: "Back",
    next: "Next",
    done: "Done",
    loading: "Loading...",
  }
};

export const useTranslation = (language: Language) => {
  return translations[language];
};