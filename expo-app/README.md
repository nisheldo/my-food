# MyFood - Expo App

A React Native food tracking app built with Expo. Track your daily and weekly food intake.

## Quick Start with Expo Go

1. Install **Expo Go** on your phone:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Install dependencies:
   ```bash
   cd expo-app
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Scan the QR code with:
   - **iOS**: Camera app
   - **Android**: Expo Go app

## Features

- **Today View**: See all foods logged today, organized by meal type
- **Weekly View**: Weekly summary with daily breakdown
- **Quick Add**: Fast buttons for common foods
- **Nutrition Tracking**: Track calories, protein, carbs, and fat
- **Edit & Delete**: Modify or remove entries

## Project Structure

```
expo-app/
├── App.tsx                 # Main app with navigation
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── FoodEntryRow.tsx
│   │   ├── QuickAddButton.tsx
│   │   └── SummaryCard.tsx
│   ├── screens/            # App screens
│   │   ├── TodayScreen.tsx
│   │   ├── WeeklyScreen.tsx
│   │   ├── AddFoodScreen.tsx
│   │   └── FoodDetailScreen.tsx
│   ├── storage/            # Data persistence
│   │   └── foodStorage.ts
│   └── types/              # TypeScript types
│       └── index.ts
└── assets/                 # App icons and images
```

## Tech Stack

- **Expo** - React Native framework
- **React Navigation** - Navigation library
- **AsyncStorage** - Local data persistence
- **TypeScript** - Type safety
