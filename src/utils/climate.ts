// Climate data and calculations for multi-city passive house simulation
import type {
  City,
  ClimateProfile,
  SeasonalDate,
  SolarCalculationParams,
  EnhancedClimateData,
} from '@/types/climate'

// Seasonal dates (astronomical seasons)
export const SEASONAL_DATES: SeasonalDate[] = [
  {
    id: 'winter-solstice',
    name: 'Winter Solstice',
    date: '2024-12-21',
    description: 'Shortest day of the year - minimal solar gain',
    dayOfYear: 355,
    solarDeclination: -23.44, // degrees
  },
  {
    id: 'spring-equinox',
    name: 'Spring Equinox',
    date: '2024-03-20',
    description: 'Equal day and night - moderate solar gain',
    dayOfYear: 79,
    solarDeclination: 0.0,
  },
  {
    id: 'summer-solstice',
    name: 'Summer Solstice',
    date: '2024-06-21',
    description: 'Longest day of the year - maximum solar gain',
    dayOfYear: 172,
    solarDeclination: 23.44,
  },
  {
    id: 'fall-equinox',
    name: 'Fall Equinox',
    date: '2024-09-22',
    description: 'Equal day and night - moderate solar gain',
    dayOfYear: 266,
    solarDeclination: 0.0,
  },
]

// City climate profiles with realistic data
export const CITIES: City[] = [
  {
    id: 'san-francisco',
    name: 'San Francisco',
    country: 'USA',
    location: { lat: 37.77, lon: -122.42 },
    timezone: 'America/Los_Angeles',
    climate: {
      winterTemp: { min: 8, max: 15 },
      springTemp: { min: 11, max: 18 },
      summerTemp: { min: 13, max: 22 },
      fallTemp: { min: 12, max: 20 },
      winterHumidity: 0.75,
      springHumidity: 0.7,
      summerHumidity: 0.65,
      fallHumidity: 0.7,
      airQuality: { typical: 45, variation: 15 },
      continentality: 0.1, // Very maritime
      maritimeInfluence: 0.9,
      pollutionLevel: 0.3,
    },
  },
  {
    id: 'denver',
    name: 'Denver',
    country: 'USA',
    location: { lat: 39.74, lon: -104.99 },
    timezone: 'America/Denver',
    climate: {
      winterTemp: { min: -8, max: 7 },
      springTemp: { min: 2, max: 18 },
      summerTemp: { min: 15, max: 30 },
      fallTemp: { min: 3, max: 20 },
      winterHumidity: 0.45,
      springHumidity: 0.5,
      summerHumidity: 0.4,
      fallHumidity: 0.45,
      airQuality: { typical: 45, variation: 15 }, // Better air quality for solar transmission
      continentality: 0.8, // High continental influence
      maritimeInfluence: 0.1,
      pollutionLevel: 0.2, // Lower pollution due to high altitude and clean air
    },
  },
  {
    id: 'los-angeles',
    name: 'Los Angeles',
    country: 'USA',
    location: { lat: 34.05, lon: -118.24 },
    timezone: 'America/Los_Angeles',
    climate: {
      winterTemp: { min: 9, max: 20 },
      springTemp: { min: 13, max: 24 },
      summerTemp: { min: 18, max: 28 },
      fallTemp: { min: 15, max: 26 },
      winterHumidity: 0.65,
      springHumidity: 0.6,
      summerHumidity: 0.55,
      fallHumidity: 0.6,
      airQuality: { typical: 65, variation: 25 },
      continentality: 0.3,
      maritimeInfluence: 0.6,
      pollutionLevel: 0.6, // Higher pollution
    },
  },
  {
    id: 'chicago',
    name: 'Chicago',
    country: 'USA',
    location: { lat: 41.88, lon: -87.63 },
    timezone: 'America/Chicago',
    climate: {
      winterTemp: { min: -9, max: 0 },
      springTemp: { min: 4, max: 17 },
      summerTemp: { min: 18, max: 29 },
      fallTemp: { min: 6, max: 18 },
      winterHumidity: 0.7,
      springHumidity: 0.65,
      summerHumidity: 0.6,
      fallHumidity: 0.65,
      airQuality: { typical: 70, variation: 20 },
      continentality: 0.7,
      maritimeInfluence: 0.2, // Some lake effect
      pollutionLevel: 0.5,
    },
  },
  {
    id: 'new-york',
    name: 'New York',
    country: 'USA',
    location: { lat: 40.71, lon: -74.01 },
    timezone: 'America/New_York',
    climate: {
      winterTemp: { min: -3, max: 6 },
      springTemp: { min: 8, max: 19 },
      summerTemp: { min: 20, max: 29 },
      fallTemp: { min: 10, max: 20 },
      winterHumidity: 0.65,
      springHumidity: 0.6,
      summerHumidity: 0.65,
      fallHumidity: 0.6,
      airQuality: { typical: 60, variation: 20 },
      continentality: 0.5,
      maritimeInfluence: 0.4,
      pollutionLevel: 0.5,
    },
  },
  {
    id: 'miami',
    name: 'Miami',
    country: 'USA',
    location: { lat: 25.76, lon: -80.19 },
    timezone: 'America/New_York',
    climate: {
      winterTemp: { min: 15, max: 24 },
      springTemp: { min: 20, max: 28 },
      summerTemp: { min: 24, max: 32 },
      fallTemp: { min: 21, max: 29 },
      winterHumidity: 0.75,
      springHumidity: 0.7,
      summerHumidity: 0.8,
      fallHumidity: 0.75,
      airQuality: { typical: 40, variation: 15 },
      continentality: 0.1, // Very maritime
      maritimeInfluence: 0.9,
      pollutionLevel: 0.3,
    },
  },
  {
    id: 'dallas',
    name: 'Dallas',
    country: 'USA',
    location: { lat: 32.78, lon: -96.8 },
    timezone: 'America/Chicago',
    climate: {
      winterTemp: { min: 2, max: 15 },
      springTemp: { min: 12, max: 26 },
      summerTemp: { min: 24, max: 36 },
      fallTemp: { min: 13, max: 27 },
      winterHumidity: 0.6,
      springHumidity: 0.65,
      summerHumidity: 0.55,
      fallHumidity: 0.6,
      airQuality: { typical: 75, variation: 25 },
      continentality: 0.7,
      maritimeInfluence: 0.1,
      pollutionLevel: 0.6,
    },
  },
  {
    id: 'london',
    name: 'London',
    country: 'UK',
    location: { lat: 51.51, lon: -0.13 },
    timezone: 'Europe/London',
    climate: {
      winterTemp: { min: 2, max: 8 },
      springTemp: { min: 6, max: 15 },
      summerTemp: { min: 12, max: 22 },
      fallTemp: { min: 7, max: 16 },
      winterHumidity: 0.85,
      springHumidity: 0.75,
      summerHumidity: 0.7,
      fallHumidity: 0.8,
      airQuality: { typical: 55, variation: 20 },
      continentality: 0.2,
      maritimeInfluence: 0.8,
      pollutionLevel: 0.4,
    },
  },
  {
    id: 'frankfurt',
    name: 'Frankfurt',
    country: 'Germany',
    location: { lat: 50.11, lon: 8.68 },
    timezone: 'Europe/Berlin',
    climate: {
      winterTemp: { min: -1, max: 4 },
      springTemp: { min: 5, max: 17 },
      summerTemp: { min: 14, max: 25 },
      fallTemp: { min: 6, max: 16 },
      winterHumidity: 0.8,
      springHumidity: 0.7,
      summerHumidity: 0.65,
      fallHumidity: 0.75,
      airQuality: { typical: 50, variation: 15 },
      continentality: 0.4,
      maritimeInfluence: 0.5,
      pollutionLevel: 0.4,
    },
  },
]

/**
 * Calculate solar elevation angle for given location, date, and time
 */
export function calculateSolarElevation(params: SolarCalculationParams): number {
  const { latitude, dayOfYear, hour, solarDeclination } = params

  // Convert to radians
  const latRad = (latitude * Math.PI) / 180
  const declRad = (solarDeclination * Math.PI) / 180

  // Hour angle (solar noon = 0, morning negative, afternoon positive)
  const hourAngle = ((hour - 12) * 15 * Math.PI) / 180

  // Solar elevation angle
  const elevation = Math.asin(
    Math.sin(latRad) * Math.sin(declRad) +
      Math.cos(latRad) * Math.cos(declRad) * Math.cos(hourAngle),
  )

  // Convert back to degrees and ensure positive
  return Math.max(0, (elevation * 180) / Math.PI)
}

/**
 * Calculate solar radiation based on solar elevation and atmospheric conditions
 * Enhanced for realistic Denver winter performance
 */
export function calculateSolarRadiation(
  solarElevation: number,
  latitude: number,
  season: string,
  airQuality: number,
): number {
  if (solarElevation <= 0) return 0

  // Base solar irradiance at top of atmosphere
  const solarConstant = 1361 // W/m²

  // Atmospheric transmission factors
  const elevationFactor = Math.sin((solarElevation * Math.PI) / 180)
  const airMassFactor = 1 / (elevationFactor + 0.01) // Approximate air mass

  // Improved atmospheric transmission for high altitude locations like Denver
  // Denver is at 1,609m elevation - much clearer air than sea level
  const altitudeBonus = Math.abs(latitude - 39.74) < 1 ? 1.1 : 1.0 // 10% bonus for Denver's altitude
  const baseTransmission = 0.78 // Better base transmission for clear air
  const atmosphericTransmission = Math.pow(baseTransmission, airMassFactor) * altitudeBonus

  // Air quality reduction (AQI affects solar transmission, but less severely)
  const aqiFactor = Math.max(0.5, 1 - (airQuality - 50) / 300) // Less aggressive AQI penalty

  // Improved seasonal atmospheric conditions - winter can still be very clear
  const seasonalFactor = season === 'winter' ? 0.95 : season === 'summer' ? 1.0 : 0.98

  // Realistic cloud cover based on location climate patterns
  // Denver has ~300 sunny days per year, so much less cloud cover
  const getCloudFactor = (lat: number, season: string) => {
    if (Math.abs(lat - 39.74) < 1) {
      // Denver area
      // Denver winter: 70% clear days, 20% partly cloudy, 10% overcast
      const clearSkyProbability = season === 'winter' ? 0.7 : 0.8
      const partlyCloudyProbability = season === 'winter' ? 0.2 : 0.15

      // Simple random selection based on hour to vary cloud conditions
      const hourSeed =
        (new Date().getHours() + Math.floor(new Date().getTime() / (24 * 60 * 60 * 1000))) % 10

      if (hourSeed < clearSkyProbability * 10) {
        return 0.95 // Clear sky - minimal cloud impact
      } else if (hourSeed < (clearSkyProbability + partlyCloudyProbability) * 10) {
        return 0.7 // Partly cloudy
      } else {
        return 0.3 // Overcast
      }
    } else {
      // Other locations - more conservative cloud modeling
      const baseCloudiness = 0.2 + 0.3 * Math.sin((lat / 180) * Math.PI)
      return 1 - baseCloudiness * 0.6
    }
  }

  const cloudFactor = getCloudFactor(latitude, season)

  const solarRadiation =
    solarConstant *
    elevationFactor *
    atmosphericTransmission *
    aqiFactor *
    seasonalFactor *
    cloudFactor

  return Math.round(Math.max(0, solarRadiation))
}

/**
 * Calculate day length for given latitude and solar declination
 */
export function calculateDayLength(latitude: number, solarDeclination: number): number {
  const latRad = (latitude * Math.PI) / 180
  const declRad = (solarDeclination * Math.PI) / 180

  // Hour angle at sunrise/sunset
  const cosHourAngle = -Math.tan(latRad) * Math.tan(declRad)

  // Prevent domain errors for polar regions
  if (cosHourAngle > 1) return 0 // Polar night
  if (cosHourAngle < -1) return 24 // Polar day

  const hourAngle = Math.acos(cosHourAngle)
  const dayLength = (2 * hourAngle * 12) / Math.PI

  return Math.round(dayLength * 10) / 10
}

/**
 * Determine season based on day of year
 */
export function getSeason(dayOfYear: number): 'winter' | 'spring' | 'summer' | 'fall' {
  // Meteorological seasons (approximate)
  if (dayOfYear >= 355 || dayOfYear <= 60) return 'winter' // Dec 21 - Feb 28
  if (dayOfYear >= 61 && dayOfYear <= 152) return 'spring' // Mar 1 - May 31
  if (dayOfYear >= 153 && dayOfYear <= 244) return 'summer' // Jun 1 - Aug 31
  return 'fall' // Sep 1 - Dec 20
}

/**
 * Generate enhanced climate data for a specific city, season, and hour
 */
export function generateEnhancedClimateData(
  cityId: string,
  seasonalDateId: string,
  hour: number,
): EnhancedClimateData {
  const city = CITIES.find((c) => c.id === cityId)
  const seasonalDate = SEASONAL_DATES.find((d) => d.id === seasonalDateId)

  if (!city || !seasonalDate) {
    throw new Error(`Invalid city (${cityId}) or seasonal date (${seasonalDateId})`)
  }

  const { climate, location } = city
  const season = getSeason(seasonalDate.dayOfYear)

  // Get seasonal temperature range
  const tempRange = (() => {
    switch (season) {
      case 'winter':
        return climate.winterTemp
      case 'spring':
        return climate.springTemp
      case 'summer':
        return climate.summerTemp
      case 'fall':
        return climate.fallTemp
      default:
        return climate.summerTemp
    }
  })()

  // Get seasonal humidity
  const baseHumidity = (() => {
    switch (season) {
      case 'winter':
        return climate.winterHumidity
      case 'spring':
        return climate.springHumidity
      case 'summer':
        return climate.summerHumidity
      case 'fall':
        return climate.fallHumidity
      default:
        return climate.summerHumidity
    }
  })()

  // Calculate daily temperature variation
  const dailyRange = tempRange.max - tempRange.min
  const continentalEffect = climate.continentality * 0.3 // Extra temperature swing
  const actualDailyRange = dailyRange * (1 + continentalEffect)

  // Temperature follows sinusoidal pattern (peak around 15:00)
  const tempPhase = ((hour - 6) / 24) * 2 * Math.PI
  const temperature = tempRange.min + (actualDailyRange / 2) * (1 + Math.sin(tempPhase))

  // Humidity inversely related to temperature
  const humidityVariation = (temperature - tempRange.min) / actualDailyRange
  const humidity = baseHumidity - humidityVariation * 0.2 * (1 - climate.maritimeInfluence)

  // Solar calculations
  const solarParams: SolarCalculationParams = {
    latitude: location.lat,
    dayOfYear: seasonalDate.dayOfYear,
    hour,
    solarDeclination: seasonalDate.solarDeclination,
  }

  const solarElevation = calculateSolarElevation(solarParams)
  const dayLength = calculateDayLength(location.lat, seasonalDate.solarDeclination)

  // Air quality with daily variation and pollution baseline
  const baseAQI = climate.airQuality.typical + climate.pollutionLevel * 30
  const hourlyVariation = Math.sin((hour - 8) * 0.5) * climate.airQuality.variation
  const airQualityIndex = Math.max(20, baseAQI + hourlyVariation)

  const solarRadiation = calculateSolarRadiation(
    solarElevation,
    location.lat,
    season,
    airQualityIndex,
  )

  // Debug logging for solar calculations at noon in Denver winter
  if (hour === 12 && cityId === 'denver' && seasonalDateId === 'winter-solstice') {
    console.log('🌞 Denver Winter Solstice Solar Debug:')
    console.log(`  Solar Elevation: ${solarElevation.toFixed(1)}°`)
    console.log(`  Solar Declination: ${seasonalDate.solarDeclination}°`)
    console.log(`  Day Length: ${dayLength.toFixed(1)} hours`)
    console.log(`  Air Quality Index: ${airQualityIndex}`)
    console.log(`  Calculated Solar Radiation: ${solarRadiation} W/m²`)
    console.log(`  Expected Range: 400-700 W/m² for clear winter day`)
  }

  // Wind speed (simplified)
  const windSpeed = 2 + Math.sin(hour * 0.3) * 3 * (1 - climate.maritimeInfluence)

  return {
    hour,
    temperature: Math.round(temperature * 10) / 10,
    humidity: Math.max(0.2, Math.min(0.95, Math.round(humidity * 100) / 100)),
    solarRadiation,
    airQualityIndex: Math.round(airQualityIndex),
    windSpeed: Math.round(windSpeed * 10) / 10,
    solarElevation: Math.round(solarElevation * 10) / 10,
    dayLength,
    season,
    cityId,
    seasonalDate: seasonalDate.date,
  }
}

/**
 * Get city by ID
 */
export function getCityById(cityId: string): City | undefined {
  return CITIES.find((c) => c.id === cityId)
}

/**
 * Get seasonal date by ID
 */
export function getSeasonalDateById(seasonalDateId: string): SeasonalDate | undefined {
  return SEASONAL_DATES.find((d) => d.id === seasonalDateId)
}
