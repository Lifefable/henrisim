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

  // Henri's Decision Engine State
  const currentMode = ref('normal')
  const recentDecisions = ref<Array<{ timestamp: number; action: string; reason: string }>>([])
  const nextAdaptation = ref<string | null>(null)

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

    // Henri's adaptive analysis - analyze environment first
    analyzeEnvironment()

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
        } else if (module.name === 'erv') {
          // Pass ERV configuration for adaptive behavior
          module.simulate(houseState, timestepHours, moduleConfigs.erv)
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

  // Henri's Adaptive Decision Engine
  const addDecision = (action: string, reason: string) => {
    recentDecisions.value.push({
      timestamp: houseState.time,
      action,
      reason
    })
    // Keep only last 10 decisions
    if (recentDecisions.value.length > 10) {
      recentDecisions.value.shift()
    }
  }

  const analyzeEnvironment = () => {
    // Reset next adaptation
    nextAdaptation.value = null
    
    // Emergency mode - smoke event
    if (houseState.safety.smokeEvent) {
      if (currentMode.value !== 'emergency') {
        currentMode.value = 'emergency'
        addDecision('Emergency mode activated', 'Smoke event detected')
        
        // Activate sprinkler system
        houseState.safety.sprinklersActive = true
        addDecision('Sprinklers activated', 'Fire safety protocol')
        
        // Increase ERV flow rate for smoke evacuation
        const ervModule = modules.value.find(m => m.name === 'erv')
        if (ervModule?.enabled) {
          moduleConfigs.erv.flowRate = 400 // Double flow rate
          addDecision('ERV emergency ventilation', 'Evacuating contaminated air')
        }
      }
      return
    }

    // High solar radiation adaptation
    if (houseState.outdoor.solarRadiation > 700) {
      if (currentMode.value !== 'high-solar') {
        currentMode.value = 'high-solar'
        addDecision('High solar mode activated', `Solar radiation: ${houseState.outdoor.solarRadiation}W/m²`)
        
        // Reduce heat pump efficiency due to solar heat gain
        moduleConfigs.heatPump.efficiency = 2.8 // Reduced from 3.5
        addDecision('Heat pump efficiency reduced', 'Compensating for solar heat gain')
      }
      
      // Predict when to reduce solar impact
      if (houseState.time < 16) {
        nextAdaptation.value = 'Will reduce solar heat gain at peak (15:00)'
      }
    }

    // Low battery adaptation  
    const batteryPercent = (houseState.energy.batteryKWh / 20) * 100
    if (batteryPercent < 20 && currentMode.value !== 'low-battery') {
      currentMode.value = 'low-battery'
      addDecision('Low battery mode activated', `Battery at ${Math.round(batteryPercent)}%`)
      
      // Reduce heat pump target temperature to conserve energy
      moduleConfigs.heatPump.targetTemperature = Math.max(19, moduleConfigs.heatPump.targetTemperature - 1)
      addDecision('Temperature setpoint lowered', 'Conserving battery energy')
      
      nextAdaptation.value = 'Will restore normal temperature when battery > 30%'
    }

    // Poor air quality adaptation
    if (houseState.outdoor.airQualityIndex > 100) {
      if (currentMode.value !== 'air-quality-protection') {
        currentMode.value = 'air-quality-protection'
        addDecision('Air quality protection mode', `Outdoor AQI: ${Math.round(houseState.outdoor.airQualityIndex)}`)
        
        // Reduce ERV flow rate to minimize outdoor air intake
        moduleConfigs.erv.flowRate = Math.max(100, moduleConfigs.erv.flowRate * 0.6)
        addDecision('ERV flow reduced', 'Limiting outdoor air intake')
      }
    }

    // Comfort priority mode - when comfort score drops
    if (houseState.comfortScore < 60 && currentMode.value !== 'comfort-priority') {
      currentMode.value = 'comfort-priority'
      addDecision('Comfort priority mode', `Comfort score: ${houseState.comfortScore}%`)
      
      // Boost heat pump efficiency
      moduleConfigs.heatPump.efficiency = 4.0
      addDecision('Heat pump efficiency boosted', 'Prioritizing occupant comfort')
      
      // Increase ERV efficiency
      moduleConfigs.erv.efficiency = 0.8
      addDecision('ERV efficiency increased', 'Improving air quality')
      
      nextAdaptation.value = 'Will return to normal when comfort > 80%'
    }

    // Return to normal mode conditions
    if (currentMode.value !== 'normal') {
      let shouldReturnToNormal = false
      
      if (currentMode.value === 'high-solar' && houseState.outdoor.solarRadiation < 500) {
        shouldReturnToNormal = true
        moduleConfigs.heatPump.efficiency = 3.5 // Restore normal efficiency
      }
      
      if (currentMode.value === 'low-battery' && batteryPercent > 30) {
        shouldReturnToNormal = true
        moduleConfigs.heatPump.targetTemperature = 21 // Restore normal temperature
      }
      
      if (currentMode.value === 'comfort-priority' && houseState.comfortScore > 80) {
        shouldReturnToNormal = true
        moduleConfigs.heatPump.efficiency = 3.5 // Restore normal efficiency
        moduleConfigs.erv.efficiency = 0.7 // Restore normal efficiency
      }
      
      if (currentMode.value === 'air-quality-protection' && houseState.outdoor.airQualityIndex < 75) {
        shouldReturnToNormal = true
        moduleConfigs.erv.flowRate = 200 // Restore normal flow rate
      }
      
      if (shouldReturnToNormal) {
        currentMode.value = 'normal'
        addDecision('Normal operation restored', 'Environmental conditions normalized')
        nextAdaptation.value = null
      }
    }
  }

  return {
    // State
    houseState,
    isPlaying,
    playbackSpeed,
    history,
    modules,
    moduleConfigs,
    
    // Henri's Decision Engine
    currentMode,
    recentDecisions,
    nextAdaptation,

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
    analyzeEnvironment,
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
