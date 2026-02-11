import Dexie, { Table } from 'dexie';

// Data types matching PRD schema
export interface Person {
    id?: number;
    name: string;
}

export interface Loan {
    id?: number;
    lenderId: number;
    borrowerId: number;
    principal: number;
    interestRate?: number; // Optional, percentage or flat amount
    startDate: string; // ISO date string
    dueDate?: string; // Optional, ISO date string
    notes?: string;
    status: 'Active' | 'Paid' | 'Overdue';
}

export interface Payment {
    id?: number;
    loanId: number;
    amount: number;
    date: string; // ISO date string
}

// Dexie database class
export class DebtTrackerDB extends Dexie {
    people!: Table<Person>;
    loans!: Table<Loan>;
    payments!: Table<Payment>;

    constructor() {
        super('DebtTrackerDB');

        // Define schema
        this.version(1).stores({
            people: '++id, name',
            loans: '++id, lenderId, borrowerId, status, dueDate',
            payments: '++id, loanId, date'
        });
    }
}

// Single database instance
export const db = new DebtTrackerDB();
