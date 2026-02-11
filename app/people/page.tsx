'use client';

import React, { useState } from 'react';
import { usePeople } from '@/lib/hooks/use-data';
import { deletePerson } from '@/lib/db-operations';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { PersonForm } from '@/components/person-form';
import { Person } from '@/lib/db';
import './page.css';

export default function PeoplePage() {
    const people = usePeople();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingPerson, setEditingPerson] = useState<Person | null>(null);
    const [deletingPerson, setDeletingPerson] = useState<Person | null>(null);

    const handleDelete = async (person: Person) => {
        if (person.id) {
            await deletePerson(person.id);
            setDeletingPerson(null);
        }
    };

    if (!people) {
        return <div className="page-container">Loading...</div>;
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">People</h1>
                <Button onClick={() => setIsAddModalOpen(true)}>+ Add Person</Button>
            </div>

            {people.length === 0 ? (
                <div className="empty-state">
                    <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <h2 className="empty-title">No people yet</h2>
                    <p className="empty-text">Add people to track loans and debts with them</p>
                    <Button onClick={() => setIsAddModalOpen(true)}>Add Your First Person</Button>
                </div>
            ) : (
                <div className="people-grid">
                    {people.map((person) => (
                        <Card key={person.id}>
                            <CardBody>
                                <div className="person-card">
                                    <div className="person-avatar">
                                        {person.name.charAt(0).toUpperCase()}
                                    </div>
                                    <h3 className="person-name">{person.name}</h3>
                                    <div className="person-actions">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setEditingPerson(person)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => setDeletingPerson(person)}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            )}

            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add New Person"
            >
                <PersonForm
                    onSuccess={() => {
                        setIsAddModalOpen(false);
                    }}
                    onCancel={() => setIsAddModalOpen(false)}
                />
            </Modal>

            <Modal
                isOpen={!!editingPerson}
                onClose={() => setEditingPerson(null)}
                title="Edit Person"
            >
                <PersonForm
                    person={editingPerson || undefined}
                    onSuccess={() => {
                        setEditingPerson(null);
                    }}
                    onCancel={() => setEditingPerson(null)}
                />
            </Modal>

            <Modal
                isOpen={!!deletingPerson}
                onClose={() => setDeletingPerson(null)}
                title="Delete Person"
            >
                <p>Are you sure you want to delete <strong>{deletingPerson?.name}</strong>?</p>
                <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', opacity: 0.7 }}>
                    This will not delete associated loans.
                </p>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                    <Button
                        variant="danger"
                        onClick={() => deletingPerson && handleDelete(deletingPerson)}
                        fullWidth
                    >
                        Delete
                    </Button>
                    <Button variant="secondary" onClick={() => setDeletingPerson(null)} fullWidth>
                        Cancel
                    </Button>
                </div>
            </Modal>
        </div>
    );
}
