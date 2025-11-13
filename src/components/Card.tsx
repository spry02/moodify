import React from 'react';

interface CardProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  className = "",
}) => {
  return (
    <section
      className={`rounded-3xl border border-white/20 bg-white/10 backdrop-blur p-5 ${className}`.trim()}
    >
      <div className="mb-4">
        <h2 className="text-lg font-bold">{title}</h2>
        {subtitle && <p className="text-sm opacity-70 -mt-1">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
};
