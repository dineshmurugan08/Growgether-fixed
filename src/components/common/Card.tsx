import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
  emeraldGlow?: boolean;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverable = true,
  emeraldGlow = false,
  className = '',
  ...props
}) => {
  const hoverClass = hoverable ? 'gt-card-hover' : '';
  const glowClass = emeraldGlow ? 'gt-card-emerald-glow' : '';

  return (
    <div className={`gt-card ${hoverClass} ${glowClass} ${className}`} {...props}>
      {children}
    </div>
  );
};

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  variant?: 'emerald' | 'amber' | 'purple';
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  variant = 'emerald',
  trend,
}) => {
  return (
    <Card hoverable className="gt-stat-card">
      <div className={`gt-stat-icon-wrapper gt-stat-icon-${variant}`}>
        {icon}
      </div>
      <div>
        <div className="gt-stat-label">{title}</div>
        <div className="gt-stat-value">{value}</div>
        {trend && <div style={{ fontSize: '0.75rem', color: 'var(--primary-300)', marginTop: '2px' }}>{trend}</div>}
      </div>
    </Card>
  );
};
