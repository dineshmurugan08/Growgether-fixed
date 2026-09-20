import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'amber' | 'purple' | 'cyan' | 'neutral';
  icon?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'emerald',
  icon,
  style,
  className = '',
}) => {
  return (
    <span className={`gt-badge gt-badge-${variant} ${className}`} style={style}>
      {icon && <span>{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
