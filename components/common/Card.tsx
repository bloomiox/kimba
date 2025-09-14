import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  titleIcon?: React.ElementType;
}

const Card: React.FC<CardProps> = ({ children, className = '', title, titleIcon: Icon }) => {
  return (
    <div className={`bg-white dark:bg-gray-800/50 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700/50 ${className}`}>
      {title && (
        <h3 className="text-xl font-semibold mb-4 text-accent flex items-center gap-2">
            {Icon && <Icon className="w-5 h-5" />}
            {title}
        </h3>
      )}
      {children}
    </div>
  );
};

export default Card;
