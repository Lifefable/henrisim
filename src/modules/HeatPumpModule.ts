import type { HouseState } from '@/types/simulation'

/**
 * Heat Pump Module
 * Calculates heating/cooling energy consumption and maintains target temperature
 * NOTE: Heat loss is now handled by passive physics in the main simulation
 */
export function simulateHeatPump(
  houseState: HouseState,
  timestepHours = 1,
  config?: any,
): HouseState {
  const { indoor, outdoor, envelope, energy } = houseState

  // Get target temperature from module config (will be passed from store)
  const targetTemp = 21 // Default target, should come from config
  const heatPumpCOP = 3.5 // Coefficient of Performance
  const heatPumpCapacity = 12 // kW maximum capacity

  // Calculate required heating/cooling to reach target
  const tempDifference = targetTemp - indoor.temperature
  const requiredEnergyKW = Math.abs(tempDifference) * envelope.floorArea * 0.1 // Simplified

  // Determine if heating or cooling is needed
  const isCooling = tempDifference < 0

  let energyUsed = 0
  let temperatureChange = 0

  if (Math.abs(tempDifference) > 0.1) {
    // Only run if significant difference
    // Limit energy use to heat pump capacity
    const actualEnergyKW = Math.min(requiredEnergyKW, heatPumpCapacity)

    // Calculate electrical energy consumption (COP accounts for efficiency)
    energyUsed = (actualEnergyKW / heatPumpCOP) * timestepHours

    // Calculate temperature change achieved
    const heatDelivered = actualEnergyKW * timestepHours
    temperatureChange = heatDelivered / (envelope.floorArea * 0.3) // Simplified thermal mass

    if (isCooling) {
      temperatureChange = -temperatureChange
    }

    // Apply temperature change from heat pump operation
    indoor.temperature += temperatureChange
  }

  // Update energy consumption
  energy.heatPumpKWh += energyUsed

  // Don't update net energy here - let battery module handle final net calculation
  // energy.netKWh = energy.heatPumpKWh + energy.ervKWh - energy.solarKWh

  return houseState
}

/**
 * Create Heat Pump simulation module
 */
export const createHeatPumpModule = () => ({
  name: 'heatPump',
  enabled: true,
  simulate: simulateHeatPump,
})
