import type { HouseState } from '@/types/simulation'
import type {
  EnergyBalanceComponents,
  ThermalBridges,
  PassiveHouseMetrics,
  HVACSystemMetrics,
  BuildingZones,
} from '@/types/energy-balance'

/**
 * Enhanced Energy Balance Calculator
 * Based on Passive House Institute energy balance methodology
 * Implements detailed heat loss/gain calculations from calibration charts
 */
export class EnergyBalanceCalculator {
  private buildingZones: BuildingZones
  private thermalBridges: ThermalBridges

  constructor(zones: BuildingZones, bridges: ThermalBridges) {
    this.buildingZones = zones
    this.thermalBridges = bridges
  }

  /**
   * Calculate detailed energy balance matching calibration chart methodology
   */
  calculateEnergyBalance(
    houseState: HouseState,
    timestepHours: number = 1,
  ): EnergyBalanceComponents {
    const { indoor, outdoor, envelope } = houseState
    const tempDiff = indoor.temperature - outdoor.temperature

    // === HEAT LOSSES (matching chart categories) ===
    const losses = {
      // External wall - Ambient
      externalWallAmbient: this.calculateWallLoss(
        tempDiff,
        envelope.wallR,
        envelope.floorArea * 0.6, // Estimated wall area
        timestepHours,
      ),

      // External wall - Ground (basement walls)
      externalWallGround: this.calculateGroundLoss(
        tempDiff,
        envelope.floorR,
        envelope.floorArea * 0.2, // Estimated basement wall area
        timestepHours,
      ),

      // Roof/Ceiling - Ambient
      roofCeilingAmbient: this.calculateRoofLoss(
        tempDiff,
        envelope.roofR,
        envelope.floorArea,
        timestepHours,
      ),

      // Floor slab / Basement ceiling
      floorSlabBasement: this.calculateFloorSlabLoss(
        tempDiff,
        envelope.floorR,
        envelope.floorArea,
        timestepHours,
      ),

      // Unheated garage (if applicable)
      unheatedGarage: this.calculateUnheatedSpaceLoss(
        tempDiff,
        envelope.floorArea * 0.1, // Assume 10% garage interface
        timestepHours,
      ),

      // Windows
      windows: this.calculateWindowLoss(
        tempDiff,
        envelope.windowU,
        envelope.windowArea,
        timestepHours,
      ),

      // Exterior door
      exteriorDoor: this.calculateDoorLoss(
        tempDiff,
        2.0, // Typical door U-value W/m²K
        4.0, // Typical door area m²
        timestepHours,
      ),

      // Ventilation heat loss
      ventilation: this.calculateVentilationLoss(
        tempDiff,
        envelope.infiltrationRate,
        this.buildingZones.volume,
        timestepHours,
      ),

      total: 0, // Will be calculated
    }

    // Add thermal bridge losses
    const thermalBridgeLoss = this.calculateThermalBridgeLoss(tempDiff, timestepHours)
    losses.externalWallAmbient += thermalBridgeLoss * 0.4 // Distribute thermal bridges
    losses.roofCeilingAmbient += thermalBridgeLoss * 0.3
    losses.windows += thermalBridgeLoss * 0.3

    losses.total = Object.values(losses).reduce(
      (sum, loss) => (typeof loss === 'number' ? sum + loss : sum),
      0,
    )

    // === HEAT GAINS (matching chart categories) ===
    const gains = {
      // Solar gains through windows
      solarGains: this.calculateSolarGains(
        outdoor.solarRadiation,
        envelope.windowArea,
        timestepHours,
      ),

      // Internal heat gains (people, lighting, equipment)
      internalHeatGains: this.calculateInternalGains(timestepHours),

      // Non-useful heat gains (heat that contributes to overheating)
      nonUsefulHeatGains: this.calculateNonUsefulGains(
        outdoor.temperature,
        indoor.temperature,
        timestepHours,
      ),

      total: 0, // Will be calculated
    }

    gains.total = gains.solarGains + gains.internalHeatGains + gains.nonUsefulHeatGains

    // === NET DEMAND CALCULATION ===
    const netHeatingDemand = Math.max(0, losses.total - gains.total)
    const netCoolingDemand = Math.max(0, gains.total - losses.total)

    return {
      losses,
      gains,
      netDemand: {
        heating: netHeatingDemand,
        cooling: netCoolingDemand,
      },
      areaSpecific: {
        heatingLoad: netHeatingDemand / this.buildingZones.heatedArea,
        coolingLoad: netCoolingDemand / this.buildingZones.heatedArea,
        treatableFloorArea: this.buildingZones.heatedArea,
      },
    }
  }

  // === DETAILED LOSS CALCULATIONS ===

  private calculateWallLoss(
    tempDiff: number,
    rValue: number,
    area: number,
    timestep: number,
  ): number {
    const uValue = 1 / rValue // W/m²K
    return (Math.abs(tempDiff) * uValue * area * timestep) / 1000 // Convert to kWh
  }

  private calculateGroundLoss(
    tempDiff: number,
    rValue: number,
    area: number,
    timestep: number,
  ): number {
    // Ground temperature is more stable, use reduced temperature difference
    const reducedTempDiff = tempDiff * 0.6
    const uValue = 1 / rValue
    return (Math.abs(reducedTempDiff) * uValue * area * timestep) / 1000
  }

  private calculateRoofLoss(
    tempDiff: number,
    rValue: number,
    area: number,
    timestep: number,
  ): number {
    const uValue = 1 / rValue
    // Roof exposed to ambient, full temperature difference
    return (Math.abs(tempDiff) * uValue * area * timestep) / 1000
  }

  private calculateFloorSlabLoss(
    tempDiff: number,
    rValue: number,
    area: number,
    timestep: number,
  ): number {
    // Floor slab to ground, reduced temperature difference
    const groundTempDiff = tempDiff * 0.5
    const uValue = 1 / rValue
    return (Math.abs(groundTempDiff) * uValue * area * timestep) / 1000
  }

  private calculateUnheatedSpaceLoss(tempDiff: number, area: number, timestep: number): number {
    // Unheated space typically 50-70% of outdoor temperature difference
    const reducedTempDiff = tempDiff * 0.6
    const uValue = 0.5 // Typical U-value for unheated space interface
    return (Math.abs(reducedTempDiff) * uValue * area * timestep) / 1000
  }

  private calculateWindowLoss(
    tempDiff: number,
    uValue: number,
    area: number,
    timestep: number,
  ): number {
    return (Math.abs(tempDiff) * uValue * area * timestep) / 1000
  }

  private calculateDoorLoss(
    tempDiff: number,
    uValue: number,
    area: number,
    timestep: number,
  ): number {
    return (Math.abs(tempDiff) * uValue * area * timestep) / 1000
  }

  private calculateVentilationLoss(
    tempDiff: number,
    achRate: number,
    volume: number,
    timestep: number,
  ): number {
    const airDensity = 1.2 // kg/m³
    const specificHeat = 1.005 // kJ/kg·K
    const volumeFlow = (achRate * volume) / 3600 // m³/s
    const massFlow = volumeFlow * airDensity // kg/s

    // Heat loss in Watts
    const heatLossW = Math.abs(tempDiff) * massFlow * specificHeat * 1000

    // Convert to kWh
    return (heatLossW * timestep) / 1000000
  }

  private calculateThermalBridgeLoss(tempDiff: number, timestep: number): number {
    // Total thermal bridge heat transfer coefficient (W/K)
    const totalPsiValue = this.thermalBridges.total
    const heatLossW = Math.abs(tempDiff) * totalPsiValue
    return (heatLossW * timestep) / 1000 // Convert to kWh
  }

  // === HEAT GAIN CALCULATIONS ===

  private calculateSolarGains(
    solarRadiation: number,
    windowArea: number,
    timestep: number,
  ): number {
    const solarHeatGainCoeff = 0.6 // SHGC for typical PH windows
    const frameReduction = 0.9 // 10% reduction for frames

    // Solar radiation W/m² * area * SHGC * frame factor * timestep
    const solarGainW = solarRadiation * windowArea * solarHeatGainCoeff * frameReduction
    return (solarGainW * timestep) / 1000 // Convert to kWh
  }

  private calculateInternalGains(timestep: number): number {
    // Internal gains from people, lighting, equipment
    const totalInternalGainsW = this.buildingZones.internalGains.total
    return (totalInternalGainsW * timestep) / 1000 // Convert to kWh
  }

  private calculateNonUsefulGains(
    outdoorTemp: number,
    indoorTemp: number,
    timestep: number,
  ): number {
    // Non-useful gains contribute to overheating when outdoor temp > comfort range
    if (outdoorTemp > 25 && indoorTemp > 25) {
      const excessGains = Math.max(0, (indoorTemp - 25) * this.buildingZones.heatedArea * 0.05)
      return (excessGains * timestep) / 1000
    }
    return 0
  }

  /**
   * Calculate Passive House compliance metrics
   */
  calculatePassiveHouseMetrics(
    annualEnergyBalance: EnergyBalanceComponents[],
    hvacMetrics: HVACSystemMetrics,
  ): PassiveHouseMetrics {
    const totalHeating = annualEnergyBalance.reduce(
      (sum, balance) => sum + balance.netDemand.heating,
      0,
    )
    const totalCooling = annualEnergyBalance.reduce(
      (sum, balance) => sum + balance.netDemand.cooling,
      0,
    )

    const heatedArea = this.buildingZones.heatedArea

    return {
      annualHeatingDemand: totalHeating / heatedArea,
      annualCoolingDemand: totalCooling / heatedArea,
      primaryEnergyDemand: this.calculatePrimaryEnergy(totalHeating, totalCooling, hvacMetrics),
      airtightness: 0.5, // This would come from blower door test
      heatRecoveryEfficiency: hvacMetrics.ventilation.heatRecoveryEfficiency,
      temperatureAmplitude: this.calculateTemperatureAmplitude(),
      overheatingFrequency: this.calculateOverheatingFrequency(),
    }
  }

  private calculatePrimaryEnergy(
    heating: number,
    cooling: number,
    hvac: HVACSystemMetrics,
  ): number {
    // Simplified primary energy calculation
    const electricityFactor = 2.6 // Primary energy factor for electricity
    const totalElectricity =
      heating / hvac.heatPump.seasonalCOP + cooling / hvac.heatPump.seasonalCOP

    return (totalElectricity * electricityFactor) / this.buildingZones.heatedArea
  }

  private calculateTemperatureAmplitude(): number {
    // This would be calculated from annual temperature variations
    return 20 // Placeholder - should be < 25K for PH compliance
  }

  private calculateOverheatingFrequency(): number {
    // Percentage of year above 25°C
    return 5 // Placeholder - should be calculated from annual simulation
  }
}

/**
 * Default building configuration for passive house
 */
export const createDefaultBuildingZones = (): BuildingZones => ({
  heatedArea: 150, // m² ATFA
  volume: 375, // m³ (150m² × 2.5m height)
  occupancy: 4, // persons
  internalGains: {
    people: 70, // W/person
    lighting: 3, // W/m²
    equipment: 5, // W/m²
    total: 4 * 70 + 150 * 3 + 150 * 5, // 1480W total
  },
})

/**
 * Default thermal bridge configuration
 */
export const createDefaultThermalBridges = (): ThermalBridges => ({
  foundation: 15, // W/K
  balcony: 5, // W/K
  roof: 8, // W/K
  windows: 12, // W/K
  total: 40, // W/K
})
