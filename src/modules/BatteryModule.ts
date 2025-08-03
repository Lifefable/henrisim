import type { HouseState } from '@/types/simulation'

/**
 * Battery Module
 * Stores excess solar energy and provides energy when needed
 * Simple charge/discharge cycle per hour
 */
export function simulateBattery(
  houseState: HouseState,
  timestepHours = 1,
  config?: any,
): HouseState {
  const { energy } = houseState

  // Battery configuration - More realistic rates
  const batteryCapacity = 20 // kWh total capacity
  const chargeRate = 3.5 // kW maximum charge rate (3.5 kWh per hour)
  const dischargeRate = 3.5 // kW maximum discharge rate (3.5 kWh per hour)
  const efficiency = 0.92 // 92% round-trip efficiency

  // Calculate current energy balance (excluding battery)
  const energyConsumed = energy.heatPumpKWh + energy.ervKWh
  const energyGenerated = energy.solarKWh
  const energyBalance = energyGenerated - energyConsumed

  // Current battery state - maintain charge level even when disabled
  let currentCharge = energy.batteryKWh
  let batteryEnergyFlow = 0 // Track energy flowing in/out of battery

  if (energyBalance > 0.1) {
    // Excess energy available - charge battery (only if meaningful surplus)
    const maxChargeAmount = Math.min(
      energyBalance, // Available excess energy
      chargeRate * timestepHours, // Charge rate limit (realistic)
      batteryCapacity - currentCharge, // Remaining battery capacity
    )

    if (maxChargeAmount > 0.05) { // Only charge if meaningful amount
      const actualChargeAmount = maxChargeAmount * efficiency
      currentCharge += actualChargeAmount
      batteryEnergyFlow = actualChargeAmount // Positive = charging
    }
  } else if (energyBalance < -0.1 && currentCharge > 0.1) {
    // Energy deficit and battery has meaningful charge - discharge battery
    const energyDeficit = Math.abs(energyBalance)
    const maxDischargeAmount = Math.min(
      energyDeficit, // Energy needed
      dischargeRate * timestepHours, // Discharge rate limit (realistic)
      currentCharge, // Available battery charge
    )

    if (maxDischargeAmount > 0.05) { // Only discharge if meaningful amount
      currentCharge -= maxDischargeAmount
      batteryEnergyFlow = -maxDischargeAmount // Negative = discharging
    }
  }

  // Update battery state with proper bounds checking
  energy.batteryKWh = Math.max(0, Math.min(batteryCapacity, currentCharge))

  // Calculate final net energy flow to/from grid
  // After battery operations, remaining energy deficit/surplus goes to/from grid
  // Positive = importing from grid, Negative = exporting to grid
  const finalEnergyBalance = energyBalance - batteryEnergyFlow
  energy.netKWh = finalEnergyBalance

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
