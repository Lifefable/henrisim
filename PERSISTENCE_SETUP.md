# State Persistence Setup

## Overview

All Pinia stores in the Henri Home Passive House Simulation now persist their state to localStorage, ensuring that user data and simulation state are maintained between browser refreshes and sessions.

## Implementation Details

### 1. Plugin Installation

- **Package**: `pinia-plugin-persistedstate`
- **Setup**: Added to `main.ts` with global configuration

### 2. Stores with Persistence

#### Simulation Store (`simulation`)

- **Key**: `henri-simulation`
- **Persists**: All simulation state including house state, modules, Henri's decisions, and energy balance
- **Excludes**: `isPlaying` state (automatically resets to paused on page load to avoid timer synchronization issues)
- **Storage**: localStorage

#### Configuration Store (`configuration`)

- **Key**: `henri-configuration`
- **Persists**: All building configuration, HVAC settings, and user preferences
- **Storage**: localStorage

#### User Store (`user`)

- **Key**: `henri-user`
- **Persists**: User authentication state and profile data
- **Storage**: localStorage

#### Counter Store (`counter`)

- **Key**: `henri-counter`
- **Persists**: Demo counter state and history
- **Storage**: localStorage

## Benefits

### 🔄 **Session Persistence**

- Simulation continues exactly where left off after browser refresh
- All user configurations and preferences are maintained
- Henri's decision history and current mode persist

### 🎯 **User Experience**

- No need to reconfigure settings after closing browser
- Seamless continuation of multi-hour simulations
- Preserved state when switching between tabs/windows

### ⚡ **Performance**

- Instant restoration of complex simulation state
- No need to rebuild configurations on each load
- Cached energy balance calculations

## Usage

### Automatic Persistence

All store state automatically saves to localStorage on changes:

```typescript
// This change will automatically persist
simulationStore.setCity('tokyo')
configStore.building.floorArea = 200
```

### Manual Control (if needed)

```typescript
// Clear specific store data
localStorage.removeItem('henri-simulation')

// Clear all Henri app data
localStorage.removeItem('henri-simulation')
localStorage.removeItem('henri-configuration')
localStorage.removeItem('henri-user')
localStorage.removeItem('henri-counter')
```

### Browser Developer Tools

Check persistence in DevTools:

1. Open Developer Tools (F12)
2. Go to Application tab > Local Storage
3. Look for keys: `henri-simulation`, `henri-configuration`, etc.

## Storage Keys

- `henri-simulation` - Complete simulation state
- `henri-configuration` - Building and system configurations
- `henri-user` - User authentication and profile
- `henri-counter` - Demo counter state

## Testing Persistence

1. **Start simulation** and make changes (change city, adjust settings, run simulation)
2. **Refresh the page** - all state should be restored exactly
3. **Close browser** and reopen - state persists across sessions
4. **Check localStorage** in DevTools to see persisted data

## Troubleshooting

### Simulation Button Shows "Pause" After Refresh

**Issue**: The simulation button may show "Pause" instead of "Play" after page refresh, even though the simulation isn't actually running.

**Solution**: This has been fixed by excluding the `isPlaying` state from persistence. The simulation will always start in a paused state after page refresh, ensuring the UI matches the actual simulation state.

### Clearing Persisted Data

If you need to reset the application state:

```javascript
// Clear all Henri app data in browser console
localStorage.removeItem('henri-simulation')
localStorage.removeItem('henri-configuration')
localStorage.removeItem('henri-user')
localStorage.removeItem('henri-counter')
```

The simulation will now seamlessly continue from exactly where you left off, maintaining all your settings, Henri's current mode, recent decisions, and the complete house state.
