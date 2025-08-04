<template>
    <div class="house-simulation">
        <div class="simulation-header">
            <div class="header-main">
                <div class="header-text">
                    <h1>Henri Home Passive House Simulation</h1>
                    <p class="simulation-subtitle">
                        {{ formatDate(simulationStore.houseState.date) }} -
                        {{ simulationStore.getCurrentCity()?.name || 'Denver' }}, {{
                            simulationStore.getCurrentCity()?.country || 'USA' }}
                        - {{ simulationStore.getCurrentSeasonalDate()?.name || 'Summer Solstice' }}
                    </p>
                </div>
                <div class="time-display">
                    <h2>{{ formatTime(simulationStore.currentHour) }}</h2>
                    <p>Hour {{ simulationStore.currentHour }} of 24</p>
                    <p v-if="simulationStore.houseState.dayLength" class="daylight-info">
                        {{ simulationStore.houseState.dayLength.toFixed(1) }}h daylight
                    </p>
                </div>
            </div>

            <!-- Location and Season Controls in Header -->
            <div class="header-controls">
                <div class="location-controls">
                    <div class="control-group">
                        <label class="control-label">🏙️ City:</label>
                        <select :value="simulationStore.houseState.location.cityId || 'denver'"
                            @change="handleCityChange" class="header-selector">
                            <option v-for="city in simulationStore.getCityList()" :key="city.id" :value="city.id">
                                {{ city.name }}, {{ city.country }}
                            </option>
                        </select>
                    </div>
                    <div class="control-group">
                        <label class="control-label">📆 Season:</label>
                        <select :value="simulationStore.houseState.seasonalDateId || 'summer-solstice'"
                            @change="handleSeasonChange" class="header-selector">
                            <option v-for="seasonalDate in simulationStore.getSeasonalDateList()" :key="seasonalDate.id"
                                :value="seasonalDate.id">
                                {{ seasonalDate.name }}
                            </option>
                        </select>
                    </div>
                </div>
            </div>

            <div class="time-control-panel">
                <div class="time-slider-container">
                    <input type="range" min="0" max="23" step="1" v-model.number="timeSlider" class="time-slider" />
                    <div class="time-labels">
                        <span>00:00</span>
                        <span>06:00</span>
                        <span>12:00</span>
                        <span>18:00</span>
                        <span>23:00</span>
                    </div>
                </div>

                <div class="simulation-controls">
                    <BaseButton @click="simulationStore.resetSimulation()" variant="ghost" size="sm">
                        Reset
                    </BaseButton>
                    <BaseButton @click="togglePlayback" :variant="simulationStore.isPlaying ? 'danger' : 'primary'">
                        {{ simulationStore.isPlaying ? 'Pause' : 'Play' }}
                    </BaseButton>
                    <BaseButton @click="showTestScenariosModal = true" variant="secondary" size="sm">
                        Test Scenarios
                    </BaseButton>
                </div>
            </div>
        </div>

        <div class="simulation-content">

            <!-- Main Dashboard -->
            <div class="dashboard">
                <!-- Environmental Overview -->
                <div class="overview-panel">
                    <h3>Environmental Overview</h3>
                    <div class="metrics-grid">
                        <div class="metric-card">
                            <div class="metric-icon">🌡️</div>
                            <div class="metric-content">
                                <div class="metric-label">Indoor Temp</div>
                                <div class="metric-value">{{
                                    formatTemperature(simulationStore.houseState.indoor.temperature) }}</div>
                                <div class="metric-subtitle">{{
                                    formatHumidity(simulationStore.houseState.indoor.humidity) }} humidity • Target: {{
                                        formatTemperature(simulationStore.moduleConfigs.heatPump.targetTemperature) }}</div>
                            </div>
                        </div>

                        <div class="metric-card">
                            <div class="metric-icon">🌤️</div>
                            <div class="metric-content">
                                <div class="metric-label">Outdoor Temp</div>
                                <div class="metric-value">{{
                                    formatTemperature(simulationStore.houseState.outdoor.temperature) }}</div>
                                <div class="metric-subtitle">{{
                                    formatHumidity(simulationStore.houseState.outdoor.humidity) }} humidity</div>
                            </div>
                        </div>

                        <div class="metric-card">
                            <div class="metric-icon">💨</div>
                            <div class="metric-content">
                                <div class="metric-label">Air Quality</div>
                                <div class="metric-value">{{
                                    formatAirQuality(simulationStore.houseState.indoor.airQuality) }}</div>
                                <div class="metric-subtitle">AQI: {{
                                    Math.round(simulationStore.houseState.outdoor.airQualityIndex) }}</div>
                            </div>
                        </div>

                        <div class="metric-card">
                            <div class="metric-icon">☀️</div>
                            <div class="metric-content">
                                <div class="metric-label">Solar</div>
                                <div class="metric-value">{{ formatEnergy(simulationStore.houseState.energy.solarKWh) }}
                                </div>
                                <div class="metric-subtitle">{{
                                    Math.round(simulationStore.houseState.outdoor.solarRadiation) }} W/m²</div>
                            </div>
                        </div>

                        <div class="metric-card">
                            <div class="metric-icon">🔋</div>
                            <div class="metric-content">
                                <div class="metric-label">Battery</div>
                                <div class="metric-value">{{ formatEnergy(simulationStore.houseState.energy.batteryKWh)
                                    }}</div>
                                <div class="metric-subtitle">{{ getBatteryPercentage() }}% charged</div>
                            </div>
                        </div>

                        <div class="metric-card">
                            <div class="metric-icon">⚡</div>
                            <div class="metric-content">
                                <div class="metric-label">Grid Net</div>
                                <div class="metric-value">{{ formatEnergy(simulationStore.netEnergyFlow) }}</div>
                                <div class="metric-subtitle">{{ simulationStore.netEnergyFlow > 0 ? 'Consuming' :
                                    'Exporting' }}</div>
                            </div>
                        </div>

                        <div class="metric-card comfort-card" :class="{ 'comfortable': simulationStore.isComfortable }">
                            <div class="metric-icon">😊</div>
                            <div class="metric-content">
                                <div class="metric-label">Comfort Score</div>
                                <div class="metric-value">{{ simulationStore.houseState.comfortScore }}%</div>
                                <div class="metric-subtitle">{{
                                    getComfortStatus(simulationStore.houseState.comfortScore) }}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Module Status Panel -->
                <div class="modules-panel">
                    <h3>System Status</h3>
                    <div class="modules-grid">
                        <!-- Heat Pump Module -->
                        <div class="module-card" :class="{ 'module-disabled': !isModuleEnabled('heatPump') }">
                            <div class="module-header">
                                <h4>🔥 Heat Pump</h4>
                                <div class="module-status">
                                    <span class="status-indicator" :class="{ 'active': isModuleEnabled('heatPump') }">
                                        {{ isModuleEnabled('heatPump') ? '🟢 ACTIVE' : '🔴 OFF' }}
                                    </span>
                                    <label class="toggle-switch">
                                        <input type="checkbox" :checked="isModuleEnabled('heatPump')"
                                            @change="toggleModule('heatPump')" />
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>
                            </div>
                            <div class="module-content">
                                <div class="module-stat">
                                    <span>Energy Used:</span>
                                    <span>{{ formatEnergy(simulationStore.houseState.energy.heatPumpKWh) }}</span>
                                </div>
                                <div class="module-stat">
                                    <span>Target Temp:</span>
                                    <span>{{ formatTemperature(simulationStore.moduleConfigs.heatPump.targetTemperature)
                                        }}</span>
                                </div>
                                <div class="module-stat">
                                    <span>COP:</span>
                                    <span>{{ simulationStore.moduleConfigs.heatPump.efficiency }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- ERV Module -->
                        <div class="module-card" :class="{ 'module-disabled': !isModuleEnabled('erv') }">
                            <div class="module-header">
                                <h4>💨 ERV System</h4>
                                <div class="module-status">
                                    <span class="status-indicator" :class="{ 'active': isModuleEnabled('erv') }">
                                        {{ isModuleEnabled('erv') ? '🟢 ACTIVE' : '🔴 OFF' }}
                                    </span>
                                    <label class="toggle-switch">
                                        <input type="checkbox" :checked="isModuleEnabled('erv')"
                                            @change="toggleModule('erv')" />
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>
                            </div>
                            <div class="module-content">
                                <div class="module-stat">
                                    <span>Energy Used:</span>
                                    <span>{{ formatEnergy(simulationStore.houseState.energy.ervKWh) }}</span>
                                </div>
                                <div class="module-stat">
                                    <span>Efficiency:</span>
                                    <span>{{ Math.round(simulationStore.moduleConfigs.erv.efficiency * 100) }}%</span>
                                </div>
                                <div class="module-stat">
                                    <span>Flow Rate:</span>
                                    <span>{{ simulationStore.moduleConfigs.erv.flowRate }} m³/h</span>
                                </div>
                            </div>
                        </div>

                        <!-- Solar Module -->
                        <div class="module-card" :class="{ 'module-disabled': !isModuleEnabled('solar') }">
                            <div class="module-header">
                                <h4>☀️ Solar Panels</h4>
                                <div class="module-status">
                                    <span class="status-indicator" :class="{ 'active': isModuleEnabled('solar') }">
                                        {{ isModuleEnabled('solar') ? '🟢 ACTIVE' : '🔴 OFF' }}
                                    </span>
                                    <label class="toggle-switch">
                                        <input type="checkbox" :checked="isModuleEnabled('solar')"
                                            @change="toggleModule('solar')" />
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>
                            </div>
                            <div class="module-content">
                                <div class="module-stat">
                                    <span>Energy Generated:</span>
                                    <span>{{ formatEnergy(simulationStore.houseState.energy.solarKWh) }}</span>
                                </div>
                                <div class="module-stat">
                                    <span>Solar Radiation:</span>
                                    <span>{{ Math.round(simulationStore.houseState.outdoor.solarRadiation) }}
                                        W/m²</span>
                                </div>
                                <div class="module-stat">
                                    <span>Panel Area:</span>
                                    <span>40 m²</span>
                                </div>
                            </div>
                        </div>

                        <!-- Battery Module -->
                        <div class="module-card" :class="{ 'module-disabled': !isModuleEnabled('battery') }">
                            <div class="module-header">
                                <h4>🔋 Battery Storage</h4>
                                <div class="module-status">
                                    <span class="status-indicator" :class="{ 'active': isModuleEnabled('battery') }">
                                        {{ isModuleEnabled('battery') ? '🟢 ACTIVE' : '🔴 OFF' }}
                                    </span>
                                    <label class="toggle-switch">
                                        <input type="checkbox" :checked="isModuleEnabled('battery')"
                                            @change="toggleModule('battery')" />
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>
                            </div>
                            <div class="module-content">
                                <div class="module-stat">
                                    <span>Stored Energy:</span>
                                    <span>{{ formatEnergy(simulationStore.houseState.energy.batteryKWh) }}</span>
                                </div>
                                <div class="module-stat">
                                    <span>Charge Level:</span>
                                    <span>{{ getBatteryPercentage() }}%</span>
                                </div>
                                <div class="module-stat">
                                    <span>Capacity:</span>
                                    <span>20 kWh</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Henri's Decision Engine Panel -->
                <div class="decision-panel">
                    <h3>🧠 Henri's Decision Engine</h3>

                    <!-- All Modes Display -->
                    <div class="modes-section">
                        <div class="modes-label">Available Modes</div>
                        <div class="modes-grid">
                            <div v-for="mode in allModes" :key="mode.id" class="mode-card" :class="{
                                'active': simulationStore.currentMode === mode.id,
                                'clickable': mode.id !== 'emergency'
                            }" @click="handleModeClick(mode.id)" @mouseenter="handleModeHover(mode.id)"
                                @mouseleave="handleModeLeave()">
                                <div class="mode-icon">{{ mode.icon }}</div>
                                <div class="mode-name">{{ mode.name }}</div>
                                <div v-if="simulationStore.currentMode === mode.id" class="active-indicator">ACTIVE
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Recent Decisions -->
                    <div class="recent-decisions">
                        <div class="decisions-label">Recent Decisions</div>
                        <div class="decisions-list">
                            <div v-for="decision in simulationStore.recentDecisions.slice(-3)" :key="decision.id"
                                class="decision-item">
                                <span class="decision-time">{{ formatDecisionTime(decision.timestamp) }}</span>
                                <span class="decision-text">{{ decision.action }}</span>
                            </div>
                            <div v-if="simulationStore.recentDecisions.length === 0" class="no-decisions">
                                No adaptive actions yet
                            </div>
                        </div>
                    </div>

                    <!-- Mode Explanation -->
                    <div class="mode-explanation" :class="{ 'preview-mode': hoveredModeId }">
                        <div class="explanation-label">
                            {{ hoveredModeId ? 'Hover Preview' : 'Current Mode Behavior' }}
                        </div>
                        <div class="explanation-text">{{ getCurrentModeExplanation() }}</div>
                    </div>

                    <div v-if="simulationStore.nextAdaptation" class="next-adaptation">
                        <span class="adaptation-label">Next Adaptation:</span>
                        <span class="adaptation-text">{{ simulationStore.nextAdaptation }}</span>
                    </div>
                </div>

                <!-- Debug Data Table -->
                <div class="testing-panel">
                    <div class="debug-data-section">
                        <div class="debug-header">
                            <h4>🔧 Time Series Debug Log</h4>
                            <div class="debug-controls">
                                <BaseButton @click="copyTimeSeriesData" variant="ghost" size="sm">
                                    📋 Copy Time Series
                                </BaseButton>
                                <BaseButton @click="clearTimeSeriesData" variant="ghost" size="sm">
                                    �️ Clear Log
                                </BaseButton>
                                <BaseButton @click="exportTimeSeriesCSV" variant="ghost" size="sm">
                                    📄 Export CSV
                                </BaseButton>
                            </div>
                        </div>

                        <div class="timeseries-container">
                            <div class="timeseries-info">
                                <p><strong>Rows logged:</strong> {{ timeSeriesData.length }}</p>
                                <p><strong>Auto-logging:</strong> {{ autoLogging ? '✅ Enabled' : '❌ Disabled' }}</p>
                                <BaseButton @click="toggleAutoLogging" variant="ghost" size="sm">
                                    {{ autoLogging ? 'Disable Auto-Log' : 'Enable Auto-Log' }}
                                </BaseButton>
                            </div>

                            <div class="timeseries-table-container">
                                <table class="timeseries-table">
                                    <thead>
                                        <tr>
                                            <th>Hour</th>
                                            <th>Temp Out</th>
                                            <th>Temp In</th>
                                            <th>Solar W/m²</th>
                                            <th>Solar kWh</th>
                                            <th>Heat Pump kWh</th>
                                            <th>ERV kWh</th>
                                            <th>Battery kWh</th>
                                            <th>Battery %</th>
                                            <th>Net Grid kWh</th>
                                            <th>Energy Balance</th>
                                            <th>Comfort %</th>
                                            <th>Henri Mode</th>
                                            <th>HP Enabled</th>
                                            <th>Solar Enabled</th>
                                            <th>Battery Enabled</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="(row, index) in timeSeriesData" :key="index" :class="{
                                            'current-hour': row.hour === simulationStore.houseState.time,
                                            'energy-surplus': parseFloat(row.energyBalance) > 0,
                                            'energy-deficit': parseFloat(row.energyBalance) < 0,
                                            'battery-full': parseFloat(row.batteryPercent) >= 100,
                                            'battery-empty': parseFloat(row.batteryPercent) <= 0
                                        }">
                                            <td>{{ row.hour }}:00</td>
                                            <td>{{ row.tempOut }}°C</td>
                                            <td>{{ row.tempIn }}°C</td>
                                            <td>{{ row.solarRadiation }}</td>
                                            <td>{{ row.solarKWh }}</td>
                                            <td>{{ row.heatPumpKWh }}</td>
                                            <td>{{ row.ervKWh }}</td>
                                            <td>{{ row.batteryKWh }}</td>
                                            <td>{{ row.batteryPercent }}%</td>
                                            <td>{{ row.netKWh }}</td>
                                            <td>{{ row.energyBalance }}</td>
                                            <td>{{ row.comfort }}%</td>
                                            <td>{{ row.henriMode }}</td>
                                            <td>{{ row.hpEnabled ? 'Y' : 'N' }}</td>
                                            <td>{{ row.solarEnabled ? 'Y' : 'N' }}</td>
                                            <td>{{ row.batteryEnabled ? 'Y' : 'N' }}</td>
                                        </tr>
                                        <tr v-if="timeSeriesData.length === 0">
                                            <td colspan="16" class="no-data">No data logged yet. Run simulation or
                                                enable auto-logging.</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Energy Balance Chart -->
                <div class="energy-balance-section">
                    <div v-if="simulationStore.energyBalance">
                        <EnergyBalanceChart :energy-balance="simulationStore.energyBalance" />
                    </div>
                    <div v-else class="energy-balance-loading">
                        <h3>Energy Balance Analysis</h3>
                        <p>Loading energy balance calculations...</p>
                        <p><strong>Debug:</strong> Energy balance is {{ simulationStore.energyBalance }}</p>
                        <button @click="simulationStore.runSimulation()" class="base-button">Trigger
                            Calculation</button>
                    </div>
                </div>

                <!-- Henri Comparison Panel -->
                <div class="henri-comparison-section">
                    <HenriComparisonPanel />
                </div>

                <!-- Safety Panel -->
                <div v-if="simulationStore.houseState.safety.smokeEvent || simulationStore.houseState.safety.sprinklersActive"
                    class="safety-panel alert">
                    <h3>⚠️ Safety Alert</h3>
                    <div v-if="simulationStore.houseState.safety.smokeEvent" class="safety-message">
                        Smoke event detected! Air quality systems affected.
                    </div>
                    <div v-if="simulationStore.houseState.safety.sprinklersActive" class="safety-message">
                        Sprinkler system active.
                    </div>
                    <BaseButton @click="simulationStore.clearSmokeEvent()" variant="danger" size="sm">
                        Clear Emergency
                    </BaseButton>
                </div>
            </div>
        </div>

        <!-- Test Scenarios Modal -->
        <div v-if="showTestScenariosModal" class="modal-overlay" @click="showTestScenariosModal = false">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h3>🧪 Test Scenarios</h3>
                    <button @click="showTestScenariosModal = false" class="modal-close">✕</button>
                </div>

                <div class="modal-body">
                    <!-- Active Test Scenario Display -->
                    <div v-if="simulationStore.activeTestScenario" class="active-scenario-panel">
                        <div class="scenario-header">
                            <div class="scenario-info">
                                <h4>🔬 Active Test Scenario</h4>
                                <div class="scenario-details">
                                    <span class="scenario-name">{{ simulationStore.activeTestScenario.name }}</span>
                                    <span class="scenario-description">{{ simulationStore.activeTestScenario.description
                                        }}</span>
                                </div>
                            </div>
                            <BaseButton @click="simulationStore.clearTestScenario()" variant="secondary" size="sm">
                                ❌ Clear Scenario
                            </BaseButton>
                        </div>
                    </div>

                    <!-- Environmental Test Scenarios -->
                    <div class="test-section">
                        <h4>🌡️ Environmental Tests</h4>
                        <div class="testing-controls">
                            <BaseButton @click="simulationStore.triggerTestScenario('heatWave')" variant="danger"
                                size="sm">
                                🔥 Heat Wave
                            </BaseButton>
                            <BaseButton @click="simulationStore.triggerTestScenario('coldSnap')" variant="primary"
                                size="sm">
                                🥶 Cold Snap
                            </BaseButton>
                            <BaseButton @click="simulationStore.triggerTestScenario('poorAirQuality')"
                                variant="secondary" size="sm">
                                💨 Poor Air Quality
                            </BaseButton>
                        </div>
                    </div>

                    <!-- Energy Test Scenarios -->
                    <div class="test-section">
                        <h4>⚡ Energy Tests</h4>
                        <div class="testing-controls">
                            <BaseButton @click="simulationStore.triggerTestScenario('lowBattery')" variant="secondary"
                                size="sm">
                                🔋 Low Battery
                            </BaseButton>
                            <BaseButton @click="simulationStore.triggerTestScenario('powerOutage')" variant="danger"
                                size="sm">
                                ⚫ Power Outage
                            </BaseButton>
                        </div>
                    </div>

                    <!-- Safety & Complex Tests -->
                    <div class="test-section">
                        <h4>🚨 Safety & Complex Tests</h4>
                        <div class="testing-controls">
                            <BaseButton @click="simulationStore.triggerTestScenario('smokeAlarm')" variant="danger"
                                size="sm">
                                🚨 Smoke Alarm
                            </BaseButton>
                            <BaseButton @click="simulationStore.triggerTestScenario('comfortChallenge')"
                                variant="secondary" size="sm">
                                😰 Comfort Challenge
                            </BaseButton>
                        </div>
                    </div>

                    <!-- Time Controls -->
                    <div class="test-section">
                        <h4>🕐 Time Controls</h4>
                        <div class="testing-controls">
                            <BaseButton @click="setTimeOfDay('morning')" variant="ghost" size="sm">
                                🌅 Morning (06:00)
                            </BaseButton>
                            <BaseButton @click="setTimeOfDay('noon')" variant="ghost" size="sm">
                                ☀️ Noon (12:00)
                            </BaseButton>
                            <BaseButton @click="setTimeOfDay('evening')" variant="ghost" size="sm">
                                🌆 Evening (18:00)
                            </BaseButton>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useSimulationStore } from '@/stores/simulation'
import { createHeatPumpModule } from '@/modules/HeatPumpModule'
import { createERVModule } from '@/modules/ERVModule'
import { createSolarModule } from '@/modules/SolarModule'
import { createBatteryModule } from '@/modules/BatteryModule'
import BaseButton from '@/components/ui/BaseButton.vue'
import EnergyBalanceChart from '@/components/EnergyBalanceChart.vue'
import HenriComparisonPanel from '@/components/HenriComparisonPanel.vue'

const simulationStore = useSimulationStore()

// Computed slider value that syncs with store
const timeSlider = computed({
    get: () => simulationStore.currentHour,
    set: (value: number) => simulationStore.setTime(value)
})

// Initialize modules
onMounted(() => {
    // Always clear and re-initialize modules to prevent persistence corruption
    simulationStore.modules.length = 0
    
    simulationStore.addModule(createHeatPumpModule())
    simulationStore.addModule(createERVModule())
    simulationStore.addModule(createSolarModule())
    simulationStore.addModule(createBatteryModule())
    
    console.log('🔧 Modules forcefully re-initialized on mount')
    console.log('Module check:', simulationStore.modules.map(m => ({ name: m.name, hasSimulate: typeof m.simulate === 'function' })))

    // Auto-enable data logging  
    autoLogging.value = true

    // Run initial simulation to populate energy balance
    simulationStore.runSimulation()

    // Auto-start the simulation
    simulationStore.startSimulation()
})

// Methods
const togglePlayback = () => {
    if (simulationStore.isPlaying) {
        simulationStore.pauseSimulation()
    } else {
        simulationStore.startSimulation()
    }
}

const toggleModule = (moduleName: string) => {
    simulationStore.toggleModule(moduleName)
    simulationStore.runSimulation()

    // Auto-log after module toggle
    if (autoLogging.value) {
        nextTick(() => {
            logCurrentTimestep()
        })
    }
}

const isModuleEnabled = (moduleName: string) => {
    const module = simulationStore.modules.find(m => m.name === moduleName)
    return module?.enabled ?? false
}

// Formatters
const formatTime = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`
}

const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

const formatTemperature = (temp: number) => {
    return `${Math.round(temp * 10) / 10}°C`
}

const formatHumidity = (humidity: number) => {
    return `${Math.round(humidity * 100)}%`
}

const formatAirQuality = (aq: number) => {
    return `${Math.round(aq * 100)}%`
}

const formatEnergy = (kwh: number) => {
    return `${Math.round(kwh * 100) / 100} kWh`
}

const getComfortStatus = (score: number) => {
    if (score >= 90) return 'Excellent'
    if (score >= 80) return 'Very Good'
    if (score >= 70) return 'Good'
    if (score >= 60) return 'Fair'
    return 'Poor'
}

const getBatteryPercentage = () => {
    const batteryCapacity = 20 // kWh (should match battery module)
    const currentCharge = simulationStore.houseState.energy.batteryKWh
    return Math.round((currentCharge / batteryCapacity) * 100)
}

const setTimeOfDay = (timeOfDay: string) => {
    const timeMap = {
        'morning': 6,
        'noon': 12,
        'evening': 18,
        'night': 0
    }
    const hour = timeMap[timeOfDay as keyof typeof timeMap] || 12
    simulationStore.setTime(hour)
}

// New handlers for location and season
const handleCityChange = (event: Event) => {
    const target = event.target as HTMLSelectElement
    if (target?.value) {
        simulationStore.setCity(target.value)
    }
}

const handleSeasonChange = (event: Event) => {
    const target = event.target as HTMLSelectElement
    if (target?.value) {
        simulationStore.setSeasonalDate(target.value)
    }
}

// Decision Engine Formatters
const getModeIcon = (mode: string) => {
    const modeIcons = {
        'normal': '🏠',
        'emergency': '🚨',
        'energy-saving': '💡',
        'comfort-priority': '😌',
        'high-solar': '☀️',
        'low-battery': '🔋',
        'air-quality-protection': '💨'
    }
    return modeIcons[mode as keyof typeof modeIcons] || '🏠'
}

const formatMode = (mode: string) => {
    const modeNames = {
        'normal': 'Normal Operation',
        'emergency': 'Emergency Response',
        'energy-saving': 'Energy Conservation',
        'comfort-priority': 'Comfort Priority',
        'high-solar': 'High Solar Gain',
        'low-battery': 'Low Battery Mode',
        'air-quality-protection': 'Air Quality Protection'
    }
    return modeNames[mode as keyof typeof modeNames] || 'Normal Operation'
}

// All available modes for the UI
const allModes = ref([
    {
        id: 'normal',
        icon: '🏠',
        name: 'Normal',
        description: 'Standard efficient operation with balanced heating (21°C target), optimized energy usage (COP 3.5), and normal ventilation flow (200 m³/h). Default mode when no special conditions are detected.'
    },
    {
        id: 'comfort-priority',
        icon: '😌',
        name: 'Comfort Priority',
        description: 'Prioritizes temperature and comfort over energy efficiency. Activates when comfort drops below 60% or temperature error exceeds 3°C. Boosts heat pump to 4.2 COP and increases ERV efficiency to 80% for faster recovery.'
    },
    {
        id: 'low-battery',
        icon: '🔋',
        name: 'Energy Saving',
        description: 'Conserves battery power when charge drops below 20%. Reduces target temperature by 1°C (minimum 20°C) while improving heat pump efficiency to 4.5 COP to maintain comfort with less energy consumption.'
    },
    {
        id: 'high-solar',
        icon: '☀️',
        name: 'High Solar',
        description: 'Manages excessive solar heat gain when radiation exceeds 700 W/m². Reduces heat pump efficiency to 2.8 COP to compensate for passive solar heating through windows and prevent overheating.'
    },
    {
        id: 'air-quality-protection',
        icon: '💨',
        name: 'Air Quality Protection',
        description: 'Protects indoor air quality when outdoor AQI exceeds 100. Reduces ERV flow rate by 40% (minimum 100 m³/h) to limit contaminated outdoor air intake while maintaining necessary ventilation.'
    },
    {
        id: 'emergency',
        icon: '🚨',
        name: 'Emergency',
        description: 'Emergency response for smoke events. Activates sprinkler systems, doubles ERV flow rate to 400 m³/h for air evacuation, and prioritizes safety over energy efficiency. Cannot be manually activated.'
    }
])

// Handle mode selection
const handleModeClick = (modeId: string) => {
    // Emergency mode cannot be manually set
    if (modeId === 'emergency') {
        return
    }

    // Override Henri's current mode
    simulationStore.setManualMode(modeId)
    console.log(`🎮 Manual mode override: ${formatMode(modeId)}`)
}

// Hover state for mode explanations
const hoveredModeId = ref<string | null>(null)

// Handle mode hover to show description
const handleModeHover = (modeId: string) => {
    hoveredModeId.value = modeId
}

// Handle mouse leave to revert to active mode description
const handleModeLeave = () => {
    hoveredModeId.value = null
}

// Get explanation for current mode or hovered mode
const getCurrentModeExplanation = () => {
    const displayModeId = hoveredModeId.value || simulationStore.currentMode
    const currentMode = allModes.value.find(mode => mode.id === displayModeId)
    return currentMode?.description || 'Standard efficient operation mode.'
}

const formatDecisionTime = (timestamp: number) => {
    const hour = Math.floor(timestamp)
    return `${hour.toString().padStart(2, '0')}:00`
}

// Data Logging Control

// Time Series Debug Data Management
const timeSeriesData = ref<Array<{
    hour: number,
    tempOut: string,
    tempIn: string,
    solarRadiation: number,
    solarKWh: string,
    heatPumpKWh: string,
    ervKWh: string,
    batteryKWh: string,
    batteryPercent: string,
    netKWh: string,
    energyBalance: string,
    comfort: number,
    henriMode: string,
    hpEnabled: boolean,
    solarEnabled: boolean,
    batteryEnabled: boolean,
    timestamp: string
}>>([])

const autoLogging = ref(false)

// Test Scenarios Modal
const showTestScenariosModal = ref(false)

const logCurrentTimestep = () => {
    const state = simulationStore.houseState

    // Calculate accurate energy balance (positive = surplus, negative = deficit)
    const energyProduced = state.energy.solarKWh
    const energyConsumed = state.energy.heatPumpKWh + state.energy.ervKWh
    const energyBalance = energyProduced - energyConsumed

    // Create unique identifier for this timestep
    const timestepId = `${state.time}-${state.energy.solarKWh.toFixed(3)}-${state.energy.batteryKWh.toFixed(3)}`

    const logEntry = {
        hour: state.time,
        tempOut: state.outdoor.temperature.toFixed(1),
        tempIn: state.indoor.temperature.toFixed(1),
        solarRadiation: Math.round(state.outdoor.solarRadiation),
        solarKWh: state.energy.solarKWh.toFixed(3),
        heatPumpKWh: state.energy.heatPumpKWh.toFixed(3),
        ervKWh: state.energy.ervKWh.toFixed(3),
        batteryKWh: state.energy.batteryKWh.toFixed(3),
        batteryPercent: getBatteryPercentage().toString(),
        netKWh: state.energy.netKWh.toFixed(3),
        energyBalance: energyBalance.toFixed(3),
        comfort: state.comfortScore,
        henriMode: simulationStore.currentMode,
        hpEnabled: isModuleEnabled('heatPump'),
        solarEnabled: isModuleEnabled('solar'),
        batteryEnabled: isModuleEnabled('battery'),
        timestamp: new Date().toISOString(),
        timestepId: timestepId
    }

    // Enhanced duplicate prevention using unique timestep identifier
    const existingEntry = timeSeriesData.value.find(entry =>
        entry.hour === logEntry.hour &&
        Math.abs(parseFloat(entry.solarKWh) - parseFloat(logEntry.solarKWh)) < 0.001 &&
        Math.abs(parseFloat(entry.batteryKWh) - parseFloat(logEntry.batteryKWh)) < 0.001
    )

    if (!existingEntry) {
        timeSeriesData.value.push(logEntry)
        console.log(`📊 Logged timestep ${logEntry.hour}:00 - Solar: ${logEntry.solarKWh} kWh, Battery: ${logEntry.batteryPercent}%, Balance: ${logEntry.energyBalance} kWh`)

        // Debug battery behavior
        if (parseFloat(logEntry.batteryPercent) === 0 || parseFloat(logEntry.batteryPercent) === 100) {
            console.log(`🔋 Battery edge case: ${logEntry.batteryPercent}% (${logEntry.batteryKWh} kWh) - Solar: ${logEntry.solarKWh}, HP: ${logEntry.heatPumpKWh}`)
        }

        // Keep only last 100 entries to prevent memory issues
        if (timeSeriesData.value.length > 100) {
            timeSeriesData.value = timeSeriesData.value.slice(-100)
        }
    } else {
        console.log(`⚠️ Skipped duplicate timestep ${logEntry.hour}:00`)
    }
}

const toggleAutoLogging = () => {
    autoLogging.value = !autoLogging.value
    if (autoLogging.value) {
        console.log('%c📊 Auto-logging enabled - Time series data will be logged automatically', 'color: #16a34a; font-weight: bold;')
        // Log current state immediately
        logCurrentTimestep()
    } else {
        console.log('%c📊 Auto-logging disabled', 'color: #dc2626; font-weight: bold;')
    }
}

const copyTimeSeriesData = () => {
    const headers = ['Hour', 'TempOut', 'TempIn', 'SolarW/m²', 'SolarKWh', 'HeatPumpKWh', 'ERVkWh', 'BatteryKWh', 'Battery%', 'NetGridKWh', 'EnergyBalance', 'Comfort%', 'HenriMode', 'HPEnabled', 'SolarEnabled', 'BatteryEnabled', 'Timestamp']

    const csvData = [
        headers.join('\t'),
        ...timeSeriesData.value.map(row => [
            `${row.hour}:00`,
            row.tempOut,
            row.tempIn,
            row.solarRadiation,
            row.solarKWh,
            row.heatPumpKWh,
            row.ervKWh,
            row.batteryKWh,
            row.batteryPercent,
            row.netKWh,
            row.energyBalance,
            row.comfort,
            row.henriMode,
            row.hpEnabled ? 'Y' : 'N',
            row.solarEnabled ? 'Y' : 'N',
            row.batteryEnabled ? 'Y' : 'N',
            row.timestamp
        ].join('\t'))
    ].join('\n')

    navigator.clipboard.writeText(csvData).then(() => {
        console.log('%c📋 Time series data copied to clipboard (tab-separated)', 'color: #16a34a; font-weight: bold;')
    }).catch(err => {
        console.error('Failed to copy time series data:', err)
        console.log('%c📋 Time Series Data (copy manually):', 'color: #dc2626; font-weight: bold;')
        console.log(csvData)
    })
}

const clearTimeSeriesData = () => {
    timeSeriesData.value = []
    console.log('%c🗑️ Time series data cleared', 'color: #6b7280; font-weight: bold;')
}

const exportTimeSeriesCSV = () => {
    const headers = ['Hour', 'TempOut', 'TempIn', 'SolarW/m²', 'SolarKWh', 'HeatPumpKWh', 'ERVkWh', 'BatteryKWh', 'Battery%', 'NetGridKWh', 'EnergyBalance', 'Comfort%', 'HenriMode', 'HPEnabled', 'SolarEnabled', 'BatteryEnabled', 'Timestamp']

    const csvData = [
        headers.join(','),
        ...timeSeriesData.value.map(row => [
            `${row.hour}:00`,
            row.tempOut,
            row.tempIn,
            row.solarRadiation,
            row.solarKWh,
            row.heatPumpKWh,
            row.ervKWh,
            row.batteryKWh,
            row.batteryPercent,
            row.netKWh,
            row.energyBalance,
            row.comfort,
            row.henriMode,
            row.hpEnabled ? 'Y' : 'N',
            row.solarEnabled ? 'Y' : 'N',
            row.batteryEnabled ? 'Y' : 'N',
            row.timestamp
        ].join(','))
    ].join('\n')

    const blob = new Blob([csvData], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `henri-simulation-${new Date().toISOString().slice(0, 19)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    console.log('%c📄 CSV file downloaded', 'color: #16a34a; font-weight: bold;')
}

// Watch for simulation changes to auto-log

// Watch for time changes to auto-log (this covers automatic playback)
watch(() => simulationStore.houseState.time, (newTime, oldTime) => {
    if (autoLogging.value && newTime !== oldTime) {
        console.log(`⏰ Time changed from ${oldTime}:00 to ${newTime}:00 - logging timestep`)
        // Use nextTick to ensure the simulation has completed
        nextTick(() => {
            logCurrentTimestep()
        })
    }
})

// Watch for energy changes (this covers manual simulation runs)
watch(() => [
    simulationStore.houseState.energy.solarKWh,
    simulationStore.houseState.energy.batteryKWh,
    simulationStore.houseState.energy.heatPumpKWh
], () => {
    if (autoLogging.value) {
        console.log(`⚡ Energy state changed - logging timestep`)
        // Use nextTick to ensure the simulation has completed
        nextTick(() => {
            logCurrentTimestep()
        })
    }
})
</script>

<style scoped>
.house-simulation {
    max-width: none;
    margin: 0;
    padding: 1rem 2rem;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.simulation-header {
    background: white;
    border-radius: 0.75rem;
    padding: 1rem 2rem;
    box-shadow: 0 2px 4px -1px rgb(0 0 0 / 0.1);
    margin-bottom: 1rem;
    border: 1px solid #e5e7eb;
}

.header-main {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.header-text {
    flex: 1;
}

.simulation-header h1 {
    color: #111827;
    margin-bottom: 0.25rem;
    font-size: 1.75rem;
    font-weight: 700;
}

.simulation-subtitle {
    color: #374151;
    font-size: 0.9rem;
    font-weight: 500;
    margin: 0;
}

.time-display {
    text-align: right;
}

.time-display h2 {
    font-size: 1.75rem;
    font-weight: 700;
    color: #111827;
    margin-bottom: 0.25rem;
}

.time-display p {
    color: #6b7280;
    font-size: 0.875rem;
    margin: 0;
}

.daylight-info {
    color: #3b82f6 !important;
    font-weight: 600;
    font-size: 0.8rem !important;
}

.time-control-panel {
    display: flex;
    align-items: center;
    gap: 2rem;
}

.header-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-left: 2rem;
}

.location-controls {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 1rem;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
}

.location-controls label {
    font-size: 0.75rem;
    font-weight: 600;
    color: #475569;
    margin: 0;
}

.location-controls select {
    padding: 0.25rem 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    background: white;
    color: #374151;
    min-width: 80px;
}

.time-slider-container {
    flex: 1;
    max-width: 500px;
}

.time-slider {
    width: 100%;
    height: 12px;
    border-radius: 6px;
    background: #e5e7eb;
    outline: none;
    cursor: pointer;
    appearance: none;
    margin-bottom: 0.5rem;
}

.time-slider::-webkit-slider-thumb {
    appearance: none;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    border: 4px solid white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.time-slider::-moz-range-thumb {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    border: 4px solid white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.time-labels {
    display: flex;
    justify-content: space-between;
    margin-top: 0.25rem;
    font-size: 0.75rem;
    color: #6b7280;
    font-weight: 500;
}

.simulation-controls {
    display: flex;
    gap: 0.75rem;
    flex-shrink: 0;
}

.dashboard {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
    grid-auto-rows: min-content;
    max-width: 1400px;
    margin: 0 auto;
}

/* Ensure the debug table spans full width when in multi-column layout */
.testing-panel {
    grid-column: 1 / -1;
}

/* Ensure energy balance spans full width */
.energy-balance-section {
    grid-column: 1 / -1;
}

/* Ensure Henri comparison spans full width */
.henri-comparison-section {
    grid-column: 1 / -1;
}

/* Ensure safety panel spans full width */
.safety-panel {
    grid-column: 1 / -1;
}

.overview-panel,
.modules-panel,
.testing-panel,
.decision-panel {
    background: white;
    border-radius: 0.75rem;
    padding: 1rem;
    box-shadow: 0 2px 4px -1px rgb(0 0 0 / 0.1);
    border: 1px solid #e5e7eb;
}

.overview-panel h3,
.modules-panel h3,
.testing-panel h3,
.decision-panel h3 {
    color: #111827;
    margin-bottom: 0.75rem;
    font-size: 1.125rem;
    font-weight: 700;
}

.decisions-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    align-items: start;
    margin-bottom: 0.75rem;
}

.modes-section {
    margin-bottom: 1rem;
}

.modes-label {
    font-size: 0.75rem;
    color: #64748b;
    margin-bottom: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.modes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.mode-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 0.5rem;
    background: #f8fafc;
    border: 2px solid #e2e8f0;
    border-radius: 0.5rem;
    transition: all 0.2s ease;
    position: relative;
    min-height: 80px;
}

.mode-card.clickable {
    cursor: pointer;
}

.mode-card.clickable:hover {
    border-color: #3b82f6;
    background: #eff6ff;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.mode-card.active {
    background: #dbeafe;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.mode-card:not(.clickable) {
    opacity: 0.6;
    cursor: not-allowed;
}

.mode-icon {
    font-size: 1.5rem;
    margin-bottom: 0.25rem;
}

.mode-name {
    font-size: 0.75rem;
    font-weight: 600;
    color: #374151;
    text-align: center;
    line-height: 1.2;
}

.active-indicator {
    position: absolute;
    top: -8px;
    right: -8px;
    background: #10b981;
    color: white;
    font-size: 0.5rem;
    padding: 0.25rem 0.5rem;
    border-radius: 1rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.mode-explanation {
    background: #fffbeb;
    border: 1px solid #fed7aa;
    border-radius: 0.5rem;
    padding: 0.75rem;
    margin-bottom: 0.75rem;
    transition: all 0.2s ease;
}

.mode-explanation.preview-mode {
    background: #f0f9ff;
    border-color: #7dd3fc;
}

.explanation-label {
    font-size: 0.75rem;
    color: #92400e;
    margin-bottom: 0.5rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    transition: color 0.2s ease;
}

.mode-explanation.preview-mode .explanation-label {
    color: #0369a1;
}

.explanation-text {
    font-size: 0.8rem;
    color: #7c2d12;
    line-height: 1.4;
    font-weight: 500;
    transition: color 0.2s ease;
}

.mode-explanation.preview-mode .explanation-text {
    color: #075985;
}

.recent-decisions {
    background: #f8fafc;
    border-radius: 0.5rem;
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    margin-bottom: 0.75rem;
}

.decisions-label {
    font-size: 0.75rem;
    color: #64748b;
    margin-bottom: 0.5rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.decisions-list {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.decision-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8rem;
    padding: 0.25rem 0;
}

.decision-time {
    color: #6b7280;
    font-weight: 600;
    min-width: 3rem;
}

.decision-text {
    color: #374151;
    font-weight: 500;
    flex: 1;
}

.no-decisions {
    font-size: 0.8rem;
    color: #9ca3af;
    font-style: italic;
    text-align: center;
    padding: 0.5rem 0;
}

.next-adaptation {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: #eff6ff;
    border-radius: 0.5rem;
    border: 1px solid #bfdbfe;
    font-size: 0.8rem;
}

.adaptation-label {
    color: #1e40af;
    font-weight: 600;
}

.adaptation-text {
    color: #1e3a8a;
    font-weight: 500;
}

.metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 0.75rem;
    justify-content: center;
}

.metric-card {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: #f8fafc;
    border-radius: 0.5rem;
    border: 1px solid #e2e8f0;
    transition: all 0.2s ease;
}

.metric-card:hover {
    border-color: #cbd5e1;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.metric-card.comfortable {
    background: #f0fdf4;
    border-color: #86efac;
}

.metric-icon {
    font-size: 1.5rem;
    min-width: 2rem;
    text-align: center;
}

.metric-content {
    flex: 1;
    min-width: 0;
}

.metric-label {
    font-size: 0.75rem;
    color: #64748b;
    margin-bottom: 0.25rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.metric-value {
    font-size: 1.25rem;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 0.125rem;
    line-height: 1.2;
}

.metric-subtitle {
    font-size: 0.75rem;
    color: #64748b;
    font-weight: 500;
}

.modules-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.75rem;
}

.module-card {
    background: white;
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.module-card.module-disabled {
    opacity: 0.6;
    background: #f5f5f5;
}

.module-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
}

.module-header h4 {
    color: #1f2937;
    font-weight: 700;
    font-size: 1rem;
}

.module-status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.status-indicator {
    font-size: 0.8rem;
    font-weight: bold;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    background: #f0f0f0;
    transition: all 0.3s ease;
}

.status-indicator.active {
    background: #e8f5e8;
    color: #2d7a2d;
}

.status-indicator:not(.active) {
    background: #ffe6e6;
    color: #a63333;
}

.toggle-switch {
    position: relative;
    display: inline-block;
    width: 40px;
    height: 22px;
}

.toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #cbd5e1;
    transition: 0.3s;
    border-radius: 22px;
}

.toggle-slider:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 2px;
    bottom: 2px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

input:checked+.toggle-slider {
    background-color: #10b981;
}

input:checked+.toggle-slider:before {
    transform: translateX(18px);
}

.module-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.module-stat {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
    padding: 0.25rem 0;
}

.module-stat:last-child {
    border-bottom: none;
}

.module-stat span:first-child {
    color: #64748b;
    font-weight: 600;
}

.module-stat span:last-child {
    color: #0f172a;
    font-weight: 700;
}

.safety-panel {
    background: #fef2f2;
    border: 2px solid #fca5a5;
    border-radius: 1rem;
    padding: 2rem;
    margin-top: 1rem;
}

.safety-panel h3 {
    color: #dc2626;
    margin-bottom: 1rem;
}

.safety-message {
    color: #991b1b;
    margin-bottom: 1rem;
    font-weight: 600;
}

.testing-controls {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
}

.test-section {
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e5e7eb;
}

.test-section:last-of-type {
    border-bottom: none;
    margin-bottom: 0.5rem;
}

.test-section h4 {
    margin: 0 0 0.75rem 0;
    font-size: 0.9rem;
    font-weight: 600;
    color: #374151;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.telemetry-info {
    background: #f3f4f6;
    border-radius: 0.5rem;
    padding: 1rem;
    margin-top: 1rem;
    border-left: 4px solid #3b82f6;
}

.telemetry-info p {
    margin: 0 0 0.5rem 0;
    font-size: 0.85rem;
    color: #374151;
}

.telemetry-info p:last-child {
    margin-bottom: 0;
}

.active-scenario-panel {
    background: #fef3c7;
    border: 2px solid #f59e0b;
    border-radius: 0.75rem;
    padding: 1rem;
    margin-bottom: 1.5rem;
    animation: pulse-glow 2s ease-in-out infinite alternate;
}

@keyframes pulse-glow {
    0% {
        box-shadow: 0 0 5px rgba(245, 158, 11, 0.3);
    }

    100% {
        box-shadow: 0 0 20px rgba(245, 158, 11, 0.6);
    }
}

.scenario-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
}

.scenario-info {
    flex: 1;
}

.scenario-info h4 {
    margin: 0 0 0.5rem 0;
    color: #92400e;
    font-size: 1rem;
    font-weight: 700;
}

.scenario-details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.scenario-name {
    font-size: 1.1rem;
    font-weight: 700;
    color: #78350f;
}

.scenario-description {
    font-size: 0.9rem;
    color: #a16207;
    font-weight: 500;
}

@media (min-width: 1920px) {
    /* Removed metrics-grid override for better automatic layout */
}

@media (min-width: 1440px) and (max-width: 1919px) {
    /* Removed metrics-grid override for better automatic layout */
}

@media (min-width: 1024px) and (max-width: 1439px) {
    /* Removed metrics-grid override for better automatic layout */
}

@media (min-width: 1200px) {
    .dashboard {
        grid-template-columns: repeat(3, 1fr);
        max-width: 1400px;
    }
}

@media (min-width: 768px) and (max-width: 1199px) {
    .dashboard {
        grid-template-columns: repeat(2, 1fr);
        max-width: 100%;
    }
}

@media (max-width: 767px) {
    .dashboard {
        grid-template-columns: 1fr;
        max-width: 100%;
    }

    .metrics-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 767px) {
    .house-simulation {
        padding: 0.75rem;
    }

    .simulation-header {
        padding: 1rem;
    }

    .header-main {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
        margin-bottom: 1rem;
    }

    .time-display {
        text-align: left;
        width: 100%;
    }

    .time-control-panel {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
    }

    .dashboard {
        grid-template-columns: 1fr;
        max-width: 100%;
    }

    .metrics-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .modes-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .simulation-controls,
    .testing-controls {
        flex-direction: column;
    }

    .metric-card {
        padding: 0.5rem;
    }

    .module-card {
        padding: 0.5rem;
    }

    .simulation-header h1 {
        font-size: 1.5rem;
    }

    .time-display h2 {
        font-size: 1.5rem;
    }

    .scenario-header {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
    }

    .scenario-details {
        margin-bottom: 0.5rem;
    }
}

/* Energy Balance Section */
.energy-balance-section {
    margin-top: 1.5rem;
}

.energy-balance-loading {
    padding: 1rem;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    text-align: center;
}

.energy-balance-loading h3 {
    color: #374151;
    margin-bottom: 0.5rem;
}

.energy-balance-loading p {
    color: #6b7280;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
}

@media (max-width: 480px) {
    .metric-card {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
    }

    .metric-icon {
        font-size: 3rem;
    }

    .testing-controls {
        gap: 0.5rem;
    }
}

/* Debug Data Table Styles */
.debug-data-section {
    margin-top: 2rem;
    padding: 1.5rem;
    background: #ffffff;
    border-radius: 0.75rem;
    border: 2px solid #1f2937;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.debug-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #374151;
}

.debug-header h4 {
    margin: 0;
    color: #111827;
    font-size: 1.25rem;
    font-weight: 700;
}

.debug-controls {
    display: flex;
    gap: 0.5rem;
}

.timeseries-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.timeseries-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem;
    background: #f3f4f6;
    border-radius: 0.5rem;
    border: 1px solid #d1d5db;
}

.timeseries-info p {
    margin: 0;
    font-weight: 600;
    color: #374151;
}

.timeseries-table-container {
    overflow-x: auto;
    background: white;
    border-radius: 0.5rem;
    border: 2px solid #374151;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.timeseries-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.timeseries-table th {
    background-color: #1f2937;
    color: #ffffff;
    border: 1px solid #374151;
    padding: 0.75rem 0.5rem;
    text-align: left;
    font-weight: 700;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    white-space: nowrap;
}

.timeseries-table td {
    border: 1px solid #d1d5db;
    padding: 0.5rem;
    font-weight: 600;
    color: #111827;
    background-color: #ffffff;
    white-space: nowrap;
}

.timeseries-table tbody tr:nth-child(even) td {
    background-color: #f9fafb;
}

.timeseries-table tbody tr:hover td {
    background-color: #e5e7eb;
}

.timeseries-table tbody tr.current-hour td {
    background-color: #dbeafe !important;
    border-color: #3b82f6;
    font-weight: 700;
}

.timeseries-table tbody tr.energy-surplus td {
    background-color: #d1fae5 !important;
}

.timeseries-table tbody tr.energy-deficit td {
    background-color: #fee2e2 !important;
}

.timeseries-table tbody tr.battery-full td:nth-child(9) {
    background-color: #dcfce7 !important;
    color: #166534;
    font-weight: 700;
}

.timeseries-table tbody tr.battery-empty td:nth-child(9) {
    background-color: #fecaca !important;
    color: #991b1b;
    font-weight: 700;
}

.no-data {
    text-align: center;
    color: #6b7280;
    font-style: italic;
    background-color: #f9fafb !important;
}

/* Specific column styling for better readability */
.timeseries-table td:nth-child(1) {
    /* Hour */
    background-color: #f3f4f6;
    font-weight: 700;
    color: #1f2937;
}

.timeseries-table td:nth-child(5),
/* Solar kWh */
.timeseries-table td:nth-child(6),
/* Heat Pump kWh */
.timeseries-table td:nth-child(7),
/* ERV kWh */
.timeseries-table td:nth-child(8),
/* Battery kWh */
.timeseries-table td:nth-child(10),
/* Net Grid kWh */
.timeseries-table td:nth-child(11) {
    /* Energy Balance */
    font-weight: 700;
    color: #059669;
}

.timeseries-table td:nth-child(13) {
    /* Henri Mode */
    font-weight: 600;
    color: #7c2d12;
}

.timeseries-table td:nth-child(14),
/* HP Enabled */
.timeseries-table td:nth-child(15),
/* Solar Enabled */
.timeseries-table td:nth-child(16) {
    /* Battery Enabled */
    font-weight: 700;
    text-align: center;
}

@media (max-width: 768px) {
    .debug-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
    }

    .timeseries-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }

    .timeseries-table {
        font-size: 0.75rem;
    }

    .timeseries-table th,
    .timeseries-table td {
        padding: 0.375rem 0.25rem;
    }
}

/* Location & Season Controls Styling */
.current-location-display {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    padding: 1rem;
    margin-bottom: 1rem;
}

.location-info,
.season-info,
.climate-details {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
}

.climate-details {
    display: grid;
    grid-template-columns: auto 1fr auto 1fr;
    gap: 0.5rem 1rem;
    margin-bottom: 0;
}

.location-label,
.season-label,
.climate-label {
    font-size: 0.75rem;
    color: #64748b;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.location-value,
.season-value,
.climate-value {
    font-size: 0.875rem;
    color: #0f172a;
    font-weight: 700;
}

.selection-group {
    margin-bottom: 1rem;
}

.selection-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 0.5rem;
}

.city-selector,
.season-selector {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    background: white;
    font-size: 0.875rem;
    color: #374151;
    cursor: pointer;
    transition: all 0.2s ease;
}

.city-selector:hover,
.season-selector:hover {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.city-selector:focus,
.season-selector:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

@media (max-width: 768px) {
    .current-location-display {
        padding: 0.75rem;
    }

    .climate-details {
        grid-template-columns: 1fr;
        gap: 0.25rem;
    }

    .city-selector,
    .season-selector {
        padding: 0.5rem;
        font-size: 0.8rem;
    }
}

/* Test Scenarios Modal */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.modal-content {
    background: white;
    border-radius: 1rem;
    max-width: 700px;
    max-height: 80vh;
    width: 90%;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    animation: slideIn 0.3s ease-out;
    overflow: hidden;
}

@keyframes slideIn {
    from {
        transform: translateY(-20px) scale(0.95);
        opacity: 0;
    }

    to {
        transform: translateY(0) scale(1);
        opacity: 1;
    }
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    border-bottom: 1px solid #e5e7eb;
    background: #f8fafc;
}

.modal-header h3 {
    margin: 0;
    color: #111827;
    font-size: 1.25rem;
    font-weight: 700;
}

.modal-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #6b7280;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 0.25rem;
    transition: all 0.2s ease;
}

.modal-close:hover {
    background: #f3f4f6;
    color: #374151;
}

.modal-body {
    padding: 1.5rem 2rem;
    max-height: 60vh;
    overflow-y: auto;
}

/* Modal-specific styles for test sections */
.modal-body .test-section {
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e5e7eb;
}

.modal-body .test-section:last-of-type {
    border-bottom: none;
    margin-bottom: 0;
}

.modal-body .test-section h4 {
    margin: 0 0 0.75rem 0;
    font-size: 1rem;
    font-weight: 600;
    color: #374151;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.modal-body .testing-controls {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 0.75rem;
}

.modal-body .active-scenario-panel {
    background: #fef3c7;
    border: 2px solid #f59e0b;
    border-radius: 0.75rem;
    padding: 1rem;
    margin-bottom: 1.5rem;
}

@media (max-width: 768px) {
    .modal-content {
        width: 95%;
        max-height: 90vh;
        margin: 1rem;
    }

    .modal-header {
        padding: 1rem 1.5rem;
    }

    .modal-body {
        padding: 1rem 1.5rem;
    }

    .modal-body .testing-controls {
        grid-template-columns: 1fr;
    }
}
</style>
