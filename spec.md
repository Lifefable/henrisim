# Henri Home Passive House Simulation - Technical Specification v2.3

## Overview

The Henri Home Simulation is a comprehensive Vue 3 web application that models a high-performance passive house with adaptive environmental systems. Built on a modular architecture, it simulates thermal dynamics, energy flows, air quality, and comfort metrics with real-time physics-based calculations across multiple global cities and seasonal conditions.

## Architecture Summary

**Framework**: Vue 3 with Composition API and TypeScript  
**State Management**: Pinia stores with reactive simulation engine  
**Physics Engine**: Passive house physics with PHI-compliant energy balance calculations  
**Adaptive Intelligence**: Henri's decision engine with environmental response algorithms  
**Visualization**: Real-time charts and interactive module controls  
**Climate System**: Multi-city, multi-seasonal climate modeling with accurate solar calculations

## Core Implemented Systems

### 1. Heat Pump Module ✅ IMPLEMENTED

**Purpose**: Primary heating/cooling system with adaptive temperature control  
**Physics**: COP-based energy consumption, thermal mass calculations  
**Configuration**:

- Target temperature: 19-21°C (adaptive)
- COP: 2.8-4.5 (adaptive based on conditions and mode)
- Capacity: 18 kW maximum (improved for better temperature control)

**Key Features**:

- Automatic heating/cooling mode selection
- Energy efficiency optimization
- Integration with passive heat loss calculations
- Adaptive COP adjustment based on outdoor conditions

### 2. ERV (Energy Recovery Ventilation) Module ✅ IMPLEMENTED

**Purpose**: Air quality management with thermal energy recovery  
**Physics**: Heat recovery efficiency, humidity exchange, fan power consumption  
**Configuration**:

- Heat recovery efficiency: 70-80% (adaptive)
- Flow rate: 200-400 m³/h (adaptive)
- Fan power: 150W (variable for emergency modes)

**Key Features**:

- Outdoor air quality assessment and filtration strategy
- Emergency smoke evacuation mode (2x flow rate)
- Humidity control and thermal recovery
- Adaptive efficiency based on outdoor conditions

### 3. Solar PV Module ✅ IMPLEMENTED

**Purpose**: Renewable energy generation with passive solar heat gain  
**Physics**: Solar radiation to electricity conversion, window heat gain  
**Configuration**:

- Panel area: 40 m²
- Panel efficiency: 20%
- Inverter efficiency: 95%
- Window solar heat gain coefficient: 0.4

**Key Features**:

- Time-based solar radiation modeling (sin wave pattern)
- Passive heat gain through windows
- Real-time energy generation tracking
- Integration with battery storage system

### 4. Battery Storage Module ✅ IMPLEMENTED

**Purpose**: Energy storage and grid interaction management  
**Physics**: Charge/discharge cycles, round-trip efficiency, capacity management  
**Configuration**:

- Capacity: 20 kWh
- Charge/discharge rate: 5 kW
- Round-trip efficiency: 90%
- Initial charge: 25% (5 kWh)

**Key Features**:

- Excess solar energy storage
- Automatic charge/discharge based on energy balance
- Grid export/import optimization
- State of charge persistence when disabled
- **Fixed**: Energy value accumulation bug preventing charging (v2.1)

### 5. Passive Physics Engine ✅ IMPLEMENTED

**Purpose**: Continuous building physics simulation regardless of system status  
**Physics**: Heat loss through envelope, air quality degradation, natural ventilation

**Key Calculations**:

- **Heat Loss**: Wall, roof, floor, window, and infiltration losses
- **Thermal Mass**: Building thermal inertia effects
- **Air Quality Degradation**: Natural decline without ventilation (2%/hour)
- **Solar Heat Gain**: Passive heating through windows
- **Humidity Migration**: Natural drift toward outdoor conditions

### 6. Henri's Adaptive Intelligence ✅ IMPLEMENTED

**Purpose**: AI-driven optimization and environmental response  
**Modes**:

- **Normal**: Standard efficient operation
- **Emergency**: Smoke/safety event response
- **Energy-Saving**: Low battery conservation mode
- **Comfort-Priority**: Temperature/comfort optimization
- **High-Solar**: Solar heat gain management

**Decision Making**:

- Real-time environmental analysis
- Predictive adaptation planning
- System efficiency optimization
- Emergency protocol activation

### 7. Energy Balance Analysis ✅ IMPLEMENTED

**Purpose**: PHI-compliant building energy analysis with calibration charts  
**Standards**: Passive House Institute (PHI) methodology  
**Visualizations**:

- Winter/Summer analysis toggle
- Stacked bar charts showing:
  - Heat losses (transmission, ventilation, thermal bridges)
  - Heat gains (solar, internal, auxiliary heating)
- Proportional height scaling for accurate comparison

### 8. Multi-City Climate System ✅ IMPLEMENTED

**Purpose**: Realistic climate modeling across diverse global locations and seasons  
**Coverage**: 9 global cities spanning major climate zones  
**Seasons**: Winter/Spring/Summer/Fall solstices and equinoxes

**Global Cities**:

- **San Francisco, USA** (37.8°N) - Mediterranean climate
- **Denver, USA** (39.7°N) - Continental semi-arid
- **Los Angeles, USA** (34.1°N) - Mediterranean/desert
- **Chicago, USA** (41.9°N) - Continental humid
- **New York, USA** (40.7°N) - Humid subtropical
- **Miami, USA** (25.8°N) - Tropical
- **Dallas, USA** (32.8°N) - Humid subtropical/continental
- **London, UK** (51.5°N) - Oceanic
- **Frankfurt, Germany** (50.1°N) - Oceanic/continental

**Seasonal Dates**:

- **Winter Solstice** (Dec 21) - Minimal solar gain, shortest day
- **Spring Equinox** (Mar 20) - Moderate solar, equal day/night
- **Summer Solstice** (Jun 21) - Maximum solar gain, longest day
- **Fall Equinox** (Sep 22) - Moderate solar, equal day/night

**Climate Features**:

- Realistic temperature ranges based on geographic location
- Humidity patterns reflecting continental vs. maritime influence
- Air quality baselines accounting for regional pollution levels
- Accurate solar radiation calculations using latitude and solar declination
- Day length calculations for each location and season
- Diurnal temperature variations based on climate characteristics

## Data Model (TypeScript Interfaces)

```typescript
interface HouseState {
  time: number // 0-23 hours
  date: string // YYYY-MM-DD format
  location: Location // Multi-city location with climate data
  outdoor: OutdoorConditions // Weather data
  indoor: IndoorConditions // Internal environment
  envelope: BuildingEnvelope // Building specifications
  energy: EnergyState // All energy flows
  safety: SafetyState // Emergency status
  comfortScore: number // 0-100 comfort metric

  // Enhanced climate data
  seasonalDateId?: string // Current seasonal date identifier
  season?: 'winter' | 'spring' | 'summer' | 'fall'
  dayLength?: number // Hours of daylight
  solarElevation?: number // Current solar elevation angle
}

interface Location {
  lat: number // Latitude in degrees
  lon: number // Longitude in degrees
  cityId?: string // City identifier for climate profiles
  cityName?: string // Human-readable city name
}

interface EnergyState {
  heatPumpKWh: number // Heat pump consumption
  ervKWh: number // ERV fan consumption
  solarKWh: number // Solar generation
  batteryKWh: number // Battery charge level
  netKWh: number // Grid import/export
}

interface BuildingEnvelope {
  floorArea: 150 // m² (passive house optimized)
  wallR: 5.0 // m²·K/W (high insulation)
  roofR: 7.0 // m²·K/W
  floorR: 4.0 // m²·K/W
  windowU: 0.8 // W/m²·K (triple glazed)
  windowArea: 20 // m²
  infiltrationRate: 0.3 // ACH (very tight)
}

interface ClimateProfile {
  // Seasonal temperature ranges (°C)
  winterTemp: { min: number; max: number }
  springTemp: { min: number; max: number }
  summerTemp: { min: number; max: number }
  fallTemp: { min: number; max: number }

  // Seasonal humidity patterns (0-1)
  winterHumidity: number
  summerHumidity: number
  springHumidity: number
  fallHumidity: number

  // Climate characteristics
  continentality: number // 0-1, affects daily temperature swing
  maritimeInfluence: number // 0-1, affects temperature moderation
  pollutionLevel: number // 0-1, affects air quality baseline
}
```

## Simulation Flow & Architecture

### 1. Time Control System

- **Manual Control**: Hour slider (0-23)
- **Automatic Playback**: Continuous simulation with pause/play
- **Climate Updates**: Solar radiation and temperature cycles

### 2. Physics Simulation Pipeline

```
1. Apply Passive Physics (always runs)
   ├── Heat loss calculations
   ├── Air quality degradation
   └── Natural thermal effects

2. Henri's Environmental Analysis
   ├── Current condition assessment
   ├── Mode switching logic
   └── Predictive adaptation

3. Run Enabled Modules (in order)
   ├── Heat Pump (temperature control)
   ├── ERV (air quality + thermal recovery)
   ├── Solar (energy generation)
   └── Battery (energy storage)

4. Calculate Energy Balance
   ├── PHI-compliant analysis
   ├── Chart visualization updates
   └── Comfort score calculation
```

### 3. Module State Management

- **Enabled Modules**: Full functionality with energy tracking
- **Disabled Modules**:
  - Energy consumption/generation = 0
  - Physical effects removed (no heating, no air quality improvement)
  - State preservation (battery maintains charge level)
  - Passive physics continue (heat loss, air quality degradation)

## User Interface Components

### Core Interface ✅ IMPLEMENTED

- **Time Control Panel**: Hour slider, play/pause, reset controls
- **Environmental Overview**: Temperature, humidity, air quality, solar metrics
- **System Status Grid**: Module cards with real-time status indicators
- **Henri's Decision Engine**: Current mode, recent decisions, next adaptations
- **Testing Scenarios**: Environmental stress tests and time controls
- **Location & Season Controls**: City selection, seasonal date picker with climate info

### Multi-City Climate Interface ✅ IMPLEMENTED

- **Current Location Display**: Shows selected city, country, and coordinates
- **Season Information**: Current seasonal date with day length and solar elevation
- **City Selector**: Dropdown with 9 global cities across climate zones
- **Seasonal Date Picker**: Choose from solstices and equinoxes
- **Climate Visualization**: Real-time display of enhanced climate parameters
- **Dynamic Header**: Updates location and season information automatically

### Module Status Cards ✅ IMPLEMENTED

Each module displays:

- **Visual Status**: 🟢 ACTIVE / 🔴 OFF indicators
- **Toggle Control**: Enable/disable switch
- **Real-time Metrics**: Energy consumption, efficiency, operational parameters
- **Visual Feedback**: Disabled state styling (dimmed, gray background)

### Energy Balance Visualization ✅ IMPLEMENTED

- **Interactive Charts**: Winter/Summer analysis toggle
- **PHI Compliance**: Matches passive house calibration methodology
- **Real-time Updates**: Responds to module state changes
- **Proportional Scaling**: Accurate energy magnitude representation

## Testing & Scenarios ✅ IMPLEMENTED

### Environmental Tests

- **Heat Wave**: High temperature stress testing
- **Cold Snap**: Extreme cold response
- **Poor Air Quality**: Air filtration challenges

### Energy Tests

- **Low Battery**: Energy conservation modes
- **Power Outage**: Grid independence testing

### Safety Tests

- **Smoke Alarm**: Emergency ventilation protocols
- **Comfort Challenge**: Multi-factor stress testing

### Time Controls

- **Morning (06:00)**: Low solar, heating demand
- **Noon (12:00)**: Peak solar, potential cooling needs
- **Evening (18:00)**: Declining solar, energy storage utilization

## Performance & Telemetry ✅ IMPLEMENTED

### Advanced Logging System

- **Henri Decision Cycles**: AI reasoning transparency
- **Module Performance**: Individual system analysis
- **Energy Efficiency Metrics**: COP tracking, energy flows
- **Environmental Analysis**: Condition assessment and responses
- **Execution Timing**: Performance monitoring and optimization

### Real-time Metrics

- **Temperature Error**: Deviation from target temperature
- **Comfort Trends**: Score changes over time
- **Energy Efficiency**: System performance indicators
- **Module Status**: Active/inactive state tracking

### Time Series Debug Interface ✅ IMPLEMENTED

- **Structured Data Table**: Hour-by-hour simulation data in tabular format
- **Copy/Paste Functionality**: Tab-separated data for easy analysis
- **Auto-logging**: Automatic data capture during simulation playback
- **CSV Export**: Download time series data for external analysis
- **High Contrast Design**: Black text on white background for readability
- **Key Metrics Tracking**: All critical simulation parameters per timestep

## Technical Implementation

### Module Architecture

```typescript
interface SimulationModule {
  name: string
  enabled: boolean
  simulate: (houseState: HouseState, timestepHours?: number, config?: any) => HouseState
}
```

### Energy Flow Management

- **Single Source of Truth**: Battery module calculates final net energy
- **Conflict Prevention**: Individual modules don't override net calculations
- **Energy Balance**: `netKWh = consumption - generation - battery_discharge`

### State Persistence

- **Module States**: Enabled/disabled status maintained
- **Battery Charge**: Preserves energy level when disabled
- **Configuration**: Adaptive parameters saved across sessions

## Future Extensibility

### Planned Enhancements

- **Window Shading Module**: Dynamic solar heat gain control
- **IAQ Filter Module**: Advanced air purification systems
- **Thermal Mass Module**: Enhanced building thermal modeling
- **Weather Integration**: Real weather data API connection
- **Historical Analysis**: Multi-day simulation and trending

### API Integration Points

- **Weather Services**: Real-time climate data
- **Energy Markets**: Grid pricing and demand response
- **Building Management**: IoT sensor integration
- **Performance Monitoring**: Long-term efficiency tracking

## Validation & Compliance

### Building Standards

- **Passive House Institute (PHI)**: Energy balance methodology compliance
- **ASHRAE Standards**: HVAC system modeling accuracy
- **Building Energy Codes**: Envelope performance validation

### Simulation Accuracy

- **Physics Validation**: Heat transfer, thermodynamics, fluid dynamics
- **Energy Balance**: Conservation of energy principles
- **System Integration**: Module interaction verification
- **Performance Benchmarking**: Real building data comparison

### Recent Bug Fixes (v2.1)

- **Battery Charging Issue**: Fixed energy value accumulation preventing battery charging
  - **Problem**: Energy values accumulated over timesteps instead of resetting
  - **Solution**: Reset all energy flows at start of each simulation timestep
  - **Impact**: Battery now charges properly from excess solar generation

### Major Improvements (v2.3)

- **Multi-City Climate System**: Complete global climate modeling capability
  - **Problem**: Simulation was limited to Denver summer solstice only
  - **Solution**: Added 9 global cities with realistic climate profiles and 4 seasonal dates
  - **Cities**: San Francisco, Denver, Los Angeles, Chicago, New York, Miami, Dallas, London, Frankfurt
  - **Seasons**: Winter/Spring/Summer/Fall solstices and equinoxes
  - **Features**: Accurate solar calculations, realistic temperature patterns, humidity modeling
  - **Impact**: Enables passive house performance analysis across diverse climates and seasons

### Major Improvements (v2.2)

- **Time Series Debug Interface**: Comprehensive debugging data table
  - **Problem**: Console logging was inadequate for debugging simulation behavior
  - **Solution**: Added structured time series data table with copy/paste functionality
  - **Features**: Auto-logging, CSV export, high contrast design, hour-by-hour tracking
  - **Impact**: Enables effective debugging and analysis of simulation behavior over time

---

_This specification reflects the current implementation as of the Henri Home Simulation v2.3, including all major systems, adaptive intelligence, energy balance analysis, multi-city climate modeling, critical bug fixes, and comprehensive debugging tools._
