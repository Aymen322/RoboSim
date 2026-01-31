import { useAppStore } from '../store/useAppStore';
import { Play, Pause, RotateCcw, FileText, Code2 } from 'lucide-react';
import { Viewport } from './Viewport';

export const Dashboard = () => {
    const {
        code, setCode,
        analyzeCode, parsedPlan,
        isPlaying, setIsPlaying,
        resetSimulation, playbackTime, simulationDuration
    } = useAppStore();


    return (
        <div className="flex h-screen w-full bg-gray-100 p-4 gap-4 font-sans text-gray-800">

            {/* Left Panel: Code & Controls */}
            <div className="flex flex-col w-1/3 min-w-[350px] gap-4">

                {/* Header */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <h1 className="text-xl font-bold flex items-center gap-2 text-indigo-600">
                        <Code2 size={24} />
                        RoboSim
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Robotics Assessment Platform
                    </p>
                </div>

                {/* Code Editor */}
                <div className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col min-h-0">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="font-semibold text-gray-700 flex items-center gap-2">
                            <FileText size={16} />
                            Command Script
                        </h2>
                        <div className="flex gap-2">
                            <label className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded hover:bg-gray-100 transition cursor-pointer border border-gray-200">
                                Upload File
                                <input
                                    type="file"
                                    className="hidden"
                                    accept=".txt,.py,.xml,.json,.cpp"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onload = (ev) => {
                                                const content = ev.target?.result as string;
                                                setCode(content);
                                            };
                                            reader.readAsText(file);
                                        }
                                    }}
                                />
                            </label>
                            <button
                                onClick={() => analyzeCode()}
                                className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded hover:bg-indigo-100 transition"
                            >
                                Check Syntax
                            </button>
                        </div>
                    </div>
                    <textarea
                        className="flex-1 w-full bg-gray-50 border border-gray-200 rounded-lg p-3 font-mono text-sm resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        spellCheck={false}
                    />
                    <div className="mt-2 text-xs text-gray-400">
                        Supported: cmd_vel(v, w), wait(s), sleep(s)
                    </div>
                </div>

                {/* Analysis / Status */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 h-1/4 min-h-[150px] overflow-auto">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Analysis</h3>
                    {parsedPlan ? (
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Commands:</span>
                                <span className="font-medium">{parsedPlan.commands.length}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Total Duration:</span>
                                <span className="font-medium">{parsedPlan.totalDuration.toFixed(2)}s</span>
                            </div>
                            <div className="mt-2 text-xs text-gray-500 border-t pt-2 max-h-[100px] overflow-auto">
                                {parsedPlan.commands.map((cmd, i) => (
                                    <div key={i} className="truncate">
                                        {i + 1}. {cmd.type} {cmd.type === 'VELOCITY' ? `v=${cmd.linear.x}, w=${cmd.angular.z}` : `t=${cmd.duration}`}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400 italic">Run analysis to see plan details.</p>
                    )}
                </div>
            </div>

            {/* Right Panel: Simulation */}
            <div className="flex-1 flex flex-col gap-4">
                {/* Toolbar */}
                <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className={`p-2 rounded-lg transition-colors flex items-center gap-2 font-medium text-sm
                  ${isPlaying
                                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                    : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                        >
                            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                            {isPlaying ? 'Pause' : 'Play'}
                        </button>

                        <button
                            onClick={resetSimulation}
                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                            title="Reset"
                        >
                            <RotateCcw size={18} />
                        </button>
                    </div>

                    <div className="flex items-center gap-4 text-sm font-mono text-gray-600">
                        <div>
                            Time: <span className="font-bold text-gray-900">{playbackTime.toFixed(2)}s</span> / {simulationDuration.toFixed(2)}s
                        </div>
                    </div>
                </div>

                {/* 3D Viewport */}
                <div className="flex-1 min-h-0">
                    <Viewport />
                </div>
            </div>
        </div>
    );
};
