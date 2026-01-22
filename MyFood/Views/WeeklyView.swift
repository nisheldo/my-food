import SwiftUI
import SwiftData

struct WeeklyView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \FoodEntry.timestamp, order: .reverse)
    private var allEntries: [FoodEntry]

    private var weekStart: Date {
        Calendar.current.date(from: Calendar.current.dateComponents([.yearForWeekOfYear, .weekOfYear], from: Date()))!
    }

    private var weekEntries: [FoodEntry] {
        allEntries.filter { $0.timestamp >= weekStart }
    }

    private var entriesByDay: [(date: Date, entries: [FoodEntry])] {
        let calendar = Calendar.current
        let grouped = Dictionary(grouping: weekEntries) { entry in
            calendar.startOfDay(for: entry.timestamp)
        }
        return grouped.sorted { $0.key > $1.key }.map { (date: $0.key, entries: $0.value) }
    }

    var body: some View {
        NavigationStack {
            List {
                weekSummarySection

                ForEach(entriesByDay, id: \.date) { day in
                    Section {
                        ForEach(day.entries.sorted { $0.timestamp > $1.timestamp }) { entry in
                            NavigationLink(destination: FoodDetailView(entry: entry)) {
                                FoodEntryRow(entry: entry)
                            }
                        }
                        .onDelete { indexSet in
                            deleteEntries(entries: day.entries.sorted { $0.timestamp > $1.timestamp }, at: indexSet)
                        }
                    } header: {
                        HStack {
                            Text(day.date, format: .dateTime.weekday(.wide).month().day())
                            Spacer()
                            Text("\(dayCalories(for: day.entries)) cal")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                }

                if weekEntries.isEmpty {
                    ContentUnavailableView(
                        "No Food This Week",
                        systemImage: "calendar",
                        description: Text("Start logging your meals to see your weekly summary")
                    )
                }
            }
            .navigationTitle("This Week")
        }
    }

    private var weekSummarySection: some View {
        Section("Weekly Summary") {
            VStack(spacing: 16) {
                HStack(spacing: 20) {
                    WeeklyStatView(
                        title: "Total Calories",
                        value: "\(totalWeekCalories)",
                        subtitle: "avg \(averageDailyCalories)/day",
                        color: .orange
                    )

                    WeeklyStatView(
                        title: "Meals Logged",
                        value: "\(weekEntries.count)",
                        subtitle: "this week",
                        color: .blue
                    )
                }

                Divider()

                HStack(spacing: 12) {
                    MacroProgressView(title: "Protein", value: totalWeekProtein, color: .green)
                    MacroProgressView(title: "Carbs", value: totalWeekCarbs, color: .blue)
                    MacroProgressView(title: "Fat", value: totalWeekFat, color: .yellow)
                }
            }
            .padding(.vertical, 8)
        }
    }

    private var totalWeekCalories: Int {
        weekEntries.compactMap { $0.calories }.reduce(0, +)
    }

    private var averageDailyCalories: Int {
        let days = max(1, entriesByDay.count)
        return totalWeekCalories / days
    }

    private var totalWeekProtein: Double {
        weekEntries.compactMap { $0.protein }.reduce(0, +)
    }

    private var totalWeekCarbs: Double {
        weekEntries.compactMap { $0.carbs }.reduce(0, +)
    }

    private var totalWeekFat: Double {
        weekEntries.compactMap { $0.fat }.reduce(0, +)
    }

    private func dayCalories(for entries: [FoodEntry]) -> Int {
        entries.compactMap { $0.calories }.reduce(0, +)
    }

    private func deleteEntries(entries: [FoodEntry], at offsets: IndexSet) {
        for index in offsets {
            modelContext.delete(entries[index])
        }
    }
}

struct WeeklyStatView: View {
    let title: String
    let value: String
    let subtitle: String
    let color: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
            Text(value)
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(color)
            Text(subtitle)
                .font(.caption2)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

struct MacroProgressView: View {
    let title: String
    let value: Double
    let color: Color

    var body: some View {
        VStack(spacing: 4) {
            Text(String(format: "%.0fg", value))
                .font(.headline)
                .fontWeight(.semibold)
                .foregroundColor(color)
            Text(title)
                .font(.caption2)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
    }
}

#Preview {
    WeeklyView()
        .modelContainer(for: FoodEntry.self, inMemory: true)
}
