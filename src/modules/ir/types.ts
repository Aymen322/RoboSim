export type Vector3 = {
    x: number;
    y: number;
    z: number;
};

export type SimulationCommandType = 'VELOCITY' | 'WAIT';

export interface VelocityCommand {
    type: 'VELOCITY';
    linear: Vector3;
    angular: Vector3;
    duration?: number; // Duration in seconds. If undefined, it's indefinite until next command (usually treated as 0 or handled by wait)
}

export interface WaitCommand {
    type: 'WAIT';
    duration: number; // Seconds to wait/maintain previous state
}

export type SimulationCommand = VelocityCommand | WaitCommand;

export interface RobotState {
    x: number;
    y: number;
    theta: number; // Orientation in radians
    linearVelocity: number; // Forward velocity (v)
    angularVelocity: number; // Angular velocity (omega)
    time: number; // Current simulation time
}

export interface SimulationPlan {
    commands: SimulationCommand[];
    totalDuration: number;
}
