import type { HouseState } from '@/types/simulation'

/**
 * ERV (Energy Recovery Ventilation) Module
 * Improves indoor air quality toward 1.0
 * Adds small energy cost for fans
 * Recovers ~70% of thermal difference
 */
export function simulateERV(houseState: HouseState, timestepHours = 1): HouseState {
  const { indoor, outdoor, envelope, energy } = houseState

  // ERV Configuration
  const ervEfficiency = 0.7 // 70% heat recovery efficiency
  const fanPower = 0.15 // kW (150W for fans)
  const ventilationRate = 200 // m³/h fresh air
  const maxAirQuality = 0.95 // Maximum achievable with ERV

  // Calculate air quality improvement
  const outdoorAQNormalized = Math.max(0.3, 1 - outdoor.airQualityIndex / 150) // Convert AQI to 0-1 scale
  const freshAirFraction = ventilationRate / (envelope.floorArea * 2.5) / envelope.infiltrationRate

  // Air quality mixing calculation
  const airQualityImprovement = (outdoorAQNormalized - indoor.airQuality) * freshAirFraction * 0.1
  indoor.airQuality = Math.min(
    maxAirQuality,
    indoor.airQuality + airQualityImprovement * timestepHours,
  )

  // Thermal recovery calculation
  const tempDifference = outdoor.temperature - indoor.temperature
  const thermalRecovery = tempDifference * ervEfficiency * 0.1 // Simplified heat transfer

  // Apply recovered heat (small effect on indoor temperature)
  const thermalMass = envelope.floorArea * 0.3 // Simplified thermal mass
  const temperatureChange = (thermalRecovery * timestepHours) / thermalMass
  indoor.temperature += temperatureChange

  // Humidity exchange (ERV also recovers some humidity)
  const humidityDifference = outdoor.humidity - indoor.humidity
  const humidityRecovery = humidityDifference * ervEfficiency * 0.05
  indoor.humidity += humidityRecovery * timestepHours
  indoor.humidity = Math.max(0.2, Math.min(0.8, indoor.humidity)) // Keep within reasonable bounds

  // Energy consumption for fans
  const energyUsed = fanPower * timestepHours
  energy.ervKWh += energyUsed

  // Update net energy
  energy.netKWh = energy.heatPumpKWh + energy.ervKWh - energy.solarKWh

  return houseState
}

/**
 * Create ERV simulation module
 */
export const createERVModule = () => ({
  name: 'erv',
  enabled: true,
  simulate: simulateERV,
})
