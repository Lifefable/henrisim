<template>
    <div class="henri-comparison-panel">
        <div class="panel-header">
            <h3>🧠 Henri's Long-Term Impact Analysis</h3>
            <p class="panel-subtitle">
                Compare Henri's adaptive intelligence against baseline operation over multiple days
            </p>
        </div>

        <div class="comparison-controls">
            <div class="control-group">
                <label>Simulation Period:</label>
                <select v-model="selectedDays" :disabled="simulationStore.multiDaySimulation.isRunning">
                    <option :value="7">1 Week (7 days)</option>
                    <option :value="30">1 Month (30 days)</option>
                    <option :value="90">1 Season (90 days)</option>
                    <option :value="365">1 Year (365 days)</option>
                </select>
            </div>

            <div class="action-buttons">
                <BaseButton @click="runComparison" :disabled="simulationStore.multiDaySimulation.isRunning"
                    variant="primary">
                    {{ simulationStore.multiDaySimulation.isRunning ? 'Running...' : 'Run Henri Comparison' }}
                </BaseButton>

                <BaseButton @click="simulationStore.resetMultiDaySimulation()"
                    :disabled="simulationStore.multiDaySimulation.isRunning" variant="ghost">
                    Reset
                </BaseButton>
            </div>
        </div>

        <!-- Progress Indicator -->
        <div v-if="simulationStore.multiDaySimulation.isRunning" class="progress-section">
            <div class="progress-header">
                <h4>{{ progressTitle }}</h4>
                <span class="progress-text">
                    Day {{ simulationStore.multiDaySimulation.currentDay }} of {{
                        simulationStore.multiDaySimulation.totalDays }}
                </span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill"
                    :style="{ width: (simulationStore.multiDaySimulation.currentDay / simulationStore.multiDaySimulation.totalDays) * 100 + '%' }">
                </div>
            </div>
        </div>

        <!-- Results Section -->
        <div v-if="hasComparisonData" class="results-section">
            <h4>📊 Henri's Impact Summary</h4>

            <div class="metrics-grid">
                <!-- Energy Consumption -->
                <div class="metric-comparison">
                    <div class="metric-header">
                        <span class="metric-icon">⚡</span>
                        <span class="metric-title">Energy Consumption</span>
                    </div>
                    <div class="metric-values">
                        <div class="metric-value baseline">
                            <span class="label">Baseline:</span>
                            <span class="value">{{ formatEnergy(metrics.totalEnergyConsumption.baseline) }}</span>
                        </div>
                        <div class="metric-value henri">
                            <span class="label">With Henri:</span>
                            <span class="value">{{ formatEnergy(metrics.totalEnergyConsumption.henri) }}</span>
                        </div>
                        <div class="metric-savings" :class="{ positive: energySavings > 0 }">
                            <span class="savings-value">{{ energySavings > 0 ? '-' : '+' }}{{
                                Math.abs(energySavings).toFixed(1) }}%</span>
                            <span class="savings-label">{{ energySavings > 0 ? 'Energy Saved' : 'Energy Used' }}</span>
                        </div>
                    </div>
                </div>

                <!-- Cost Savings -->
                <div class="metric-comparison">
                    <div class="metric-header">
                        <span class="metric-icon">💰</span>
                        <span class="metric-title">Energy Costs</span>
                    </div>
                    <div class="metric-values">
                        <div class="metric-value baseline">
                            <span class="label">Baseline:</span>
                            <span class="value">${{ formatCurrency(metrics.totalEnergyCost.baseline) }}</span>
                        </div>
                        <div class="metric-value henri">
                            <span class="label">With Henri:</span>
                            <span class="value">${{ formatCurrency(metrics.totalEnergyCost.henri) }}</span>
                        </div>
                        <div class="metric-savings" :class="{ positive: costSavings > 0 }">
                            <span class="savings-value">${{ Math.abs(costSavings).toFixed(2) }}</span>
                            <span class="savings-label">{{ costSavings > 0 ? 'Saved' : 'Extra Cost' }}</span>
                        </div>
                    </div>
                </div>

                <!-- Comfort Score -->
                <div class="metric-comparison">
                    <div class="metric-header">
                        <span class="metric-icon">😊</span>
                        <span class="metric-title">Average Comfort</span>
                    </div>
                    <div class="metric-values">
                        <div class="metric-value baseline">
                            <span class="label">Baseline:</span>
                            <span class="value">{{ metrics.totalComfortScore.baseline.toFixed(1) }}%</span>
                        </div>
                        <div class="metric-value henri">
                            <span class="label">With Henri:</span>
                            <span class="value">{{ metrics.totalComfortScore.henri.toFixed(1) }}%</span>
                        </div>
                        <div class="metric-savings" :class="{ positive: comfortImprovement > 0 }">
                            <span class="savings-value">+{{ comfortImprovement.toFixed(1) }}%</span>
                            <span class="savings-label">Comfort Improvement</span>
                        </div>
                    </div>
                </div>

                <!-- Excellent Comfort Hours -->
                <div class="metric-comparison">
                    <div class="metric-header">
                        <span class="metric-icon">⭐</span>
                        <span class="metric-title">Excellent Comfort Hours (≥90%)</span>
                    </div>
                    <div class="metric-values">
                        <div class="metric-value baseline">
                            <span class="label">Baseline:</span>
                            <span class="value">{{ metrics.excellentComfortHours.baseline }} / {{ totalHours }}
                                hrs</span>
                        </div>
                        <div class="metric-value henri">
                            <span class="label">With Henri:</span>
                            <span class="value">{{ metrics.excellentComfortHours.henri }} / {{ totalHours }} hrs</span>
                        </div>
                        <div class="metric-savings" :class="{ positive: excellentComfortImprovement > 0 }">
                            <span class="savings-value">+{{ excellentComfortImprovement }} hrs</span>
                            <span class="savings-label">More Excellent Hours</span>
                        </div>
                    </div>
                </div>

                <!-- Good Comfort Hours -->
                <div class="metric-comparison">
                    <div class="metric-header">
                        <span class="metric-icon">⏰</span>
                        <span class="metric-title">Good Comfort Hours (≥80%)</span>
                    </div>
                    <div class="metric-values">
                        <div class="metric-value baseline">
                            <span class="label">Baseline:</span>
                            <span class="value">{{ metrics.goodComfortHours.baseline }} / {{ totalHours }} hrs</span>
                        </div>
                        <div class="metric-value henri">
                            <span class="label">With Henri:</span>
                            <span class="value">{{ metrics.goodComfortHours.henri }} / {{ totalHours }} hrs</span>
                        </div>
                        <div class="metric-savings" :class="{ positive: goodComfortImprovement > 0 }">
                            <span class="savings-value">+{{ goodComfortImprovement }} hrs</span>
                            <span class="savings-label">More Good Hours</span>
                        </div>
                    </div>
                </div>

                <!-- Comfort Recovery Time -->
                <div class="metric-comparison">
                    <div class="metric-header">
                        <span class="metric-icon">🚀</span>
                        <span class="metric-title">Comfort Recovery Speed</span>
                    </div>
                    <div class="metric-values">
                        <div class="metric-value baseline">
                            <span class="label">Baseline Recovery:</span>
                            <span class="value">{{ metrics.comfortRecoveryTime.baseline.toFixed(1) }} hrs</span>
                        </div>
                        <div class="metric-value henri">
                            <span class="label">Henri Recovery:</span>
                            <span class="value">{{ metrics.comfortRecoveryTime.henri.toFixed(1) }} hrs</span>
                        </div>
                        <div class="metric-savings" :class="{ positive: comfortRecoveryImprovement > 0 }">
                            <span class="savings-value">{{ Math.abs(comfortRecoveryImprovement).toFixed(1) }} hrs</span>
                            <span class="savings-label">{{ comfortRecoveryImprovement > 0 ? 'Faster Recovery' : 'Slower Recovery' }}</span>
                        </div>
                    </div>
                </div>

                <!-- Comfort Stability -->
                <div class="metric-comparison">
                    <div class="metric-header">
                        <span class="metric-icon">📊</span>
                        <span class="metric-title">Comfort Stability</span>
                    </div>
                    <div class="metric-values">
                        <div class="metric-value baseline">
                            <span class="label">Baseline Variance:</span>
                            <span class="value">{{ metrics.comfortStability.baseline.toFixed(1) }}</span>
                        </div>
                        <div class="metric-value henri">
                            <span class="label">Henri Variance:</span>
                            <span class="value">{{ metrics.comfortStability.henri.toFixed(1) }}</span>
                        </div>
                        <div class="metric-savings" :class="{ positive: comfortStabilityImprovement > 0 }">
                            <span class="savings-value">{{ comfortStabilityImprovement.toFixed(1) }}%</span>
                            <span class="savings-label">More Stable</span>
                        </div>
                    </div>
                </div>

                <!-- Adaptive Actions -->
                <div class="metric-comparison">
                    <div class="metric-header">
                        <span class="metric-icon">🎯</span>
                        <span class="metric-title">Adaptive Actions</span>
                    </div>
                    <div class="metric-values">
                        <div class="metric-value baseline">
                            <span class="label">Baseline:</span>
                            <span class="value">{{ metrics.adaptiveActions.baseline }}</span>
                        </div>
                        <div class="metric-value henri">
                            <span class="label">With Henri:</span>
                            <span class="value">{{ metrics.adaptiveActions.henri }}</span>
                        </div>
                        <div class="metric-savings positive">
                            <span class="savings-value">{{ metrics.adaptiveActions.henri }}</span>
                            <span class="savings-label">Smart Adjustments</span>
                        </div>
                    </div>
                </div>

                <!-- CO2 Savings -->
                <div class="metric-comparison">
                    <div class="metric-header">
                        <span class="metric-icon">🌱</span>
                        <span class="metric-title">CO₂ Impact</span>
                    </div>
                    <div class="metric-values">
                        <div class="metric-value henri">
                            <span class="label">CO₂ Reduced:</span>
                            <span class="value">{{ formatCO2(metrics.co2Savings.henri) }} kg</span>
                        </div>
                        <div class="metric-savings positive">
                            <span class="savings-value">{{ formatCO2(metrics.co2Savings.henri) }} kg</span>
                            <span class="savings-label">CO₂ Saved</span>
                        </div>
                    </div>
                </div>

                <!-- Energy Efficiency -->
                <div class="metric-comparison">
                    <div class="metric-header">
                        <span class="metric-icon">🔄</span>
                        <span class="metric-title">Energy Efficiency</span>
                    </div>
                    <div class="metric-values">
                        <div class="metric-value baseline">
                            <span class="label">Baseline:</span>
                            <span class="value">{{ (metrics.energyEfficiency.baseline * 100).toFixed(1) }}%</span>
                        </div>
                        <div class="metric-value henri">
                            <span class="label">With Henri:</span>
                            <span class="value">{{ (metrics.energyEfficiency.henri * 100).toFixed(1) }}%</span>
                        </div>
                        <div class="metric-savings" :class="{ positive: efficiencyImprovement > 0 }">
                            <span class="savings-value">+{{ efficiencyImprovement.toFixed(1) }}%</span>
                            <span class="savings-label">Efficiency Gain</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Summary -->
            <div class="summary-section">
                <h4>🎯 Henri's Value Proposition</h4>
                <div class="summary-grid">
                    <div class="summary-item">
                        <strong>Energy Savings:</strong>
                        {{ energySavings > 0 ? energySavings.toFixed(1) + '% reduction' : 'Baseline more efficient' }}
                    </div>
                    <div class="summary-item">
                        <strong>Cost Savings:</strong>
                        ${{ Math.abs(costSavings).toFixed(2) }} {{ costSavings > 0 ? 'saved' : 'extra cost' }} over {{
                            selectedDays }} days
                    </div>
                    <div class="summary-item">
                        <strong>Comfort:</strong>
                        {{ comfortImprovement.toFixed(1) }}% improvement in average comfort
                    </div>
                    <div class="summary-item">
                        <strong>Excellent Comfort:</strong>
                        +{{ excellentComfortImprovement }} more hours at excellent comfort (≥90%)
                    </div>
                    <div class="summary-item">
                        <strong>Good Comfort:</strong>
                        +{{ goodComfortImprovement }} more hours at good comfort (≥80%)
                    </div>
                    <div class="summary-item">
                        <strong>Comfort Recovery:</strong>
                        {{ comfortRecoveryImprovement.toFixed(1) }} hours faster recovery from comfort drops
                    </div>
                    <div class="summary-item">
                        <strong>Comfort Stability:</strong>
                        {{ comfortStabilityImprovement.toFixed(1) }}% more consistent comfort levels
                    </div>
                    <div class="summary-item">
                        <strong>Smart Actions:</strong>
                        {{ metrics.adaptiveActions.henri }} intelligent adaptations to changing conditions
                    </div>
                    <div class="summary-item">
                        <strong>Environmental:</strong>
                        {{ formatCO2(metrics.co2Savings.henri) }} kg CO₂ emissions prevented
                    </div>
                    <div class="summary-item">
                        <strong>Annual Projection:</strong>
                        ${{ (costSavings * (365 / selectedDays)).toFixed(0) }} potential annual savings
                    </div>
                </div>
            </div>
        </div>

        <!-- No Data State -->
        <div v-else class="no-data-state">
            <div class="no-data-content">
                <span class="no-data-icon">📊</span>
                <h4>Run Henri Comparison</h4>
                <p>Start a multi-day simulation to see Henri's cumulative benefits over time. The comparison will show
                    energy savings, comfort improvements, and environmental impact.</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSimulationStore } from '@/stores/simulation'
import BaseButton from '@/components/ui/BaseButton.vue'

const simulationStore = useSimulationStore()
const selectedDays = ref(30)

const hasComparisonData = computed(() =>
    simulationStore.multiDaySimulation.baselineRun &&
    simulationStore.multiDaySimulation.currentRun.length > 0
)

const metrics = computed(() => simulationStore.multiDaySimulation.comparisonMetrics)

const energySavings = computed(() => {
    if (!hasComparisonData.value) return 0
    const baseline = metrics.value.totalEnergyConsumption.baseline
    const henri = metrics.value.totalEnergyConsumption.henri
    return baseline > 0 ? ((baseline - henri) / baseline) * 100 : 0
})

const costSavings = computed(() => {
    if (!hasComparisonData.value) return 0
    return metrics.value.totalEnergyCost.baseline - metrics.value.totalEnergyCost.henri
})

const comfortImprovement = computed(() => {
    if (!hasComparisonData.value) return 0
    return metrics.value.totalComfortScore.henri - metrics.value.totalComfortScore.baseline
})

const efficiencyImprovement = computed(() => {
    if (!hasComparisonData.value) return 0
    return (metrics.value.energyEfficiency.henri - metrics.value.energyEfficiency.baseline) * 100
})

const totalHours = computed(() => simulationStore.multiDaySimulation.totalDays * 24)

const excellentComfortImprovement = computed(() => {
    if (!hasComparisonData.value) return 0
    return metrics.value.excellentComfortHours.henri - metrics.value.excellentComfortHours.baseline
})

const goodComfortImprovement = computed(() => {
    if (!hasComparisonData.value) return 0
    return metrics.value.goodComfortHours.henri - metrics.value.goodComfortHours.baseline
})

const comfortRecoveryImprovement = computed(() => {
    if (!hasComparisonData.value) return 0
    // Positive = faster recovery (lower time is better)
    return metrics.value.comfortRecoveryTime.baseline - metrics.value.comfortRecoveryTime.henri
})

const comfortStabilityImprovement = computed(() => {
    if (!hasComparisonData.value) return 0
    // Lower variance is better, so calculate improvement as reduction in variance
    const baseline = metrics.value.comfortStability.baseline
    const henri = metrics.value.comfortStability.henri
    return baseline > 0 ? ((baseline - henri) / baseline) * 100 : 0
})

const progressTitle = computed(() => {
    return simulationStore.multiDaySimulation.henriEnabled
        ? '🧠 Running WITH Henri'
        : '🏠 Running Baseline (No Henri)'
})

const runComparison = async () => {
    await simulationStore.runHenriComparison(selectedDays.value)
}

// Formatters
const formatEnergy = (kwh: number) => `${kwh.toFixed(1)} kWh`
const formatCurrency = (amount: number) => amount.toFixed(2)
const formatCO2 = (kg: number) => kg.toFixed(1)
</script>

<style scoped>
.henri-comparison-panel {
    background: white;
    border-radius: 0.75rem;
    padding: 1.5rem;
    box-shadow: 0 2px 4px -1px rgb(0 0 0 / 0.1);
    border: 1px solid #e5e7eb;
    margin-bottom: 1rem;
}

.panel-header {
    margin-bottom: 1.5rem;
}

.panel-header h3 {
    color: #111827;
    margin-bottom: 0.5rem;
    font-size: 1.25rem;
    font-weight: 700;
}

.panel-subtitle {
    color: #6b7280;
    font-size: 0.9rem;
    margin: 0;
}

.comparison-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 0.5rem;
    border: 1px solid #e2e8f0;
}

.control-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.control-group label {
    font-weight: 600;
    color: #374151;
    font-size: 0.9rem;
}

.control-group select {
    padding: 0.5rem 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    background: white;
    font-size: 0.9rem;
}

.action-buttons {
    display: flex;
    gap: 0.75rem;
}

.progress-section {
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: #eff6ff;
    border-radius: 0.5rem;
    border: 1px solid #bfdbfe;
}

.progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
}

.progress-header h4 {
    color: #1e40af;
    margin: 0;
    font-size: 1rem;
}

.progress-text {
    color: #1e3a8a;
    font-weight: 600;
    font-size: 0.9rem;
}

.progress-bar {
    width: 100%;
    height: 8px;
    background: #e0e7ff;
    border-radius: 4px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #3b82f6, #1d4ed8);
    transition: width 0.3s ease;
}

.results-section h4 {
    color: #111827;
    margin-bottom: 1rem;
    font-size: 1.125rem;
    font-weight: 700;
}

.metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.metric-comparison {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    padding: 1rem;
}

.metric-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
}

.metric-icon {
    font-size: 1.25rem;
}

.metric-title {
    font-weight: 600;
    color: #374151;
    font-size: 0.9rem;
}

.metric-values {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.metric-value {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.875rem;
}

.metric-value.baseline .label {
    color: #6b7280;
}

.metric-value.henri .label {
    color: #3b82f6;
    font-weight: 600;
}

.metric-value .value {
    font-weight: 700;
    color: #111827;
}

.metric-savings {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    border-radius: 0.375rem;
    margin-top: 0.5rem;
    font-size: 0.875rem;
    background: #fef2f2;
    border: 1px solid #fecaca;
}

.metric-savings.positive {
    background: #f0fdf4;
    border-color: #bbf7d0;
}

.metric-savings .savings-value {
    font-weight: 700;
    color: #dc2626;
}

.metric-savings.positive .savings-value {
    color: #16a34a;
}

.metric-savings .savings-label {
    color: #6b7280;
    font-size: 0.8rem;
}

.summary-section {
    margin-top: 1.5rem;
    padding: 1rem;
    background: #f0fdf4;
    border-radius: 0.5rem;
    border: 1px solid #bbf7d0;
}

.summary-section h4 {
    color: #14532d;
    margin-bottom: 1rem;
    font-size: 1.125rem;
}

.summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 0.75rem;
}

.summary-item {
    font-size: 0.875rem;
    color: #166534;
    line-height: 1.4;
}

.summary-item strong {
    color: #14532d;
}

.no-data-state {
    padding: 2rem;
    text-align: center;
}

.no-data-content {
    max-width: 400px;
    margin: 0 auto;
}

.no-data-icon {
    font-size: 3rem;
    display: block;
    margin-bottom: 1rem;
}

.no-data-content h4 {
    color: #374151;
    margin-bottom: 0.5rem;
    font-size: 1.125rem;
}

.no-data-content p {
    color: #6b7280;
    font-size: 0.9rem;
    line-height: 1.5;
    margin: 0;
}

@media (max-width: 768px) {
    .comparison-controls {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
    }

    .metrics-grid {
        grid-template-columns: 1fr;
    }

    .summary-grid {
        grid-template-columns: 1fr;
    }
}
</style>
