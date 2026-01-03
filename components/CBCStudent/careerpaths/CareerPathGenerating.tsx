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
                {/* Animated Icon */}
                <div className="relative w-24 h-24 mx-auto mb-8">
                    {/* Outer ring */}
                    <div className="absolute inset-0 rounded-full border-4 border-white/10"></div>
                    {/* Progress ring */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle
                            cx="48"
                            cy="48"
                            r="44"
                            fill="none"
                            stroke="url(#gradient)"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray={`${percentage * 2.76} 276`}
                            className="transition-all duration-500"
                        />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#0ea5e9" />
                                <stop offset="100%" stopColor="#8b5cf6" />
                            </linearGradient>
                        </defs>
                    </svg>
                    {/* Center icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-10 h-10 text-[#0ea5e9] animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-white mb-2">
                    Creating Your Path
                </h2>
                <p className="text-white/50 mb-8">
                    <span className="text-[#0ea5e9] font-medium">{careerTitle}</span>
                </p>

                {/* Progress bar */}
                <div className="w-full max-w-md mx-auto mb-4">
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-[#0ea5e9] to-[#8b5cf6] rounded-full transition-all duration-500"
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

            {/* Subtle animation dots */}
            <div className="flex justify-center gap-2 mt-12">
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        className="w-2 h-2 rounded-full bg-[#0ea5e9]/50 animate-pulse"
                        style={{ animationDelay: `${i * 200}ms` }}
                    />
                ))}
            </div>
        </div>
    );
}
