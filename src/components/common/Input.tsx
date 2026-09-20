import React from 'react';
import { Check, Search } from 'lucide-react';

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const TextField: React.FC<TextFieldProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="gt-form-group">
      {label && <label className="gt-label">{label}</label>}
      <input className={`gt-input ${className}`} {...props} />
      {error && <span style={{ fontSize: '0.75rem', color: 'var(--rose-pink)' }}>{error}</span>}
    </div>
  );
};

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const SearchInput: React.FC<SearchInputProps> = ({ className = '', ...props }) => {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <Search size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
      <input
        className={`gt-input ${className}`}
        style={{ paddingLeft: '36px' }}
        placeholder="Search habits, tasks, or friends..."
        {...props}
      />
    </div>
  );
};

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange, label }) => {
  return (
    <label className="gt-checkbox-wrapper" onClick={() => onChange(!checked)}>
      <div className={`gt-checkbox ${checked ? 'checked' : ''}`}>
        {checked && <Check size={14} strokeWidth={3} />}
      </div>
      {label && <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{label}</span>}
    </label>
  );
};
