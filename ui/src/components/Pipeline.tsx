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
        let i = 0;
        const interval = setInterval(() => {
            setSteps((prev) => {
                const next = [...prev];
                if (i < next.length) {
                    next[i].status = "running";
                    next[i].message = `Running ${next[i].name}…`;
                }
                if (i > 0 && i - 1 < next.length) {
                    next[i - 1].status = "done";
                    next[i - 1].message = `${next[i - 1].name} completed`;
                }
                return next;
            });

            i++;
            if (i > initialSteps.length) {
                clearInterval(interval);
                onComplete?.();
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [initialSteps, onComplete]);

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
