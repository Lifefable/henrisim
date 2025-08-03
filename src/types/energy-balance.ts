// Enhanced Energy Balance Types based on Passive House Institute calibration standards

export interface EnergyBalanceComponents {
  // Heat Losses (kWh)
  losses: {
    externalWallAmbient: number
    externalWallGround: number
    roofCeilingAmbient: number
    floorSlabBasement: number
    unheatedGarage: number
    windows: number
    exteriorDoor: number
    ventilation: number
    total: number
  }

  // Heat Gains (kWh)
  gains: {
    solarGains: number
    internalHeatGains: number
    nonUsefulHeatGains: number
    total: number
  }

  // Net heating/cooling demand
  netDemand: {
    heating: number // PH (heating load)
    cooling: number // PC (cooling load)
  }

  // Area-specific loads (kWh/m²a)
  areaSpecific: {
    heatingLoad: number // PH/ATFA
    coolingLoad: number // PC/ATFA
    treatableFloorArea: number // ATFA (m²)
  }
}

export interface ThermalBridges {
  // Thermal bridge heat loss coefficients (W/K)
  foundation: number
  balcony: number
  roof: number
  windows: number
  total: number
}

export interface PassiveHouseMetrics {
  // Compliance metrics
  annualHeatingDemand: number // kWh/m²a (must be ≤ 15)
  annualCoolingDemand: number // kWh/m²a (must be ≤ 15)
  primaryEnergyDemand: number // kWh/m²a (must be ≤ 120)
  airtightness: number // n50 (must be ≤ 0.6 h⁻¹)

  // Performance indicators
  heatRecoveryEfficiency: number // % (must be ≥ 75%)
  temperatureAmplitude: number // K (must be ≤ 25K for comfort)
  overheatingFrequency: number // % of year above 25°C
}

export interface ClimateData {
  // Monthly climate data for energy calculations
  month: number
  outdoorTemperature: number // °C average
  solarRadiation: number // kWh/m²
  windSpeed: number // m/s
  humidity: number // %
  heatingDegreeDays: number // K·d
  coolingDegreeDays: number // K·d
}

export interface HVACSystemMetrics {
  heatPump: {
    seasonalCOP: number // SCOP
    capacity: number // kW
    supplyTemperature: {
      max: number // °C (typically 35-52°C for PH)
      current: number
    }
    partLoadFactor: number // 0-1
  }

  ventilation: {
    heatRecoveryEfficiency: number // %
    electricalEfficiency: number // Wh/m³
    frostProtection: boolean
    summerBypass: boolean
    flowRate: {
      supply: number // m³/h
      extract: number // m³/h
    }
  }
}

export interface BuildingZones {
  heatedArea: number // m² ATFA
  volume: number // m³
  occupancy: number // persons
  internalGains: {
    people: number // W/person (typically 70W)
    lighting: number // W/m²
    equipment: number // W/m²
    total: number // W
  }
}
