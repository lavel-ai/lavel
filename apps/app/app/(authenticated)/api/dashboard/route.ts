// apps/app/app/api/dashboard/advisory-cases-count/route.ts
import { getAdvisoryCasesKPI } from '../../../actions/cases/cases-actions';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const response = await getAdvisoryCasesKPI(request);
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch advisory cases count' },
      { status: 500 }
    );
  }
}