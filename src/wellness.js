export const WELLNESS_CATEGORIES = {
  fitness: { name: 'Fitness', description: 'Indian traditions. Everyday strength.' },
  indian_diet: { name: 'Indian Diet', description: 'Familiar food. Clearer nutrition.' },
  nutrition_myths: { name: 'Nutrition Myths', description: 'Food claims, examined with evidence.' },
  home_workouts: { name: 'Home Workouts', description: 'Less equipment. A practical start.' },
}

export const asList = (value) => Array.isArray(value) ? value : []

export function nutrientValue(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 }).format(value) : '—'
}
