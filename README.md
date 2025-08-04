# 🏠 Henri Home Passive House Simulation

[![Vue.js](https://img.shields.io/badge/Vue.js-3.5-4FC08D?logo=vue.js&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Pinia](https://img.shields.io/badge/Pinia-3.0-FFD43B?logo=pinia&logoColor=black)](https://pinia.vuejs.org/)

A comprehensive Vue 3 web application that simulates a high-performance passive house with Henri's adaptive environmental intelligence. Experience real-time physics-based modeling, multi-city climate systems, and advanced energy analytics across diverse global locations and seasonal conditions.

## ✨ Key Features

### 🧠 Henri's Adaptive Intelligence
- **6 Operational Modes**: Normal, Emergency, Low Battery, Comfort Priority, High Solar, Air Quality Protection
- **Real-time Decision Making**: Environmental analysis and predictive adaptation
- **Manual Override**: User control with automatic mode switching
- **Smart Optimization**: Balances energy efficiency with occupant comfort

### 🌍 Multi-City Climate System
- **9 Global Cities**: San Francisco, Denver, Los Angeles, Chicago, New York, Miami, Dallas, London, Frankfurt
- **4 Seasonal Dates**: Winter/Spring/Summer/Fall solstices and equinoxes
- **Realistic Climate Modeling**: Temperature patterns, humidity, air quality, solar radiation
- **Accurate Solar Calculations**: Latitude-based solar elevation and day length

### 📊 Henri Comparison Analytics
- **Multi-Day Simulations**: 1 week to 1 year comparison periods
- **Dual-Engine Architecture**: Baseline vs Henri performance analysis
- **10+ Comparison Metrics**: Energy, comfort, cost, environmental impact
- **Granular Comfort Analytics**: Excellent (≥90%), Good (≥80%), recovery time, stability
- **Value Proposition Analysis**: ROI projections and environmental benefits

### ⚡ Advanced Building Systems
- **Heat Pump Module**: Adaptive COP (2.8-4.5), temperature control (19-21°C)
- **ERV System**: Energy recovery (70-80%), flow control (200-400 m³/h)
- **Solar PV Array**: 40 m² panels, 20% efficiency, passive heat gain
- **Battery Storage**: 20 kWh capacity, 90% round-trip efficiency
- **Passive Physics Engine**: Continuous thermal, air quality, and humidity modeling

### 📈 Energy Balance Analysis
- **PHI Compliance**: Passive House Institute methodology
- **Interactive Charts**: Winter/Summer analysis with proportional scaling
- **Real-time Visualization**: Heat losses, gains, and energy flows
- **Performance Metrics**: Efficiency tracking and optimization insights

## 🚀 Quick Start

### Prerequisites
- **Node.js** ≥20.19.0 or ≥22.12.0
- **npm** or **yarn** package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/Lifefable/henrisim.git
cd henrisim

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

```bash
# Development
npm run dev          # Start Vite dev server with hot reload

# Building
npm run build        # Build for production
npm run preview      # Preview production build locally

# Code Quality
npm run lint         # Run ESLint with auto-fix
npm run format       # Format code with Prettier
npm run type-check   # TypeScript type checking
```

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Vue 3 + Composition API + TypeScript
- **State Management**: Pinia with persistence
- **Build Tool**: Vite 7.0
- **Styling**: Scoped CSS with responsive design
- **Code Quality**: ESLint + Prettier + TypeScript

### Project Structure

```
src/
├── components/           # Vue components
│   ├── ui/              # Reusable UI components
│   ├── features/        # Feature-specific components
│   └── icons/           # SVG icon components
├── composables/         # Vue composition functions
├── modules/             # Simulation modules (Heat Pump, ERV, Solar, Battery)
├── stores/              # Pinia state stores
├── types/               # TypeScript type definitions
├── utils/               # Utility functions and helpers
├── views/               # Page-level components
└── router/              # Vue Router configuration
```

### Core Systems

#### 1. Simulation Engine (`src/stores/simulation.ts`)
- Physics-based building simulation
- Henri's adaptive intelligence
- Multi-day comparison system
- Real-time environmental analysis

#### 2. Module System (`src/modules/`)
- **HeatPumpModule.ts**: Temperature control and COP optimization
- **ERVModule.ts**: Air quality management and thermal recovery
- **SolarModule.ts**: Renewable energy generation and passive heat gain
- **BatteryModule.ts**: Energy storage and grid interaction

#### 3. Climate System (`src/utils/climate.ts`)
- Global city climate profiles
- Seasonal solar calculations
- Temperature and humidity modeling
- Air quality baseline data

#### 4. Energy Balance (`src/utils/energy-balance.ts`)
- PHI-compliant energy analysis
- Building envelope calculations
- Heat loss and gain modeling
- Thermal bridge analysis

## 🎮 User Interface

### Main Dashboard
- **Environmental Overview**: Real-time temperature, humidity, air quality, solar metrics
- **System Status Grid**: Module cards with live status indicators
- **Henri Decision Engine**: Current mode, recent decisions, next adaptations
- **Time Controls**: Hour slider, play/pause, reset functionality

### Henri Comparison Panel
- **Simulation Controls**: Period selection (7 days to 1 year)
- **Progress Visualization**: Real-time progress with day indicators
- **Metrics Comparison**: Side-by-side baseline vs Henri analysis
- **Value Proposition**: Energy savings, cost analysis, environmental impact

### Climate Interface
- **Location Selector**: 9 global cities with climate zones
- **Seasonal Controls**: Solstice and equinox date selection
- **Climate Visualization**: Dynamic weather and solar parameters
- **Geographic Information**: Coordinates, day length, solar elevation

## 📐 Technical Specifications

### Building Envelope (Passive House Standards)
- **Floor Area**: 150 m² (optimized passive house design)
- **Insulation Values**: Wall R-5.0, Roof R-7.0, Floor R-4.0 m²·K/W
- **Windows**: Triple-glazed, U-value 0.8 W/m²·K, 20 m² total area
- **Airtightness**: 0.3 ACH infiltration rate (very tight construction)

### System Specifications
- **Heat Pump**: 18 kW capacity, adaptive COP 2.8-4.5
- **ERV**: 200-400 m³/h flow rate, 70-80% heat recovery efficiency
- **Solar Array**: 40 m² panels, 20% efficiency, 95% inverter efficiency
- **Battery**: 20 kWh lithium, 5 kW charge/discharge rate, 90% round-trip efficiency

### Performance Metrics
- **Comfort Score**: 0-100% real-time occupant comfort calculation
- **Energy Efficiency**: Dynamic COP tracking and optimization
- **Environmental Impact**: CO₂ emissions tracking and reduction analysis
- **Cost Analysis**: Real-time energy cost calculation with grid pricing

## �� Testing & Scenarios

### Built-in Test Scenarios
- **Environmental Tests**: Heat wave, cold snap, poor air quality
- **Energy Tests**: Low battery, power outage simulations
- **Safety Tests**: Smoke alarm, comfort challenge protocols
- **Time Controls**: Morning, noon, evening condition presets

### Debug & Analysis Tools
- **Time Series Interface**: Hour-by-hour simulation data export
- **Henri Decision Logging**: AI reasoning transparency
- **Performance Monitoring**: Module efficiency and execution timing
- **CSV Export**: Structured data for external analysis

## 🌱 Environmental Impact

### Sustainability Features
- **CO₂ Tracking**: Real-time emissions calculation and reduction monitoring
- **Energy Optimization**: Intelligent system efficiency improvements
- **Renewable Integration**: Solar generation with battery storage optimization
- **Passive Design**: Building physics modeling for minimal energy consumption

### Climate Adaptation
- **Global Climate Support**: 9 cities across major climate zones
- **Seasonal Analysis**: Performance across solstices and equinoxes
- **Weather Responsiveness**: Adaptive system behavior based on conditions
- **Future-Ready**: Extensible for weather API integration

## 🔧 Development

### Code Quality
- **TypeScript**: Full type safety with strict configuration
- **ESLint**: Vue 3 and TypeScript linting rules
- **Prettier**: Consistent code formatting
- **Component Architecture**: Modular, reusable component design

### State Management
- **Pinia**: Modern Vuex alternative with TypeScript support
- **Persistence**: Automatic localStorage synchronization
- **Reactivity**: Vue 3 Composition API integration
- **Modularity**: Feature-based store organization

### Performance
- **Vite**: Lightning-fast development and optimized builds
- **Code Splitting**: Automatic route-based chunking
- **Tree Shaking**: Minimal production bundle size
- **Hot Module Replacement**: Instant development feedback

## 📚 API Reference

### Key Interfaces

```typescript
// Core simulation state
interface HouseState {
  time: number
  location: Location
  outdoor: OutdoorConditions
  indoor: IndoorConditions
  energy: EnergyState
  safety: SafetyState
  comfortScore: number
}

// Henri comparison analytics
interface ComparisonMetrics {
  totalEnergyConsumption: { baseline: number; henri: number }
  totalComfortScore: { baseline: number; henri: number }
  excellentComfortHours: { baseline: number; henri: number }
  adaptiveActions: { baseline: number; henri: number }
  // ... additional metrics
}

// Module configuration
interface SimulationModule {
  name: string
  enabled: boolean
  simulate: (houseState: HouseState) => HouseState
}
```

## 🗺️ Roadmap

### Current Version (v2.4)
- ✅ Henri Comparison System with granular analytics
- ✅ Multi-city climate modeling (9 cities, 4 seasons)
- ✅ Advanced comfort metrics and recovery tracking
- ✅ UI-responsive multi-day simulations

### Planned Enhancements
- **Window Shading Module**: Dynamic solar heat gain control
- **IAQ Filter Module**: Advanced air purification systems
- **Weather API Integration**: Real-time meteorological data
- **Mobile Optimization**: Responsive design improvements
- **Multi-language Support**: Internationalization framework

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run linting
npm run lint

# Type check
npm run type-check
```
