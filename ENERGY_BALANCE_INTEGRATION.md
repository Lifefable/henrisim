# Energy Balance Integration

## Overview

This integration adds comprehensive energy balance calculations to the Henri passive house simulation, based on Passive House Institute (PHI) energy balance methodology. The system implements the detailed heat loss and gain calculations shown in your heating and cooling load calibration charts.

## Key Features

### 1. Detailed Energy Balance Calculator (`src/utils/energy-balance.ts`)

The `EnergyBalanceCalculator` class implements:

#### Heat Loss Categories (matching your charts):

- **External wall - Ambient**: Heat loss through above-grade walls to outdoor air
- **External wall - Ground**: Heat loss through below-grade walls to ground
- **Roof/Ceiling - Ambient**: Heat loss through roof to outdoor air
- **Floor slab / Basement ceiling**: Heat loss through floors to ground
- **Unheated garage**: Heat loss to unheated adjacent spaces
- **Windows**: Heat loss through glazing and frames
- **Exterior door**: Heat loss through entry doors
- **Ventilation**: Heat loss through air exchange
- **Thermal bridges**: Additional heat loss through construction details

#### Heat Gain Categories:

- **Solar gains**: Heat gain through windows from solar radiation
- **Internal heat gains**: Heat from occupants, lighting, and equipment
- **Non-useful heat gains**: Excess heat contributing to overheating

### 2. Passive House Compliance Metrics

The system calculates key PHI metrics:

- **Annual heating demand** (must be ≤ 15 kWh/m²a)
- **Annual cooling demand** (must be ≤ 15 kWh/m²a)
- **Primary energy demand** (must be ≤ 120 kWh/m²a)
- **Airtightness** (n50 must be ≤ 0.6 h⁻¹)
- **Heat recovery efficiency** (must be ≥ 75%)

### 3. Visual Energy Balance Charts (`src/components/EnergyBalanceChart.vue`)

The component provides:

- **Stacked bar charts** showing losses vs gains (matching your calibration chart style)
- **Toggle between heating and cooling** load calculations
- **Color-coded segments** for each energy component
- **Area-specific load calculations** (kWh/m²)
- **Performance metrics** including load efficiency

## Integration Points

### Store Integration (`src/stores/simulation.ts`)

```typescript
// Enhanced energy balance calculator
const energyBalanceCalculator = new EnergyBalanceCalculator(
  createDefaultBuildingZones(),
  createDefaultThermalBridges(),
)

// Real-time energy balance calculation
currentEnergyBalance.value = energyBalanceCalculator.calculateEnergyBalance(
  houseState,
  timestepHours,
)
```

### Component Integration (`src/components/HouseSimulation.vue`)

```vue
<!-- Energy Balance Chart -->
<div v-if="simulationStore.energyBalance" class="energy-balance-section">
    <EnergyBalanceChart :energy-balance="simulationStore.energyBalance" />
</div>
```

## Energy Balance Methodology

### Heat Loss Calculations

Each heat loss component uses building physics principles:

```typescript
// Example: External wall heat loss
const wallLoss = ((tempDiff / rValue) * area * timestep) / 1000
```

Where:

- `tempDiff`: Indoor-outdoor temperature difference (°C)
- `rValue`: Thermal resistance (m²·K/W)
- `area`: Surface area (m²)
- `timestep`: Time period (hours)

### Thermal Bridge Treatment

Thermal bridges are distributed across components based on typical construction details:

- 40% attributed to wall connections
- 30% to roof connections
- 30% to window installations

### Solar Gain Calculations

Solar gains account for:

- **Solar Heat Gain Coefficient (SHGC)**: 0.6 for typical PH windows
- **Frame factor**: 10% reduction for window frames
- **Orientation and shading**: Future enhancement opportunity

## Configuration

### Default Building Parameters

```typescript
const buildingZones = {
  heatedArea: 150, // m² (ATFA - treatable floor area)
  volume: 375, // m³
  occupancy: 4, // persons
  internalGains: {
    people: 70, // W/person (typical metabolic heat)
    lighting: 3, // W/m² (efficient LED lighting)
    equipment: 5, // W/m² (appliances and electronics)
    total: 1480, // W total internal gains
  },
}
```

### Thermal Bridge Defaults

```typescript
const thermalBridges = {
  foundation: 15, // W/K
  balcony: 5, // W/K
  roof: 8, // W/K
  windows: 12, // W/K
  total: 40, // W/K
}
```

## Usage Examples

### Real-time Energy Analysis

The energy balance updates automatically during simulation and provides:

```typescript
// Current energy balance from store
const energyBalance = simulationStore.energyBalance

// Access detailed breakdowns
console.log('Heating demand:', energyBalance.netDemand.heating, 'kWh')
console.log('Area-specific load:', energyBalance.areaSpecific.heatingLoad, 'kWh/m²')
console.log('Total losses:', energyBalance.losses.total, 'kWh')
console.log('Total gains:', energyBalance.gains.total, 'kWh')
```

### Scenario Testing

The enhanced system integrates with Henri's test scenarios:

```typescript
// Trigger extreme weather scenario
simulationStore.triggerTestScenario('heatWave')
// Energy balance automatically recalculates with new conditions
```

## Future Enhancements

### 1. Annual Simulation

- Monthly energy balance calculations
- Seasonal performance analysis
- PHI compliance verification

### 2. Dynamic Building Parameters

- User-configurable building envelope
- Multiple climate zones
- Custom internal gain schedules

### 3. Advanced Thermal Modeling

- Multi-zone heat transfer
- Thermal mass effects
- Advanced HVAC system modeling

### 4. Energy Cost Analysis

- Utility rate integration
- Peak demand calculations
- Economic optimization

## Compliance with PHI Standards

This implementation follows Passive House Institute methodology:

1. **PHPP (Passive House Planning Package)** calculation methods
2. **EN ISO 13790** energy balance standard
3. **DIN 4108-6** thermal bridge treatment
4. **EN 12831** heating load calculation principles

The energy balance charts match the format and categories used in official PHI energy balance worksheets, providing a professional-grade analysis tool for passive house design and verification.
