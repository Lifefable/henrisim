// Type definitions for Henri Home Simulation

export interface Location {
  lat: number
  lon: number
  cityId?: string // Optional city identifier for enhanced climate data
  cityName?: string // Human-readable city name
}

export interface OutdoorConditions {
  temperature: number // °C
  humidity: number // fraction (0-1)
  solarRadiation: number // W/m²
  airQualityIndex: number // AQI
  windSpeed: number // m/s
}

export interface IndoorConditions {
  temperature: number // °C
  humidity: number // fraction (0-1)
  airQuality: number // 0-1 normalized
}

export interface BuildingEnvelope {
  floorArea: number // m²
  wallR: number // m²*K/W
  roofR: number // m²*K/W
  floorR: number // m²*K/W
  windowU: number // W/m²*K
  windowArea: number // m²
  infiltrationRate: number // ACH (Air Changes per Hour)
}

export interface EnergyState {
  heatPumpKWh: number
  ervKWh: number
  solarKWh: number
  batteryKWh: number
  netKWh: number
  iaqKWh?: number
}

export interface SafetyState {
  sprinklersActive: boolean
  smokeEvent: boolean
}

export interface HouseState {
  time: number // 0-23 hours
  date: string // YYYY-MM-DD format
  location: Location
  outdoor: OutdoorConditions
  indoor: IndoorConditions
  envelope: BuildingEnvelope
  energy: EnergyState
  safety: SafetyState
  comfortScore: number // 0-100

  // Enhanced seasonal/geographic data
  seasonalDateId?: string // ID of current seasonal date (solstice/equinox)
  season?: 'winter' | 'spring' | 'summer' | 'fall'
  dayLength?: number // Hours of daylight
  solarElevation?: number // Current solar elevation angle
}

export interface SimulationModule {
  name: string
  enabled: boolean
  simulate: (houseState: HouseState, timestepHours?: number, config?: any) => HouseState
}

export interface ClimateData {
  hour: number
  temperature: number
  humidity: number
  solarRadiation: number
  airQualityIndex: number
}

// Module-specific interfaces
export interface HeatPumpConfig {
  targetTemperature: number
  efficiency: number // COP (Coefficient of Performance)
  capacity: number // kW
}

export interface ERVConfig {
  enabled: boolean
  efficiency: number // heat recovery efficiency (0-1)
  flowRate: number // m³/h
  fanPower: number // W
}

export interface SolarConfig {
  panelArea: number // m²
  efficiency: number // 0-1
  orientation: number // degrees from south
  tilt: number // degrees from horizontal
  inverterEfficiency: number // 0-1
}

export interface BatteryConfig {
  capacity: number // kWh
  chargeRate: number // kW
  dischargeRate: number // kW
  currentCharge: number // kWh
  efficiency: number // round-trip efficiency (0-1)
}

export interface ModuleConfigs {
  heatPump: HeatPumpConfig
  erv: ERVConfig
  solar?: SolarConfig
  battery?: BatteryConfig
}

// Simulation events
export type SimulationEvent =
  | 'time_changed'
  | 'module_toggled'
  | 'emergency_triggered'
  | 'target_temperature_changed'

export interface SimulationEventPayload {
  type: SimulationEvent
  data: unknown
}
