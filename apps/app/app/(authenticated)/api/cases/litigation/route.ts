import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getLitigationCasesKPI } from '@/app/actions/cases/cases-actions';

export async function GET(request: NextRequest) {
  try {
    const result = await getLitigationCasesKPI(request);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching litigation cases:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Failed to fetch litigation cases count' 
      }, 
      { status: 500 }
    );
  }
} 