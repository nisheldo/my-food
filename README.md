# MyFood

A simple iOS app for tracking what you eat throughout the day and week.

## Features

- **Today View**: See all foods logged today organized by meal type (breakfast, lunch, dinner, snack)
- **Weekly View**: Review your eating patterns with a weekly summary and daily breakdown
- **Quick Add**: Quickly log common foods like coffee, apples, or water
- **Nutrition Tracking**: Optionally track calories, protein, carbs, and fat
- **Edit & Delete**: Easily modify or remove food entries

## Requirements

- iOS 17.0+
- Xcode 15.0+

## Getting Started

1. Open `MyFood.xcodeproj` in Xcode
2. Select your target device or simulator
3. Build and run (Cmd+R)

## Architecture

- **SwiftUI** for the user interface
- **SwiftData** for local data persistence
- MVVM-style architecture with SwiftUI's property wrappers

## Project Structure

```
MyFood/
├── MyFoodApp.swift      # App entry point
├── ContentView.swift     # Main tab view
├── Models/
│   └── FoodEntry.swift   # Food entry data model
├── Views/
│   ├── TodayView.swift   # Today's food list
│   ├── AddFoodView.swift # Add new food entry
│   ├── WeeklyView.swift  # Weekly summary
│   └── FoodDetailView.swift # View/edit food details
└── Assets.xcassets/      # App icons and colors
```
