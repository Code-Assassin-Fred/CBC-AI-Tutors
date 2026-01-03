"use client";

interface CareerPathGeneratingProps {
    message: string;
    percentage: number;
    careerTitle: string;
}

export default function CareerPathGenerating({ message, percentage, careerTitle }: CareerPathGeneratingProps) {
    return (
        <div className="max-w-2xl mx-auto pt-20 px-4">
            <div className="text-center">
                {/* Title */}
                <h2 className="text-2xl font-bold text-white mb-2">
                    Creating Your Path
                </h2>
                <p className="text-white/50 mb-8">
                    <span className="text-white font-medium">{careerTitle}</span>
                </p>

                {/* Progress bar */}
                <div className="w-full max-w-md mx-auto mb-4">
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#0ea5e9] rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                </div>

                {/* Status message */}
                <p className="text-white/60 text-sm">
                    {message}
                </p>

                {/* Percentage */}
                <p className="text-white/30 text-xs mt-2">
                    {percentage}%
                </p>
            </div>
        </div>
    );
}
