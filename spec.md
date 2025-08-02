Henri Home Simulation Spec (Extended for Passive House Components)

Overview

This spec defines the Henri Home Simulation Framework for a Vue 3 scaffold, modeling a Passive House/Henri home with modular environmental systems. It is modular and extensible, starting with core components and allowing additional Passive House elements to be added.

Core Modules (Initial Implementation):

Heat Pump Module (primary) – drives indoor temperature & energy consumption.

ERV Module (secondary) – drives air quality & minor thermal effects.

Extensible Modules (Future):

Solar Module – provides solar power and passive heat gains.

Battery Module – tracks energy storage and discharges to offset grid usage.

Window Shading Module – reduces solar heat gain and influences cooling load.

IAQ Filter Module – adjusts indoor air quality when filtration is active.

Sprinkler/Structure Protection Module – models energy and water use for fire safety events.

Simulation Goals

Simulate one day in hourly increments (0–23h) at a set latitude/longitude (default: Denver).

Update a reactive houseState object representing indoor climate, energy use, and comfort.

Allow modular simulation of:

Thermal dynamics (heat pump, window heat gain/loss)

Air quality (ERV, IAQ filters)

Energy flow (solar, battery, grid draw)

Safety events (smoke or heat triggering sprinklers or intake closure)

Data Model (Base)

export default {
time: 0, // 0–23 hours
date: '2025-06-21', // simulation date
location: { lat: 39.7392, lon: -104.9903 }, // Denver

outdoor: {
temperature: 0, // °C
humidity: 0.45, // fraction
solarRadiation: 0, // W/m²
airQualityIndex: 50, // AQI
windSpeed: 2 // m/s (for future modules)
},

indoor: {
temperature: 21, // °C
humidity: 0.40,
airQuality: 0.9 // 0–1 normalized
},

envelope: {
floorArea: 150, // m²
wallR: 5.0, // m²*K/W
roofR: 7.0,
floorR: 4.0,
windowU: 0.8, // W/m²*K
windowArea: 20, // m²
infiltrationRate: 0.3 // ACH
},

energy: {
heatPumpKWh: 0,
ervKWh: 0,
solarKWh: 0,
batteryKWh: 0,
netKWh: 0
},

safety: {
sprinklersActive: false,
smokeEvent: false
},

comfortScore: 100
};

Core Module Interfaces

Signature:

function simulateModule(houseState, timestepHours = 1) -> houseState

1. Heat Pump Module (HeatPumpModule.js)

Calculates heat loss/gain and energy use.

Adjusts indoor temperature toward target.

2. ERV Module (ERVModule.js)

Improves indoor air quality toward 1.0.

Adds small energy cost for fans.

Recovers ~30% of thermal difference.

Extensible Passive House Modules

3. Solar Module (SolarModule.js)

Function:

Generates solar energy based on solarRadiation and panelArea.

Adds passive heat gain proportional to window area and orientation.

Outputs:

energy.solarKWh increase

Optional small bump in indoor.temperature

4. Battery Module (BatteryModule.js)

Function:

Stores excess solar energy and offsets grid energy use.

Simple charge/discharge cycle per hour.

Outputs:

energy.batteryKWh current state of charge

Adjusted energy.netKWh

5. Window Shading Module (WindowShadingModule.js)

Function:

Dynamically adjusts solar heat gain and glare.

Reduces cooling load during high radiation hours.

Outputs:

Modifies indoor.temperature gain from solar

Can optionally feed a comfortScore improvement

6. IAQ Filter Module (IAQFilterModule.js)

Function:

Improves indoor air quality beyond ERV limits.

Uses fan energy, can detect smoke event and seal intakes.

Outputs:

Improved indoor.airQuality

energy.iaqKWh increment per hour

Can toggle safety.smokeEvent

7. Sprinkler/Structure Protection Module (SprinklerModule.js)

Function:

Activates when safety.smokeEvent or heat event occurs.

Tracks water and energy usage for pumps.

Outputs:

safety.sprinklersActive = true

Optional: comfortScore penalty

Component Structure

/src
/components
HouseSimulation.vue # Parent orchestrator with slider
SidePanel.vue # Shows module I/O cards
HeatPumpModule.vue # UI card for heat pump status
ERVModule.vue # UI card for ERV status
SolarModule.vue
BatteryModule.vue
WindowShadingModule.vue
IAQFilterModule.vue
SprinklerModule.vue
/modules
houseState.js
HeatPumpModule.js
ERVModule.js
SolarModule.js
BatteryModule.js
WindowShadingModule.js
IAQFilterModule.js
SprinklerModule.js
ClimateEngine.js

Simulation Flow

Slider Event → simulateHour(hour)

Update Climate: from ClimateEngine

Run Modules in Order:

HeatPumpModule

ERVModule

SolarModule

BatteryModule

WindowShadingModule

IAQFilterModule

SprinklerModule

Update houseState and propagate to UI components.

Next Steps

Implement Heat Pump + ERV + Side Panel.

Add synthetic solar + shading to visualize thermal and energy flows.

Integrate IAQ Filter & Safety Modules for smoke/fire scenarios.

Implement charts for temperature, AQ, and energy usage over 24h.

Enable module toggling for feature demonstrations.
