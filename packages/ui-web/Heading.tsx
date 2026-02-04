import React from 'react';

interface HeadingProps {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  gradient?: boolean;
  className?: string;
}

export function Heading({ 
  children, 
  level = 1,
  gradient = false,
  className = '' 
}: HeadingProps) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  
  const sizeClasses = {
    1: 'text-4xl sm:text-5xl md:text-6xl font-bold',
    2: 'text-3xl sm:text-4xl font-bold',
    3: 'text-2xl sm:text-3xl font-semibold',
    4: 'text-xl sm:text-2xl font-semibold',
    5: 'text-lg sm:text-xl font-medium',
    6: 'text-base sm:text-lg font-medium',
  };

  const gradientClass = gradient 
    ? 'bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500' 
    : 'text-gray-900';

  return (
    <Tag className={`${sizeClasses[level]} ${gradientClass} ${className}`}>
      {children}
    </Tag>
  );
}
