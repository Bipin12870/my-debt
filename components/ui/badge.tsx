import React from 'react';
import './badge.css';

interface BadgeProps {
    status: 'Active' | 'Paid' | 'Overdue';
    children: React.ReactNode;
}

export function Badge({ status, children }: BadgeProps) {
    return (
        <span className={`badge badge-${status.toLowerCase()}`}>
            {children}
        </span>
    );
}
