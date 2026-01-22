import SwiftUI
import SwiftData

struct FoodDetailView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    @Bindable var entry: FoodEntry

    @State private var isEditing = false
    @State private var showDeleteConfirmation = false

    var body: some View {
        List {
            Section {
                if isEditing {
                    TextField("Food name", text: $entry.name)
                } else {
                    LabeledContent("Name", value: entry.name)
                }

                if isEditing {
                    Picker("Meal", selection: $entry.mealType) {
                        ForEach(MealType.allCases, id: \.self) { type in
                            Label(type.rawValue, systemImage: type.icon).tag(type)
                        }
                    }
                } else {
                    LabeledContent("Meal") {
                        Label(entry.mealType.rawValue, systemImage: entry.mealType.icon)
                    }
                }

                if isEditing {
                    DatePicker("Time", selection: $entry.timestamp)
                } else {
                    LabeledContent("Time") {
                        Text(entry.timestamp, format: .dateTime)
                    }
                }
            }

            Section("Nutrition") {
                NutritionRow(
                    icon: "flame.fill",
                    color: .orange,
                    title: "Calories",
                    value: entry.calories.map { "\($0)" } ?? "-",
                    unit: "cal",
                    isEditing: isEditing
                ) { newValue in
                    entry.calories = Int(newValue)
                }

                NutritionRow(
                    icon: "leaf.fill",
                    color: .green,
                    title: "Protein",
                    value: entry.protein.map { String(format: "%.1f", $0) } ?? "-",
                    unit: "g",
                    isEditing: isEditing
                ) { newValue in
                    entry.protein = Double(newValue)
                }

                NutritionRow(
                    icon: "circle.grid.2x2.fill",
                    color: .blue,
                    title: "Carbs",
                    value: entry.carbs.map { String(format: "%.1f", $0) } ?? "-",
                    unit: "g",
                    isEditing: isEditing
                ) { newValue in
                    entry.carbs = Double(newValue)
                }

                NutritionRow(
                    icon: "drop.fill",
                    color: .yellow,
                    title: "Fat",
                    value: entry.fat.map { String(format: "%.1f", $0) } ?? "-",
                    unit: "g",
                    isEditing: isEditing
                ) { newValue in
                    entry.fat = Double(newValue)
                }
            }

            if !entry.notes.isEmpty || isEditing {
                Section("Notes") {
                    if isEditing {
                        TextField("Add notes...", text: $entry.notes, axis: .vertical)
                            .lineLimit(3...6)
                    } else {
                        Text(entry.notes)
                            .foregroundColor(.secondary)
                    }
                }
            }

            if !isEditing {
                Section {
                    Button(role: .destructive) {
                        showDeleteConfirmation = true
                    } label: {
                        HStack {
                            Spacer()
                            Text("Delete Entry")
                            Spacer()
                        }
                    }
                }
            }
        }
        .navigationTitle(isEditing ? "Edit Food" : "Food Details")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button(isEditing ? "Done" : "Edit") {
                    isEditing.toggle()
                }
            }
        }
        .confirmationDialog(
            "Delete this food entry?",
            isPresented: $showDeleteConfirmation,
            titleVisibility: .visible
        ) {
            Button("Delete", role: .destructive) {
                modelContext.delete(entry)
                dismiss()
            }
            Button("Cancel", role: .cancel) {}
        }
    }
}

struct NutritionRow: View {
    let icon: String
    let color: Color
    let title: String
    let value: String
    let unit: String
    let isEditing: Bool
    let onEdit: (String) -> Void

    @State private var editValue: String = ""

    var body: some View {
        HStack {
            Image(systemName: icon)
                .foregroundColor(color)
                .frame(width: 24)

            Text(title)

            Spacer()

            if isEditing {
                TextField("0", text: $editValue)
                    .keyboardType(.decimalPad)
                    .multilineTextAlignment(.trailing)
                    .frame(width: 80)
                    .onChange(of: editValue) { _, newValue in
                        onEdit(newValue)
                    }
                    .onAppear {
                        editValue = value == "-" ? "" : value
                    }
                Text(unit)
                    .foregroundColor(.secondary)
            } else {
                Text("\(value) \(unit)")
                    .foregroundColor(.secondary)
            }
        }
    }
}

#Preview {
    NavigationStack {
        FoodDetailView(entry: FoodEntry(
            name: "Grilled Chicken Salad",
            mealType: .lunch,
            calories: 450,
            protein: 35,
            carbs: 20,
            fat: 25,
            notes: "Added extra dressing"
        ))
    }
    .modelContainer(for: FoodEntry.self, inMemory: true)
}
