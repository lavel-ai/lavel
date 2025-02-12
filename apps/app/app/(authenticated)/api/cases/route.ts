// app/api/cases/route.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getCases } from '../../cases/actions';

/**
 * GET /api/cases
 *
 * This endpoint retrieves all cases for the current tenant.
 * It uses the full NextRequest so that getCases can extract the tenant's subdomain,
 * look up the connection URL, and query the correct database.
 */
export async function GET(request: NextRequest) {
  try {
    // Call the server action that retrieves all cases.
    // This function uses the tenantDb attached to the request by extracting the tenant info.
    const cases = await getCases(request);
    
    // Return the cases as JSON.
    return NextResponse.json(cases);
  } catch (error: any) {
    console.error('Error fetching cases:', error);
    
    // Respond with an error message and a 500 status code.
    return NextResponse.json({ error: 'Failed to fetch cases' }, { status: 500 });
  }
}
