import { defineStore } from 'pinia'
import { ref, computed, reactive } from 'vue'
import type { HouseState, ModuleConfigs, SimulationModule, ClimateData } from '@/types/simulation'

// Default house state
const createDefaultHouseState = (): HouseState => ({
  time: 12, // Start at noon
  date: '2025-06-21', // Summer solstice
  location: { lat: 39.7392, lon: -104.9903 }, // Denver

  outdoor: {
    temperature: 25, // °C
    humidity: 0.45,
    solarRadiation: 800, // W/m²
    airQualityIndex: 50,
    windSpeed: 2,
  },

  indoor: {
    temperature: 21, // °C
    humidity: 0.4,
    airQuality: 0.9,
  },

  envelope: {
    floorArea: 150, // m²
    wallR: 5.0, // m²*K/W
    roofR: 7.0,
    floorR: 4.0,
    windowU: 0.8, // W/m²*K
    windowArea: 20, // m²
    infiltrationRate: 0.3, // ACH
  },

  energy: {
    heatPumpKWh: 0,
    ervKWh: 0,
    solarKWh: 0,
    batteryKWh: 0,
    netKWh: 0,
  },

  safety: {
    sprinklersActive: false,
    smokeEvent: false,
  },

  comfortScore: 100,
})

export const useSimulationStore = defineStore('simulation', () => {
  // State
  const houseState = reactive<HouseState>(createDefaultHouseState())
  const isPlaying = ref(false)
  const playbackSpeed = ref(1) // 1x, 2x, 4x speed
  const history = ref<HouseState[]>([])
  const modules = ref<SimulationModule[]>([])

  // Module configurations
  const moduleConfigs = reactive<ModuleConfigs>({
    heatPump: {
      targetTemperature: 21,
      efficiency: 3.5, // COP
      capacity: 12, // kW
    },
    erv: {
      enabled: true,
      efficiency: 0.7, // 70% heat recovery
      flowRate: 200, // m³/h
      fanPower: 150, // W
    },
  })

  // Getters
  const currentHour = computed(() => houseState.time)
  const isComfortable = computed(() => houseState.comfortScore > 70)
  const totalEnergyUsed = computed(
    () =>
      houseState.energy.heatPumpKWh + houseState.energy.ervKWh + (houseState.energy.iaqKWh || 0),
  )
  const netEnergyFlow = computed(() => houseState.energy.solarKWh - totalEnergyUsed.value)

  // Actions
  const setTime = (hour: number) => {
    houseState.time = Math.max(0, Math.min(23, hour))
    updateClimateConditions()
    runSimulation()
  }

  const updateClimateConditions = () => {
    const climateData = generateClimateData(houseState.time)
    houseState.outdoor = {
      ...houseState.outdoor,
      ...climateData,
    }
  }

  const addModule = (module: SimulationModule) => {
    modules.value.push(module)
  }

  const toggleModule = (moduleName: string) => {
    const module = modules.value.find((m) => m.name === moduleName)
    if (module) {
      module.enabled = !module.enabled
    }
  }

  const runSimulation = (timestepHours = 1) => {
    // Save current state to history
    saveToHistory()

    // Run enabled modules in sequence
    const enabledModules = modules.value.filter((m) => m.enabled)

    for (const module of enabledModules) {
      try {
        // Pass module config for modules that need it
        if (module.name === 'heatPump') {
          // Inject target temperature into heat pump simulation
          const originalTemp = houseState.indoor.temperature
          module.simulate(houseState, timestepHours)

          // Apply target temperature logic
          const targetTemp = moduleConfigs.heatPump.targetTemperature
          const tempDiff = targetTemp - originalTemp

          if (Math.abs(tempDiff) > 0.1) {
            houseState.indoor.temperature = originalTemp + tempDiff * 0.1 // Gradual adjustment
          }
        } else {
          module.simulate(houseState, timestepHours)
        }
      } catch (error) {
        console.error(`Error in module ${module.name}:`, error)
      }
    }

    // Update comfort score
    updateComfortScore()
  }

  const saveToHistory = () => {
    // Keep last 24 hours of history
    if (history.value.length >= 24) {
      history.value.shift()
    }
    history.value.push(JSON.parse(JSON.stringify(houseState)))
  }

  const updateComfortScore = () => {
    let score = 100

    // Temperature comfort (±2°C from target is comfortable)
    const tempDiff = Math.abs(
      houseState.indoor.temperature - moduleConfigs.heatPump.targetTemperature,
    )
    if (tempDiff > 2) {
      score -= Math.min(30, tempDiff * 5)
    }

    // Humidity comfort (30-60% is ideal)
    const humidity = houseState.indoor.humidity * 100
    if (humidity < 30 || humidity > 60) {
      score -= Math.min(20, Math.abs(humidity - 45) * 0.5)
    }

    // Air quality (> 0.8 is good)
    if (houseState.indoor.airQuality < 0.8) {
      score -= (0.8 - houseState.indoor.airQuality) * 50
    }

    // Safety events
    if (houseState.safety.smokeEvent) score -= 50
    if (houseState.safety.sprinklersActive) score -= 20

    houseState.comfortScore = Math.max(0, Math.round(score))
  }

  // Playback timer
  let playbackTimer: number | null = null

  const startSimulation = () => {
    if (isPlaying.value) return // Already playing

    isPlaying.value = true

    // Clear any existing timer
    if (playbackTimer) {
      clearInterval(playbackTimer)
    }

    // Start the simulation timer
    playbackTimer = setInterval(() => {
      if (!isPlaying.value) {
        if (playbackTimer) {
          clearInterval(playbackTimer)
          playbackTimer = null
        }
        return
      }

      // Advance time by 1 hour
      const newHour = (currentHour.value + 1) % 24
      setTime(newHour)
    }, 1000 / playbackSpeed.value) // Speed: 1 = 1 second per hour, 2 = 0.5 seconds per hour
  }

  const pauseSimulation = () => {
    isPlaying.value = false
    if (playbackTimer) {
      clearInterval(playbackTimer)
      playbackTimer = null
    }
  }

  const resetSimulation = () => {
    // Stop any running simulation
    isPlaying.value = false
    if (playbackTimer) {
      clearInterval(playbackTimer)
      playbackTimer = null
    }

    // Reset the state
    Object.assign(houseState, createDefaultHouseState())
    history.value = []
  }

  const updateModuleConfig = (moduleName: keyof ModuleConfigs, config: unknown) => {
    if (moduleConfigs[moduleName]) {
      Object.assign(moduleConfigs[moduleName], config)
    }
  }

  // Trigger emergency event
  const triggerSmokeEvent = () => {
    houseState.safety.smokeEvent = true
    runSimulation()
  }

  const clearSmokeEvent = () => {
    houseState.safety.smokeEvent = false
    houseState.safety.sprinklersActive = false
    runSimulation()
  }

  return {
    // State
    houseState,
    isPlaying,
    playbackSpeed,
    history,
    modules,
    moduleConfigs,

    // Getters
    currentHour,
    isComfortable,
    totalEnergyUsed,
    netEnergyFlow,

    // Actions
    setTime,
    addModule,
    toggleModule,
    runSimulation,
    startSimulation,
    pauseSimulation,
    resetSimulation,
    updateModuleConfig,
    triggerSmokeEvent,
    clearSmokeEvent,
  }
})

// Climate data generator for Denver
function generateClimateData(hour: number): Partial<ClimateData> {
  // Simplified climate model for Denver summer day
  const baseTemp = 25 // °C base temperature
  const tempRange = 15 // daily temperature swing

  // Temperature follows sinusoidal pattern (peak at 15:00)
  const tempPhase = ((hour - 6) / 24) * 2 * Math.PI
  const temperature = baseTemp + (tempRange / 2) * Math.sin(tempPhase)

  // Humidity inversely related to temperature
  const humidity = 0.6 - (temperature - 15) * 0.01

  // Solar radiation (peak at noon)
  let solarRadiation = 0
  if (hour >= 6 && hour <= 18) {
    const solarPhase = ((hour - 6) / 12) * Math.PI
    solarRadiation = 1000 * Math.sin(solarPhase)
  }

  // Air quality varies slightly
  const airQualityIndex = 50 + Math.sin(hour * 0.5) * 10

  return {
    temperature: Math.round(temperature * 10) / 10,
    humidity: Math.round(humidity * 100) / 100,
    solarRadiation: Math.round(solarRadiation),
    airQualityIndex: Math.round(airQualityIndex),
  }
}
