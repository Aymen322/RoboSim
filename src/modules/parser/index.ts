import type { SimulationCommand, SimulationPlan } from '../ir/types';

export class CodeParser {
    /**
     * Extracts simulation commands from code info (Mock ROS, JSON, XML).
     */
    static parse(input: string): SimulationPlan {
        const trimmed = input.trim();
        // Check for JSON array payload
        if (trimmed.startsWith('[') || (trimmed.startsWith('{') && trimmed.includes('"commands"'))) {
            return this.parseJSON(trimmed);
        }
        return this.parseScript(trimmed);
    }

    private static parseJSON(input: string): SimulationPlan {
        try {
            const parsed = JSON.parse(input);
            // Handle both [commands] and { commands: [] }
            const commands: SimulationCommand[] = Array.isArray(parsed)
                ? parsed
                : (Array.isArray(parsed.commands) ? parsed.commands : [parsed]);

            return {
                commands,
                totalDuration: this.calculateTotalDuration(commands)
            };
        } catch (e) {
            console.error("JSON Parse Error", e);
            return { commands: [], totalDuration: 0 };
        }
    }

    private static parseScript(input: string): SimulationPlan {
        const lines = input.split('\n');
        const commands: SimulationCommand[] = [];

        // IMPROVED REGEX PATTERNS

        // 1. Velocity: cmd_vel(v, w), velocity(v, w), or XML attributes
        const velRegex = /(?:cmd_vel|velocity|move|drive)(?:_command)?.*?(?:linear|x|v|val)?\s*[=:]?\s*["']?(-?\d+\.?\d*)["']?.*?(?:angular|z|w|rot)?\s*[=:]?\s*["']?(-?\d+\.?\d*)["']?/i;

        // Simpler function call style: cmd_vel(1.0, 0.5)
        const funcVelRegex = /(?:cmd_vel|velocity)\s*\(\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/i;

        // 2. Wait:
        // wait(t) | sleep(t) | delay(t)
        // XML: <wait duration="2" /> | <sleep time="2" />
        const waitRegex = /(?:wait|sleep|delay)(?:_command)?.*?(?:duration|time|seconds|s|val)?\s*[=:\(]?\s*["']?(\d+\.?\d*)["']?/i;


        for (const line of lines) {
            const cleanLine = line.trim();
            if (!cleanLine || cleanLine.startsWith('#') || cleanLine.startsWith('//') || cleanLine.startsWith('<!--')) continue;

            // Check for Wait first (simpler)
            const waitMatch = cleanLine.match(waitRegex);
            if (waitMatch) {
                const duration = parseFloat(waitMatch[1]);
                if (!isNaN(duration)) {
                    commands.push({ type: 'WAIT', duration });
                    continue;
                }
            }

            // Check for Velocity
            // Try specific function call first
            const funcMatch = cleanLine.match(funcVelRegex);
            if (funcMatch) {
                commands.push({
                    type: 'VELOCITY',
                    linear: { x: parseFloat(funcMatch[1]), y: 0, z: 0 },
                    angular: { x: 0, y: 0, z: parseFloat(funcMatch[2]) }
                });
                continue;
            }

            // Try generic heuristic (handles XML attributes or key-value pairs)
            const looseMatch = cleanLine.match(velRegex);
            if (looseMatch && (cleanLine.includes('vel') || cleanLine.includes('move') || cleanLine.includes('drive'))) {
                // Fallback: capture generic numeric pairs if context implies movement (e.g. "move", "vel")
                const v = parseFloat(looseMatch[1]);
                const w = parseFloat(looseMatch[2]);

                if (!isNaN(v) && !isNaN(w)) {
                    commands.push({
                        type: 'VELOCITY',
                        linear: { x: v, y: 0, z: 0 },
                        angular: { x: 0, y: 0, z: w }
                    });
                    continue;
                }
            }
        }

        return {
            commands,
            totalDuration: this.calculateTotalDuration(commands)
        };
    }

    private static calculateTotalDuration(commands: SimulationCommand[]): number {
        return commands.reduce((acc, cmd) => acc + (cmd.duration || 0), 0);
    }
}
