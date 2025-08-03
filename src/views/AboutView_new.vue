<template>
    <div class="about">
        <div class="about-container">
            <h1>About Henri Home Passive House Simulation</h1>

            <section class="intro">
                <p>
                    This simulation models a modern Passive House (Henri Home) with advanced environmental
                    systems that work together to maintain comfort while minimizing energy consumption.
                </p>
            </section>

            <!-- Configuration Section -->
            <section class="configuration">
                <div class="config-header">
                    <h2>⚙️ System Configuration</h2>
                    <div class="config-controls">
                        <button @click="toggleEditMode" :class="['config-button', { active: configStore.isEditing }]">
                            {{ configStore.isEditing ? '💾 Save Changes' : '✏️ Edit Configuration' }}
                        </button>
                        <button v-if="configStore.isEditing" class="config-button secondary" @click="resetToDefaults">
                            🔄 Reset to Defaults
                        </button>
                        <div v-if="configStore.isEditing" class="preset-selector">
                            <select @change="loadPreset(($event.target as HTMLSelectElement).value)"
                                class="preset-select">
                                <option value="">Load Preset...</option>
                                <option value="minimal-ph">Minimal Passive House</option>
                                <option value="premium-ph">Premium Passive House</option>
                                <option value="retrofit">Retrofit/EnerPHit</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Building Envelope Configuration -->
                <div v-if="configStore.isEditing" class="config-section">
                    <h3>🏠 Building Envelope</h3>
                    <div class="config-grid">
                        <div class="config-item">
                            <label>Floor Area (m²)</label>
                            <input v-model.number="configStore.building.floorArea" type="number"
                                :min="configStore.validationRanges.building.floorArea.min"
                                :max="configStore.validationRanges.building.floorArea.max" @input="onConfigChange" />
                            <small class="config-hint">{{ configStore.getValidationMessage('building', 'floorArea')
                                }}</small>
                        </div>

                        <div class="config-item">
                            <label>Wall R-Value (m²·K/W)</label>
                            <input v-model.number="configStore.building.wallR" type="number" step="0.1"
                                :min="configStore.validationRanges.building.wallR.min"
                                :max="configStore.validationRanges.building.wallR.max" @input="onConfigChange" />
                            <small class="config-hint">{{ configStore.getValidationMessage('building', 'wallR')
                                }}</small>
                        </div>

                        <div class="config-item">
                            <label>Roof R-Value (m²·K/W)</label>
                            <input v-model.number="configStore.building.roofR" type="number" step="0.1"
                                :min="configStore.validationRanges.building.roofR.min"
                                :max="configStore.validationRanges.building.roofR.max" @input="onConfigChange" />
                            <small class="config-hint">{{ configStore.getValidationMessage('building', 'roofR')
                                }}</small>
                        </div>

                        <div class="config-item">
                            <label>Window U-Value (W/m²·K)</label>
                            <input v-model.number="configStore.building.windowU" type="number" step="0.1"
                                :min="configStore.validationRanges.building.windowU.min"
                                :max="configStore.validationRanges.building.windowU.max" @input="onConfigChange" />
                            <small class="config-hint">{{ configStore.getValidationMessage('building', 'windowU')
                                }}</small>
                        </div>

                        <div class="config-item">
                            <label>Window Area (m²)</label>
                            <input v-model.number="configStore.building.windowArea" type="number"
                                :min="configStore.validationRanges.building.windowArea.min"
                                :max="configStore.validationRanges.building.windowArea.max" @input="onConfigChange" />
                            <small class="config-hint">{{ configStore.getValidationMessage('building', 'windowArea')
                                }}</small>
                        </div>

                        <div class="config-item">
                            <label>Air Leakage (ACH)</label>
                            <input v-model.number="configStore.building.infiltrationRate" type="number" step="0.1"
                                :min="configStore.validationRanges.building.infiltrationRate.min"
                                :max="configStore.validationRanges.building.infiltrationRate.max"
                                @input="onConfigChange" />
                            <small class="config-hint">{{ configStore.getValidationMessage('building',
                                'infiltrationRate') }}</small>
                        </div>
                    </div>

                    <div class="calculated-values">
                        <h4>📊 Calculated Values</h4>
                        <div class="calc-grid">
                            <div class="calc-item">
                                <strong>Volume:</strong> {{ configStore.getVolume().toFixed(0) }} m³
                            </div>
                            <div class="calc-item">
                                <strong>Window-to-Floor Ratio:</strong> {{
                                    configStore.getWindowToFloorRatio().toFixed(1) }}%
                            </div>
                        </div>
                    </div>
                </div>

                <!-- HVAC System Configuration -->
                <div v-if="configStore.isEditing" class="config-section">
                    <h3>🔥 Heat Pump System</h3>
                    <div class="config-grid">
                        <div class="config-item">
                            <label>Capacity (kW)</label>
                            <input v-model.number="configStore.hvac.heatPump.capacity" type="number" step="0.1"
                                :min="configStore.validationRanges.heatPump.capacity.min"
                                :max="configStore.validationRanges.heatPump.capacity.max" @input="onConfigChange" />
                            <small class="config-hint">{{ configStore.getValidationMessage('heatPump', 'capacity')
                                }}</small>
                        </div>

                        <div class="config-item">
                            <label>COP Heating</label>
                            <input v-model.number="configStore.hvac.heatPump.copHeating" type="number" step="0.1"
                                :min="configStore.validationRanges.heatPump.copHeating.min"
                                :max="configStore.validationRanges.heatPump.copHeating.max" @input="onConfigChange" />
                            <small class="config-hint">{{ configStore.getValidationMessage('heatPump', 'copHeating')
                                }}</small>
                        </div>

                        <div class="config-item">
                            <label>COP Cooling</label>
                            <input v-model.number="configStore.hvac.heatPump.copCooling" type="number" step="0.1"
                                :min="configStore.validationRanges.heatPump.copCooling.min"
                                :max="configStore.validationRanges.heatPump.copCooling.max" @input="onConfigChange" />
                            <small class="config-hint">{{ configStore.getValidationMessage('heatPump', 'copCooling')
                                }}</small>
                        </div>
                    </div>
                </div>

                <!-- ERV System Configuration -->
                <div v-if="configStore.isEditing" class="config-section">
                    <h3>💨 ERV System</h3>
                    <div class="config-grid">
                        <div class="config-item">
                            <label>Flow Rate (m³/h)</label>
                            <input v-model.number="configStore.hvac.erv.flowRate" type="number"
                                :min="configStore.validationRanges.erv.flowRate.min"
                                :max="configStore.validationRanges.erv.flowRate.max" @input="onConfigChange" />
                            <small class="config-hint">{{ configStore.getValidationMessage('erv', 'flowRate') }}</small>
                        </div>

                        <div class="config-item">
                            <label>Heat Recovery Efficiency (%)</label>
                            <input v-model.number="ervEfficiencyPercent" type="number" min="50" max="95"
                                @input="onERVEfficiencyChange" />
                            <small class="config-hint">{{ configStore.getValidationMessage('erv', 'efficiency')
                                }}</small>
                        </div>

                        <div class="config-item">
                            <label>Fan Power (W)</label>
                            <input v-model.number="configStore.hvac.erv.fanPower" type="number"
                                :min="configStore.validationRanges.erv.fanPower.min"
                                :max="configStore.validationRanges.erv.fanPower.max" @input="onConfigChange" />
                            <small class="config-hint">{{ configStore.getValidationMessage('erv', 'fanPower') }}</small>
                        </div>
                    </div>
                </div>

                <!-- Solar System Configuration -->
                <div v-if="configStore.isEditing" class="config-section">
                    <h3>☀️ Solar System</h3>
                    <div class="config-grid">
                        <div class="config-item">
                            <label>Panel Area (m²)</label>
                            <input v-model.number="configStore.hvac.solar.panelArea" type="number"
                                :min="configStore.validationRanges.solar.panelArea.min"
                                :max="configStore.validationRanges.solar.panelArea.max" @input="onConfigChange" />
                            <small class="config-hint">{{ configStore.getValidationMessage('solar', 'panelArea')
                                }}</small>
                        </div>

                        <div class="config-item">
                            <label>Panel Efficiency (%)</label>
                            <input v-model.number="solarEfficiencyPercent" type="number" min="15" max="25"
                                @input="onSolarEfficiencyChange" />
                            <small class="config-hint">{{ configStore.getValidationMessage('solar', 'panelEfficiency')
                                }}</small>
                        </div>

                        <div class="config-item">
                            <label>Inverter Efficiency (%)</label>
                            <input v-model.number="inverterEfficiencyPercent" type="number" min="90" max="98"
                                @input="onInverterEfficiencyChange" />
                            <small class="config-hint">{{ configStore.getValidationMessage('solar',
                                'inverterEfficiency') }}</small>
                        </div>
                    </div>
                </div>

                <!-- Battery System Configuration -->
                <div v-if="configStore.isEditing" class="config-section">
                    <h3>🔋 Battery System</h3>
                    <div class="config-grid">
                        <div class="config-item">
                            <label>Capacity (kWh)</label>
                            <input v-model.number="configStore.hvac.battery.capacity" type="number"
                                :min="configStore.validationRanges.battery.capacity.min"
                                :max="configStore.validationRanges.battery.capacity.max" @input="onConfigChange" />
                            <small class="config-hint">{{ configStore.getValidationMessage('battery', 'capacity')
                                }}</small>
                        </div>

                        <div class="config-item">
                            <label>Charge Rate (kW)</label>
                            <input v-model.number="configStore.hvac.battery.chargeRate" type="number" step="0.1"
                                :min="configStore.validationRanges.battery.chargeRate.min"
                                :max="configStore.validationRanges.battery.chargeRate.max" @input="onConfigChange" />
                            <small class="config-hint">{{ configStore.getValidationMessage('battery', 'chargeRate')
                                }}</small>
                        </div>

                        <div class="config-item">
                            <label>Round-trip Efficiency (%)</label>
                            <input v-model.number="batteryEfficiencyPercent" type="number" min="80" max="98"
                                @input="onBatteryEfficiencyChange" />
                            <small class="config-hint">{{ configStore.getValidationMessage('battery', 'efficiency')
                                }}</small>
                        </div>
                    </div>
                </div>

                <!-- Performance Summary -->
                <div class="config-summary">
                    <h4>📈 Current System Performance Assessment</h4>
                    <div class="summary-grid">
                        <div :class="['summary-item', getPerformanceClass('envelope')]">
                            <strong>Building Envelope:</strong><br>
                            {{ getBuildingPerformance() }}
                        </div>
                        <div :class="['summary-item', getPerformanceClass('hvac')]">
                            <strong>HVAC Sizing:</strong><br>
                            {{ getHVACPerformance() }}
                        </div>
                        <div :class="['summary-item', getPerformanceClass('renewable')]">
                            <strong>Renewable Energy:</strong><br>
                            {{ getRenewablePerformance() }}
                        </div>
                    </div>
                </div>
            </section>

            <section class="modules">
                <h2>Current System Specifications</h2>

                <div class="module-grid">
                    <div class="module-info">
                        <h3>🔥 Heat Pump System</h3>
                        <p>
                            The primary heating and cooling system with configurable capacity and efficiency.
                            Current settings: {{ configStore.hvac.heatPump.capacity }}kW capacity with
                            COP of {{ configStore.hvac.heatPump.copHeating }} for heating.
                        </p>
                    </div>

                    <div class="module-info">
                        <h3>💨 Energy Recovery Ventilation (ERV)</h3>
                        <p>
                            Provides fresh outdoor air while recovering thermal energy from outgoing air.
                            Current settings: {{ configStore.hvac.erv.flowRate }}m³/h flow rate with
                            {{ (configStore.hvac.erv.efficiency * 100).toFixed(0) }}% heat recovery efficiency.
                        </p>
                    </div>

                    <div class="module-info">
                        <h3>☀️ Solar Panel System</h3>
                        <p>
                            {{ configStore.hvac.solar.panelArea }}m² of solar panels generate clean electricity during
                            daylight hours.
                            {{ (configStore.hvac.solar.panelEfficiency * 100).toFixed(0) }}% panel efficiency with
                            {{ (configStore.hvac.solar.inverterEfficiency * 100).toFixed(0) }}% inverter efficiency.
                        </p>
                    </div>

                    <div class="module-info">
                        <h3>🔋 Battery Storage</h3>
                        <p>
                            {{ configStore.hvac.battery.capacity }}kWh battery system stores excess solar energy
                            with {{ (configStore.hvac.battery.efficiency * 100).toFixed(0) }}% round-trip efficiency.
                            Charge/discharge rate: {{ configStore.hvac.battery.chargeRate }}kW.
                        </p>
                    </div>
                </div>
            </section>

            <section class="building">
                <h2>Current Building Characteristics</h2>
                <div class="building-specs">
                    <div class="spec-item">
                        <strong>Floor Area:</strong> {{ configStore.building.floorArea }} m²
                    </div>
                    <div class="spec-item">
                        <strong>Wall Insulation:</strong> R-{{ configStore.building.wallR }} m²·K/W
                    </div>
                    <div class="spec-item">
                        <strong>Roof Insulation:</strong> R-{{ configStore.building.roofR }} m²·K/W
                    </div>
                    <div class="spec-item">
                        <strong>Windows:</strong> {{ configStore.building.windowArea }} m² with U-value of {{
                            configStore.building.windowU }} W/m²·K
                    </div>
                    <div class="spec-item">
                        <strong>Air Leakage:</strong> {{ configStore.building.infiltrationRate }} ACH ({{
                        getAirtightnessRating() }})
                    </div>
                    <div class="spec-item">
                        <strong>Volume:</strong> {{ configStore.getVolume().toFixed(0) }} m³
                    </div>
                </div>
            </section>

            <section class="location">
                <h2>Multi-Climate Simulation</h2>
                <p>
                    The simulation features <strong>enhanced climate modeling</strong> with support for multiple cities
                    and seasonal variations. Choose from 9 global locations and 4 key seasonal dates to explore
                    passive house performance across different climates.
                </p>

                <div class="climate-features">
                    <div class="feature-group">
                        <h3>🌍 Global Cities</h3>
                        <ul>
                            <li><strong>San Francisco, USA</strong> - Mediterranean climate (37.8°N)</li>
                            <li><strong>Denver, USA</strong> - Continental semi-arid (39.7°N)</li>
                            <li><strong>Los Angeles, USA</strong> - Mediterranean/desert (34.1°N)</li>
                            <li><strong>Chicago, USA</strong> - Continental humid (41.9°N)</li>
                            <li><strong>New York, USA</strong> - Humid subtropical (40.7°N)</li>
                            <li><strong>Miami, USA</strong> - Tropical (25.8°N)</li>
                            <li><strong>Dallas, USA</strong> - Humid subtropical (32.8°N)</li>
                            <li><strong>London, UK</strong> - Oceanic (51.5°N)</li>
                            <li><strong>Frankfurt, Germany</strong> - Continental oceanic (50.1°N)</li>
                        </ul>
                    </div>

                    <div class="feature-group">
                        <h3>📅 Seasonal Dates</h3>
                        <ul>
                            <li><strong>Winter Solstice</strong> (Dec 21) - Shortest day, minimal solar gain</li>
                            <li><strong>Spring Equinox</strong> (Mar 20) - Equal day/night, moderate solar</li>
                            <li><strong>Summer Solstice</strong> (Jun 21) - Longest day, maximum solar gain</li>
                            <li><strong>Fall Equinox</strong> (Sep 22) - Equal day/night, moderate solar</li>
                        </ul>
                    </div>
                </div>

                <p>
                    Each climate configuration includes realistic temperature ranges, humidity patterns,
                    air quality baselines, and accurate solar radiation calculations based on latitude
                    and seasonal solar angles.
                </p>

                <h3>🌤️ Enhanced Climate Modeling Features</h3>
                <ul>
                    <li>Realistic diurnal temperature variations based on continental vs. maritime influence</li>
                    <li>Accurate solar radiation calculations using solar elevation and atmospheric transmission</li>
                    <li>Humidity patterns that respond to temperature and geographic location</li>
                    <li>Air quality baselines reflecting regional pollution levels</li>
                    <li>Day length calculations for each latitude and season</li>
                    <li>Solar declination angles for precise seasonal solar modeling</li>
                </ul>
            </section>

            <section class="comfort">
                <h2>Comfort Scoring</h2>
                <p>
                    The comfort score (0-100%) evaluates how well the house systems maintain
                    occupant comfort based on:
                </p>
                <ul>
                    <li><strong>Temperature:</strong> ±2°C from target is comfortable</li>
                    <li><strong>Humidity:</strong> 30-60% relative humidity is ideal</li>
                    <li><strong>Air Quality:</strong> >80% normalized air quality is good</li>
                    <li><strong>Safety:</strong> Emergency events reduce comfort</li>
                </ul>
            </section>

            <section class="usage">
                <h2>How to Use</h2>
                <ol>
                    <li>Use the <strong>time slider</strong> to simulate different hours of the day</li>
                    <li><strong>Toggle modules</strong> on/off to see their individual effects</li>
                    <li>Try the <strong>preset times</strong> (morning, noon, evening) for quick scenarios</li>
                    <li>Trigger a <strong>smoke event</strong> to see safety system responses</li>
                    <li>Watch how <strong>energy flows</strong> change throughout the day</li>
                    <li><strong>Edit configuration</strong> in this page to explore different building designs</li>
                </ol>
            </section>

        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useConfigurationStore } from '@/stores/configuration'
import { useSimulationStore } from '@/stores/simulation'

// Stores
const configStore = useConfigurationStore()
const simulationStore = useSimulationStore()

// Local reactive values for percentage inputs
const ervEfficiencyPercent = ref((configStore.hvac.erv.efficiency * 100))
const solarEfficiencyPercent = ref((configStore.hvac.solar.panelEfficiency * 100))
const inverterEfficiencyPercent = ref((configStore.hvac.solar.inverterEfficiency * 100))
const batteryEfficiencyPercent = ref((configStore.hvac.battery.efficiency * 100))

// Actions
const toggleEditMode = () => {
    if (configStore.isEditing) {
        // Save changes - sync to simulation
        simulationStore.refreshFromConfiguration()
        configStore.hasUnsavedChanges = false
    }
    configStore.isEditing = !configStore.isEditing
}

const resetToDefaults = () => {
    configStore.resetToDefaults()
    updatePercentageValues()
    onConfigChange()
}

const loadPreset = (presetName: string) => {
    if (presetName) {
        configStore.loadPreset(presetName)
        updatePercentageValues()
        onConfigChange()
    }
}

const onConfigChange = () => {
    configStore.hasUnsavedChanges = true
    // Optionally sync immediately for live preview
    simulationStore.updateFromConfiguration()
}

// Percentage input handlers
const onERVEfficiencyChange = () => {
    configStore.hvac.erv.efficiency = ervEfficiencyPercent.value / 100
    onConfigChange()
}

const onSolarEfficiencyChange = () => {
    configStore.hvac.solar.panelEfficiency = solarEfficiencyPercent.value / 100
    onConfigChange()
}

const onInverterEfficiencyChange = () => {
    configStore.hvac.solar.inverterEfficiency = inverterEfficiencyPercent.value / 100
    onConfigChange()
}

const onBatteryEfficiencyChange = () => {
    configStore.hvac.battery.efficiency = batteryEfficiencyPercent.value / 100
    onConfigChange()
}

const updatePercentageValues = () => {
    ervEfficiencyPercent.value = configStore.hvac.erv.efficiency * 100
    solarEfficiencyPercent.value = configStore.hvac.solar.panelEfficiency * 100
    inverterEfficiencyPercent.value = configStore.hvac.solar.inverterEfficiency * 100
    batteryEfficiencyPercent.value = configStore.hvac.battery.efficiency * 100
}

// Performance assessment functions
const getAirtightnessRating = () => {
    const rate = configStore.building.infiltrationRate
    if (rate <= 0.6) return 'excellent Passive House standard'
    if (rate <= 1.0) return 'very tight construction'
    if (rate <= 2.0) return 'tight construction'
    return 'standard construction'
}

const getBuildingPerformance = () => {
    const wallR = configStore.building.wallR
    const windowU = configStore.building.windowU
    const infiltration = configStore.building.infiltrationRate

    if (wallR >= 5.0 && windowU <= 0.8 && infiltration <= 0.6) {
        return 'Excellent Passive House Standard'
    } else if (wallR >= 4.0 && windowU <= 1.0 && infiltration <= 1.0) {
        return 'Good Energy Efficient Standard'
    } else if (wallR >= 3.0 && windowU <= 1.5 && infiltration <= 2.0) {
        return 'Standard Energy Code Compliant'
    } else {
        return 'Below Standard - Needs Improvement'
    }
}

const getHVACPerformance = () => {
    const heatPumpCapacity = configStore.hvac.heatPump.capacity
    const floorArea = configStore.building.floorArea
    const capacityPerArea = heatPumpCapacity / floorArea * 1000 // W/m²

    if (capacityPerArea <= 15) {
        return 'Properly Sized for Passive House'
    } else if (capacityPerArea <= 25) {
        return 'Slightly Oversized but Acceptable'
    } else if (capacityPerArea <= 40) {
        return 'Oversized - Consider Reducing'
    } else {
        return 'Dramatically Oversized - Needs Correction'
    }
}

const getRenewablePerformance = () => {
    const solarArea = configStore.hvac.solar.panelArea
    const floorArea = configStore.building.floorArea
    const solarRatio = solarArea / floorArea

    if (solarRatio >= 0.3) {
        return 'Excellent Solar Coverage'
    } else if (solarRatio >= 0.2) {
        return 'Good Solar Coverage'
    } else if (solarRatio >= 0.1) {
        return 'Modest Solar Coverage'
    } else {
        return 'Limited Solar Coverage'
    }
}

const getPerformanceClass = (category: string) => {
    let performance = ''
    if (category === 'envelope') {
        performance = getBuildingPerformance()
    } else if (category === 'hvac') {
        performance = getHVACPerformance()
    } else if (category === 'renewable') {
        performance = getRenewablePerformance()
    }

    if (performance.includes('Excellent') || performance.includes('Properly')) {
        return 'excellent'
    } else if (performance.includes('Good') || performance.includes('Acceptable')) {
        return 'good'
    } else if (performance.includes('Standard') || performance.includes('Modest')) {
        return 'standard'
    } else {
        return 'poor'
    }
}

// Watch for configuration changes to sync percentage values
watch(() => [
    configStore.hvac.erv.efficiency,
    configStore.hvac.solar.panelEfficiency,
    configStore.hvac.solar.inverterEfficiency,
    configStore.hvac.battery.efficiency,
], updatePercentageValues)
</script>

<style scoped>
.about {
    min-height: 100vh;
    padding: 2rem;
    background: #f8fafc;
}

.about-container {
    max-width: 1000px;
    margin: 0 auto;
    background: white;
    border-radius: 1rem;
    padding: 3rem;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

h1 {
    color: #111827;
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 2rem;
    text-align: center;
}

h2 {
    color: #1f2937;
    font-size: 1.75rem;
    font-weight: 600;
    margin: 2.5rem 0 1.5rem 0;
    border-bottom: 2px solid #e5e7eb;
    padding-bottom: 0.5rem;
}

h3 {
    color: #111827;
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
}

section {
    margin-bottom: 2rem;
}

.intro p {
    font-size: 1.2rem;
    color: #374151;
    line-height: 1.7;
    text-align: center;
    margin-bottom: 2rem;
    font-weight: 500;
}

.module-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}

.module-info {
    background: #f9fafb;
    border-radius: 0.75rem;
    padding: 2rem;
    border: 1px solid #e5e7eb;
}

.module-info p {
    color: #374151;
    line-height: 1.6;
    font-weight: 500;
}

.building-specs {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
}

.spec-item {
    background: #ffffff;
    padding: 1.5rem;
    border-radius: 0.75rem;
    border: 2px solid #e5e7eb;
    border-left: 4px solid #3b82f6;
    color: #111827;
    font-weight: 500;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.spec-item strong {
    color: #1f2937;
    font-weight: 700;
}

ul,
ol {
    color: #374151;
    line-height: 1.6;
    font-weight: 500;
}

li {
    margin-bottom: 0.5rem;
}

p {
    color: #374151;
    line-height: 1.6;
    font-weight: 500;
}

.climate-features {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin: 1.5rem 0;
}

.feature-group h3 {
    color: #1f2937;
    font-size: 1.125rem;
    margin-bottom: 1rem;
    border-bottom: 2px solid #e5e7eb;
    padding-bottom: 0.5rem;
}

.feature-group ul {
    margin: 0;
}

.feature-group li {
    margin-bottom: 0.75rem;
    padding-left: 0.5rem;
}

/* Configuration Section Styles */
.configuration {
    background: #f8fafc;
    border-radius: 1rem;
    padding: 2rem;
    margin: 2rem 0;
    border: 2px solid #e5e7eb;
}

.config-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
}

.config-controls {
    display: flex;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
}

.config-button {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.875rem;
}

.config-button:hover {
    background: #2563eb;
    transform: translateY(-1px);
}

.config-button.active {
    background: #059669;
}

.config-button.secondary {
    background: #6b7280;
}

.config-button.secondary:hover {
    background: #4b5563;
}

.preset-select {
    padding: 0.5rem;
    border: 2px solid #d1d5db;
    border-radius: 0.375rem;
    background: white;
    font-size: 0.875rem;
}

.config-section {
    background: white;
    border-radius: 0.75rem;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    border: 1px solid #e5e7eb;
}

.config-section h3 {
    color: #1f2937;
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #e5e7eb;
}

.config-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
}

.config-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.config-item label {
    font-weight: 600;
    color: #374151;
    font-size: 0.875rem;
}

.config-item input {
    padding: 0.75rem;
    border: 2px solid #d1d5db;
    border-radius: 0.375rem;
    font-size: 1rem;
    transition: border-color 0.2s;
}

.config-item input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.config-hint {
    color: #6b7280;
    font-size: 0.75rem;
    font-style: italic;
}

.calculated-values {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid #e5e7eb;
}

.calculated-values h4 {
    color: #1f2937;
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 1rem;
}

.calc-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
}

.calc-item {
    background: #f3f4f6;
    padding: 1rem;
    border-radius: 0.5rem;
    border-left: 4px solid #3b82f6;
}

.config-summary {
    background: #ffffff;
    border-radius: 0.75rem;
    padding: 2rem;
    border: 2px solid #e5e7eb;
    margin-top: 2rem;
}

.config-summary h4 {
    color: #1f2937;
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
}

.summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
}

.summary-item {
    padding: 1.5rem;
    border-radius: 0.5rem;
    border-left: 4px solid;
}

.summary-item.excellent {
    background: #f0fdf4;
    border-left-color: #16a34a;
    color: #15803d;
}

.summary-item.good {
    background: #fefce8;
    border-left-color: #ca8a04;
    color: #a16207;
}

.summary-item.standard {
    background: #fff7ed;
    border-left-color: #ea580c;
    color: #c2410c;
}

.summary-item.poor {
    background: #fef2f2;
    border-left-color: #dc2626;
    color: #b91c1c;
}

@media (max-width: 768px) {
    .about {
        padding: 1rem;
    }

    .about-container {
        padding: 2rem;
    }

    h1 {
        font-size: 2rem;
    }

    .climate-features {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }

    .module-grid {
        grid-template-columns: 1fr;
    }

    .building-specs {
        grid-template-columns: 1fr;
    }

    .config-grid {
        grid-template-columns: 1fr;
    }

    .calc-grid {
        grid-template-columns: 1fr;
    }

    .summary-grid {
        grid-template-columns: 1fr;
    }
}
</style>
