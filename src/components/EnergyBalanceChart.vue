<template>
    <div class="energy-balance-charts">
        <h3 class="chart-title">Energy Balance Analysis</h3>

        <!-- Explanation -->
        <div class="chart-explanation">
            <p v-if="activeChart === 'heating'">
                <strong>🔥 Winter Analysis:</strong> Shows how much energy your home loses vs. gains during cold
                weather.
                The bigger the gap between losses and gains, the more heating you need.
            </p>
            <p v-else>
                <strong>❄️ Summer Analysis:</strong> Shows heat entering your home vs. cooling capacity during hot
                weather.
                When heat gains exceed losses, you need cooling to stay comfortable.
            </p>
        </div>

        <!-- Toggle between heating and cooling -->
        <div class="chart-controls">
            <BaseButton :class="{ active: activeChart === 'heating' }" @click="activeChart = 'heating'">
                🔥 Winter Analysis
            </BaseButton>
            <BaseButton :class="{ active: activeChart === 'cooling' }" @click="activeChart = 'cooling'">
                ❄️ Summer Analysis
            </BaseButton>
        </div>

        <!-- Energy Balance Chart -->
        <div class="energy-chart-container">
            <div class="chart-header">
                <h4>{{ chartTitle }}</h4>
                <div class="load-summary">
                    <span>{{ currentLoadType }} Load: </span>
                    <strong>{{ currentLoad.toFixed(1) }} kWh</strong>
                    <span class="area-specific">
                        ({{ areaSpecificLoad.toFixed(1) }} kWh/m²)
                    </span>
                </div>
            </div>

            <!-- Stacked Bar Chart -->
            <div class="stacked-chart">
                <!-- Losses Bar -->
                <div class="chart-section">
                    <h5>{{ activeChart === 'heating' ? 'Heat Escaping (Losses)' : 'Heat Entering (Loads)' }}</h5>
                    <div class="stacked-bar losses-bar">
                        <div v-for="(loss, key) in displayLosses" :key="key" class="bar-segment loss-segment"
                            :class="`loss-${key}`" :style="{ height: `${getLossHeight(loss)}px` }"
                            :title="`${getLossLabel(key)}: ${loss.toFixed(2)} kWh`">
                            <span v-if="getLossHeight(loss) > 20" class="segment-value">{{ loss.toFixed(1) }}</span>
                        </div>
                    </div>
                    <div class="bar-label">{{ activeChart === 'heating' ? 'Heat Lost' : 'Heat Gained' }}</div>
                </div>

                <!-- Gains Bar -->
                <div class="chart-section">
                    <h5>{{ activeChart === 'heating' ? 'Heat Sources (Gains)' : 'Cooling Sources' }}</h5>
                    <div class="stacked-bar gains-bar">
                        <div v-for="(gain, key) in displayGains" :key="key" class="bar-segment gain-segment"
                            :class="`gain-${key}`" :style="{ height: `${getGainHeight(gain)}px` }"
                            :title="`${getGainLabel(key)}: ${gain.toFixed(2)} kWh`">
                            <span v-if="getGainHeight(gain) > 20" class="segment-value">{{ gain.toFixed(1) }}</span>
                        </div>
                    </div>
                    <div class="bar-label">{{ activeChart === 'heating' ? 'Free Heat' : 'Cooling Need' }}</div>
                </div>
            </div>

            <!-- Legend -->
            <div class="chart-legend">
                <div class="legend-section">
                    <h6>{{ activeChart === 'heating' ? 'Where Heat Escapes From' : 'Where Heat Enters From' }}</h6>
                    <div class="legend-items">
                        <div v-for="(loss, key) in displayLosses" :key="key" class="legend-item">
                            <div class="legend-color" :class="`loss-${key}`"></div>
                            <span>{{ getLossLabel(key) }}</span>
                        </div>
                    </div>
                </div>

                <div class="legend-section">
                    <h6>{{ activeChart === 'heating' ? 'Sources of Free Heat' : 'Cooling Requirements' }}</h6>
                    <div class="legend-items">
                        <div v-for="(gain, key) in displayGains" :key="key" class="legend-item">
                            <div class="legend-color" :class="`gain-${key}`"></div>
                            <span>{{ getGainLabel(key) }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Performance Metrics -->
            <div class="performance-metrics">
                <div class="metric">
                    <span class="metric-label">Area Specific Load:</span>
                    <span class="metric-value">{{ areaSpecificLoad.toFixed(1) }} kWh/m²</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Total Floor Area:</span>
                    <span class="metric-value">{{ energyBalance.areaSpecific.treatableFloorArea }} m²</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Load Efficiency:</span>
                    <span class="metric-value">{{ loadEfficiency.toFixed(1) }}%</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import type { EnergyBalanceComponents } from '@/types/energy-balance'

interface Props {
    energyBalance: EnergyBalanceComponents
}

const props = defineProps<Props>()

const activeChart = ref<'heating' | 'cooling'>('heating')

// Computed properties for chart data
const chartTitle = computed(() => {
    return activeChart.value === 'heating'
        ? 'Winter Energy Analysis - How much heating is needed?'
        : 'Summer Energy Analysis - How much cooling is needed?'
})

const currentLoadType = computed(() =>
    activeChart.value === 'heating' ? 'Heating Need' : 'Cooling Need'
)

const currentLoad = computed(() =>
    activeChart.value === 'heating'
        ? props.energyBalance.netDemand.heating
        : props.energyBalance.netDemand.cooling
)

const areaSpecificLoad = computed(() =>
    activeChart.value === 'heating'
        ? props.energyBalance.areaSpecific.heatingLoad
        : props.energyBalance.areaSpecific.coolingLoad
)

const loadEfficiency = computed(() => {
    const totalLosses = props.energyBalance.losses.total
    const totalGains = props.energyBalance.gains.total
    return totalLosses > 0 ? (totalGains / totalLosses) * 100 : 0
})

// Filter out zero values and format for display
const displayLosses = computed(() => {
    const { losses } = props.energyBalance
    return Object.fromEntries(
        Object.entries(losses)
            .filter(([key, value]) => key !== 'total' && value > 0.01)
            .sort(([, a], [, b]) => b - a) // Sort by value descending
    )
})

const displayGains = computed(() => {
    const { gains } = props.energyBalance
    return Object.fromEntries(
        Object.entries(gains)
            .filter(([key, value]) => key !== 'total' && value > 0.01)
            .sort(([, a], [, b]) => b - a) // Sort by value descending
    )
})

// Chart sizing functions
const maxValue = computed(() => {
    const lossTotal = Object.values(displayLosses.value).reduce((sum, val) => sum + val, 0)
    const gainTotal = Object.values(displayGains.value).reduce((sum, val) => sum + val, 0)
    return Math.max(lossTotal, gainTotal)
})

const getLossHeight = (value: number): number => {
    const maxHeight = 180 // pixels (leave room for labels)
    const totalLosses = Object.values(displayLosses.value).reduce((sum, val) => sum + val, 0)
    if (totalLosses === 0) return 0
    const proportion = value / totalLosses
    return Math.max(8, proportion * maxHeight)
}

const getGainHeight = (value: number): number => {
    const maxHeight = 180 // pixels (leave room for labels)
    const totalGains = Object.values(displayGains.value).reduce((sum, val) => sum + val, 0)
    if (totalGains === 0) return 0
    const proportion = value / totalGains
    return Math.max(8, proportion * maxHeight)
}

// Label mappings
const lossLabels: Record<string, string> = {
    externalWallAmbient: 'External wall - Ambient',
    externalWallGround: 'External wall - Ground',
    roofCeilingAmbient: 'Roof/Ceiling - Ambient',
    floorSlabBasement: 'Floor slab / Basement ceiling',
    unheatedGarage: 'Unheated garage',
    windows: 'Windows',
    exteriorDoor: 'Exterior door',
    ventilation: 'Ventilation'
}

const gainLabels: Record<string, string> = {
    solarGains: 'Sunlight through windows',
    internalHeatGains: 'People, lights & appliances',
    nonUsefulHeatGains: 'Excess heat (causes overheating)'
}

const getLossLabel = (key: string | number): string => {
    if (typeof key === 'string') {
        return lossLabels[key] || key
    }
    return String(key)
}

const getGainLabel = (key: string | number): string => {
    if (typeof key === 'string') {
        return gainLabels[key] || key
    }
    return String(key)
}
</script>

<style scoped>
.energy-balance-charts {
    padding: 1rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chart-title {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #1f2937;
}

.chart-explanation {
    background: #f0f9ff;
    border: 1px solid #0284c7;
    border-radius: 6px;
    padding: 0.75rem;
    margin-bottom: 1rem;
}

.chart-explanation p {
    margin: 0;
    font-size: 0.9rem;
    color: #0c4a6e;
    line-height: 1.4;
}

.chart-controls {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.chart-controls .base-button {
    padding: 0.5rem 1rem;
    background: #f3f4f6;
    border: 1px solid #d1d5db;
    color: #6b7280;
}

.chart-controls .base-button.active {
    background: #3b82f6;
    border-color: #3b82f6;
    color: white;
}

.energy-chart-container {
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 1rem;
}

.chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #e5e7eb;
}

.chart-header h4 {
    font-size: 1rem;
    font-weight: 500;
    color: #374151;
}

.load-summary {
    font-size: 0.9rem;
    color: #6b7280;
}

.area-specific {
    font-size: 0.8rem;
    color: #9ca3af;
}

.stacked-chart {
    display: flex;
    gap: 2rem;
    justify-content: center;
    align-items: flex-end;
    height: 300px;
    margin: 1rem 0;
    overflow: hidden;
}

.chart-section {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.chart-section h5 {
    font-size: 0.9rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
    color: #374151;
    order: 1;
}

.stacked-bar {
    display: flex;
    flex-direction: column-reverse;
    align-items: center;
    width: 80px;
    height: 200px;
    border: 1px solid #d1d5db;
    position: relative;
    order: 2;
    background: #f9fafb;
}

.bar-segment {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    font-size: 0.7rem;
    font-weight: 500;
    color: white;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    flex-shrink: 0;
    min-height: 15px;
}

.segment-value {
    writing-mode: horizontal-tb;
    text-align: center;
    font-size: 0.6rem;
    line-height: 1;
}

.bar-label {
    margin-top: 0.5rem;
    font-size: 0.8rem;
    font-weight: 500;
    color: #374151;
    order: 3;
}

/* Loss segment colors matching the charts */
.loss-externalWallAmbient {
    background-color: #dc2626;
}

.loss-externalWallGround {
    background-color: #ea580c;
}

.loss-roofCeilingAmbient {
    background-color: #d97706;
}

.loss-floorSlabBasement {
    background-color: #ca8a04;
}

.loss-unheatedGarage {
    background-color: #65a30d;
}

.loss-windows {
    background-color: #059669;
}

.loss-exteriorDoor {
    background-color: #0891b2;
}

.loss-ventilation {
    background-color: #0284c7;
}

/* Gain segment colors */
.gain-solarGains {
    background-color: #eab308;
}

.gain-internalHeatGains {
    background-color: #f59e0b;
}

.gain-nonUsefulHeatGains {
    background-color: #f97316;
}

.chart-legend {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;
}

.legend-section h6 {
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #374151;
}

.legend-items {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8rem;
    color: #6b7280;
}

.legend-color {
    width: 12px;
    height: 12px;
    border-radius: 2px;
}

.performance-metrics {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;
}

.metric {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.metric-label {
    font-size: 0.8rem;
    color: #6b7280;
}

.metric-value {
    font-size: 0.9rem;
    font-weight: 600;
    color: #374151;
}
</style>
