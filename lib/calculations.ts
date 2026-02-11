import { db, Loan, Payment } from './db';
import { isAfter, parseISO } from 'date-fns';

/**
 * Calculate remaining balance for a loan
 * Formula: (Principal + Interest) - Total Payments
 */
export function calculateRemainingBalance(loan: Loan, payments: Payment[]): number {
    const totalAmount = loan.principal + (loan.interestRate || 0);
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    return Math.max(0, totalAmount - totalPaid);
}

/**
 * Determine loan status based on due date and balance
 */
export function calculateLoanStatus(loan: Loan, balance: number): Loan['status'] {
    if (balance === 0) {
        return 'Paid';
    }

    if (loan.dueDate && isAfter(new Date(), parseISO(loan.dueDate))) {
        return 'Overdue';
    }

    return 'Active';
}

/**
 * Calculate total amount owed TO the user (user is lender)
 */
export async function calculateTotalOwed(userId: number): Promise<number> {
    const loans = await db.loans.where('lenderId').equals(userId).toArray();
    let total = 0;

    for (const loan of loans) {
        const payments = await db.payments.where('loanId').equals(loan.id!).toArray();
        const balance = calculateRemainingBalance(loan, payments);
        total += balance;
    }

    return total;
}

/**
 * Calculate total amount user owes (user is borrower)
 */
export async function calculateTotalOwing(userId: number): Promise<number> {
    const loans = await db.loans.where('borrowerId').equals(userId).toArray();
    let total = 0;

    for (const loan of loans) {
        const payments = await db.payments.where('loanId').equals(loan.id!).toArray();
        const balance = calculateRemainingBalance(loan, payments);
        total += balance;
    }

    return total;
}

/**
 * Get loan with calculated balance and updated status
 */
export async function getLoanWithDetails(loanId: number) {
    const loan = await db.loans.get(loanId);
    if (!loan) return null;

    const payments = await db.payments.where('loanId').equals(loanId).toArray();
    const balance = calculateRemainingBalance(loan, payments);
    const status = calculateLoanStatus(loan, balance);

    return { loan, payments, balance, status };
}
