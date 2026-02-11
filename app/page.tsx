'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLoansWithDetails } from '@/lib/hooks/use-data';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { LoanForm } from '@/components/loan-form';
import './page.css';

export default function HomePage() {
  const loans = useLoansWithDetails();
  const [isAddLoanModalOpen, setIsAddLoanModalOpen] = useState(false);

  if (!loans) {
    return <div className="page-container">Loading...</div>;
  }

  // Calculate totals
  const activeLoans = loans.filter(l => l.status === 'Active' || l.status === 'Overdue');
  const overdueLoans = loans.filter(l => l.status === 'Overdue');

  // Note: In a real app, you'd need a "me" concept. For MVP, we'll just show all balances
  const totalBalance = loans.reduce((sum, loan) => sum + loan.balance, 0);

  return (
    <div className="page-container">
      <div className="home-header">
        <h1 className="page-title">Debt Tracker</h1>
        <Button onClick={() => setIsAddLoanModalOpen(true)}>+ New Loan</Button>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <Card>
          <CardBody>
            <div className="summary-card">
              <div className="summary-icon summary-icon-primary">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="summary-content">
                <div className="summary-label">Active Loans</div>
                <div className="summary-value">{activeLoans.length}</div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="summary-card">
              <div className="summary-icon summary-icon-success">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="summary-content">
                <div className="summary-label">Total Outstanding</div>
                <div className="summary-value">${totalBalance.toFixed(2)}</div>
              </div>
            </div>
          </CardBody>
        </Card>

        {overdueLoans.length > 0 && (
          <Card>
            <CardBody>
              <div className="summary-card">
                <div className="summary-icon summary-icon-danger">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="summary-content">
                  <div className="summary-label">Overdue</div>
                  <div className="summary-value">{overdueLoans.length}</div>
                </div>
              </div>
            </CardBody>
          </Card>
        )}
      </div>

      {/* Overdue Loans Section */}
      {overdueLoans.length > 0 && (
        <div className="section">
          <h2 className="section-title">⚠️ Overdue Loans</h2>
          <div className="loans-list">
            {overdueLoans.map((loan) => (
              <Link key={loan.id} href={`/loans/${loan.id}`} style={{ textDecoration: 'none' }}>
                <Card className="card-clickable">
                  <CardBody>
                    <div className="loan-card-compact">
                      <div className="loan-compact-info">
                        <div className="loan-compact-parties">
                          {loan.lenderName} → {loan.borrowerName}
                        </div>
                        <Badge status="Overdue">Overdue</Badge>
                      </div>
                      <div className="loan-compact-amount">${loan.balance.toFixed(2)}</div>
                    </div>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Active Loans */}
      {activeLoans.length > 0 && (
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Active Loans</h2>
            <Link href="/loans">
              <Button variant="ghost" size="sm">View All →</Button>
            </Link>
          </div>
          <div className="loans-list">
            {activeLoans.slice(0, 5).map((loan) => (
              <Link key={loan.id} href={`/loans/${loan.id}`} style={{ textDecoration: 'none' }}>
                <Card className="card-clickable">
                  <CardBody>
                    <div className="loan-card-compact">
                      <div className="loan-compact-info">
                        <div className="loan-compact-parties">
                          {loan.lenderName} → {loan.borrowerName}
                        </div>
                        <Badge status={loan.status}>{loan.status}</Badge>
                      </div>
                      <div className="loan-compact-amount">${loan.balance.toFixed(2)}</div>
                    </div>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {loans.length === 0 && (
        <div className="empty-state">
          <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className="empty-title">Welcome to Debt Tracker</h2>
          <p className="empty-text">Start by adding people, then create loans to track debts</p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <Link href="/people">
              <Button variant="secondary">Add People</Button>
            </Link>
            <Button onClick={() => setIsAddLoanModalOpen(true)}>Create Loan</Button>
          </div>
        </div>
      )}

      <Modal
        isOpen={isAddLoanModalOpen}
        onClose={() => setIsAddLoanModalOpen(false)}
        title="Create New Loan"
      >
        <LoanForm
          onSuccess={() => setIsAddLoanModalOpen(false)}
          onCancel={() => setIsAddLoanModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
