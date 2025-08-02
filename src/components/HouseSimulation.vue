<template>
    <div class="house-simulation">
        <div class="simulation-header">
            <div class="header-main">
                <div class="header-text">
                    <h1>Henri Home Passive House Simulation</h1>
                    <p class="simulation-subtitle">
                        {{ formatDate(simulationStore.houseState.date) }} -
                        Denver, CO
                    </p>
                </div>
                <div class="time-display">
                    <h2>{{ formatTime(simulationStore.currentHour) }}</h2>
                    <p>Hour {{ simulationStore.currentHour }} of 24</p>
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
                                <div class="metric-subtitle">Target: {{
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
                        <div class="module-card">
                            <div class="module-header">
                                <h4>🔥 Heat Pump</h4>
                                <label class="toggle-switch">
                                    <input type="checkbox" :checked="isModuleEnabled('heatPump')"
                                        @change="toggleModule('heatPump')" />
                                    <span class="toggle-slider"></span>
                                </label>
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
                        <div class="module-card">
                            <div class="module-header">
                                <h4>💨 ERV System</h4>
                                <label class="toggle-switch">
                                    <input type="checkbox" :checked="isModuleEnabled('erv')"
                                        @change="toggleModule('erv')" />
                                    <span class="toggle-slider"></span>
                                </label>
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
                        <div class="module-card">
                            <div class="module-header">
                                <h4>☀️ Solar Panels</h4>
                                <label class="toggle-switch">
                                    <input type="checkbox" :checked="isModuleEnabled('solar')"
                                        @change="toggleModule('solar')" />
                                    <span class="toggle-slider"></span>
                                </label>
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
                        <div class="module-card">
                            <div class="module-header">
                                <h4>🔋 Battery Storage</h4>
                                <label class="toggle-switch">
                                    <input type="checkbox" :checked="isModuleEnabled('battery')"
                                        @change="toggleModule('battery')" />
                                    <span class="toggle-slider"></span>
                                </label>
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
                    <div class="decisions-grid">
                        <div class="current-mode">
                            <div class="mode-indicator" :class="simulationStore.currentMode">
                                {{ getModeIcon(simulationStore.currentMode) }}
                            </div>
                            <div class="mode-text">
                                <div class="mode-label">Current Mode</div>
                                <div class="mode-value">{{ formatMode(simulationStore.currentMode) }}</div>
                            </div>
                        </div>
                        <div class="recent-decisions">
                            <div class="decisions-label">Recent Decisions</div>
                            <div class="decisions-list">
                                <div v-for="decision in simulationStore.recentDecisions.slice(-3)" :key="decision.timestamp" 
                                     class="decision-item">
                                    <span class="decision-time">{{ formatDecisionTime(decision.timestamp) }}</span>
                                    <span class="decision-text">{{ decision.action }}</span>
                                </div>
                                <div v-if="simulationStore.recentDecisions.length === 0" class="no-decisions">
                                    No adaptive actions yet
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-if="simulationStore.nextAdaptation" class="next-adaptation">
                        <span class="adaptation-label">Next Adaptation:</span>
                        <span class="adaptation-text">{{ simulationStore.nextAdaptation }}</span>
                    </div>
                </div>

                <!-- Testing Panel -->
                <div class="testing-panel">
                    <h3>🧪 Testing & Scenarios</h3>
                    <div class="testing-controls">
                        <BaseButton @click="simulationStore.triggerSmokeEvent()" variant="danger" size="sm">
                            Trigger Smoke Event
                        </BaseButton>
                        <BaseButton @click="setTimeOfDay('morning')" variant="ghost" size="sm">
                            Morning (06:00)
                        </BaseButton>
                        <BaseButton @click="setTimeOfDay('noon')" variant="ghost" size="sm">
                            Noon (12:00)
                        </BaseButton>
                        <BaseButton @click="setTimeOfDay('evening')" variant="ghost" size="sm">
                            Evening (18:00)
                        </BaseButton>
                    </div>
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
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useSimulationStore } from '@/stores/simulation'
import { createHeatPumpModule } from '@/modules/HeatPumpModule'
import { createERVModule } from '@/modules/ERVModule'
import { createSolarModule } from '@/modules/SolarModule'
import { createBatteryModule } from '@/modules/BatteryModule'
import BaseButton from '@/components/ui/BaseButton.vue'

const simulationStore = useSimulationStore()

// Computed slider value that syncs with store
const timeSlider = computed({
    get: () => simulationStore.currentHour,
    set: (value: number) => simulationStore.setTime(value)
})

// Initialize modules
onMounted(() => {
    simulationStore.addModule(createHeatPumpModule())
    simulationStore.addModule(createERVModule())
    simulationStore.addModule(createSolarModule())
    simulationStore.addModule(createBatteryModule())
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

// Decision Engine Formatters
const getModeIcon = (mode: string) => {
    const modeIcons = {
        'normal': '🏠',
        'emergency': '🚨', 
        'energy-saving': '💡',
        'comfort-priority': '😌',
        'high-solar': '☀️',
        'low-battery': '🔋'
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
        'low-battery': 'Low Battery Mode'
    }
    return modeNames[mode as keyof typeof modeNames] || 'Normal Operation'
}

const formatDecisionTime = (timestamp: number) => {
    const hour = Math.floor(timestamp)
    return `${hour.toString().padStart(2, '0')}:00`
}
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

.time-control-panel {
    display: flex;
    align-items: center;
    gap: 2rem;
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
    display: flex;
    flex-direction: column;
    gap: 1rem;
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
    grid-template-columns: auto 1fr;
    gap: 1rem;
    align-items: start;
    margin-bottom: 0.75rem;
}

.current-mode {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: #f1f5f9;
    border-radius: 0.5rem;
    border: 1px solid #e2e8f0;
}

.mode-indicator {
    font-size: 2rem;
    min-width: 3rem;
    text-align: center;
    padding: 0.5rem;
    border-radius: 0.5rem;
    background: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.mode-indicator.emergency {
    background: #fef2f2;
    border: 2px solid #fca5a5;
}

.mode-indicator.energy-saving {
    background: #f0fdf4;
    border: 2px solid #86efac;
}

.mode-indicator.high-solar {
    background: #fffbeb;
    border: 2px solid #fcd34d;
}

.mode-text {
    flex: 1;
}

.mode-label {
    font-size: 0.75rem;
    color: #64748b;
    margin-bottom: 0.25rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.mode-value {
    font-size: 1rem;
    font-weight: 700;
    color: #0f172a;
}

.recent-decisions {
    background: #f8fafc;
    border-radius: 0.5rem;
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
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
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 0.75rem;
    justify-content: center;
}

.module-card {
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    padding: 0.75rem;
    background: #f8fafc;
    transition: all 0.2s ease;
}

.module-card:hover {
    border-color: #cbd5e1;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.module-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
}

.module-header h4 {
    color: #0f172a;
    font-size: 1rem;
    font-weight: 700;
    margin: 0;
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

@media (min-width: 1920px) {
    .metrics-grid {
        grid-template-columns: repeat(6, 200px);
    }

    .modules-grid {
        grid-template-columns: repeat(4, 300px);
    }
}

@media (min-width: 1440px) and (max-width: 1919px) {
    .metrics-grid {
        grid-template-columns: repeat(5, 200px);
    }

    .modules-grid {
        grid-template-columns: repeat(3, 300px);
    }
}

@media (min-width: 1024px) and (max-width: 1439px) {
    .metrics-grid {
        grid-template-columns: repeat(4, 200px);
    }

    .modules-grid {
        grid-template-columns: repeat(2, 300px);
    }
}

@media (max-width: 1023px) {
    .metrics-grid {
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    }

    .modules-grid {
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    }
}

@media (max-width: 768px) {
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

    .metrics-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .modules-grid {
        grid-template-columns: 1fr;
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
</style>
