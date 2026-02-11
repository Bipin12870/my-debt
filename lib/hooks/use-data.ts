import { useLiveQuery } from 'dexie-react-hooks';
import { db, Person, Loan, Payment } from '../db';
import { calculateRemainingBalance, calculateLoanStatus } from '../calculations';

/**
 * Hook to get all people with live updates
 */
export function usePeople() {
    return useLiveQuery(() => db.people.toArray());
}

/**
 * Hook to get a specific person
 */
export function usePerson(id: number | undefined) {
    return useLiveQuery(() => {
        if (!id) return undefined;
        return db.people.get(id);
    }, [id]);
}

/**
 * Hook to get all loans with live updates
 */
export function useLoans() {
    return useLiveQuery(() => db.loans.toArray());
}

/**
 * Hook to get a specific loan with payments and calculated details
 */
export function useLoanDetails(id: number | undefined) {
    return useLiveQuery(async () => {
        if (!id) return null;

        const loan = await db.loans.get(id);
        if (!loan) return null;

        const payments = await db.payments.where('loanId').equals(id).toArray();
        const lender = await db.people.get(loan.lenderId);
        const borrower = await db.people.get(loan.borrowerId);
        const balance = calculateRemainingBalance(loan, payments);
        const status = calculateLoanStatus(loan, balance);

        return { loan, payments, lender, borrower, balance, status };
    }, [id]);
}

/**
 * Hook to get loans for a specific person (as lender or borrower)
 */
export function useLoansByPerson(personId: number | undefined) {
    return useLiveQuery(async () => {
        if (!personId) return [];
        return db.loans
            .filter(loan => loan.lenderId === personId || loan.borrowerId === personId)
            .toArray();
    }, [personId]);
}

/**
 * Hook to get all loans with enriched details (lender/borrower names, balance, status)
 */
export function useLoansWithDetails() {
    return useLiveQuery(async () => {
        const loans = await db.loans.toArray();
        const enriched = await Promise.all(
            loans.map(async (loan) => {
                const payments = await db.payments.where('loanId').equals(loan.id!).toArray();
                const lender = await db.people.get(loan.lenderId);
                const borrower = await db.people.get(loan.borrowerId);
                const balance = calculateRemainingBalance(loan, payments);
                const status = calculateLoanStatus(loan, balance);

                return {
                    ...loan,
                    lenderName: lender?.name || 'Unknown',
                    borrowerName: borrower?.name || 'Unknown',
                    balance,
                    status,
                    paymentCount: payments.length
                };
            })
        );

        return enriched;
    });
}

/**
 * Hook to get payments for a loan
 */
export function usePayments(loanId: number | undefined) {
    return useLiveQuery(async () => {
        if (!loanId) return [];
        return db.payments.where('loanId').equals(loanId).sortBy('date');
    }, [loanId]);
}
