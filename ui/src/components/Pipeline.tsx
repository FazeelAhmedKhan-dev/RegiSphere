import { useEffect, useState } from "react";
import { CheckCircle, Loader2, AlertCircle, Zap } from "lucide-react";

// Types
export type AgentStatus = "pending" | "running" | "done" | "error";

export interface AgentStep {
    id: string;
    name: string;
    status: AgentStatus;
    message?: string;
}

interface PipelineProps {
    steps: AgentStep[];
    onComplete?: () => void;
}

export default function Pipeline({ steps: initialSteps, onComplete }: PipelineProps) {
    const [steps, setSteps] = useState<AgentStep[]>(initialSteps);

    useEffect(() => {
        // Get session ID from URL params or props
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('sessionId');
        
        if (!sessionId) {
            console.error('No session ID found');
            return;
        }

        const fetchPipelineStatus = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/pipeline/${sessionId}/status`);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                console.log('Pipeline status:', data);
                
                // Update steps with real data from backend
                setSteps(data.steps.map((step: any) => ({
                    id: step.id,
                    name: step.name,
                    status: step.status,
                    message: step.message
                })));
                
                // Stop polling if pipeline is completed or errored
                if (data.status === 'completed' || data.status === 'error') {
                    return true; // Signal to stop polling
                }
                
            } catch (error) {
                console.error('Error fetching pipeline status:', error);
            }
            return false;
        };

        // Initial fetch
        fetchPipelineStatus();

        // Poll for updates every 2 seconds
        const interval = setInterval(async () => {
            const shouldStop = await fetchPipelineStatus();
            if (shouldStop) {
                clearInterval(interval);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    const completed = steps.filter((s) => s.status === "done").length;
    const progress = Math.round((completed / steps.length) * 100);

    const iconFor = (status: AgentStatus) => {
        switch (status) {
            case "done":
                return <CheckCircle className="text-green-500 w-6 h-6" />;
            case "running":
                return <Loader2 className="text-blue-500 animate-spin w-6 h-6" />;
            case "error":
                return <AlertCircle className="text-red-500 w-6 h-6" />;
            default:
                return <div className="w-6 h-6 rounded-full border border-gray-300" />;
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-8 bg-gradient-to-br from-white via-slate-50 to-slate-100 rounded-2xl shadow-lg">
            <div className="flex items-center gap-2 mb-6">
                <Zap className="text-blue-600 w-7 h-7" />
                <h2 className="text-2xl font-bold text-slate-800">Intelligent Agent Pipeline</h2>
            </div>
            <p className="text-gray-600 mb-6 text-sm">
                Each step below represents a critical part of how the agents gracefully handle your request.
            </p>

            {/* Progress bar */}
            <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden mb-8">
                <div
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-blue-700 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
                <span className="absolute inset-0 flex justify-center items-center text-xs font-semibold text-gray-700">
                    {progress}%
                </span>
            </div>

            {/* Steps */}
            <div className="space-y-4">
                {steps.map((step, idx) => (
                    <div
                        key={step.id}
                        className="flex items-start gap-4 p-4 rounded-xl bg-white shadow-sm border hover:shadow-md transition-all"
                    >
                        <div className="mt-1">{iconFor(step.status)}</div>
                        <div className="flex-1">
                            <p className="font-semibold text-slate-800">
                                {idx + 1}. {step.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{step.message}</p>
                            {step.status === "running" && (
                                <div className="mt-2 w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                    <div className="bg-blue-400 h-2 animate-pulse" style={{ width: "60%" }}></div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
