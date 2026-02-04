import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export function Card({ children, title, className = '' }: CardProps) {
  return (
    <div className={`p-6 bg-white rounded-lg shadow-md ${className}`}>
      {title && (
        <h3 className="text-xl font-bold mb-4">{title}</h3>
      )}
      {children}
    </div>
  );
}