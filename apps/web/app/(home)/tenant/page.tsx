import { TenantInfo } from '../components/tenant-info';

export default async function TenantPage({
    params: { subdomain }
}: {
    params: { subdomain: string }
}) {
    return (
        <div>
            <TenantInfo subdomain={subdomain} />
        </div>
    );
}
