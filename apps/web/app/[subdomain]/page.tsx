import { TenantInfo } from '../(home)/components/tenant-info';

// This page will be accessible at: http://mg.localhost:3000
export default async function TenantPage({
    params: { subdomain }
}: {
    params: { subdomain: string }
}) {
    console.log('Subdomain:', subdomain); // For debugging
    
    return (
        <div className="p-4">
            <h1 className="text-xl mb-4">Tenant Page: {subdomain}</h1>
            <TenantInfo subdomain={subdomain} />
        </div>
    );
} 