'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLoanDetails } from '@/lib/hooks/use-data';
import { deleteLoan } from '@/lib/db-operations';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { LoanForm } from '@/components/loan-form';
import { PaymentForm } from '@/components/payment-form';
import { format, parseISO } from 'date-fns';
import './page.css';

export default function LoanDetailPage() {
    const params = useParams();
    const router = useRouter();
    const loanId = parseInt(params.id as string);
    const details = useLoanDetails(loanId);

    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const handleDelete = async () => {
        await deleteLoan(loanId);
        router.push('/loans');
    };

    if (!details) {
        return <div className="page-container">Loading...</div>;
    }

    const { loan, lender, borrower, payments, balance, status } = details;

    return (
        <div className="page-container">
            <div className="detail-header">
                <Button variant="ghost" onClick={() => router.back()}>
                    ← Back
                </Button>
                <div className="detail-actions">
                    <Button variant="secondary" size="sm" onClick={() => setIsEditModalOpen(true)}>
                        Edit
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => setIsDeleteModalOpen(true)}>
                        Delete
                    </Button>
                </div>
            </div>

            <div className="detail-title">
                <h1 className="page-title">Loan Details</h1>
                <Badge status={status}>{status}</Badge>
            </div>

            <Card>
                <CardBody>
                    <div className="detail-grid">
                        <div className="detail-item">
                            <span className="detail-label">Lender</span>
                            <span className="detail-value">{lender?.name || 'Unknown'}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Borrower</span>
                            <span className="detail-value">{borrower?.name || 'Unknown'}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Principal</span>
                            <span className="detail-value">${loan.principal.toFixed(2)}</span>
                        </div>
                        {loan.interestRate !== undefined && loan.interestRate > 0 && (
                            <div className="detail-item">
                                <span className="detail-label">Interest</span>
                                <span className="detail-value">${loan.interestRate.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="detail-item">
                            <span className="detail-label">Start Date</span>
                            <span className="detail-value">{format(parseISO(loan.startDate), 'MMM d, yyyy')}</span>
                        </div>
                        {loan.dueDate && (
                            <div className="detail-item">
                                <span className="detail-label">Due Date</span>
                                <span className="detail-value">{format(parseISO(loan.dueDate), 'MMM d, yyyy')}</span>
                            </div>
                        )}
                    </div>
                    {loan.notes && (
                        <div className="detail-notes">
                            <span className="detail-label">Notes</span>
                            <p>{loan.notes}</p>
                        </div>
                    )}
                </CardBody>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex-between">
                        <span>Balance</span>
                        {balance > 0 && (
                            <Button size="sm" onClick={() => setIsPaymentModalOpen(true)}>
                                + Add Payment
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardBody>
                    <div className="balance-display">
                        <div className="balance-remaining">
                            <span className="balance-label">Remaining</span>
                            <span className="balance-amount">${balance.toFixed(2)}</span>
                        </div>
                        <div className="balance-stats">
                            <div className="balance-stat">
                                <span>Original: ${loan.principal.toFixed(2)}</span>
                            </div>
                            {loan.interestRate && loan.interestRate > 0 && (
                                <div className="balance-stat">
                                    <span>Interest: ${loan.interestRate.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="balance-stat">
                                <span>Paid: ${(loan.principal + (loan.interestRate || 0) - balance).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {payments.length > 0 && (
                <Card>
                    <CardHeader>Payment History ({payments.length})</CardHeader>
                    <CardBody>
                        <div className="payments-list">
                            {payments.map((payment) => (
                                <div key={payment.id} className="payment-item">
                                    <div className="payment-date">
                                        {format(parseISO(payment.date), 'MMM d, yyyy')}
                                    </div>
                                    <div className="payment-amount">
                                        ${payment.amount.toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardBody>
                </Card>
            )}

            <Modal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                title="Add Payment"
            >
                <PaymentForm
                    loanId={loanId}
                    maxAmount={balance}
                    onSuccess={() => setIsPaymentModalOpen(false)}
                    onCancel={() => setIsPaymentModalOpen(false)}
                />
            </Modal>

            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Loan"
            >
                <LoanForm
                    loan={loan}
                    onSuccess={() => setIsEditModalOpen(false)}
                    onCancel={() => setIsEditModalOpen(false)}
                />
            </Modal>

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete Loan"
            >
                <p>Are you sure you want to delete this loan?</p>
                <p className="text-muted" style={{ marginTop: 'var(--space-2)' }}>
                    This will also delete all associated payments. This action cannot be undone.
                </p>
                <div className="form-actions">
                    <Button variant="danger" onClick={handleDelete} fullWidth>
                        Delete Loan
                    </Button>
                    <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)} fullWidth>
                        Cancel
                    </Button>
                </div>
            </Modal>
        </div>
    );
}
