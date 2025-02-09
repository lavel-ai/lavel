import { getTenantConnectionUrl, clearTenantConnectionCache, clearAllTenantConnectionCaches } from '../queries/tenant-lookup';
import { db } from '../../main-app/db'; // Still mock the db client itself
import { vi, describe, afterEach, it, expect, beforeAll } from 'vitest';

// Mock the keys module
vi.mock('../../keys', () => {
    return {
        keys: vi.fn(() => ({ // Mock the keys function
            DATABASE_URL: 'test_db_url', // Provide dummy values
            NEON_API_KEY: 'test_neon_api_key',
        })),
    };
});


// Mock the database client (as before)
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
        vi.clearAllMocks();
        clearAllTenantConnectionCaches();
    });

    // ... your test cases ...
    it('should return connection URL from cache on second call', async () => { /* ... */ });
    it('should return connection URL if found in database and cache it', async () => { /* ... */ });
    it('should return null if organization is not found', async () => { /* ... */ });
    it('should return null if project is not found', async () => { /* ... */ });
    it('should return null and log error if database query fails', async () => { /* ... */ });
    it('should clear cache for a specific subdomain', async () => { /* ... */ });
    it('should clear all tenant connection caches', async () => { /* ... */ });
});

describe('getTenantConnectionUrl Integration Tests', () => {
    const testSlug = 'mg';

    // Clear cache before tests
    beforeAll(() => {
        clearTenantConnectionCache(testSlug);
    });

    it('should find connection URL for existing tenant "mg"', async () => {
        const connectionUrl = await getTenantConnectionUrl(testSlug);
        
        // We expect a non-null result since 'mg' exists
        expect(connectionUrl).not.toBeNull();
        
        // Log the URL (for debugging, remove in production)
        console.log('Found connection URL:', connectionUrl);
        
        // Basic URL validation
        expect(typeof connectionUrl).toBe('string');
        expect(connectionUrl).toContain('postgres://');
    });

    it('should use cache on second call', async () => {
        // First call
        const firstCall = await getTenantConnectionUrl(testSlug);
        
        // Second call should be from cache
        const secondCall = await getTenantConnectionUrl(testSlug);
        
        // Both calls should return the same URL
        expect(secondCall).toBe(firstCall);
    });

    it('should return null for non-existent tenant', async () => {
        const nonExistentSlug = 'non-existent-tenant';
        const connectionUrl = await getTenantConnectionUrl(nonExistentSlug);
        
        expect(connectionUrl).toBeNull();
    });
}); 