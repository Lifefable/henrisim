import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

// Building envelope configuration with realistic Passive House defaults
export interface BuildingConfig {
  floorArea: number // m²
  wallR: number // m²·K/W
  roofR: number // m²·K/W
  floorR: number // m²·K/W
  windowU: number // W/m²·K
  windowArea: number // m²
  infiltrationRate: number // ACH
  ceilingHeight: number // m
}

// HVAC system configuration with realistic defaults
export interface HVACConfig {
  heatPump: {
    capacity: number // kW
    copHeating: number // Coefficient of Performance (heating)
    copCooling: number // Coefficient of Performance (cooling)
    targetTempMin: number // °C
    targetTempMax: number // °C
  }
  erv: {
    flowRate: number // m³/h
    efficiency: number // 0-1 (heat recovery efficiency)
    fanPower: number // W
  }
  solar: {
    panelArea: number // m²
    panelEfficiency: number // 0-1
    inverterEfficiency: number // 0-1
    windowSHGC: number // Solar Heat Gain Coefficient
  }
  battery: {
    capacity: number // kWh
    chargeRate: number // kW
    dischargeRate: number // kW
    efficiency: number // 0-1 (round-trip efficiency)
  }
}

// Building zones and internal gains
export interface BuildingZonesConfig {
  occupancy: number // persons
  internalGains: {
    people: number // W/person
    lighting: number // W/m²
    equipment: number // W/m²
  }
}

// Thermal bridges configuration
export interface ThermalBridgesConfig {
  foundation: number // W/K
  balcony: number // W/K
  roof: number // W/K
  windows: number // W/K
}

// Default realistic Passive House configuration
const createDefaultBuildingConfig = (): BuildingConfig => ({
  floorArea: 150, // m² - Typical family home
  wallR: 5.0, // m²·K/W - R-28 in US units (good PH insulation)
  roofR: 7.0, // m²·K/W - R-40 in US units (excellent PH insulation)
  floorR: 4.0, // m²·K/W - R-23 in US units (good PH insulation)
  windowU: 0.8, // W/m²·K - Excellent triple-glazed PH windows
  windowArea: 20, // m² - ~13% window-to-floor ratio (reasonable)
  infiltrationRate: 0.3, // ACH - Very tight construction (PH standard ≤0.6)
  ceilingHeight: 2.5, // m - Standard residential ceiling height
})

const createDefaultHVACConfig = (): HVACConfig => ({
  heatPump: {
    capacity: 3.0, // kW - Realistic for 150m² PH (was 18kW - way oversized!)
    copHeating: 3.5, // Realistic modern heat pump COP
    copCooling: 4.0, // Slightly better COP for cooling
    targetTempMin: 19, // °C - Minimum comfortable temperature
    targetTempMax: 22, // °C - Maximum comfortable temperature
  },
  erv: {
    flowRate: 150, // m³/h - 0.4 ACH for 375m³ volume (was 200-400 - oversized!)
    efficiency: 0.75, // 75% heat recovery (PH standard ≥75%)
    fanPower: 50, // W - Efficient EC motor (was 150W - oversized!)
  },
  solar: {
    panelArea: 25, // m² - More realistic for residential (was 40m²)
    panelEfficiency: 0.2, // 20% - Good modern panels
    inverterEfficiency: 0.95, // 95% - High-quality inverter
    windowSHGC: 0.4, // Solar Heat Gain Coefficient for PH windows
  },
  battery: {
    capacity: 15, // kWh - More typical residential size (was 20kWh)
    chargeRate: 3.0, // kW - Realistic charge rate (was 3.5kW)
    dischargeRate: 3.0, // kW - Realistic discharge rate
    efficiency: 0.92, // 92% round-trip efficiency
  },
})

const createDefaultBuildingZonesConfig = (): BuildingZonesConfig => ({
  occupancy: 4, // persons - Typical family
  internalGains: {
    people: 70, // W/person - Metabolic heat output
    lighting: 3, // W/m² - Efficient LED lighting
    equipment: 5, // W/m² - Appliances and electronics
  },
})

const createDefaultThermalBridgesConfig = (): ThermalBridgesConfig => ({
  foundation: 8, // W/K - Reduced from 15 (better PH construction)
  balcony: 2, // W/K - Reduced from 5 (thermal break design)
  roof: 4, // W/K - Reduced from 8 (better details)
  windows: 6, // W/K - Reduced from 12 (better installation)
})

export const useConfigurationStore = defineStore('configuration', () => {
  // Configuration state
  const building = reactive<BuildingConfig>(createDefaultBuildingConfig())
  const hvac = reactive<HVACConfig>(createDefaultHVACConfig())
  const buildingZones = reactive<BuildingZonesConfig>(createDefaultBuildingZonesConfig())
  const thermalBridges = reactive<ThermalBridgesConfig>(createDefaultThermalBridgesConfig())

  // UI state
  const isEditing = ref(false)
  const hasUnsavedChanges = ref(false)

  // Validation ranges for parameters
  const validationRanges = {
    building: {
      floorArea: { min: 50, max: 500, unit: 'm²' },
      wallR: { min: 2.0, max: 10.0, unit: 'm²·K/W' },
      roofR: { min: 3.0, max: 15.0, unit: 'm²·K/W' },
      floorR: { min: 2.0, max: 8.0, unit: 'm²·K/W' },
      windowU: { min: 0.4, max: 2.0, unit: 'W/m²·K' },
      windowArea: { min: 5, max: 50, unit: 'm²' },
      infiltrationRate: { min: 0.1, max: 1.0, unit: 'ACH' },
      ceilingHeight: { min: 2.2, max: 3.5, unit: 'm' },
    },
    heatPump: {
      capacity: { min: 1.0, max: 10.0, unit: 'kW' },
      copHeating: { min: 2.0, max: 6.0, unit: '' },
      copCooling: { min: 2.5, max: 7.0, unit: '' },
      targetTempMin: { min: 16, max: 22, unit: '°C' },
      targetTempMax: { min: 20, max: 26, unit: '°C' },
    },
    erv: {
      flowRate: { min: 50, max: 300, unit: 'm³/h' },
      efficiency: { min: 0.5, max: 0.95, unit: '%' },
      fanPower: { min: 20, max: 150, unit: 'W' },
    },
    solar: {
      panelArea: { min: 10, max: 100, unit: 'm²' },
      panelEfficiency: { min: 0.15, max: 0.25, unit: '%' },
      inverterEfficiency: { min: 0.9, max: 0.98, unit: '%' },
      windowSHGC: { min: 0.2, max: 0.7, unit: '' },
    },
    battery: {
      capacity: { min: 5, max: 50, unit: 'kWh' },
      chargeRate: { min: 1.0, max: 10.0, unit: 'kW' },
      dischargeRate: { min: 1.0, max: 10.0, unit: 'kW' },
      efficiency: { min: 0.8, max: 0.98, unit: '%' },
    },
  }

  // Calculated properties
  const getVolume = () => building.floorArea * building.ceilingHeight
  const getWindowToFloorRatio = () => (building.windowArea / building.floorArea) * 100
  const getTotalInternalGains = () =>
    buildingZones.occupancy * buildingZones.internalGains.people +
    building.floorArea *
      (buildingZones.internalGains.lighting + buildingZones.internalGains.equipment)
  const getTotalThermalBridges = () =>
    thermalBridges.foundation +
    thermalBridges.balcony +
    thermalBridges.roof +
    thermalBridges.windows

  // Validation functions
  const validateValue = (category: string, field: string, value: number): boolean => {
    const ranges = validationRanges as any
    const range = ranges[category]?.[field]
    if (!range) return true
    return value >= range.min && value <= range.max
  }

  const getValidationMessage = (category: string, field: string): string => {
    const ranges = validationRanges as any
    const range = ranges[category]?.[field]
    if (!range) return ''
    return `Valid range: ${range.min} - ${range.max} ${range.unit}`
  }

  // Reset to defaults
  const resetToDefaults = () => {
    Object.assign(building, createDefaultBuildingConfig())
    Object.assign(hvac, createDefaultHVACConfig())
    Object.assign(buildingZones, createDefaultBuildingZonesConfig())
    Object.assign(thermalBridges, createDefaultThermalBridgesConfig())
    hasUnsavedChanges.value = false
  }

  // Load preset configurations
  const loadPreset = (presetName: string) => {
    switch (presetName) {
      case 'minimal-ph':
        // Minimal Passive House - just meets standards
        building.wallR = 4.0
        building.roofR = 6.0
        building.windowU = 1.0
        hvac.heatPump.capacity = 2.0
        hvac.erv.efficiency = 0.75
        break
      case 'premium-ph':
        // Premium Passive House - exceeds standards
        building.wallR = 8.0
        building.roofR = 12.0
        building.windowU = 0.6
        hvac.heatPump.capacity = 2.5
        hvac.erv.efficiency = 0.85
        break
      case 'retrofit':
        // Retrofit/EnerPHit standard
        building.wallR = 3.0
        building.roofR = 4.5
        building.windowU = 1.2
        building.infiltrationRate = 0.6
        hvac.heatPump.capacity = 4.0
        break
    }
    hasUnsavedChanges.value = true
  }

  return {
    // State
    building,
    hvac,
    buildingZones,
    thermalBridges,
    isEditing,
    hasUnsavedChanges,

    // Computed
    getVolume,
    getWindowToFloorRatio,
    getTotalInternalGains,
    getTotalThermalBridges,

    // Validation
    validateValue,
    getValidationMessage,
    validationRanges,

    // Actions
    resetToDefaults,
    loadPreset,
  }
})
