# Robotics Simulation Platform

This project is a modular web-based simulation tool built to analyze robotics code and visualize kinematic execution in 3D. It allows users to upload control scripts (Python, XML, C++, JSON), parses them into an intermediate representation, and executes them via a deterministic time-based simulation engine.

## Core Features

-   **Multi-Format Parsing**: Supports `cmd_vel` command extraction from Python, C++, XML, and JSON.
-   **Kinematic Engine**: Pure logic simulation loop independent of the rendering layer.
-   **Visualization**: Real-time 3D rendering using `three.js` (React Three Fiber).
-   **Analysis Tools**: Instant syntax checking and trajectory preview.

## Architecture

The codebase follows a strict separation of concerns to ensure testability and modularity:

1.  **`src/modules/parser/`**: 
    -   Contains heuristic regex logic to extract commands from raw text.
    -   normalizes input into a standard `SimulationPlan`.

2.  **`src/modules/simulation/`**: 
    -   The "Physics Kernel". 
    -   Maintains `RobotState` (x, y, theta, velocities).
    -   Implements `step(time)` to integrate changes over delta time.

3.  **`src/components/Viewport.tsx`**: 
    -   The "View" layer.
    -   Subscribes to the store state and updates the 3D scene frame-by-frame.
    -   No game logic resides here; it only reflects the engine state.

4.  **`src/store/`**:
    -   Zustand store for managing global application state (input code, play/pause status, current time).

## Simulation Logic & Mapping

The core strength of this platform is the deterministic mapping of text to motion:

1.  **Input Analysis**: The `CodeParser` scans the input string (Python, XML, etc.) for velocity vectors (`v, w`) and durations (`t`).
2.  **Normalization**: These are converted into a flat array of `SimulationCommand` objects (The "Plan"), decoupling the source syntax from execution.
3.  **Time Integration**: The `SimulationEngine` uses a time-step loop. For any given playback time `T`:
    -   It replays the "Plan" from `t=0` to `t=T`.
    -   It integrates the kinematic equations: $x_{new} = x + v \cdot \cos(\theta) \cdot \Delta t$.
    -   This guarantees that *Robot state is a pure function of time*, preventing drift or lag-induced errors.
4.  **Visual Mapping**: The React Viewport subscribes to this calculated state (60 times/sec) and updates the Three.js mesh position directly, ensuring the visual represention is always 1:1 with the mathematical model.

## Development

### Setup

```bash
# Install dependencies
npm install

# Run local dev server
npm run dev
```

### Supported Commands

The parser recognizes standard ROS-like velocity commands:

-   `cmd_vel(v, w)` - Set linear (v) and angular (w) velocity.
-   `wait(t)` - Maintain current state for `t` seconds.

The regex is permissive, so it works with various syntax styles:
-   `move_robot(1.0, 0.5)`
-   `<cmd_vel linear="1.0" angular="0.5" />`
-   `{ "linear": 1.0, "angular": 0.5 }`
