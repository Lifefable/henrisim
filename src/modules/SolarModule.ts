import type { HouseState } from '@/types/simulation'

/**
 * Solar Module
 * Generates solar energy based on solarRadiation and panelArea
 * Adds passive heat gain proportional to window area and orientation
 */
export function simulateSolar(houseState: HouseState, timestepHours = 1): HouseState {
  const { indoor, outdoor, envelope, energy } = houseState

  // Solar panel configuration
  const panelArea = 40 // m² of solar panels
  const panelEfficiency = 0.2 // 20% efficiency
  const inverterEfficiency = 0.95 // 95% inverter efficiency

  // Window solar gain configuration
  const windowSolarHeatGainCoeff = 0.4 // SHGC for windows
  const windowOrientation = 1.0 // South-facing factor (1.0 = perfect south)

  // Calculate solar energy generation
  const solarRadiationKW = outdoor.solarRadiation / 1000 // Convert W/m² to kW/m²
  const solarEnergyGenerated =
    panelArea * solarRadiationKW * panelEfficiency * inverterEfficiency * timestepHours

  // Calculate passive solar heat gain through windows
  const windowSolarGain =
    envelope.windowArea * solarRadiationKW * windowSolarHeatGainCoeff * windowOrientation
  const passiveHeatGain = windowSolarGain * timestepHours

  // Convert passive heat to temperature increase
  const thermalMass = envelope.floorArea * 0.3 // Simplified thermal mass
  const temperatureIncrease = (passiveHeatGain / thermalMass) * 0.1 // Simplified conversion

  // Apply solar gains
  energy.solarKWh += solarEnergyGenerated
  indoor.temperature += temperatureIncrease

  // Update net energy (solar is negative consumption)
  energy.netKWh = energy.heatPumpKWh + energy.ervKWh - energy.solarKWh

  return houseState
}

/**
 * Create Solar simulation module
 */
export const createSolarModule = () => ({
  name: 'solar',
  enabled: true,
  simulate: simulateSolar,
})
