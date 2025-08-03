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

  // Battery configuration
  const batteryCapacity = 20 // kWh total capacity
  const chargeRate = 5 // kW maximum charge rate
  const dischargeRate = 5 // kW maximum discharge rate
  const efficiency = 0.9 // 90% round-trip efficiency

  // Calculate current energy balance (excluding battery)
  const energyConsumed = energy.heatPumpKWh + energy.ervKWh
  const energyGenerated = energy.solarKWh
  const energyBalance = energyGenerated - energyConsumed

  // Current battery state - maintain charge level even when disabled
  let currentCharge = energy.batteryKWh
  let batteryEnergyFlow = 0 // Track energy flowing in/out of battery

  if (energyBalance > 0) {
    // Excess energy available - charge battery
    const maxChargeAmount = Math.min(
      energyBalance, // Available excess energy
      chargeRate * timestepHours, // Charge rate limit
      batteryCapacity - currentCharge, // Remaining battery capacity
    )

    const actualChargeAmount = maxChargeAmount * efficiency
    currentCharge += actualChargeAmount
    batteryEnergyFlow = actualChargeAmount // Positive = charging
  } else if (energyBalance < 0 && currentCharge > 0) {
    // Energy deficit and battery has charge - discharge battery
    const energyDeficit = Math.abs(energyBalance)
    const maxDischargeAmount = Math.min(
      energyDeficit, // Energy needed
      dischargeRate * timestepHours, // Discharge rate limit
      currentCharge, // Available battery charge
    )

    currentCharge -= maxDischargeAmount
    batteryEnergyFlow = -maxDischargeAmount // Negative = discharging
  }

  // Update battery state
  energy.batteryKWh = Math.max(0, Math.min(batteryCapacity, currentCharge))

  // Calculate final net energy flow to/from grid
  // Positive = importing from grid, Negative = exporting to grid
  const netEnergyAfterBattery = energyConsumed - energyGenerated - batteryEnergyFlow
  energy.netKWh = netEnergyAfterBattery

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
