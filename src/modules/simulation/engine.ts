import type { RobotState, SimulationPlan } from '../ir/types';

export class SimulationEngine {
    private plan: SimulationPlan;
    private state: RobotState;

    constructor(plan: SimulationPlan) {
        this.plan = plan;
        this.state = this.getInitialState();
    }

    private getInitialState(): RobotState {
        return {
            x: 0,
            y: 0,
            theta: 0,
            linearVelocity: 0,
            angularVelocity: 0,
            time: 0,
        };
    }

    public reset() {
        this.state = this.getInitialState();
    }

    public step(targetTime: number): RobotState {
        // If we jump backwards, reset
        if (targetTime < this.state.time) {
            this.reset();
        }

        // Resimulate from t=0 to handle state discontinuities and ensure determinism.

        let simState = this.getInitialState();
        let simTime = 0;

        // Process commands until we reach targetTime
        for (const cmd of this.plan.commands) {
            if (simTime >= targetTime) break;


            // Determine how much of this command applies
            // If we are already past this command's window (unlikely if we start at 0), we consume it fully.
            // Actually we are marching simTime forward.

            // Apply command settings
            if (cmd.type === 'VELOCITY') {
                simState.linearVelocity = cmd.linear.x;
                simState.angularVelocity = cmd.angular.z;
            }
            // If VELOCITY has duration, apply it for that window.
            // If No Duration, it updates the state until the next WAIT command holds it.

            let commandDuration = 0;

            if (cmd.type === 'WAIT') {
                commandDuration = cmd.duration;
            } else if (cmd.type === 'VELOCITY') {
                if (cmd.duration) {
                    commandDuration = cmd.duration;
                    // Implicitely, does it stop after? 
                    // Usually `cmd_vel` is "set target". `sleep` is "wait".
                    // If I do: vel(1,0); sleep(3); vel(0,0); -> Moves for 3s.
                    // If I do: vel(1,0, duration=3); -> Moves for 3s, then... what? usually stops or keeps going?
                    // Let's assume explicit duration in VELOCITY implies: Move, then Stop? 
                    // Or better consistency: just treat duration as "time this command is active".
                } else {
                    // Velocity without duration takes 0 time to EXECUTE (instantaneous),
                    // but the state persists until next command waits.
                    commandDuration = 0;
                }
            }

            // We need to integrate this command's effect for `commandDuration` (or until targetTime)
            // BUT if commandDuration is 0 (instantaneous set), we just update params and move to next.

            if (commandDuration > 0) {
                const timeRemaining = targetTime - simTime;
                const timeToSimulate = Math.min(timeRemaining, commandDuration);

                // Integrate
                // x += v * cos(theta) * dt
                // y += v * sin(theta) * dt
                // theta += w * dt
                // (Simple Euler integration)

                simState.x += simState.linearVelocity * Math.cos(simState.theta) * timeToSimulate;
                simState.y += simState.linearVelocity * Math.sin(simState.theta) * timeToSimulate;
                simState.theta += simState.angularVelocity * timeToSimulate;

                simTime += commandDuration; // We advance the logical timeline
            }
        }

        // Update internal state cache (optional, if we were doing delta updates)
        this.state = simState;
        this.state.time = targetTime;

        return simState;
    }
}
