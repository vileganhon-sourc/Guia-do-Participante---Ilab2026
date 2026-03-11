import { CheckCircle2, Circle } from "lucide-react";

interface Step {
    id: string;
    label: string;
    status: 'completed' | 'current' | 'upcoming';
}

interface TravelProgressBarProps {
    steps: Step[];
}

export function TravelProgressBar({ steps }: TravelProgressBarProps) {
    return (
        <div className="w-full py-6">
            <div className="flex items-center justify-between relative max-w-4xl mx-auto">
                {/* Line */}
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2 z-0"></div>

                {steps.map((step, index) => (
                    <div key={step.id} className="relative z-10 flex flex-col items-center group">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${step.status === 'completed'
                                    ? 'bg-primary text-white'
                                    : step.status === 'current'
                                        ? 'bg-accent text-primary ring-4 ring-accent/20'
                                        : 'bg-white border-2 border-gray-200 text-gray-400'
                                }`}
                        >
                            {step.status === 'completed' ? (
                                <CheckCircle2 className="w-6 h-6" />
                            ) : (
                                <span className="text-sm font-bold">{index + 1}</span>
                            )}
                        </div>
                        <span
                            className={`mt-2 text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${step.status === 'current' ? 'text-primary' : 'text-gray-500'
                                }`}
                        >
                            {step.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
