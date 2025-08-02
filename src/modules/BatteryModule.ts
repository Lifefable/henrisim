import type { HouseState } from '@/types/simulation'

/**
 * Battery Module
 * Stores excess solar energy and offsets grid energy use
 * Simple charge/discharge cycle per hour
 */
export function simulateBattery(houseState: HouseState, timestepHours = 1, config?: any): HouseState {
  const { energy } = houseState

  // Battery configuration
  const batteryCapacity = 20 // kWh total capacity
  const chargeRate = 5 // kW maximum charge rate
  const dischargeRate = 5 // kW maximum discharge rate
  const efficiency = 0.9 // 90% round-trip efficiency

  // Calculate current energy balance (excluding battery)
  const energyNeeded = energy.heatPumpKWh + energy.ervKWh + (energy.iaqKWh || 0)
  const energyAvailable = energy.solarKWh
  const energyBalance = energyAvailable - energyNeeded

  // Current battery state (use existing batteryKWh as state of charge)
  let currentCharge = energy.batteryKWh

  if (energyBalance > 0) {
    // Excess energy available - charge battery
    const maxChargeAmount = Math.min(
      energyBalance * efficiency, // Available excess energy
      chargeRate * timestepHours, // Charge rate limit
      batteryCapacity - currentCharge, // Remaining battery capacity
    )
    currentCharge += maxChargeAmount
  } else if (energyBalance < 0) {
    // Energy deficit - discharge battery
    const energyDeficit = Math.abs(energyBalance)
    const maxDischargeAmount = Math.min(
      energyDeficit, // Energy needed
      dischargeRate * timestepHours, // Discharge rate limit
      currentCharge, // Available battery charge
    )
    currentCharge -= maxDischargeAmount

    // Discharged energy reduces net consumption
    energy.netKWh -= maxDischargeAmount
  }

  // Update battery state
  energy.batteryKWh = Math.max(0, Math.min(batteryCapacity, currentCharge))

  // Recalculate net energy with battery effects
  const finalEnergyBalance = energyNeeded - energyAvailable
  if (finalEnergyBalance > 0) {
    // Still need energy from grid after battery
    const gridEnergy = Math.max(
      0,
      finalEnergyBalance - (currentCharge > 0 ? Math.min(currentCharge, finalEnergyBalance) : 0),
    )
    energy.netKWh = gridEnergy
  } else {
    // Surplus energy after charging battery
    energy.netKWh = finalEnergyBalance
  }

  return houseState
}

/**
 * Create Battery simulation module
 */
export const createBatteryModule = () => ({
  name: 'battery',
  enabled: true,
  simulate: simulateBattery,
})
