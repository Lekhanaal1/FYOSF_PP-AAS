import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

// GET - Get single report
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const report = await prisma.report.findFirst({
      where: {
        id: params.id,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update report
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { reportSchema } = await import('@/lib/security/validation');
    const { ContentFilter, BasicFilterStrategy } = await import('@/lib/patterns/strategy');

    // Validate input
    const validated = reportSchema.parse(body);

    // Apply content filtering
    const filter = new ContentFilter(new BasicFilterStrategy());
    const filteredData = {
      title: filter.filterContent(validated.title),
      executiveSummary: filter.filterContent(validated.executiveSummary),
      background: filter.filterContent(validated.background),
      evidence: filter.filterContent(validated.evidence),
      problemStatement: validated.problemStatement ? filter.filterContent(validated.problemStatement) : '',
      ageTokens: validated.ageTokens ? filter.filterContent(validated.ageTokens) : '',
      dutyOfCare: validated.dutyOfCare ? filter.filterContent(validated.dutyOfCare) : '',
      stateModules: validated.stateModules ? filter.filterContent(validated.stateModules) : '',
      privacyImplementation: validated.privacyImplementation ? filter.filterContent(validated.privacyImplementation) : '',
      antiFalseSecurity: validated.antiFalseSecurity ? filter.filterContent(validated.antiFalseSecurity) : '',
      equityArchitecture: validated.equityArchitecture ? filter.filterContent(validated.equityArchitecture) : '',
      securityModel: validated.securityModel ? filter.filterContent(validated.securityModel) : '',
      governance: validated.governance ? filter.filterContent(validated.governance) : '',
      kpis: validated.kpis ? filter.filterContent(validated.kpis) : '',
    };

    // Check if report exists and belongs to user
    const existingReport = await prisma.report.findFirst({
      where: {
        id: params.id,
        authorId: session.user.id,
      },
    });

    if (!existingReport) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Update report
    const updatedReport = await prisma.report.update({
      where: { id: params.id },
      data: {
        title: filteredData.title,
        executiveSummary: filteredData.executiveSummary,
        background: filteredData.background,
        evidence: filteredData.evidence,
        problemStatement: filteredData.problemStatement,
        ageTokens: filteredData.ageTokens,
        dutyOfCare: filteredData.dutyOfCare,
        stateModules: filteredData.stateModules,
        privacyImplementation: filteredData.privacyImplementation,
        antiFalseSecurity: filteredData.antiFalseSecurity,
        equityArchitecture: filteredData.equityArchitecture,
        securityModel: filteredData.securityModel,
        governance: filteredData.governance,
        kpis: filteredData.kpis,
      },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(updatedReport);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete report
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if report exists and belongs to user
    const existingReport = await prisma.report.findFirst({
      where: {
        id: params.id,
        authorId: session.user.id,
      },
    });

    if (!existingReport) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Delete report
    await prisma.report.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Error deleting report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

