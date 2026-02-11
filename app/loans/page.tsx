'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLoansWithDetails } from '@/lib/hooks/use-data';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { LoanForm } from '@/components/loan-form';
import './page.css';

type FilterStatus = 'All' | 'Active' | 'Paid' | 'Overdue';

export default function LoansPage() {
    const loans = useLoansWithDetails();
    const [filter, setFilter] = useState<FilterStatus>('All');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const filteredLoans = loans?.filter((loan) => {
        if (filter === 'All') return true;
        return loan.status === filter;
    }) || [];

    if (!loans) {
        return <div className="page-container">Loading...</div>;
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Loans</h1>
                <Button onClick={() => setIsAddModalOpen(true)}>+ Add Loan</Button>
            </div>

            <div className="filter-tabs">
                {(['All', 'Active', 'Overdue', 'Paid'] as FilterStatus[]).map((status) => (
                    <button
                        key={status}
                        className={`filter-tab ${filter === status ? 'filter-tab-active' : ''}`}
                        onClick={() => setFilter(status)}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {filteredLoans.length === 0 ? (
                <div className="empty-state">
                    <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h2 className="empty-title">
                        {filter === 'All' ? 'No loans yet' : `No ${filter.toLowerCase()} loans`}
                    </h2>
                    <p className="empty-text">
                        {filter === 'All'
                            ? 'Create your first loan to start tracking'
                            : `You don't have any ${filter.toLowerCase()} loans`}
                    </p>
                    {filter === 'All' && (
                        <Button onClick={() => setIsAddModalOpen(true)}>Create Your First Loan</Button>
                    )}
                </div>
            ) : (
                <div className="loans-list">
                    {filteredLoans.map((loan) => (
                        <Link key={loan.id} href={`/loans/${loan.id}`} style={{ textDecoration: 'none' }}>
                            <Card>
                                <CardBody>
                                    <div className="loan-card">
                                        <div className="loan-header">
                                            <div className="loan-parties">
                                                <div className="loan-party">
                                                    <span className="loan-label">Lender</span>
                                                    <span className="loan-value">{loan.lenderName}</span>
                                                </div>
                                                <svg className="loan-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                </svg>
                                                <div className="loan-party">
                                                    <span className="loan-label">Borrower</span>
                                                    <span className="loan-value">{loan.borrowerName}</span>
                                                </div>
                                            </div>
                                            <Badge status={loan.status}>{loan.status}</Badge>
                                        </div>
                                        <div className="loan-amount">
                                            <span className="loan-amount-label">Remaining</span>
                                            <span className="loan-amount-value">${loan.balance.toFixed(2)}</span>
                                            <span className="loan-amount-original">of ${loan.principal.toFixed(2)}</span>
                                        </div>
                                        {loan.paymentCount > 0 && (
                                            <div className="loan-payments">
                                                {loan.paymentCount} payment{loan.paymentCount !== 1 ? 's' : ''}
                                            </div>
                                        )}
                                    </div>
                                </CardBody>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}

            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Create New Loan"
            >
                <LoanForm
                    onSuccess={() => setIsAddModalOpen(false)}
                    onCancel={() => setIsAddModalOpen(false)}
                />
            </Modal>
        </div>
    );
}
