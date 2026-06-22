export const POSITIONS = [
  "Arquero",
  "Defensa Central",
  "Lateral Derecho",
  "Lateral Izquierdo",
  "Mediocentro",
  "Volante de Creación",
  "Extremo Derecho",
  "Extremo Izquierdo",
  "Delantero Centro",
  "Segundo Delantero",
] as const

export const CATEGORIES = ["+18", "+30", "+40"] as const

export const LEVELS = ["Principiante", "Intermedio", "Avanzado"] as const

export const AVAILABILITIES = ["Mañana", "Tarde", "Noche", "Fin de Semana", "Flexible"] as const

export const LEGS = ["Derecha", "Izquierda", "Ambas"] as const

export const POSITION_ICONS: Record<string, string> = {
  Arquero: "shield",
  "Defensa Central": "shield",
  "Lateral Derecho": "chevron-right",
  "Lateral Izquierdo": "chevron-left",
  Mediocentro: "git-merge",
  "Volante de Creación": "sparkles",
  "Extremo Derecho": "arrow-right",
  "Extremo Izquierdo": "arrow-left",
  "Delantero Centro": "target",
  "Segundo Delantero": "crosshair",
}

export const WEEKLY_APPLICATION_LIMIT = 3
export const PREMIUM_PRICE_USD = 9.99
export const PREMIUM_PRICE_UYU = 399
