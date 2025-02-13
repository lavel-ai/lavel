import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getWeeklyTimeEntriesKPI } from '@/app/actions/time-entries/time-entries-actions';
import { auth } from '@repo/auth/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await getWeeklyTimeEntriesKPI(request, userId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching weekly time entries:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Failed to fetch weekly time entries' 
      }, 
      { status: 500 }
    );
  }
} 