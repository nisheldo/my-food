import Foundation
import SwiftData

@Model
final class FoodEntry {
    var id: UUID
    var name: String
    var mealType: MealType
    var calories: Int?
    var protein: Double?
    var carbs: Double?
    var fat: Double?
    var notes: String
    var timestamp: Date

    init(
        name: String,
        mealType: MealType = .snack,
        calories: Int? = nil,
        protein: Double? = nil,
        carbs: Double? = nil,
        fat: Double? = nil,
        notes: String = "",
        timestamp: Date = Date()
    ) {
        self.id = UUID()
        self.name = name
        self.mealType = mealType
        self.calories = calories
        self.protein = protein
        self.carbs = carbs
        self.fat = fat
        self.notes = notes
        self.timestamp = timestamp
    }
}

enum MealType: String, Codable, CaseIterable {
    case breakfast = "Breakfast"
    case lunch = "Lunch"
    case dinner = "Dinner"
    case snack = "Snack"

    var icon: String {
        switch self {
        case .breakfast: return "sun.rise.fill"
        case .lunch: return "sun.max.fill"
        case .dinner: return "moon.fill"
        case .snack: return "leaf.fill"
        }
    }
}

extension FoodEntry {
    static var sampleEntries: [FoodEntry] {
        [
            FoodEntry(name: "Oatmeal with Berries", mealType: .breakfast, calories: 350, protein: 12, carbs: 60, fat: 8),
            FoodEntry(name: "Grilled Chicken Salad", mealType: .lunch, calories: 450, protein: 35, carbs: 20, fat: 25),
            FoodEntry(name: "Apple", mealType: .snack, calories: 95, protein: 0.5, carbs: 25, fat: 0.3),
            FoodEntry(name: "Salmon with Vegetables", mealType: .dinner, calories: 550, protein: 40, carbs: 30, fat: 28),
        ]
    }
}
