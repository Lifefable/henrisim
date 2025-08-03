import type { HouseState } from '@/types/simulation'

/**
 * ERV (Energy Recovery Ventilation) Module
 * Improves indoor air quality toward 1.0
 * Adds small energy cost for fans
 * Recovers thermal energy based on configuration
 * Now adaptive to environmental conditions
 */
export function simulateERV(houseState: HouseState, timestepHours = 1, config?: any): HouseState {
  const { indoor, outdoor, envelope, energy } = houseState

  // ERV Configuration - now uses dynamic config if provided
  const ervEfficiency = config?.efficiency || 0.7 // 70% heat recovery efficiency (adaptive)
  const fanPower = (config?.fanPower || 150) / 1000 // kW (adaptive fan power)
  const ventilationRate = config?.flowRate || 200 // m³/h fresh air (adaptive)
  const maxAirQuality = 0.95 // Maximum achievable with ERV

  // Emergency mode adjustments
  if (houseState.safety.smokeEvent) {
    // In emergency mode, prioritize air evacuation over energy efficiency
    const emergencyFlowRate = ventilationRate * 2 // Double the flow rate
    const emergencyFanPower = fanPower * 1.5 // Increase fan power

    // More aggressive air quality improvement in emergency
    const outdoorAQNormalized = Math.max(0.1, 1 - outdoor.airQualityIndex / 100) // Less conservative in emergency
    const freshAirFraction =
      emergencyFlowRate / (envelope.floorArea * 2.5) / envelope.infiltrationRate

    const airQualityImprovement = (outdoorAQNormalized - indoor.airQuality) * freshAirFraction * 0.2 // Double improvement rate
    indoor.airQuality = Math.min(
      maxAirQuality,
      indoor.airQuality + airQualityImprovement * timestepHours,
    )

    // Reduced thermal recovery in emergency mode (focus on air exchange)
    const tempDifference = outdoor.temperature - indoor.temperature
    const thermalRecovery = tempDifference * (ervEfficiency * 0.5) * 0.1 // Reduced efficiency

    const thermalMass = envelope.floorArea * 0.3
    const temperatureChange = (thermalRecovery * timestepHours) / thermalMass
    indoor.temperature += temperatureChange

    // Higher energy consumption in emergency
    const energyUsed = emergencyFanPower * timestepHours
    energy.ervKWh += energyUsed

    return houseState
  }

  // Normal operation with adaptive parameters
  // Calculate air quality improvement
  const outdoorAQNormalized = Math.max(0.3, 1 - outdoor.airQualityIndex / 150) // Convert AQI to 0-1 scale
  const freshAirFraction = ventilationRate / (envelope.floorArea * 2.5) / envelope.infiltrationRate

  // Air quality mixing calculation - adaptive based on outdoor conditions
  let airQualityImprovement = (outdoorAQNormalized - indoor.airQuality) * freshAirFraction * 0.1

  // Reduce improvement rate if outdoor air quality is poor
  if (outdoor.airQualityIndex > 100) {
    airQualityImprovement *= 0.5 // Reduce by half when outdoor air is poor
  }

  indoor.airQuality = Math.min(
    maxAirQuality,
    indoor.airQuality + airQualityImprovement * timestepHours,
  )

  // Thermal recovery calculation - adaptive efficiency
  const tempDifference = outdoor.temperature - indoor.temperature
  const thermalRecovery = tempDifference * ervEfficiency * 0.1 // Uses adaptive efficiency

  // Apply recovered heat (small effect on indoor temperature)
  const thermalMass = envelope.floorArea * 0.3 // Simplified thermal mass
  const temperatureChange = (thermalRecovery * timestepHours) / thermalMass
  indoor.temperature += temperatureChange

  // Humidity exchange (ERV also recovers some humidity) - adaptive
  const humidityDifference = outdoor.humidity - indoor.humidity
  const humidityRecovery = humidityDifference * ervEfficiency * 0.05
  indoor.humidity += humidityRecovery * timestepHours
  indoor.humidity = Math.max(0.2, Math.min(0.8, indoor.humidity)) // Keep within reasonable bounds

  // Energy consumption for fans - adaptive based on configuration
  const energyUsed = fanPower * timestepHours
  energy.ervKWh += energyUsed

  // Don't update net energy here - let battery module handle final net calculation
  // energy.netKWh = energy.heatPumpKWh + energy.ervKWh - energy.solarKWh

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
