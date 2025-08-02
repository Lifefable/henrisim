import type { HouseState } from '@/types/simulation'

/**
 * Heat Pump Module
 * Calculates heat loss/gain and energy consumption
 * Adjusts indoor temperature toward target
 */
export function simulateHeatPump(houseState: HouseState, timestepHours = 1): HouseState {
  const { indoor, outdoor, envelope, energy } = houseState

  // Get target temperature from module config (will be passed from store)
  const targetTemp = 21 // Default target, should come from config
  const heatPumpCOP = 3.5 // Coefficient of Performance
  const heatPumpCapacity = 12 // kW maximum capacity

  // Calculate heat loss through building envelope
  const heatLoss = calculateHeatLoss(indoor, outdoor, envelope)

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
  }

  // Apply heat loss
  const heatLossEffect = (heatLoss * timestepHours) / (envelope.floorArea * 0.3)

  // Update indoor temperature
  indoor.temperature += temperatureChange - heatLossEffect

  // Update energy consumption
  energy.heatPumpKWh += energyUsed

  // Update net energy
  energy.netKWh = energy.heatPumpKWh + energy.ervKWh - energy.solarKWh

  return houseState
}

/**
 * Calculate heat loss through building envelope
 */
function calculateHeatLoss(
  indoor: HouseState['indoor'],
  outdoor: HouseState['outdoor'],
  envelope: HouseState['envelope'],
): number {
  const tempDiff = indoor.temperature - outdoor.temperature

  // Heat loss through walls, roof, floor (simplified)
  const wallLoss = (tempDiff / envelope.wallR) * envelope.floorArea * 0.6 // Assume 60% wall area
  const roofLoss = (tempDiff / envelope.roofR) * envelope.floorArea
  const floorLoss = (tempDiff / envelope.floorR) * envelope.floorArea

  // Heat loss through windows
  const windowLoss = tempDiff * envelope.windowU * envelope.windowArea

  // Infiltration heat loss
  const airDensity = 1.2 // kg/m³
  const specificHeat = 1.005 // kJ/kg·K
  const houseVolume = envelope.floorArea * 2.5 // Assume 2.5m ceiling height
  const infiltrationFlow = (envelope.infiltrationRate * houseVolume) / 3600 // m³/s
  const infiltrationLoss = tempDiff * airDensity * specificHeat * infiltrationFlow

  const totalHeatLoss = wallLoss + roofLoss + floorLoss + windowLoss + infiltrationLoss

  return Math.max(0, totalHeatLoss) // Heat loss, not gain
}

/**
 * Create Heat Pump simulation module
 */
export const createHeatPumpModule = () => ({
  name: 'heatPump',
  enabled: true,
  simulate: simulateHeatPump,
})
