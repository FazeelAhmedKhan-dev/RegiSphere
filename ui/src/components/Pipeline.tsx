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
    const [isSimulationRunning, setIsSimulationRunning] = useState<boolean>(false);

    useEffect(() => {
        // Get session ID from URL params or props
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('sessionId');
        
        if (!sessionId) {
            console.error('No session ID found');
            return;
        }

        // Check if we have saved pipeline progress state
        const savedProgressKey = `pipeline-progress-${sessionId}`;
        const savedProgress = localStorage.getItem(savedProgressKey);
        
        if (savedProgress) {
            try {
                const progressData = JSON.parse(savedProgress);
                console.log('Restoring pipeline progress:', progressData);
                setSteps(progressData.steps);
                setIsSimulationRunning(progressData.isRunning);
                
                // If simulation was running, continue from where it left off
                if (progressData.isRunning && !progressData.completed) {
                    console.log('Continuing simulation from saved state');
                    continueSimulation(progressData.steps, sessionId);
                    return;
                }
                
                // If pipeline was completed, trigger onComplete
                if (progressData.completed && onComplete) {
                    setTimeout(() => {
                        onComplete();
                    }, 500);
                }
                return;
            } catch (error) {
                console.error('Error parsing saved progress:', error);
            }
        }

        const fetchPipelineStatus = () => {
            try {
                // Get sample data from localStorage
                const pipelineData = localStorage.getItem(`pipeline-${sessionId}`);
                
                if (pipelineData) {
                    const data = JSON.parse(pipelineData);
                    console.log('Pipeline status (sample):', data);
                    
                    // If pipeline is already completed, load the completed state
                    if (data.status === 'completed') {
                        setSteps(data.steps.map((step: any) => ({
                            id: step.id,
                            name: step.name,
                            status: step.status,
                            message: step.message
                        })));
                        
                        if (onComplete) {
                            setTimeout(() => {
                                onComplete();
                            }, 1000);
                        }
                        return true; // Signal that we have completed data
                    } else {
                        // Pipeline is pending, load initial steps and let simulation run
                        setSteps(data.steps.map((step: any) => ({
                            id: step.id,
                            name: step.name,
                            status: step.status,
                            message: step.message
                        })));
                        return false; // Signal to run simulation
                    }
                } else {
                    console.log('No pipeline data found for session:', sessionId);
                    return false;
                }
                
            } catch (error) {
                console.error('Error fetching pipeline status:', error);
                return false;
            }
        };

        // Simulate progressive completion for demo effect with realistic timing
        const simulateProgress = (sessionId: string) => {
            setIsSimulationRunning(true);
            saveProgress(steps, sessionId, true, false);
            return processStepsFromIndex(steps, 0, sessionId);
        };

        const processStepsFromIndex = (currentSteps: AgentStep[], startIndex: number, sessionId: string) => {
            let currentStep = startIndex;
            const totalSteps = currentSteps.length;
            
            // Different durations for different steps to make it more realistic
            const stepDurations = [
                8000,   // Repository Analysis - 8 seconds
                12000,  // Code Security Scan - 12 seconds  
                10000,  // Compliance Framework Check - 10 seconds
                9000,   // Risk Assessment - 9 seconds
                6000    // Report Generation - 6 seconds
            ];
            
            const processNextStep = () => {
                if (currentStep < totalSteps) {
                    // Set current step to running
                    const updatedSteps = currentSteps.map((step, index) => ({
                        ...step,
                        status: index < currentStep ? "done" : 
                               index === currentStep ? "running" : "pending"
                    }));
                    
                    setSteps(updatedSteps);
                    saveProgress(updatedSteps, sessionId, true, false);
                    
                    // After the step duration, mark it as done and move to next
                    setTimeout(() => {
                        const completedSteps = currentSteps.map((step, index) => ({
                            ...step,
                            status: index <= currentStep ? "done" : 
                                   index === currentStep + 1 ? "running" : "pending"
                        }));
                        
                        setSteps(completedSteps);
                        saveProgress(completedSteps, sessionId, true, false);
                        
                        currentStep++;
                        
                        if (currentStep < totalSteps) {
                             // Longer delay before starting next step
                             setTimeout(processNextStep, 1500);
                         } else {
                             // All steps completed
                             setTimeout(() => {
                                 const finalSteps = currentSteps.map(step => ({ ...step, status: "done" }));
                                 setSteps(finalSteps);
                                 setIsSimulationRunning(false);
                                 saveProgress(finalSteps, sessionId, false, true);
                                 
                                 if (onComplete) {
                                     setTimeout(() => {
                                         onComplete();
                                     }, 3000);
                                 }
                             }, 2000);
                         }
                     }, stepDurations[currentStep] || 8000);
                 }
             };
             
             // Start the first step after a longer initial delay
             const startTimeout = setTimeout(processNextStep, 2000);
             
             return () => {
                 clearTimeout(startTimeout);
             };
         };

        // Check if we have sample data, otherwise simulate progress
        const hasSampleData = fetchPipelineStatus();
        let cleanup: (() => void) | null = null;
        
        if (!hasSampleData) {
            console.log('No sample data found, simulating progress...');
            cleanup = simulateProgress(sessionId);
        }

        return () => {
            if (cleanup) {
                cleanup();
            }
        };
    }, [onComplete]);

    // Function to save current progress state
    const saveProgress = (currentSteps: AgentStep[], sessionId: string, isRunning: boolean, completed: boolean = false) => {
        const progressData = {
            steps: currentSteps,
            isRunning,
            completed,
            timestamp: Date.now()
        };
        localStorage.setItem(`pipeline-progress-${sessionId}`, JSON.stringify(progressData));
    };

    // Function to continue simulation from saved state
    const continueSimulation = (savedSteps: AgentStep[], sessionId: string) => {
        setIsSimulationRunning(true);
        
        // Find the current step (first non-done step)
        const currentStepIndex = savedSteps.findIndex(step => step.status !== 'done');
        
        if (currentStepIndex === -1) {
            // All steps are done, complete the pipeline
            setIsSimulationRunning(false);
            saveProgress(savedSteps, sessionId, false, true);
            if (onComplete) {
                setTimeout(() => {
                    onComplete();
                }, 1000);
            }
            return;
        }

        // Continue from the current step
        processStepsFromIndex(savedSteps, currentStepIndex, sessionId);
    };

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
