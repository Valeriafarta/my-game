# 📱 52 Недели Богатства - Руководство по развертыванию

## 🎯 О приложении

Netflix-стилизованное веб-приложение для 52-недельного челленджа накоплений с интерактивным интерфейсом, анимациями и экспортом прогресса в Instagram Stories.

## 🛠 Технологический стек

- **Frontend**: React + TypeScript + Vite
- **Backend**: Express.js + Node.js
- **База данных**: PostgreSQL + Drizzle ORM
- **Стилизация**: Tailwind CSS + Framer Motion
- **Аутентификация**: Replit Auth / Passport.js

## 📦 Как забрать приложение с Replit

### Метод 1: Загрузка ZIP архива
1. В Replit IDE нажмите на три точки (⋮) рядом с названием проекта
2. Выберите "Download as ZIP"
3. Сохраните архив на локальный компьютер
4. Распакуйте архив в нужную папку

### Метод 2: Git клонирование
```bash
git clone https://github.com/YOUR_USERNAME/52-weeks-wealth-challenge.git
cd 52-weeks-wealth-challenge
```

## 🚀 Локальное развертывание

### Предварительные требования
- Node.js 18+ 
- PostgreSQL 14+
- npm или yarn

### Установка зависимостей
```bash
npm install
```

### Настройка базы данных
1. Создайте PostgreSQL базу данных:
```sql
CREATE DATABASE wealth_challenge;
```

2. Создайте файл `.env` в корне проекта:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/wealth_challenge
NODE_ENV=development
SESSION_SECRET=your-super-secret-key-here
PORT=5000
```

3. Выполните миграции:
```bash
npm run db:push
```

### Запуск приложения
```bash
npm run dev
```

Приложение будет доступно по адресу: http://localhost:5000

## ☁️ Развертывание в облаке

### Vercel (Рекомендуется)
1. Форкните репозиторий на GitHub
2. Зайдите на vercel.com и подключите GitHub
3. Импортируйте проект
4. Настройте переменные окружения:
   - `DATABASE_URL` - строка подключения к PostgreSQL
   - `SESSION_SECRET` - секретный ключ для сессий
5. Деплой произойдет автоматически

### Heroku
1. Установите Heroku CLI
2. Создайте приложение:
```bash
heroku create your-app-name
heroku addons:create heroku-postgresql:mini
```
3. Настройте переменные:
```bash
heroku config:set SESSION_SECRET=your-secret-key
```
4. Деплой:
```bash
git push heroku main
```

### Railway
1. Зайдите на railway.app
2. Подключите GitHub репозиторий
3. Добавьте PostgreSQL сервис
4. Настройте переменные окружения
5. Деплой происходит автоматически

## 🗄️ Настройка базы данных в продакшене

### Neon (Serverless PostgreSQL)
1. Зайдите на neon.tech
2. Создайте проект и базу данных
3. Скопируйте CONNECTION STRING
4. Добавьте в переменные окружения как `DATABASE_URL`

### Supabase
1. Создайте проект на supabase.com
2. Перейдите в Settings → Database
3. Скопируйте Connection string
4. Используйте как `DATABASE_URL`

## 🔧 Настройка аутентификации

### Для продакшена замените dev auth на:

#### Google OAuth
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### GitHub OAuth  
```env
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

## 📱 Настройка PWA (мобильное приложение)

Приложение уже настроено как PWA. Пользователи могут:
1. Открыть сайт в браузере
2. Нажать "Добавить на главный экран"
3. Использовать как нативное приложение

## 🎨 Кастомизация

### Изменение цветовой схемы
Отредактируйте файл `client/src/index.css`:
```css
:root {
  --netflix-red: hsl(348, 100%, 47%);
  --netflix-dark-red: hsl(0, 84%, 40%);
  /* Измените на свои цвета */
}
```

### Добавление новых языков
1. Отредактируйте `client/src/lib/i18n.ts`
2. Добавьте переводы в объект `translations`

## 🔒 Безопасность

### Обязательные настройки для продакшена:
1. Сгенерируйте надежный `SESSION_SECRET`
2. Используйте HTTPS
3. Настройте CORS правильно
4. Обновляйте зависимости регулярно

## 📊 Мониторинг

### Рекомендуемые сервисы:
- Sentry - для отслеживания ошибок
- LogRocket - для анализа пользовательских сессий
- Google Analytics - для веб-аналитики

## 🐛 Устранение неполадок

### Частые проблемы:

#### База данных не подключается
```bash
# Проверьте строку подключения
npx drizzle-kit studio
```

#### Статические файлы не загружаются
```bash
# Пересоберите фронтенд
npm run build
```

#### Ошибки сессий
```bash
# Очистите сессии в базе
DELETE FROM sessions;
```

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи сервера
2. Убедитесь что все переменные окружения установлены
3. Проверьте статус базы данных
4. Создайте issue в GitHub репозитории

## 🔄 Обновления

Для получения обновлений:
```bash
git pull origin main
npm install
npm run db:push
npm run build
```

---

**Готово! Ваше приложение "52 Недели Богатства" готово к использованию и распространению! 🎉**