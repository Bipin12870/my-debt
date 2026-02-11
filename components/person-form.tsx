'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { addPerson, updatePerson } from '@/lib/db-operations';
import { Person } from '@/lib/db';

interface PersonFormProps {
    person?: Person;
    onSuccess: () => void;
    onCancel: () => void;
}

export function PersonForm({ person, onSuccess, onCancel }: PersonFormProps) {
    const [name, setName] = useState(person?.name || '');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('Name is required');
            return;
        }

        try {
            setIsSubmitting(true);
            if (person?.id) {
                await updatePerson(person.id, name.trim());
            } else {
                await addPerson(name.trim());
            }
            onSuccess();
        } catch (err) {
            setError('Failed to save person');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Input
                label="Name *"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter person's name"
                error={error}
                autoFocus
            />

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <Button type="submit" disabled={isSubmitting} fullWidth>
                    {person ? 'Update' : 'Add'} Person
                </Button>
                <Button type="button" variant="secondary" onClick={onCancel} fullWidth>
                    Cancel
                </Button>
            </div>
        </form>
    );
}
