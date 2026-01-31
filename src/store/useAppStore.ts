import { create } from 'zustand';
import type { SimulationPlan } from '../modules/ir/types';
import { CodeParser } from '../modules/parser';

interface AppState {
    code: string;
    parsedPlan: SimulationPlan | null;
    isPlaying: boolean;
    playbackTime: number;
    simulationDuration: number;

    // Actions
    setCode: (code: string) => void;
    analyzeCode: () => void;
    setIsPlaying: (playing: boolean) => void;
    setPlaybackTime: (time: number) => void;
    resetSimulation: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
    code: `// Sample Robot Code
// Drive forward at 1m/s for 2 seconds
cmd_vel(1.0, 0.0)
wait(2.0)

// Turn 90 degrees (pi/2 ~= 1.57) over 1 second
cmd_vel(0.0, 1.57)
wait(1.0)

// Drive in a circle
cmd_vel(1.0, 1.0)
wait(4.0)

// Stop
cmd_vel(0.0, 0.0)
`,
    parsedPlan: null,
    isPlaying: false,
    playbackTime: 0,
    simulationDuration: 0,

    setCode: (code) => set({ code }),

    analyzeCode: () => {
        const { code } = get();
        const plan = CodeParser.parse(code);
        set({
            parsedPlan: plan,
            simulationDuration: plan.totalDuration,
            playbackTime: 0,
            isPlaying: false
        });
    },

    setIsPlaying: (isPlaying) => set({ isPlaying }),

    setPlaybackTime: (time) => set({ playbackTime: time }),

    resetSimulation: () => set({ playbackTime: 0, isPlaying: false }),
}));
