import React from 'react';
import { CheckCircleIcon } from '../common/Icons';

interface StepperProps {
  steps: string[];
  currentStep: number; // 1-based index
}

const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-start justify-between">
        {steps.map((step, stepIdx) => {
          const stepNumber = stepIdx + 1;
          const isCompleted = currentStep > stepNumber;
          const isCurrent = currentStep === stepNumber;

          return (
            <li key={step} className="relative flex flex-col items-center flex-1">
              {/* Connector line */}
              {stepIdx !== steps.length - 1 ? (
                <div
                  className={`absolute left-1/2 top-4 w-full h-0.5 ${isCompleted ? 'bg-accent' : 'bg-gray-300 dark:bg-gray-600'}`}
                  style={{ transform: 'translateX(50%)' }}
                  aria-hidden="true"
                />
              ) : null}

              <div className="relative flex flex-col items-center">
                {/* Step circle */}
                <span className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-300 ${
                    isCompleted ? 'bg-accent' : isCurrent ? 'border-2 border-accent bg-white dark:bg-gray-800' : 'border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                }`}>
                  {isCompleted ? (
                    <CheckCircleIcon className="h-5 w-5 text-white" />
                  ) : (
                    <span className={`text-sm font-semibold ${
                        isCurrent ? 'text-accent' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {stepNumber}
                    </span>
                  )}
                </span>
                
                {/* Step text below circle */}
                <span className="mt-2 text-center">
                  <span className={`text-xs font-medium tracking-wide ${isCurrent || isCompleted ? 'text-accent' : 'text-gray-500 dark:text-gray-400'}`}>
                    {step}
                  </span>
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Stepper;
