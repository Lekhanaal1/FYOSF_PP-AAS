import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { sanitizeError, safeLogError } from '@/lib/security/errorHandler';

/**
 * POST /api/reports/[id]/fragmentation
 * 
 * Save or update FragmentationAnalysis for a report
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reportId = params.id;
    const body = await request.json();

    // Verify report belongs to user
    const report = await prisma.report.findFirst({
      where: {
        id: reportId,
        authorId: session.user.id,
      },
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Upsert FragmentationAnalysis
    const fragmentation = await prisma.fragmentationAnalysis.upsert({
      where: { reportId },
      update: {
        fragmentationScore: body.fragmentationScore,
        countryCount: body.countryCount,
        stateCount: body.stateCount,
        policyCount: body.policyCount,
        dataSources: body.dataSources ? JSON.stringify(body.dataSources) : null,
        analysisData: body.analysisData,
      },
      create: {
        reportId,
        fragmentationScore: body.fragmentationScore,
        countryCount: body.countryCount,
        stateCount: body.stateCount,
        policyCount: body.policyCount,
        dataSources: body.dataSources ? JSON.stringify(body.dataSources) : null,
        analysisData: body.analysisData,
      },
    });

    return NextResponse.json(fragmentation, { status: 200 });
  } catch (error: any) {
    safeLogError('Save Fragmentation Analysis', error);
    const sanitized = sanitizeError(error);
    return NextResponse.json(
      { error: sanitized.message },
      { status: sanitized.statusCode }
    );
  }
}

