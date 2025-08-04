import { defineStore } from 'pinia'
import { ref, computed, reactive } from 'vue'
import type { HouseState, ModuleConfigs, SimulationModule, ClimateData } from '@/types/simulation'
import type { EnergyBalanceComponents } from '@/types/energy-balance'
import {
  generateEnhancedClimateData,
  CITIES,
  SEASONAL_DATES,
  getCityById,
  getSeasonalDateById,
} from '@/utils/climate'
import {
  EnergyBalanceCalculator,
  createDefaultBuildingZones,
  createDefaultThermalBridges,
} from '@/utils/energy-balance'
import { useConfigurationStore } from './configuration'

// Default house state factory - will be updated to use configuration store
const createDefaultHouseState = (configStore?: any): HouseState => ({
  time: 12, // Start at noon
  date: '2024-06-21', // Summer solstice
  location: {
    lat: 39.7392,
    lon: -104.9903,
    cityId: 'denver',
    cityName: 'Denver',
  }, // Denver
  seasonalDateId: 'summer-solstice',
  season: 'summer',

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
    floorArea: configStore?.building.floorArea || 150, // m²
    wallR: configStore?.building.wallR || 5.0, // m²*K/W
    roofR: configStore?.building.roofR || 7.0,
    floorR: configStore?.building.floorR || 4.0,
    windowU: configStore?.building.windowU || 0.8, // W/m²*K
    windowArea: configStore?.building.windowArea || 20, // m²
    infiltrationRate: configStore?.building.infiltrationRate || 0.3, // ACH
  },

  energy: {
    heatPumpKWh: 0,
    ervKWh: 0,
    solarKWh: 0,
    batteryKWh: configStore?.hvac.battery.capacity * 0.25 || 5, // Start with 25% charge
    netKWh: 0,
  },

  safety: {
    sprinklersActive: false,
    smokeEvent: false,
  },

  comfortScore: 100,
})

export const useSimulationStore = defineStore(
  'simulation',
  () => {
    // Get configuration store
    const configStore = useConfigurationStore()

    // State - initialize with configuration values
    const houseState = reactive<HouseState>(createDefaultHouseState(configStore))
    const isPlaying = ref(false)
    const playbackSpeed = ref(1) // 1x, 2x, 4x speed
    const history = ref<HouseState[]>([])
    const modules = ref<SimulationModule[]>([])

    // Henri's Decision Engine State
    const currentMode = ref('normal')
    const recentDecisions = ref<
      Array<{ id: number; timestamp: number; action: string; reason: string }>
    >([])
    const nextAdaptation = ref<string | null>(null)

    // Test Scenario State
    const activeTestScenario = ref<{
      type: string
      name: string
      description: string
      startTime: number
    } | null>(null)

    // Multi-Day Simulation & Henri Comparison System
    interface DailyMetrics {
      day: number
      henriEnabled: boolean
      energyConsumed: number
      energyProduced: number
      netEnergy: number
      avgComfort: number
      excellentComfortHours: number // Hours with comfort ≥ 90% (excellent)
      goodComfortHours: number // Hours with comfort ≥ 80% (good)
      comfortVariance: number // Variance in comfort scores
      comfortRecoveryTime: number // Average time to recover from comfort drops
      minTemp: number
      maxTemp: number
      adaptiveActions: number
      heatingCycles: number
      coolingCycles: number
      costSavings: number
      co2Emissions: number
    }

    const multiDaySimulation = reactive({
      isRunning: false,
      currentDay: 1,
      totalDays: 30, // Default to 30 days
      henriEnabled: true,
      baselineRun: null as DailyMetrics[] | null, // For comparison without Henri
      currentRun: [] as DailyMetrics[], // Current simulation data
      comparisonMetrics: {
        totalEnergyConsumption: { henri: 0, baseline: 0 },
        totalEnergyCost: { henri: 0, baseline: 0 },
        excellentComfortHours: { henri: 0, baseline: 0 }, // Hours ≥90%
        goodComfortHours: { henri: 0, baseline: 0 }, // Hours ≥80%
        comfortStability: { henri: 0, baseline: 0 }, // Lower variance = better stability
        comfortRecoveryTime: { henri: 0, baseline: 0 }, // Average recovery time from drops
        totalComfortScore: { henri: 0, baseline: 0 },
        heatingCoolingCycles: { henri: 0, baseline: 0 },
        adaptiveActions: { henri: 0, baseline: 0 },
        energyEfficiency: { henri: 0, baseline: 0 },
        co2Savings: { henri: 0, baseline: 0 },
      },
      dailyMetrics: [] as DailyMetrics[],
    })

    // Enhanced Energy Balance System
    const energyBalanceCalculator = new EnergyBalanceCalculator(
      createDefaultBuildingZones(),
      createDefaultThermalBridges(),
    )
    const currentEnergyBalance = ref<EnergyBalanceComponents | null>(null)

    // Module configurations - now pulls from configuration store
    const moduleConfigs = reactive<ModuleConfigs>({
      heatPump: {
        targetTemperature: 21, // This will be user-adjustable in UI
        efficiency: configStore.hvac.heatPump.copHeating,
        capacity: configStore.hvac.heatPump.capacity,
      },
      erv: {
        enabled: true,
        efficiency: configStore.hvac.erv.efficiency,
        flowRate: configStore.hvac.erv.flowRate,
        fanPower: configStore.hvac.erv.fanPower,
      },
      solar: {
        panelArea: configStore.hvac.solar.panelArea,
        efficiency: configStore.hvac.solar.panelEfficiency,
        orientation: 180, // South-facing
        tilt: 30, // Optimal tilt angle
        inverterEfficiency: configStore.hvac.solar.inverterEfficiency,
      },
      battery: {
        capacity: configStore.hvac.battery.capacity,
        chargeRate: configStore.hvac.battery.chargeRate,
        dischargeRate: configStore.hvac.battery.dischargeRate,
        currentCharge: configStore.hvac.battery.capacity * 0.25, // Start at 25%
        efficiency: configStore.hvac.battery.efficiency,
      },
    })

    // Watch for configuration changes and update module configs
    const syncConfigChanges = () => {
      moduleConfigs.heatPump.efficiency = configStore.hvac.heatPump.copHeating
      moduleConfigs.heatPump.capacity = configStore.hvac.heatPump.capacity
      moduleConfigs.erv.efficiency = configStore.hvac.erv.efficiency
      moduleConfigs.erv.flowRate = configStore.hvac.erv.flowRate
      moduleConfigs.erv.fanPower = configStore.hvac.erv.fanPower
      if (moduleConfigs.solar) {
        moduleConfigs.solar.panelArea = configStore.hvac.solar.panelArea
        moduleConfigs.solar.efficiency = configStore.hvac.solar.panelEfficiency
        moduleConfigs.solar.inverterEfficiency = configStore.hvac.solar.inverterEfficiency
      }
      if (moduleConfigs.battery) {
        moduleConfigs.battery.capacity = configStore.hvac.battery.capacity
        moduleConfigs.battery.chargeRate = configStore.hvac.battery.chargeRate
        moduleConfigs.battery.dischargeRate = configStore.hvac.battery.dischargeRate
        moduleConfigs.battery.efficiency = configStore.hvac.battery.efficiency
      }
    }

    // Getters
    const currentHour = computed(() => houseState.time)
    const isComfortable = computed(() => houseState.comfortScore > 70)
    const totalEnergyUsed = computed(
      () =>
        houseState.energy.heatPumpKWh + houseState.energy.ervKWh + (houseState.energy.iaqKWh || 0),
    )
    const netEnergyFlow = computed(() => houseState.energy.solarKWh - totalEnergyUsed.value)
    const energyBalance = computed(() => currentEnergyBalance.value)

    // Actions
    const setTime = (hour: number) => {
      houseState.time = Math.max(0, Math.min(23, hour))
      updateClimateConditions()
      runSimulation()
    }

    const updateClimateConditions = () => {
      if (!houseState.location.cityId || !houseState.seasonalDateId) {
        // Fallback to legacy climate generation for backward compatibility
        const climateData = generateClimateData(houseState.time)
        houseState.outdoor = {
          ...houseState.outdoor,
          ...climateData,
        }
        return
      }

      try {
        const enhancedClimate = generateEnhancedClimateData(
          houseState.location.cityId,
          houseState.seasonalDateId,
          houseState.time,
        )

        // Update outdoor conditions
        houseState.outdoor = {
          temperature: enhancedClimate.temperature,
          humidity: enhancedClimate.humidity,
          solarRadiation: enhancedClimate.solarRadiation,
          airQualityIndex: enhancedClimate.airQualityIndex,
          windSpeed: enhancedClimate.windSpeed,
        }

        // Update seasonal metadata
        houseState.season = enhancedClimate.season
        houseState.dayLength = enhancedClimate.dayLength
        houseState.solarElevation = enhancedClimate.solarElevation
        houseState.date = enhancedClimate.seasonalDate
      } catch (error) {
        console.warn('Enhanced climate generation failed, falling back to legacy system:', error)
        // Fallback to legacy system
        const climateData = generateClimateData(houseState.time)
        houseState.outdoor = {
          ...houseState.outdoor,
          ...climateData,
        }
      }
    }

    const addModule = (module: SimulationModule) => {
      // Always push new module (HouseSimulation will clear array first)
      modules.value.push(module)
      console.log(`✅ Added module: ${module.name} (simulate: ${typeof module.simulate === 'function'})`)
    }

    const ensureModulesInitialized = () => {
      // Check if any module is missing simulate function
      const brokenModules = modules.value.filter(m => typeof m.simulate !== 'function')
      if (brokenModules.length > 0) {
        console.warn('⚠️ Found modules without simulate functions, clearing all modules')
        modules.value = []
        return false
      }
      return true
    }

    const toggleModule = (moduleName: string) => {
      const module = modules.value.find((m) => m.name === moduleName)
      if (module) {
        module.enabled = !module.enabled
        // Re-run simulation to update energy balance
        runSimulation()
      }
    }

    // === TELEMETRY & PERFORMANCE LOGGING ===

    const logHenriPerformance = (preState: HouseState) => {
      const timestamp = new Date().toISOString()
      const postState = houseState

      console.log(
        `%c🤖 HENRI DECISION CYCLE - ${timestamp}`,
        'color: #2563eb; font-weight: bold; font-size: 14px;',
      )

      // Environmental conditions analysis
      console.log('%c📊 Environmental Analysis:', 'color: #059669; font-weight: bold;')
      console.log('  🌡️  Outdoor Temp:', `${postState.outdoor.temperature.toFixed(1)}°C`)
      console.log(
        '  🏠 Indoor Temp:',
        `${postState.indoor.temperature.toFixed(1)}°C (Target: ${moduleConfigs.heatPump.targetTemperature}°C)`,
      )
      console.log('  ☀️  Solar Radiation:', `${postState.outdoor.solarRadiation}W/m²`)
      console.log('  💨 Air Quality Index:', `${Math.round(postState.outdoor.airQualityIndex)}`)
      console.log('  🔋 Battery Level:', `${Math.round((postState.energy.batteryKWh / 20) * 100)}%`)
      console.log('  😊 Comfort Score:', `${Math.round(postState.comfortScore)}%`)

      // Henri's adaptive decisions
      console.log("%c🧠 Henri's Current Mode:", 'color: #7c3aed; font-weight: bold;')
      console.log('  Mode:', currentMode.value)
      console.log('  Recent Decisions:', recentDecisions.value.length)
      console.log('  Next Adaptation:', nextAdaptation.value || 'None planned')

      // System configurations
      console.log('%c⚙️  Adaptive Configurations:', 'color: #dc2626; font-weight: bold;')
      console.log('  Heat Pump Efficiency:', `${moduleConfigs.heatPump.efficiency.toFixed(2)}`)
      console.log('  Heat Pump Target:', `${moduleConfigs.heatPump.targetTemperature}°C`)
      console.log('  ERV Flow Rate:', `${moduleConfigs.erv.flowRate} CFM`)
      console.log('  ERV Efficiency:', `${(moduleConfigs.erv.efficiency * 100).toFixed(0)}%`)

      // Performance indicators
      const tempError = Math.abs(
        postState.indoor.temperature - moduleConfigs.heatPump.targetTemperature,
      )
      const comfortTrend =
        history.value.length > 2
          ? postState.comfortScore - history.value[history.value.length - 2].comfortScore
          : 0

      console.log('%c📈 Performance Metrics:', 'color: #ea580c; font-weight: bold;')
      console.log('  Temperature Error:', `${tempError.toFixed(2)}°C`)
      console.log('  Comfort Trend:', `${comfortTrend > 0 ? '+' : ''}${comfortTrend.toFixed(1)}%`)
      console.log(
        '  Energy Efficiency:',
        `${((postState.energy.solarKWh / Math.max(1, postState.energy.netKWh)) * 100).toFixed(1)}%`,
      )
      console.log('')
    }

    const logModulePerformance = (
      moduleName: string,
      preState: HouseState,
      postState: HouseState,
      executionTime: number,
    ) => {
      console.log(`%c🔧 MODULE: ${moduleName.toUpperCase()}`, 'color: #0891b2; font-weight: bold;')

      switch (moduleName) {
        case 'heatPump':
          const tempChange = postState.indoor.temperature - preState.indoor.temperature
          const energyUsed = postState.energy.heatPumpKWh - preState.energy.heatPumpKWh
          console.log(
            `  🌡️  Temperature Change: ${tempChange > 0 ? '+' : ''}${tempChange.toFixed(3)}°C`,
          )
          console.log(`  ⚡ Energy Consumed: ${energyUsed.toFixed(3)} kWh`)
          console.log(
            `  📊 COP Actual: ${energyUsed > 0 ? (tempChange / energyUsed).toFixed(2) : 'N/A'}`,
          )
          break

        case 'erv':
          const airQualityChange = postState.indoor.airQuality - preState.indoor.airQuality
          const ervEnergy = postState.energy.ervKWh - preState.energy.ervKWh
          console.log(
            `  💨 Air Quality Change: ${airQualityChange > 0 ? '+' : ''}${(airQualityChange * 100).toFixed(1)}%`,
          )
          console.log(`  ⚡ Energy Consumed: ${ervEnergy.toFixed(3)} kWh`)
          console.log(`  🌀 Flow Rate: ${moduleConfigs.erv.flowRate} CFM`)
          break

        case 'solar':
          const solarGenerated = postState.energy.solarKWh - preState.energy.solarKWh
          console.log(`  ☀️  Energy Generated: ${solarGenerated.toFixed(3)} kWh`)
          console.log(`  📈 Generation Rate: ${((solarGenerated / 1) * 1000).toFixed(0)} W`)
          console.log(`  🌤️  Solar Radiation: ${postState.outdoor.solarRadiation} W/m²`)
          break

        case 'battery':
          const batteryChange = postState.energy.batteryKWh - preState.energy.batteryKWh
          const batteryPercent = (postState.energy.batteryKWh / 20) * 100
          console.log(
            `  🔋 Battery Change: ${batteryChange > 0 ? '+' : ''}${batteryChange.toFixed(3)} kWh`,
          )
          console.log(`  📊 Battery Level: ${batteryPercent.toFixed(1)}%`)
          console.log(
            `  ${batteryChange > 0 ? '⬆️  Charging' : batteryChange < 0 ? '⬇️  Discharging' : '⏸️  Idle'}`,
          )
          break
      }

      console.log(`  ⏱️  Execution Time: ${executionTime.toFixed(2)}ms`)
      console.log('')
    }

    const logSimulationCycle = (startTime: number, endTime: number) => {
      const cycleTime = endTime - startTime
      const timestamp = new Date().toISOString()

      console.log(
        `%c🏁 SIMULATION CYCLE COMPLETE - ${timestamp}`,
        'color: #16a34a; font-weight: bold; font-size: 14px;',
      )
      console.log(`  ⏱️  Total Cycle Time: ${cycleTime.toFixed(2)}ms`)
      console.log(`  🕐 Simulation Time: ${houseState.time.toString().padStart(2, '0')}:00`)
      console.log(`  📅 Simulation Date: ${houseState.date}`)
      console.log(`%c${'='.repeat(80)}`, 'color: #6b7280;')
      console.log('')
    }

    // === PASSIVE PHYSICS SIMULATION ===

    /**
     * Apply passive house physics that continue regardless of system status
     * This includes heat loss, air quality degradation, humidity changes, etc.
     */
    const applyPassivePhysics = (timestepHours = 1) => {
      const { indoor, outdoor, envelope } = houseState

      // 1. Heat Loss/Gain through building envelope (always applies)
      const tempDiff = indoor.temperature - outdoor.temperature

      // Calculate heat loss through walls, roof, floor
      const wallLoss = (tempDiff / envelope.wallR) * envelope.floorArea * 0.6 * timestepHours
      const roofLoss = (tempDiff / envelope.roofR) * envelope.floorArea * timestepHours
      const floorLoss = (tempDiff / envelope.floorR) * envelope.floorArea * timestepHours

      // Heat loss through windows
      const windowLoss = tempDiff * envelope.windowU * envelope.windowArea * timestepHours

      // Infiltration heat loss/gain
      const airDensity = 1.2 // kg/m³
      const specificHeat = 1.005 // kJ/kg·K
      const houseVolume = envelope.floorArea * 2.5 // Assume 2.5m ceiling height
      const infiltrationFlow = (envelope.infiltrationRate * houseVolume) / 3600 // m³/s
      const infiltrationLoss =
        tempDiff * airDensity * specificHeat * infiltrationFlow * timestepHours

      const totalHeatLoss = wallLoss + roofLoss + floorLoss + windowLoss + infiltrationLoss

      // Apply temperature change due to heat loss (no heating/cooling compensation)
      const thermalMass = envelope.floorArea * 0.3 // Simplified thermal mass calculation
      const temperatureChange = totalHeatLoss / thermalMass
      indoor.temperature -= temperatureChange

      // 2. Solar heat gain (if no cooling system to compensate)
      const isHeatPumpEnabled = modules.value.find((m) => m.name === 'heatPump')?.enabled
      if (!isHeatPumpEnabled && outdoor.solarRadiation > 200) {
        // Solar heat gain through windows
        const solarHeatGain =
          (outdoor.solarRadiation * envelope.windowArea * 0.7 * timestepHours) / 1000 // kW
        const solarTempIncrease = solarHeatGain / thermalMass
        indoor.temperature += solarTempIncrease
      }

      // 3. Air quality degradation without ERV
      const isERVEnabled = modules.value.find((m) => m.name === 'erv')?.enabled
      if (!isERVEnabled) {
        // Air quality degrades over time without ventilation
        const degradationRate = 0.02 * timestepHours // 2% per hour
        indoor.airQuality = Math.max(0.3, indoor.airQuality - degradationRate)

        // Humidity tends toward outdoor levels without ERV
        const humidityDrift = (outdoor.humidity - indoor.humidity) * 0.1 * timestepHours
        indoor.humidity += humidityDrift
      }

      // 4. Natural limits and constraints
      // Temperature can't go below outdoor temp (house acts as thermal mass)
      if (tempDiff > 0 && indoor.temperature < outdoor.temperature) {
        indoor.temperature = Math.max(indoor.temperature, outdoor.temperature - 5)
      }

      // Humidity constraints
      indoor.humidity = Math.max(0.2, Math.min(0.8, indoor.humidity))

      // Air quality can't improve without systems
      indoor.airQuality = Math.max(0.3, Math.min(1.0, indoor.airQuality))
    }

    const runSimulation = (timestepHours = 1) => {
      const startTime = performance.now()

      // Save current state to history
      saveToHistory()

      // Reset ALL energy values to zero at start of each timestep (except battery charge level)
      const previousBatteryLevel = houseState.energy.batteryKWh
      houseState.energy.heatPumpKWh = 0
      houseState.energy.ervKWh = 0
      houseState.energy.solarKWh = 0
      houseState.energy.netKWh = 0
      houseState.energy.batteryKWh = previousBatteryLevel // Preserve battery charge level

      // Reset energy values for disabled modules to zero (redundant but explicit)
      const disabledModules = modules.value.filter((m) => !m.enabled)
      for (const module of disabledModules) {
        switch (module.name) {
          case 'heatPump':
            houseState.energy.heatPumpKWh = 0
            break
          case 'erv':
            houseState.energy.ervKWh = 0
            break
          case 'solar':
            houseState.energy.solarKWh = 0
            break
          case 'battery':
            // For battery, we might want to maintain stored energy but stop charging/discharging
            // Only reset if we want to simulate complete disconnection
            break
        }
      }

      // Apply passive house physics first (always runs regardless of module status)
      applyPassivePhysics(timestepHours)

      // Henri's adaptive analysis - analyze environment first
      const preAnalysisState = JSON.parse(JSON.stringify(houseState))
      analyzeEnvironment()
      logHenriPerformance(preAnalysisState)

      // Run enabled modules in sequence
      const enabledModules = modules.value.filter((m) => m.enabled)

      for (const module of enabledModules) {
        try {
          const moduleStartTime = performance.now()
          const preModuleState = JSON.parse(JSON.stringify(houseState))

          // Safety check: ensure module has simulate function
          if (typeof module.simulate !== 'function') {
            console.error(`❌ Module ${module.name} missing simulate function`)
            continue
          }

          // Pass module config for modules that need it
          if (module.name === 'heatPump') {
            // Pass heat pump configuration for proper target temperature control
            module.simulate(houseState, timestepHours, moduleConfigs.heatPump)
          } else if (module.name === 'erv') {
            // Pass ERV configuration for adaptive behavior
            module.simulate(houseState, timestepHours, moduleConfigs.erv)
          } else {
            module.simulate(houseState, timestepHours)
          }

          const moduleEndTime = performance.now()
          logModulePerformance(
            module.name,
            preModuleState,
            houseState,
            moduleEndTime - moduleStartTime,
          )
        } catch (error) {
          console.error(`Error in module ${module.name}:`, error)
        }
      }

      const endTime = performance.now()
      logSimulationCycle(startTime, endTime)

      // Calculate detailed energy balance
      currentEnergyBalance.value = energyBalanceCalculator.calculateEnergyBalance(
        houseState,
        timestepHours,
      )

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

      // Reset the state with current configuration
      Object.assign(houseState, createDefaultHouseState(configStore))
      history.value = []

      // Sync module configurations
      syncConfigChanges()
    }

    // Configuration management functions
    const updateFromConfiguration = () => {
      // Update building envelope from configuration
      houseState.envelope.floorArea = configStore.building.floorArea
      houseState.envelope.wallR = configStore.building.wallR
      houseState.envelope.roofR = configStore.building.roofR
      houseState.envelope.floorR = configStore.building.floorR
      houseState.envelope.windowU = configStore.building.windowU
      houseState.envelope.windowArea = configStore.building.windowArea
      houseState.envelope.infiltrationRate = configStore.building.infiltrationRate

      // Update module configurations
      syncConfigChanges()

      // Re-run simulation with new parameters
      runSimulation()
    }

    const refreshFromConfiguration = () => {
      // Called when user makes changes in configuration UI
      updateFromConfiguration()

      // Note: Energy balance calculator doesn't have update methods,
      // so we just re-run the simulation with new parameters
      runSimulation()
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
    const decisionIdCounter = ref(0)
    const addDecision = (action: string, reason: string) => {
      const decision = {
        id: Date.now(),
        timestamp: houseState.time,
        action,
        reason,
      }
      recentDecisions.value.push(decision)

      // Keep only the last 10 decisions
      if (recentDecisions.value.length > 10) {
        recentDecisions.value = recentDecisions.value.slice(-10)
      }
    }

    // Manual mode override for UI control
    const setManualMode = (modeId: string) => {
      currentMode.value = modeId
      addDecision('Manual mode override', `User selected ${modeId} mode`)

      // Apply the mode configurations immediately
      switch (modeId) {
        case 'normal':
          moduleConfigs.heatPump.targetTemperature = 21
          moduleConfigs.heatPump.efficiency = 3.5
          moduleConfigs.erv.flowRate = 200
          moduleConfigs.erv.efficiency = 0.7
          break
        case 'comfort-priority':
          moduleConfigs.heatPump.efficiency = 4.2
          moduleConfigs.erv.efficiency = 0.8
          break
        case 'low-battery':
          moduleConfigs.heatPump.targetTemperature = Math.max(
            20,
            moduleConfigs.heatPump.targetTemperature - 1,
          )
          moduleConfigs.heatPump.efficiency = Math.min(4.5, moduleConfigs.heatPump.efficiency * 1.2)
          break
        case 'high-solar':
          moduleConfigs.heatPump.efficiency = 2.8
          break
        case 'air-quality-protection':
          moduleConfigs.erv.flowRate = Math.max(100, moduleConfigs.erv.flowRate * 0.6)
          break
      }

      // Update next adaptation message
      nextAdaptation.value = 'Manual mode active - automatic adaptation disabled'

      // Run simulation to apply changes
      runSimulation()
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
          const ervModule = modules.value.find((m) => m.name === 'erv')
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
          addDecision(
            'High solar mode activated',
            `Solar radiation: ${houseState.outdoor.solarRadiation}W/m²`,
          )

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

        // Focus on efficiency rather than drastically lowering temperature
        // Reduce target by only 1°C and increase efficiency instead
        moduleConfigs.heatPump.targetTemperature = Math.max(
          20, // Keep minimum at 20°C for comfort
          moduleConfigs.heatPump.targetTemperature - 1,
        )

        // Improve heat pump efficiency to use less energy for same heating
        moduleConfigs.heatPump.efficiency = Math.min(4.5, moduleConfigs.heatPump.efficiency * 1.2)

        addDecision('Efficiency optimization', 'Conserving battery with better COP')

        nextAdaptation.value = 'Will restore normal temperature when battery > 30%'
      }

      // Poor air quality adaptation
      if (houseState.outdoor.airQualityIndex > 100) {
        if (currentMode.value !== 'air-quality-protection') {
          currentMode.value = 'air-quality-protection'
          addDecision(
            'Air quality protection mode',
            `Outdoor AQI: ${Math.round(houseState.outdoor.airQualityIndex)}`,
          )

          // Reduce ERV flow rate to minimize outdoor air intake
          moduleConfigs.erv.flowRate = Math.max(100, moduleConfigs.erv.flowRate * 0.6)
          addDecision('ERV flow reduced', 'Limiting outdoor air intake')
        }
      }

      // Comfort priority mode - when comfort score drops or temperature is far from target
      const tempError = Math.abs(
        houseState.indoor.temperature - moduleConfigs.heatPump.targetTemperature,
      )

      if (
        (houseState.comfortScore < 60 || tempError > 3) &&
        currentMode.value !== 'comfort-priority'
      ) {
        currentMode.value = 'comfort-priority'
        addDecision(
          'Comfort priority mode',
          `Comfort: ${houseState.comfortScore}%, Temp error: ${tempError.toFixed(1)}°C`,
        )

        // Boost heat pump efficiency and capacity for faster recovery
        moduleConfigs.heatPump.efficiency = 4.2
        addDecision('Heat pump efficiency boosted', 'Prioritizing temperature recovery')

        // Increase ERV efficiency
        moduleConfigs.erv.efficiency = 0.8
        addDecision('ERV efficiency increased', 'Improving air quality')

        nextAdaptation.value = 'Will return to normal when comfort > 80% and temp error < 1°C'
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
          moduleConfigs.heatPump.efficiency = 3.5 // Restore normal efficiency
        }

        if (currentMode.value === 'comfort-priority') {
          const currentTempError = Math.abs(
            houseState.indoor.temperature - moduleConfigs.heatPump.targetTemperature,
          )
          if (houseState.comfortScore > 80 && currentTempError < 1) {
            shouldReturnToNormal = true
            moduleConfigs.heatPump.efficiency = 3.5 // Restore normal efficiency
            moduleConfigs.erv.efficiency = 0.7 // Restore normal efficiency
          }
        }

        if (
          currentMode.value === 'air-quality-protection' &&
          houseState.outdoor.airQualityIndex < 75
        ) {
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

    // === TESTING SCENARIO CONTROLS ===

    const triggerTestScenario = (scenarioType: string) => {
      console.log(
        `%c🧪 TRIGGERING TEST SCENARIO: ${scenarioType}`,
        'color: #dc2626; font-weight: bold; font-size: 16px;',
      )

      let scenarioName = ''
      let scenarioDescription = ''

      switch (scenarioType) {
        case 'heatWave':
          houseState.outdoor.temperature = 38
          houseState.outdoor.solarRadiation = 950
          houseState.outdoor.humidity = 0.3
          scenarioName = 'Heat Wave'
          scenarioDescription = 'Extreme heat: 38°C, 950W/m² solar'
          addDecision('TEST: Heat wave scenario triggered', 'Outdoor temp: 38°C, Solar: 950W/m²')
          break

        case 'coldSnap':
          houseState.outdoor.temperature = -15
          houseState.outdoor.solarRadiation = 200
          houseState.outdoor.humidity = 0.7
          scenarioName = 'Cold Snap'
          scenarioDescription = 'Extreme cold: -15°C, low solar'
          addDecision('TEST: Cold snap scenario triggered', 'Outdoor temp: -15°C, Solar: 200W/m²')
          break

        case 'poorAirQuality':
          houseState.outdoor.airQualityIndex = 180
          scenarioName = 'Poor Air Quality'
          scenarioDescription = 'Unhealthy air: AQI 180'
          addDecision('TEST: Poor air quality scenario', 'AQI: 180 (Unhealthy)')
          break

        case 'lowBattery':
          houseState.energy.batteryKWh = 2 // 10%
          scenarioName = 'Low Battery'
          scenarioDescription = 'Critical battery: 10% remaining'
          addDecision('TEST: Low battery scenario', 'Battery at 10%')
          break

        case 'powerOutage':
          houseState.energy.solarKWh = 0
          houseState.energy.netKWh = 0
          scenarioName = 'Power Outage'
          scenarioDescription = 'No grid or solar power'
          addDecision('TEST: Power outage scenario', 'No grid or solar power')
          break

        case 'smokeAlarm':
          triggerSmokeEvent()
          scenarioName = 'Smoke Alarm'
          scenarioDescription = 'Emergency: Smoke detected'
          addDecision('TEST: Smoke alarm scenario', 'Emergency ventilation activated')
          break

        case 'comfortChallenge':
          houseState.outdoor.temperature = 32
          houseState.indoor.temperature = 25
          houseState.energy.batteryKWh = 4 // 20%
          houseState.outdoor.airQualityIndex = 120
          scenarioName = 'Comfort Challenge'
          scenarioDescription = 'Multiple stressors active'
          addDecision('TEST: Comfort challenge', 'Multiple stressors active')
          break

        default:
          console.warn('Unknown test scenario:', scenarioType)
          return
      }

      // Set active scenario
      activeTestScenario.value = {
        type: scenarioType,
        name: scenarioName,
        description: scenarioDescription,
        startTime: Date.now(),
      }

      // Force immediate adaptation analysis
      analyzeEnvironment()
      console.log(
        `%c✅ Test scenario "${scenarioType}" applied`,
        'color: #059669; font-weight: bold;',
      )
    }

    const clearTestScenario = () => {
      if (activeTestScenario.value) {
        console.log(
          `%c🔄 CLEARING TEST SCENARIO: ${activeTestScenario.value.name}`,
          'color: #059669; font-weight: bold;',
        )
        activeTestScenario.value = null
        addDecision('Test scenario cleared', 'Returning to normal conditions')

        // Reset to normal conditions
        updateClimateConditions()
        runSimulation()
      }
    }

    // === CITY AND SEASONAL DATE MANAGEMENT ===

    const setCity = (cityId: string) => {
      const city = getCityById(cityId)
      if (!city) {
        console.warn(`Unknown city ID: ${cityId}`)
        return
      }

      houseState.location = {
        lat: city.location.lat,
        lon: city.location.lon,
        cityId: city.id,
        cityName: city.name,
      }

      console.log(
        `%c🌍 City changed to ${city.name}, ${city.country}`,
        'color: #2563eb; font-weight: bold;',
      )
      console.log(`  📍 Location: ${city.location.lat}°N, ${Math.abs(city.location.lon)}°W`)

      // Update climate conditions and re-run simulation
      updateClimateConditions()
      runSimulation()
    }

    const setSeasonalDate = (seasonalDateId: string) => {
      const seasonalDate = getSeasonalDateById(seasonalDateId)
      if (!seasonalDate) {
        console.warn(`Unknown seasonal date ID: ${seasonalDateId}`)
        return
      }

      houseState.seasonalDateId = seasonalDate.id
      houseState.date = seasonalDate.date

      console.log(
        `%c📅 Season changed to ${seasonalDate.name}`,
        'color: #2563eb; font-weight: bold;',
      )
      console.log(`  📝 ${seasonalDate.description}`)
      console.log(`  🌅 Day ${seasonalDate.dayOfYear} of year`)

      // Update climate conditions and re-run simulation
      updateClimateConditions()
      runSimulation()
    }

    const getCityList = () => CITIES
    const getSeasonalDateList = () => SEASONAL_DATES
    const getCurrentCity = () =>
      houseState.location.cityId ? getCityById(houseState.location.cityId) : null
    const getCurrentSeasonalDate = () =>
      houseState.seasonalDateId ? getSeasonalDateById(houseState.seasonalDateId) : null

    // Multi-Day Simulation Methods
    const startMultiDaySimulation = async (days: number = 7, withHenri: boolean = true) => { // Reduced default from 30 to 7
      console.log(
        `🚀 Starting ${days}-day simulation ${withHenri ? 'WITH' : 'WITHOUT'} Henri's adaptive intelligence`,
      )
      console.log(`🏠 Initial module states:`)
      modules.value.forEach(module => {
        console.log(`  ${module.name}: ${module.enabled}`)
      })
      console.log(`  Current mode: ${currentMode.value}`)

      multiDaySimulation.isRunning = true
      multiDaySimulation.currentDay = 1
      multiDaySimulation.totalDays = days
      multiDaySimulation.henriEnabled = withHenri
      multiDaySimulation.dailyMetrics = []

      // Reset comparison metrics
      Object.keys(multiDaySimulation.comparisonMetrics).forEach((key) => {
        const metric =
          multiDaySimulation.comparisonMetrics[
            key as keyof typeof multiDaySimulation.comparisonMetrics
          ]
        if (withHenri) {
          metric.henri = 0
        } else {
          metric.baseline = 0
        }
      })

      // Temporarily disable Henri if this is baseline run
      const originalMode = currentMode.value
      if (!withHenri) {
        currentMode.value = 'normal' // Force normal mode for baseline
      }

      // Simulate each day
      for (let day = 1; day <= days; day++) {
        multiDaySimulation.currentDay = day
        const dailyMetrics = await simulateDay(day, withHenri)
        multiDaySimulation.dailyMetrics.push(dailyMetrics)

        // Yield control to UI more frequently for better responsiveness
        if (day % 2 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 1)) // Allow UI updates every 2 days
        }
      }

      // Store results for comparison
      if (!withHenri) {
        multiDaySimulation.baselineRun = [...multiDaySimulation.dailyMetrics]
      } else {
        multiDaySimulation.currentRun = [...multiDaySimulation.dailyMetrics]
      }

      // Restore Henri's mode
      if (!withHenri) {
        currentMode.value = originalMode
      }

      multiDaySimulation.isRunning = false
      console.log(`✅ ${days}-day simulation complete!`)

      // Calculate final comparison metrics
      calculateComparisonMetrics()
    }

    const simulateDay = async (day: number, withHenri: boolean): Promise<DailyMetrics> => {
      console.log(`🌅 Starting day ${day} simulation (Henri: ${withHenri})`)
      
      let dailyEnergyConsumed = 0
      let dailyEnergyProduced = 0
      let dailyComfortSum = 0
      let excellentComfortHours = 0 // Hours with comfort ≥ 90%
      let goodComfortHours = 0 // Hours with comfort ≥ 80%
      const hourlyComfortScores: number[] = [] // For variance calculation
      const comfortDropRecoveryTimes: number[] = [] // Track recovery times
      let currentComfortDropStart: number | null = null
      let minTemp = Infinity
      let maxTemp = -Infinity
      let adaptiveActions = 0
      let heatingCycles = 0
      let coolingCycles = 0

      const previousHeatPumpState = { ...moduleConfigs.heatPump }

      // Log initial module states
      console.log(`📊 Module states at start of day ${day}:`)
      modules.value.forEach(module => {
        console.log(`  ${module.name}: ${module.enabled}`)
      })
      console.log(`  Current mode: ${currentMode.value}`)

      // Simulate 24 hours
      for (let hour = 0; hour < 24; hour++) {
        // Vary conditions throughout the day and across days
        const seasonalVariation = Math.sin((day / 365) * 2 * Math.PI) * 5 // ±5°C seasonal variation
        const dailyVariation = Math.sin((hour / 24) * 2 * Math.PI) * 8 // ±8°C daily variation
        const randomVariation = (Math.random() - 0.5) * 4 // ±2°C random variation

        houseState.outdoor.temperature = 20 + seasonalVariation + dailyVariation + randomVariation
        houseState.outdoor.humidity = 0.4 + Math.sin(hour * 0.3) * 0.2

        // Solar radiation (peak at noon)
        if (hour >= 6 && hour <= 18) {
          const solarPhase = ((hour - 6) / 12) * Math.PI
          houseState.outdoor.solarRadiation = (800 + day * 2) * Math.sin(solarPhase) // Increasing solar through season
        } else {
          houseState.outdoor.solarRadiation = 0
        }

        // Air quality varies
        houseState.outdoor.airQualityIndex = 40 + Math.sin(day * 0.1 + hour * 0.2) * 30

        // Set current time
        houseState.time = hour

        // Run Henri's analysis if enabled
        if (withHenri) {
          const previousMode = currentMode.value
          analyzeEnvironment()
          if (currentMode.value !== previousMode) {
            adaptiveActions++
          }
        }

        // Run simulation step
        runSimulation()

        // Yield control to UI every 6 hours to prevent browser freeze
        if (hour % 6 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 0))
        }

        // Track metrics with detailed logging for first few hours
        const hourlyConsumption = houseState.energy.heatPumpKWh + houseState.energy.ervKWh
        dailyEnergyConsumed += hourlyConsumption
        dailyEnergyProduced += houseState.energy.solarKWh

        if (hour < 3 || (hour === 12 && day === 1)) { // Log first few hours and noon of first day
          console.log(`    Hour ${hour}: HP=${houseState.energy.heatPumpKWh.toFixed(3)}, ERV=${houseState.energy.ervKWh.toFixed(3)}, Solar=${houseState.energy.solarKWh.toFixed(3)}, Mode=${currentMode.value}`)
        }

        dailyComfortSum += houseState.comfortScore

        // Track comfort metrics with granular thresholds
        hourlyComfortScores.push(houseState.comfortScore)

        // Track excellent comfort (≥90%)
        if (houseState.comfortScore >= 90) {
          excellentComfortHours++
        }

        // Track good comfort (≥80%)
        if (houseState.comfortScore >= 80) {
          goodComfortHours++
        }

        // Track comfort recovery times
        if (houseState.comfortScore < 80) {
          // Start of comfort drop
          if (currentComfortDropStart === null) {
            currentComfortDropStart = hour
          }
        } else {
          // Recovery from comfort drop
          if (currentComfortDropStart !== null) {
            const recoveryTime = hour - currentComfortDropStart
            comfortDropRecoveryTimes.push(recoveryTime)
            currentComfortDropStart = null
          }
        }

        minTemp = Math.min(minTemp, houseState.indoor.temperature)
        maxTemp = Math.max(maxTemp, houseState.indoor.temperature)

        // Track heating/cooling cycles
        if (moduleConfigs.heatPump.targetTemperature !== previousHeatPumpState.targetTemperature) {
          if (moduleConfigs.heatPump.targetTemperature > previousHeatPumpState.targetTemperature) {
            heatingCycles++
          } else {
            coolingCycles++
          }
        }

        Object.assign(previousHeatPumpState, moduleConfigs.heatPump)
      }

      // Calculate comfort variance (lower = more stable)
      const avgComfort = dailyComfortSum / 24
      const comfortVariance =
        hourlyComfortScores.reduce((sum, score) => {
          return sum + Math.pow(score - avgComfort, 2)
        }, 0) / 24

      // Calculate average comfort recovery time
      const avgComfortRecoveryTime =
        comfortDropRecoveryTimes.length > 0
          ? comfortDropRecoveryTimes.reduce((sum, time) => sum + time, 0) /
            comfortDropRecoveryTimes.length
          : 0

      // Calculate daily metrics
      const netEnergy = dailyEnergyConsumed - dailyEnergyProduced
      const costSavings = withHenri ? netEnergy * 0.15 : 0 // Henri saves ~15% on energy costs
      const co2Emissions = netEnergy * 0.4 // kg CO2 per kWh (average grid mix)

      console.log(`🌇 Day ${day} complete (Henri: ${withHenri}):`)
      console.log(`  Energy consumed: ${dailyEnergyConsumed.toFixed(3)} kWh`)
      console.log(`  Energy produced: ${dailyEnergyProduced.toFixed(3)} kWh`)
      console.log(`  Net energy: ${netEnergy.toFixed(3)} kWh`)
      console.log(`  Avg comfort: ${avgComfort.toFixed(1)}`)
      console.log(`  Adaptive actions: ${adaptiveActions}`)

      return {
        day,
        henriEnabled: withHenri,
        energyConsumed: dailyEnergyConsumed,
        energyProduced: dailyEnergyProduced,
        netEnergy,
        avgComfort,
        excellentComfortHours,
        goodComfortHours,
        comfortVariance,
        comfortRecoveryTime: avgComfortRecoveryTime,
        minTemp,
        maxTemp,
        adaptiveActions,
        heatingCycles,
        coolingCycles,
        costSavings,
        co2Emissions,
      }
    }

    const calculateComparisonMetrics = () => {
      if (!multiDaySimulation.baselineRun || !multiDaySimulation.currentRun) return

      const henri = multiDaySimulation.currentRun
      const baseline = multiDaySimulation.baselineRun

      console.log('🔍 Calculating comparison metrics...')
      console.log('Henri data points:', henri.length)
      console.log('Baseline data points:', baseline.length)

      // Total energy consumption
      multiDaySimulation.comparisonMetrics.totalEnergyConsumption.henri = henri.reduce(
        (sum, day) => sum + day.energyConsumed,
        0,
      )
      multiDaySimulation.comparisonMetrics.totalEnergyConsumption.baseline = baseline.reduce(
        (sum, day) => sum + day.energyConsumed,
        0,
      )

      // Energy cost (based on net energy consumption)
      multiDaySimulation.comparisonMetrics.totalEnergyCost.henri = henri.reduce(
        (sum, day) => sum + Math.max(0, day.netEnergy) * 0.15, // Only count positive net energy (consumed from grid)
        0,
      )
      multiDaySimulation.comparisonMetrics.totalEnergyCost.baseline = baseline.reduce(
        (sum, day) => sum + Math.max(0, day.netEnergy) * 0.15,
        0,
      )

      // Average comfort score
      multiDaySimulation.comparisonMetrics.totalComfortScore.henri = 
        henri.reduce((sum, day) => sum + day.avgComfort, 0) / henri.length
      multiDaySimulation.comparisonMetrics.totalComfortScore.baseline = 
        baseline.reduce((sum, day) => sum + day.avgComfort, 0) / baseline.length

      // Excellent comfort hours (≥90%)
      multiDaySimulation.comparisonMetrics.excellentComfortHours.henri = henri.reduce(
        (sum, day) => sum + day.excellentComfortHours,
        0,
      )
      multiDaySimulation.comparisonMetrics.excellentComfortHours.baseline = baseline.reduce(
        (sum, day) => sum + day.excellentComfortHours,
        0,
      )

      // Good comfort hours (≥80%)
      multiDaySimulation.comparisonMetrics.goodComfortHours.henri = henri.reduce(
        (sum, day) => sum + day.goodComfortHours,
        0,
      )
      multiDaySimulation.comparisonMetrics.goodComfortHours.baseline = baseline.reduce(
        (sum, day) => sum + day.goodComfortHours,
        0,
      )

      // Comfort stability (lower variance = better stability)
      const henriAvgVariance =
        henri.reduce((sum, day) => sum + day.comfortVariance, 0) / henri.length
      const baselineAvgVariance =
        baseline.reduce((sum, day) => sum + day.comfortVariance, 0) / baseline.length

      multiDaySimulation.comparisonMetrics.comfortStability.henri = henriAvgVariance
      multiDaySimulation.comparisonMetrics.comfortStability.baseline = baselineAvgVariance

      // Comfort recovery time (average time to recover from drops)
      const henriAvgRecoveryTime =
        henri.reduce((sum, day) => sum + day.comfortRecoveryTime, 0) / henri.length
      const baselineAvgRecoveryTime =
        baseline.reduce((sum, day) => sum + day.comfortRecoveryTime, 0) / baseline.length

      multiDaySimulation.comparisonMetrics.comfortRecoveryTime.henri = henriAvgRecoveryTime
      multiDaySimulation.comparisonMetrics.comfortRecoveryTime.baseline = baselineAvgRecoveryTime

      // Adaptive actions
      multiDaySimulation.comparisonMetrics.adaptiveActions.henri = henri.reduce(
        (sum, day) => sum + day.adaptiveActions,
        0,
      )
      multiDaySimulation.comparisonMetrics.adaptiveActions.baseline = baseline.reduce(
        (sum, day) => sum + day.adaptiveActions,
        0,
      )

      // CO2 savings (Henri's reduction vs baseline)
      const henriCO2 = henri.reduce((sum, day) => sum + day.co2Emissions, 0)
      const baselineCO2 = baseline.reduce((sum, day) => sum + day.co2Emissions, 0)
      multiDaySimulation.comparisonMetrics.co2Savings.henri = Math.max(0, baselineCO2 - henriCO2)

      // Energy efficiency (simplified as 1 / energy consumption ratio)
      const henriTotalConsumption = multiDaySimulation.comparisonMetrics.totalEnergyConsumption.henri
      const baselineTotalConsumption = multiDaySimulation.comparisonMetrics.totalEnergyConsumption.baseline

      if (henriTotalConsumption > 0 && baselineTotalConsumption > 0) {
        multiDaySimulation.comparisonMetrics.energyEfficiency.henri = 
          (1 / henriTotalConsumption) * 1000 // Normalized efficiency score
        multiDaySimulation.comparisonMetrics.energyEfficiency.baseline = 
          (1 / baselineTotalConsumption) * 1000
      } else {
        multiDaySimulation.comparisonMetrics.energyEfficiency.henri = 0
        multiDaySimulation.comparisonMetrics.energyEfficiency.baseline = 0
      }

      console.log('📊 Comparison metrics calculated:')
      console.log('Energy consumption - Henri:', henriTotalConsumption, 'Baseline:', baselineTotalConsumption)
      console.log('Comfort scores - Henri:', multiDaySimulation.comparisonMetrics.totalComfortScore.henri, 'Baseline:', multiDaySimulation.comparisonMetrics.totalComfortScore.baseline)
      console.log('Excellent comfort hours - Henri:', multiDaySimulation.comparisonMetrics.excellentComfortHours.henri, 'Baseline:', multiDaySimulation.comparisonMetrics.excellentComfortHours.baseline)

      // Average comfort score
      multiDaySimulation.comparisonMetrics.totalComfortScore.henri =
        henri.reduce((sum, day) => sum + day.avgComfort, 0) / henri.length
      multiDaySimulation.comparisonMetrics.totalComfortScore.baseline =
        baseline.reduce((sum, day) => sum + day.avgComfort, 0) / baseline.length

      // Heating/cooling cycles
      multiDaySimulation.comparisonMetrics.heatingCoolingCycles.henri = henri.reduce(
        (sum, day) => sum + day.heatingCycles + day.coolingCycles,
        0,
      )
      multiDaySimulation.comparisonMetrics.heatingCoolingCycles.baseline = baseline.reduce(
        (sum, day) => sum + day.heatingCycles + day.coolingCycles,
        0,
      )

      // Adaptive actions
      multiDaySimulation.comparisonMetrics.adaptiveActions.henri = henri.reduce(
        (sum, day) => sum + day.adaptiveActions,
        0,
      )
      multiDaySimulation.comparisonMetrics.adaptiveActions.baseline = 0 // No Henri = no adaptive actions

      // Energy efficiency (energy produced / energy consumed)
      const henriEfficiency =
        henri.reduce((sum, day) => sum + day.energyProduced, 0) /
        henri.reduce((sum, day) => sum + day.energyConsumed, 0)
      const baselineEfficiency =
        baseline.reduce((sum, day) => sum + day.energyProduced, 0) /
        baseline.reduce((sum, day) => sum + day.energyConsumed, 0)

      multiDaySimulation.comparisonMetrics.energyEfficiency.henri = henriEfficiency
      multiDaySimulation.comparisonMetrics.energyEfficiency.baseline = baselineEfficiency

      // CO2 savings
      multiDaySimulation.comparisonMetrics.co2Savings.henri =
        baseline.reduce((sum, day) => sum + day.co2Emissions, 0) -
        henri.reduce((sum, day) => sum + day.co2Emissions, 0)

      console.log('📊 Comparison metrics calculated:', multiDaySimulation.comparisonMetrics)
    }

    const runHenriComparison = async (days: number = 7) => { // Reduced default from 30 to 7 days
      console.log('🔬 Starting Henri vs Baseline comparison study...')

      // Validate days input to prevent browser freeze
      if (days > 30) {
        console.warn('⚠️ Limiting simulation to 30 days to prevent browser freeze')
        days = 30
      }

      // Check if modules are properly initialized
      const brokenModules = modules.value.filter(m => typeof m.simulate !== 'function')
      if (brokenModules.length > 0) {
        console.error('❌ Cannot run comparison - modules missing simulate functions:', brokenModules.map(m => m.name))
        throw new Error('Modules not properly initialized. Please refresh the page.')
      }

      // First run without Henri (baseline)
      await startMultiDaySimulation(days, false)

      // Then run with Henri
      await startMultiDaySimulation(days, true)

      console.log('🎯 Henri comparison complete!')
      return multiDaySimulation.comparisonMetrics
    }

    const resetMultiDaySimulation = () => {
      multiDaySimulation.isRunning = false
      multiDaySimulation.currentDay = 1
      multiDaySimulation.baselineRun = null
      multiDaySimulation.currentRun = []
      multiDaySimulation.dailyMetrics = []

      // Reset all metrics
      Object.keys(multiDaySimulation.comparisonMetrics).forEach((key) => {
        const metric =
          multiDaySimulation.comparisonMetrics[
            key as keyof typeof multiDaySimulation.comparisonMetrics
          ]
        metric.henri = 0
        metric.baseline = 0
      })

      console.log('🧹 Multi-day simulation reset')
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

      // Test Scenarios
      activeTestScenario,

      // Getters
      currentHour,
      isComfortable,
      totalEnergyUsed,
      netEnergyFlow,
      energyBalance,

      // Actions
      setTime,
      addModule,
      ensureModulesInitialized,
      toggleModule,
      runSimulation,
      startSimulation,
      pauseSimulation,
      resetSimulation,
      updateModuleConfig,
      triggerSmokeEvent,
      clearSmokeEvent,
      analyzeEnvironment,
      triggerTestScenario,
      clearTestScenario,
      setManualMode,

      // Configuration management
      updateFromConfiguration,
      refreshFromConfiguration,
      syncConfigChanges,

      // New climate actions
      setCity,
      setSeasonalDate,
      getCityList,
      getSeasonalDateList,
      getCurrentCity,
      getCurrentSeasonalDate,

      // Multi-Day Simulation & Henri Comparison
      multiDaySimulation,
      startMultiDaySimulation,
      runHenriComparison,
      resetMultiDaySimulation,
    }
  },
  {
    persist: {
      key: 'henri-simulation',
      storage: localStorage,
      omit: ['isPlaying', 'multiDaySimulation.isRunning', 'modules'],
    },
  },
)

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
