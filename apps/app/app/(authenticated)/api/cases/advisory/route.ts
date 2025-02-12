import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAdvisoryCasesKPI } from '../../../../actions/cases/cases-actions';

export async function GET(request: NextRequest) {
  try {
    const result = await getAdvisoryCasesKPI(request);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching advisory cases:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Failed to fetch advisory cases count' 
      }, 
      { status: 500 }
    );
  }
} 