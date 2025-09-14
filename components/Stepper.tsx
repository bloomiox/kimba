import React from 'react';
// FIX: Updated import path to use the common Icons component.
import { CheckCircleIcon } from './common/Icons';

interface StepperProps {
  steps: string[];
  currentStep: number; // 1-based index
}

const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center">
        {steps.map((step, stepIdx) => {
          const stepNumber = stepIdx + 1;
          const isCompleted = currentStep > stepNumber;
          const isCurrent = currentStep === stepNumber;

          return (
            <li key={step} className={`relative ${stepIdx !== steps.length - 1 ? 'flex-1' : ''}`}>
              {/* Connector line */}
              {stepIdx !== steps.length - 1 ? (
                <div
                  className={`absolute left-4 top-1/2 -ml-px mt-0.5 h-0.5 w-full ${isCompleted ? 'bg-accent' : 'bg-gray-300 dark:bg-gray-600'}`}
                  aria-hidden="true"
                />
              ) : null}

              <div className="relative flex items-center justify-start">
                <span className="flex h-9 items-center">
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
                </span>
                <span className="ml-4 hidden sm:flex min-w-0 flex-col">
                  <span className={`text-sm font-semibold tracking-wide ${isCurrent || isCompleted ? 'text-accent' : 'text-gray-500 dark:text-gray-400'}`}>
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