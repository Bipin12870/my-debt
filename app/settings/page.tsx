'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { exportData, downloadExport, importData } from '@/lib/export-import';
import './page.css';

export default function SettingsPage() {
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleExport = async () => {
        try {
            setIsExporting(true);
            setMessage(null);
            const data = await exportData();
            downloadExport(data);
            setMessage({ type: 'success', text: 'Data exported successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to export data' });
        } finally {
            setIsExporting(false);
        }
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsImporting(true);
            setMessage(null);
            const text = await file.text();
            await importData(text);
            setMessage({ type: 'success', text: 'Data imported successfully!' });
            // Reset file input
            e.target.value = '';
        } catch (error) {
            setMessage({
                type: 'error',
                text: error instanceof Error ? error.message : 'Failed to import data'
            });
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <div className="page-container">
            <h1 className="page-title">Settings</h1>

            <Card>
                <CardHeader>Data Backup & Restore</CardHeader>
                <CardBody>
                    <div className="settings-section">
                        <div className="warning-box">
                            <svg className="warning-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div>
                                <strong>Important:</strong> All data is stored locally on this device. Export backups regularly to prevent data loss.
                            </div>
                        </div>

                        <div className="settings-actions">
                            <div className="settings-action">
                                <div>
                                    <h3 className="settings-action-title">Export Data</h3>
                                    <p className="settings-action-desc">
                                        Download all your data as a JSON file. Keep this file safe as a backup.
                                    </p>
                                </div>
                                <Button onClick={handleExport} disabled={isExporting}>
                                    {isExporting ? 'Exporting...' : '⬇️ Export'}
                                </Button>
                            </div>

                            <div className="settings-action">
                                <div>
                                    <h3 className="settings-action-title">Import Data</h3>
                                    <p className="settings-action-desc">
                                        Restore data from a previously exported JSON file. This will replace all current data.
                                    </p>
                                </div>
                                <label htmlFor="import-file">
                                    <span className={`btn btn-primary btn-md ${isImporting ? 'disabled' : ''}`}>
                                        {isImporting ? 'Importing...' : '⬆️ Import'}
                                    </span>
                                </label>
                                <input
                                    id="import-file"
                                    type="file"
                                    accept=".json"
                                    onChange={handleImport}
                                    style={{ display: 'none' }}
                                    disabled={isImporting}
                                />
                            </div>
                        </div>

                        {message && (
                            <div className={`message message-${message.type}`}>
                                {message.text}
                            </div>
                        )}
                    </div>
                </CardBody>
            </Card>

            <Card>
                <CardHeader>About</CardHeader>
                <CardBody>
                    <div className="about-content">
                        <h3>Personal Loan & Debt Tracker</h3>
                        <p>
                            A simple, offline-first app for tracking personal loans and debts with friends and family.
                        </p>
                        <ul className="about-features">
                            <li>✅ Fully offline after first load</li>
                            <li>✅ No account required</li>
                            <li>✅ Private and secure (local storage only)</li>
                            <li>✅ Export/import for backups</li>
                        </ul>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
