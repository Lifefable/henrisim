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

  // Get target temperature from module config (passed from store)
  const targetTemp = config?.targetTemperature || 21
  const heatPumpCOP = config?.efficiency || 3.5 // Use adaptive COP from store
  const heatPumpCapacity = 18 // kW maximum capacity - increased for better control

  // Calculate required heating/cooling to reach target
  const tempDifference = targetTemp - indoor.temperature

  // Improved heat pump sizing calculation based on building thermal mass and heat loss
  const buildingThermalMass = envelope.floorArea * 0.5 // kWh/K (increased thermal mass)
  const heatLossRate = Math.abs(tempDifference) * envelope.floorArea * 0.12 // W/K (realistic heat loss)

  // Calculate required energy accounting for both temperature change and ongoing losses
  const tempChangeEnergy = Math.abs(tempDifference) * buildingThermalMass
  const continuousLossEnergy = (heatLossRate * timestepHours) / 1000 // kWh
  const totalRequiredEnergy = tempChangeEnergy + continuousLossEnergy

  const requiredEnergyKW = totalRequiredEnergy / timestepHours

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

    // More realistic temperature change calculation
    const heatDelivered = actualEnergyKW * timestepHours
    temperatureChange = heatDelivered / buildingThermalMass

    // Apply proportional control to prevent overshoot
    const maxTempChange = Math.abs(tempDifference) * 0.8 // Limit to 80% of difference per timestep
    temperatureChange = Math.min(temperatureChange, maxTempChange)

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
