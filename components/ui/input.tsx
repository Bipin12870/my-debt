import React from 'react';
import './input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
    return (
        <div className="input-group">
            {label && <label className="input-label">{label}</label>}
            <input className={`input ${error ? 'input-error' : ''} ${className}`} {...props} />
            {error && <span className="input-error-text">{error}</span>}
        </div>
    );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    children: React.ReactNode;
}

export function Select({ label, error, className = '', children, ...props }: SelectProps) {
    return (
        <div className="input-group">
            {label && <label className="input-label">{label}</label>}
            <select className={`input ${error ? 'input-error' : ''} ${className}`} {...props}>
                {children}
            </select>
            {error && <span className="input-error-text">{error}</span>}
        </div>
    );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export function Textarea({ label, error, className = '', ...props }: TextareaProps) {
    return (
        <div className="input-group">
            {label && <label className="input-label">{label}</label>}
            <textarea className={`input ${error ? 'input-error' : ''} ${className}`} {...props} />
            {error && <span className="input-error-text">{error}</span>}
        </div>
    );
}
