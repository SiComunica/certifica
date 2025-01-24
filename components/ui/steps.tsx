interface Step {
  label: string
  description?: string
}

interface StepsProps {
  currentStep: number
  steps: Step[]
  className?: string
}

export function Steps({ currentStep, steps, className = "" }: StepsProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="relative">
        <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200">
          <div 
            className="absolute top-0 left-0 h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>

        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const stepNumber = index + 1
            const isActive = stepNumber === currentStep
            const isCompleted = stepNumber < currentStep

            return (
              <div 
                key={step.label} 
                className="flex flex-col items-center"
              >
                <div 
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center 
                    font-semibold text-sm relative z-10
                    transition-colors duration-300
                    ${isCompleted 
                      ? 'bg-blue-600 text-white' 
                      : isActive 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white text-gray-500 border-2 border-gray-200'
                    }
                  `}
                >
                  {stepNumber}
                </div>

                <div className="mt-3 text-center">
                  <div className={`
                    font-medium
                    ${isActive || isCompleted ? 'text-gray-900' : 'text-gray-500'}
                  `}>
                    {step.label}
                  </div>
                  <div className="text-sm text-gray-500 max-w-[150px]">
                    {step.description}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
} 