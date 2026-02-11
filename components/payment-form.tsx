'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { addPayment } from '@/lib/db-operations';
import { format } from 'date-fns';

interface PaymentFormProps {
    loanId: number;
    maxAmount: number;
    onSuccess: () => void;
    onCancel: () => void;
}

export function PaymentForm({ loanId, maxAmount, onSuccess, onCancel }: PaymentFormProps) {
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!amount || parseFloat(amount) <= 0) {
            newErrors.amount = 'Amount must be greater than 0';
        } else if (parseFloat(amount) > maxAmount) {
            newErrors.amount = `Amount cannot exceed remaining balance ($${maxAmount.toFixed(2)})`;
        }

        if (!date) {
            newErrors.date = 'Date is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        try {
            setIsSubmitting(true);
            await addPayment({
                loanId,
                amount: parseFloat(amount),
                date,
            });
            onSuccess();
        } catch (err) {
            setErrors({ submit: 'Failed to add payment' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Input
                label="Amount *"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                error={errors.amount}
                autoFocus
            />

            <div style={{ fontSize: '0.875rem', opacity: 0.7, marginBottom: '1rem', marginTop: '-0.5rem' }}>
                Remaining balance: ${maxAmount.toFixed(2)}
            </div>

            <Input
                label="Date *"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                error={errors.date}
            />

            {errors.submit && <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{errors.submit}</p>}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <Button type="submit" disabled={isSubmitting} fullWidth>
                    Add Payment
                </Button>
                <Button type="button" variant="secondary" onClick={onCancel} fullWidth>
                    Cancel
                </Button>
            </div>
        </form>
    );
}
