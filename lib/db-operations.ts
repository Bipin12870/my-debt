import { db, Person, Loan, Payment } from './db';
import { calculateLoanStatus, calculateRemainingBalance } from './calculations';

// ===== PERSON OPERATIONS =====

export async function addPerson(name: string): Promise<number> {
    return await db.people.add({ name });
}

export async function updatePerson(id: number, name: string): Promise<void> {
    await db.people.update(id, { name });
}

export async function deletePerson(id: number): Promise<void> {
    await db.people.delete(id);
}

export async function getAllPeople(): Promise<Person[]> {
    return await db.people.toArray();
}

export async function getPerson(id: number): Promise<Person | undefined> {
    return await db.people.get(id);
}

// ===== LOAN OPERATIONS =====

export async function addLoan(loan: Omit<Loan, 'id'>): Promise<number> {
    return await db.loans.add(loan);
}

export async function updateLoan(id: number, updates: Partial<Loan>): Promise<void> {
    await db.loans.update(id, updates);
}

export async function deleteLoan(id: number): Promise<void> {
    // Delete associated payments first
    await db.payments.where('loanId').equals(id).delete();
    await db.loans.delete(id);
}

export async function getLoan(id: number): Promise<Loan | undefined> {
    return await db.loans.get(id);
}

export async function getAllLoans(): Promise<Loan[]> {
    return await db.loans.toArray();
}

export async function getLoansByPerson(personId: number): Promise<Loan[]> {
    return await db.loans
        .filter(loan => loan.lenderId === personId || loan.borrowerId === personId)
        .toArray();
}

// ===== PAYMENT OPERATIONS =====

export async function addPayment(payment: Omit<Payment, 'id'>): Promise<number> {
    const paymentId = await db.payments.add(payment);

    // Auto-update loan status after payment
    const loan = await db.loans.get(payment.loanId);
    if (loan) {
        const payments = await db.payments.where('loanId').equals(payment.loanId).toArray();
        const balance = calculateRemainingBalance(loan, payments);
        const newStatus = calculateLoanStatus(loan, balance);

        if (loan.status !== newStatus) {
            await db.loans.update(payment.loanId, { status: newStatus });
        }
    }

    return paymentId;
}

export async function getPaymentsByLoan(loanId: number): Promise<Payment[]> {
    return await db.payments.where('loanId').equals(loanId).sortBy('date');
}

export async function deletePayment(id: number): Promise<void> {
    const payment = await db.payments.get(id);
    if (payment) {
        await db.payments.delete(id);

        // Recalculate loan status after payment deletion
        const loan = await db.loans.get(payment.loanId);
        if (loan) {
            const payments = await db.payments.where('loanId').equals(payment.loanId).toArray();
            const balance = calculateRemainingBalance(loan, payments);
            const newStatus = calculateLoanStatus(loan, balance);
            await db.loans.update(payment.loanId, { status: newStatus });
        }
    }
}
