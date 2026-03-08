export type ConsistencyResult = {
  consistency: number
  activeDays: number
  totalDays: number
}

export function calculate7DayConsistency(completedDates: string[]): ConsistencyResult {
  const uniqueDays = new Set(completedDates)
  const activeDays = uniqueDays.size
  const totalDays = 7

  const consistency =
    totalDays > 0 ? Math.round((activeDays / totalDays) * 100) : 0

  return {
    consistency,
    activeDays,
    totalDays,
  }
}