// Climate and location types for multi-city simulation

export interface City {
  id: string
  name: string
  country: string
  location: {
    lat: number // Latitude in degrees
    lon: number // Longitude in degrees
  }
  timezone: string
  climate: ClimateProfile
}

export interface ClimateProfile {
  // Temperature characteristics (°C)
  winterTemp: {
    min: number // Average winter minimum
    max: number // Average winter maximum
  }
  summerTemp: {
    min: number // Average summer minimum
    max: number // Average summer maximum
  }
  springTemp: {
    min: number // Average spring minimum
    max: number // Average spring maximum
  }
  fallTemp: {
    min: number // Average fall minimum
    max: number // Average fall maximum
  }

  // Humidity characteristics (0-1)
  winterHumidity: number
  summerHumidity: number
  springHumidity: number
  fallHumidity: number

  // Air quality baseline (AQI)
  airQuality: {
    typical: number // Typical AQI
    variation: number // Daily variation range
  }

  // Climate modifiers
  continentality: number // 0-1, affects daily temperature swing
  maritimeInfluence: number // 0-1, affects temperature moderation
  pollutionLevel: number // 0-1, affects air quality baseline
}

export interface SeasonalDate {
  id: string
  name: string
  date: string // YYYY-MM-DD format
  description: string
  dayOfYear: number // 1-365
  solarDeclination: number // Sun's declination angle in degrees
}

export interface SolarCalculationParams {
  latitude: number // degrees
  dayOfYear: number // 1-365
  hour: number // 0-23
  solarDeclination: number // degrees
}

export interface EnhancedClimateData {
  hour: number
  temperature: number // °C
  humidity: number // 0-1
  solarRadiation: number // W/m²
  airQualityIndex: number // AQI
  windSpeed: number // m/s

  // Additional seasonal/geographic data
  solarElevation: number // degrees above horizon
  dayLength: number // hours of daylight
  season: 'winter' | 'spring' | 'summer' | 'fall'
  cityId: string
  seasonalDate: string
}
