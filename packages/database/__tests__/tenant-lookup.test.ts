
import { getTenantConnectionUrl, clearTenantConnectionCache, clearAllTenantConnectionCaches } from '../src/tenant-app/queries/tenant-lookup';
import { db } from '../src/main-app/db'; // Assuming this is where your main db client is
import { afterEach, expect, it, describe, vi } from 'vitest';

// Mock the database client to control its behavior in tests
vi.mock('../../main-app/db', () => {
    const mockDb = {
        query: {
            organizations: {
                findFirst: vi.fn(),
            },
            projects: {
                findFirst: vi.fn(),
            },
        },
    };
    return { db: mockDb };
});

describe('getTenantConnectionUrl', () => {
    afterEach(() => {
        vi.clearAllMocks(); // Reset mocks after each test
        clearAllTenantConnectionCaches(); // Clear cache after each test
        });

    it('should return connection URL from cache on second call', async () => {
        const subdomain = 'test-tenant';
        const mockConnectionUrl = 'test-connection-url';

        // Mock database to return a connection URL for the first call
        (db.query.organizations.findFirst as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ id: 'org-id' });
        (db.query.projects.findFirst as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ connectionUrl: mockConnectionUrl });

        // First call - should fetch from DB and cache
        const url1 = await getTenantConnectionUrl(subdomain);
        expect(url1).toBe(mockConnectionUrl);
        expect(db.query.organizations.findFirst).toHaveBeenCalledTimes(1);
        expect(db.query.projects.findFirst).toHaveBeenCalledTimes(1);

        // Reset mock call counts
        vi.clearAllMocks();

        // Second call - should fetch from cache
        const url2 = await getTenantConnectionUrl(subdomain);
        expect(url2).toBe(mockConnectionUrl);
        // Database should NOT be called again
        expect(db.query.organizations.findFirst).not.toHaveBeenCalled();
        expect(db.query.projects.findFirst).not.toHaveBeenCalled();
    });

    it('should return connection URL if found in database and cache it', async () => {
        const subdomain = 'test-tenant';
        const mockConnectionUrl = 'test-connection-url';

        // Mock database to return organization and project
        (db.query.organizations.findFirst as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ id: 'org-id' });
        (db.query.projects.findFirst as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ connectionUrl: mockConnectionUrl });

        const url = await getTenantConnectionUrl(subdomain);
        expect(url).toBe(mockConnectionUrl);
        expect(db.query.organizations.findFirst).toHaveBeenCalledWith(expect.objectContaining({
            where: expect.any(Function), // You can be more specific if needed
            columns: { id: true }
        }));
        expect(db.query.projects.findFirst).toHaveBeenCalledWith(expect.objectContaining({
            where: expect.any(Function),
            columns: { connectionUrl: true }
        }));
    });

    it('should return null if organization is not found', async () => {
        const subdomain = 'non-existent-tenant';

        // Mock database to return no organization
        (db.query.organizations.findFirst as ReturnType<typeof vi.fn>).mockResolvedValueOnce(undefined);

        const url = await getTenantConnectionUrl(subdomain);
        expect(url).toBeNull();
        expect(db.query.organizations.findFirst).toHaveBeenCalled();
        expect(db.query.projects.findFirst).not.toHaveBeenCalled(); // Project query should not be called
    });

    it('should return null if project is not found', async () => {
        const subdomain = 'tenant-without-project';

        // Mock database to return organization but no project
        (db.query.organizations.findFirst as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ id: 'org-id' });
        (db.query.projects.findFirst as ReturnType<typeof vi.fn>).mockResolvedValueOnce(undefined);

        const url = await getTenantConnectionUrl(subdomain);
        expect(url).toBeNull();
        expect(db.query.organizations.findFirst).toHaveBeenCalled();
        expect(db.query.projects.findFirst).toHaveBeenCalled();
    });

    it('should return null and log error if database query fails', async () => {
        const subdomain = 'error-tenant';
        const mockError = new Error('Database error');
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {}); // Spy on console.error

        // Mock database to throw an error
        (db.query.organizations.findFirst as ReturnType<typeof vi.fn>).mockRejectedValueOnce(mockError);

        const url = await getTenantConnectionUrl(subdomain);
        expect(url).toBeNull();
        expect(db.query.organizations.findFirst).toHaveBeenCalled();
        expect(consoleErrorSpy).toHaveBeenCalledWith("Error looking up tenant connection URL:", mockError);

        consoleErrorSpy.mockRestore(); // Restore console.error
    });

    it('should clear cache for a specific subdomain', async () => {
        const subdomain = 'tenant-to-clear';
        const mockConnectionUrl = 'cached-connection-url';

        // Populate the cache
        (db.query.organizations.findFirst as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ id: 'org-id' });
        (db.query.projects.findFirst as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ connectionUrl: mockConnectionUrl });
        await getTenantConnectionUrl(subdomain);

        // Clear cache for the subdomain
        clearTenantConnectionCache(subdomain);

        // Next call should be a cache miss and fetch from DB again
        vi.clearAllMocks();
        (db.query.organizations.findFirst as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ id: 'org-id' });
        (db.query.projects.findFirst as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ connectionUrl: 'new-connection-url' }); // Different URL

        const urlAfterClear = await getTenantConnectionUrl(subdomain);
        expect(urlAfterClear).toBe('new-connection-url'); // Should get the new URL from DB
        expect(db.query.organizations.findFirst).toHaveBeenCalledTimes(1); // DB should be queried again
    });

    it('should clear all tenant connection caches', async () => {
        const subdomain1 = 'tenant-1';
        const subdomain2 = 'tenant-2';
        const mockConnectionUrl1 = 'cached-url-1';
        const mockConnectionUrl2 = 'cached-url-2';

        // Populate cache for two subdomains
        (db.query.organizations.findFirst as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ id: 'org-id-1' });
        (db.query.projects.findFirst as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ connectionUrl: mockConnectionUrl1 });
        await getTenantConnectionUrl(subdomain1);
        vi.clearAllMocks();
        (db.query.organizations.findFirst as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ id: 'org-id-2' });
        (db.query.projects.findFirst as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ connectionUrl: mockConnectionUrl2 });
        await getTenantConnectionUrl(subdomain2);


        // Clear all caches
        clearAllTenantConnectionCaches();

        // Next calls should be cache misses
        vi.clearAllMocks();
        (db.query.organizations.findFirst as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ id: 'org-id-1' });
        (db.query.projects.findFirst as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ connectionUrl: 'new-url-1' });
        await getTenantConnectionUrl(subdomain1);
        vi.clearAllMocks();
        (db.query.organizations.findFirst as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ id: 'org-id-2' });
        (db.query.projects.findFirst as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ connectionUrl: 'new-url-2' });
        await getTenantConnectionUrl(subdomain2);


        expect(db.query.organizations.findFirst).toHaveBeenCalledTimes(2); // DB should be queried again for both
    });
}); 