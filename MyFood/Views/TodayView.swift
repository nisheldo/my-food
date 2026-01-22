import SwiftUI
import SwiftData

struct TodayView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(filter: #Predicate<FoodEntry> { entry in
        Calendar.current.isDateInToday(entry.timestamp)
    }, sort: \FoodEntry.timestamp)
    private var todayEntries: [FoodEntry]

    @State private var showingAddFood = false

    var body: some View {
        NavigationStack {
            List {
                if todayEntries.isEmpty {
                    ContentUnavailableView(
                        "No Food Logged Today",
                        systemImage: "fork.knife",
                        description: Text("Tap the + button to add your first meal")
                    )
                } else {
                    summarySection
                    mealsSection
                }
            }
            .navigationTitle("Today")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showingAddFood = true }) {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $showingAddFood) {
                AddFoodView()
            }
        }
    }

    private var summarySection: some View {
        Section("Summary") {
            HStack {
                SummaryCard(
                    title: "Calories",
                    value: "\(totalCalories)",
                    icon: "flame.fill",
                    color: .orange
                )
                SummaryCard(
                    title: "Protein",
                    value: String(format: "%.0fg", totalProtein),
                    icon: "leaf.fill",
                    color: .green
                )
                SummaryCard(
                    title: "Carbs",
                    value: String(format: "%.0fg", totalCarbs),
                    icon: "circle.grid.2x2.fill",
                    color: .blue
                )
                SummaryCard(
                    title: "Fat",
                    value: String(format: "%.0fg", totalFat),
                    icon: "drop.fill",
                    color: .yellow
                )
            }
            .listRowInsets(EdgeInsets())
            .listRowBackground(Color.clear)
        }
    }

    private var mealsSection: some View {
        ForEach(MealType.allCases, id: \.self) { mealType in
            let entries = todayEntries.filter { $0.mealType == mealType }
            if !entries.isEmpty {
                Section(mealType.rawValue) {
                    ForEach(entries) { entry in
                        NavigationLink(destination: FoodDetailView(entry: entry)) {
                            FoodEntryRow(entry: entry)
                        }
                    }
                    .onDelete { indexSet in
                        deleteEntries(entries: entries, at: indexSet)
                    }
                }
            }
        }
    }

    private var totalCalories: Int {
        todayEntries.compactMap { $0.calories }.reduce(0, +)
    }

    private var totalProtein: Double {
        todayEntries.compactMap { $0.protein }.reduce(0, +)
    }

    private var totalCarbs: Double {
        todayEntries.compactMap { $0.carbs }.reduce(0, +)
    }

    private var totalFat: Double {
        todayEntries.compactMap { $0.fat }.reduce(0, +)
    }

    private func deleteEntries(entries: [FoodEntry], at offsets: IndexSet) {
        for index in offsets {
            modelContext.delete(entries[index])
        }
    }
}

struct SummaryCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(spacing: 4) {
            Image(systemName: icon)
                .foregroundColor(color)
                .font(.title2)
            Text(value)
                .font(.headline)
                .fontWeight(.bold)
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 12)
    }
}

struct FoodEntryRow: View {
    let entry: FoodEntry

    var body: some View {
        HStack {
            Image(systemName: entry.mealType.icon)
                .foregroundColor(.accentColor)
                .frame(width: 30)

            VStack(alignment: .leading, spacing: 2) {
                Text(entry.name)
                    .font(.body)
                if let calories = entry.calories {
                    Text("\(calories) cal")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }

            Spacer()

            Text(entry.timestamp, style: .time)
                .font(.caption)
                .foregroundColor(.secondary)
        }
    }
}

#Preview {
    TodayView()
        .modelContainer(for: FoodEntry.self, inMemory: true)
}
