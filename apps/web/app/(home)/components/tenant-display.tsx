'use client';

export function TenantDisplay({ connectionStatus }: { connectionStatus: boolean }) {
    return (
        <div>
            <h1>Tenant Status</h1>
            <p>Connection: {connectionStatus ? 'Active' : 'Not Found'}</p>
        </div>
    );
} 