import { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { useAppStore } from '../store/useAppStore';
import { SimulationEngine } from '../modules/simulation/engine';

const Robot = ({ position, rotation }: { position: [number, number, number], rotation: number }) => {
    return (
        <group position={position} rotation={[0, 0, rotation]}>
            {/* Robot Body */}
            <mesh position={[0, 0, 0.25]}>
                <boxGeometry args={[0.5, 0.5, 0.5]} />
                <meshStandardMaterial color="#3b82f6" />
            </mesh>

            {/* Direction Indicator (Arrow) */}
            <mesh position={[0.4, 0, 0.25]} rotation={[0, 0, -Math.PI / 2]}>
                <coneGeometry args={[0.1, 0.3, 16]} />
                <meshStandardMaterial color="#ef4444" />
            </mesh>

            {/* Wheels (Visual only) */}
            <mesh position={[0, 0.3, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
                <meshStandardMaterial color="#1f2937" />
            </mesh>
            <mesh position={[0, -0.3, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
                <meshStandardMaterial color="#1f2937" />
            </mesh>
        </group>
    );
};

const SceneContent = () => {
    const { parsedPlan, isPlaying, playbackTime, setPlaybackTime, setIsPlaying, simulationDuration } = useAppStore();
    const engineRef = useRef<SimulationEngine | null>(null);
    const robotStateRef = useRef({ x: 0, y: 0, theta: 0 });

    // Initialize engine when plan changes
    useEffect(() => {
        if (parsedPlan) {
            engineRef.current = new SimulationEngine(parsedPlan);
        } else {
            engineRef.current = null;
        }
    }, [parsedPlan]);

    useFrame((_, delta) => {
        if (!engineRef.current) return;

        if (isPlaying) {
            let newTime = playbackTime + delta;
            if (newTime >= simulationDuration) {
                newTime = simulationDuration;
                setIsPlaying(false);
            }
            setPlaybackTime(newTime);
        }

        // Always query engine for current state based on playbackTime (interpolated or calculated)
        const currentState = engineRef.current.step(playbackTime);
        robotStateRef.current = currentState;
    });

    return (
        <>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 10]} intensity={1} castShadow />
            <Grid args={[20, 20]} sectionSize={1} sectionColor="#9ca3af" cellColor="#e5e7eb" position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} fadeDistance={20} />

            <Robot
                position={[robotStateRef.current.x, robotStateRef.current.y, 0]}
                rotation={robotStateRef.current.theta}
            />

            {/* Ground Plane helper */}
            <mesh rotation={[0, 0, 0]} position={[0, 0, -0.01]}>
                <planeGeometry args={[100, 100]} />
                <meshBasicMaterial color="#f9fafb" />
            </mesh>
        </>
    );
};

export const Viewport = () => {
    return (
        <div className="w-full h-full bg-gray-50 rounded-lg overflow-hidden border border-gray-200 shadow-inner relative">
            <Canvas camera={{ position: [0, -5, 5], up: [0, 0, 1], fov: 50 }} shadows>
                <OrbitControls makeDefault />
                <SceneContent />
            </Canvas>

            <div className="absolute bottom-4 left-4 bg-white/90 p-2 rounded shadow text-xs font-mono">
                <p>Rot: Left Click + Drag</p>
                <p>Pan: Right Click + Drag</p>
                <p>Zoom: Scroll</p>
            </div>
        </div>
    );
};
