import { db } from './db';

export interface ExportData {
    version: number;
    exportDate: string;
    people: any[];
    loans: any[];
    payments: any[];
}

/**
 * Export all data to JSON format
 */
export async function exportData(): Promise<string> {
    const people = await db.people.toArray();
    const loans = await db.loans.toArray();
    const payments = await db.payments.toArray();

    const exportData: ExportData = {
        version: 1,
        exportDate: new Date().toISOString(),
        people,
        loans,
        payments
    };

    return JSON.stringify(exportData, null, 2);
}

/**
 * Download exported data as JSON file
 */
export function downloadExport(jsonData: string): void {
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `debt-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Validate imported data structure
 */
function validateImportData(data: any): data is ExportData {
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid data format');
    }

    if (!data.version || data.version !== 1) {
        throw new Error('Unsupported data version');
    }

    if (!Array.isArray(data.people) || !Array.isArray(data.loans) || !Array.isArray(data.payments)) {
        throw new Error('Missing or invalid data arrays');
    }

    return true;
}

/**
 * Import data from JSON, replacing all existing data
 */
export async function importData(jsonString: string): Promise<void> {
    try {
        const data = JSON.parse(jsonString);
        validateImportData(data);

        // Clear existing data
        await db.transaction('rw', db.people, db.loans, db.payments, async () => {
            await db.people.clear();
            await db.loans.clear();
            await db.payments.clear();

            // Import new data
            await db.people.bulkAdd(data.people);
            await db.loans.bulkAdd(data.loans);
            await db.payments.bulkAdd(data.payments);
        });
    } catch (error) {
        if (error instanceof SyntaxError) {
            throw new Error('Invalid JSON format');
        }
        throw error;
    }
}
