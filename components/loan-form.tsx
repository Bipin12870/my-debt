'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input, Select, Textarea } from './ui/input';
import { addLoan, updateLoan } from '@/lib/db-operations';
import { usePeople } from '@/lib/hooks/use-data';
import { Loan } from '@/lib/db';
import { format } from 'date-fns';

interface LoanFormProps {
    loan?: Loan;
    onSuccess: () => void;
    onCancel: () => void;
}

export function LoanForm({ loan, onSuccess, onCancel }: LoanFormProps) {
    const people = usePeople();
    const [lenderId, setLenderId] = useState(loan?.lenderId?.toString() || '');
    const [borrowerId, setBorrowerId] = useState(loan?.borrowerId?.toString() || '');
    const [principal, setPrincipal] = useState(loan?.principal?.toString() || '');
    const [interestRate, setInterestRate] = useState(loan?.interestRate?.toString() || '');
    const [startDate, setStartDate] = useState(loan?.startDate || format(new Date(), 'yyyy-MM-dd'));
    const [dueDate, setDueDate] = useState(loan?.dueDate || '');
    const [notes, setNotes] = useState(loan?.notes || '');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!lenderId) newErrors.lenderId = 'Lender is required';
        if (!borrowerId) newErrors.borrowerId = 'Borrower is required';
        if (lenderId === borrowerId) newErrors.borrowerId = 'Lender and borrower must be different';
        if (!principal || parseFloat(principal) <= 0) newErrors.principal = 'Principal must be greater than 0';
        if (interestRate && parseFloat(interestRate) < 0) newErrors.interestRate = 'Interest cannot be negative';
        if (!startDate) newErrors.startDate = 'Start date is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        try {
            setIsSubmitting(true);
            const loanData = {
                lenderId: parseInt(lenderId),
                borrowerId: parseInt(borrowerId),
                principal: parseFloat(principal),
                interestRate: interestRate ? parseFloat(interestRate) : undefined,
                startDate,
                dueDate: dueDate || undefined,
                notes: notes || undefined,
                status: loan?.status || ('Active' as const),
            };

            if (loan?.id) {
                await updateLoan(loan.id, loanData);
            } else {
                await addLoan(loanData);
            }
            onSuccess();
        } catch (err) {
            setErrors({ submit: 'Failed to save loan' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!people || people.length === 0) {
        return (
            <div style={{ padding: '1rem' }}>
                <p>Please add people first before creating a loan.</p>
                <Button onClick={onCancel} style={{ marginTop: '1rem' }}>Close</Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit}>
            <Select
                label="Lender *"
                value={lenderId}
                onChange={(e) => setLenderId(e.target.value)}
                error={errors.lenderId}
            >
                <option value="">Select lender</option>
                {people.map((person) => (
                    <option key={person.id} value={person.id}>
                        {person.name}
                    </option>
                ))}
            </Select>

            <Select
                label="Borrower *"
                value={borrowerId}
                onChange={(e) => setBorrowerId(e.target.value)}
                error={errors.borrowerId}
            >
                <option value="">Select borrower</option>
                {people.map((person) => (
                    <option key={person.id} value={person.id}>
                        {person.name}
                    </option>
                ))}
            </Select>

            <Input
                label="Principal Amount *"
                type="number"
                step="0.01"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                placeholder="0.00"
                error={errors.principal}
            />

            <Input
                label="Interest (optional)"
                type="number"
                step="0.01"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                placeholder="Flat amount or percentage"
                error={errors.interestRate}
            />

            <Input
                label="Start Date *"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                error={errors.startDate}
            />

            <Input
                label="Due Date (optional)"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                error={errors.dueDate}
            />

            <Textarea
                label="Notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this loan..."
            />

            {errors.submit && <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{errors.submit}</p>}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <Button type="submit" disabled={isSubmitting} fullWidth>
                    {loan ? 'Update' : 'Create'} Loan
                </Button>
                <Button type="button" variant="secondary" onClick={onCancel} fullWidth>
                    Cancel
                </Button>
            </div>
        </form>
    );
}
