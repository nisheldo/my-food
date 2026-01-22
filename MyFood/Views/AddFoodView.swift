import SwiftUI
import SwiftData

struct AddFoodView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss

    @State private var name = ""
    @State private var mealType: MealType = .snack
    @State private var calories = ""
    @State private var protein = ""
    @State private var carbs = ""
    @State private var fat = ""
    @State private var notes = ""
    @State private var timestamp = Date()

    var body: some View {
        NavigationStack {
            Form {
                Section("Food Details") {
                    TextField("Food name", text: $name)

                    Picker("Meal", selection: $mealType) {
                        ForEach(MealType.allCases, id: \.self) { type in
                            Label(type.rawValue, systemImage: type.icon)
                                .tag(type)
                        }
                    }

                    DatePicker("Time", selection: $timestamp)
                }

                Section("Nutrition (optional)") {
                    HStack {
                        Image(systemName: "flame.fill")
                            .foregroundColor(.orange)
                        TextField("Calories", text: $calories)
                            .keyboardType(.numberPad)
                    }

                    HStack {
                        Image(systemName: "leaf.fill")
                            .foregroundColor(.green)
                        TextField("Protein (g)", text: $protein)
                            .keyboardType(.decimalPad)
                    }

                    HStack {
                        Image(systemName: "circle.grid.2x2.fill")
                            .foregroundColor(.blue)
                        TextField("Carbs (g)", text: $carbs)
                            .keyboardType(.decimalPad)
                    }

                    HStack {
                        Image(systemName: "drop.fill")
                            .foregroundColor(.yellow)
                        TextField("Fat (g)", text: $fat)
                            .keyboardType(.decimalPad)
                    }
                }

                Section("Notes (optional)") {
                    TextField("Add notes...", text: $notes, axis: .vertical)
                        .lineLimit(3...6)
                }

                Section {
                    quickAddButtons
                }
            }
            .navigationTitle("Add Food")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        saveEntry()
                    }
                    .disabled(name.isEmpty)
                }
            }
        }
    }

    private var quickAddButtons: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Quick Add")
                .font(.caption)
                .foregroundColor(.secondary)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    QuickAddButton(title: "Coffee", calories: 5) { quickAdd(name: "Coffee", calories: 5) }
                    QuickAddButton(title: "Apple", calories: 95) { quickAdd(name: "Apple", calories: 95, carbs: 25) }
                    QuickAddButton(title: "Banana", calories: 105) { quickAdd(name: "Banana", calories: 105, carbs: 27) }
                    QuickAddButton(title: "Water", calories: 0) { quickAdd(name: "Water", calories: 0) }
                    QuickAddButton(title: "Protein Shake", calories: 150) { quickAdd(name: "Protein Shake", calories: 150, protein: 25) }
                }
            }
        }
        .listRowInsets(EdgeInsets(top: 12, leading: 16, bottom: 12, trailing: 16))
    }

    private func quickAdd(name: String, calories: Int, protein: Double? = nil, carbs: Double? = nil, fat: Double? = nil) {
        self.name = name
        self.calories = "\(calories)"
        if let protein = protein {
            self.protein = String(format: "%.1f", protein)
        }
        if let carbs = carbs {
            self.carbs = String(format: "%.1f", carbs)
        }
        if let fat = fat {
            self.fat = String(format: "%.1f", fat)
        }
    }

    private func saveEntry() {
        let entry = FoodEntry(
            name: name,
            mealType: mealType,
            calories: Int(calories),
            protein: Double(protein),
            carbs: Double(carbs),
            fat: Double(fat),
            notes: notes,
            timestamp: timestamp
        )
        modelContext.insert(entry)
        dismiss()
    }
}

struct QuickAddButton: View {
    let title: String
    let calories: Int
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 2) {
                Text(title)
                    .font(.caption)
                    .fontWeight(.medium)
                Text("\(calories) cal")
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(Color(.systemGray6))
            .cornerRadius(8)
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    AddFoodView()
        .modelContainer(for: FoodEntry.self, inMemory: true)
}
