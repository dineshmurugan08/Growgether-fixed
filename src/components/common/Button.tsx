import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'soft';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconOnly?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  iconOnly = false,
  children,
  className = '',
  ...props
}) => {
  const sizeClass = size === 'sm' ? 'gt-btn-sm' : size === 'lg' ? 'gt-btn-lg' : '';
  const iconOnlyClass = iconOnly ? 'gt-btn-icon-only' : '';

  return (
    <button
      className={`gt-btn gt-btn-${variant} ${sizeClass} ${iconOnlyClass} ${className}`}
      {...props}
    >
      {icon && <span className="gt-btn-icon">{icon}</span>}
      {!iconOnly && children && <span>{children}</span>}
    </button>
  );
};
