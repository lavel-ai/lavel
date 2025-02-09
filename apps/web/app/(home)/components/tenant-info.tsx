import { getTenantConnectionUrl } from '@repo/database/src/tenant-app/tenant-lookup';
import { TenantDisplay } from './tenant-display';

export async function TenantInfo({ subdomain }: { subdomain: string }) {
    console.log('Looking up tenant:', subdomain); // For debugging
    
    const connectionUrl = await getTenantConnectionUrl(subdomain);
    console.log('Connection found:', !!connectionUrl); // For debugging (don't log actual URL)
    
    return <TenantDisplay connectionStatus={!!connectionUrl} />;
} 