import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { sanitizeError, safeLogError, validateRequestSize } from '@/lib/security/errorHandler';

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

    // Don't return author email
    const { author, ...reportData } = report;
    return NextResponse.json({
      ...reportData,
      author: {
        name: author?.name,
        // Exclude email
      },
    });
  } catch (error) {
    safeLogError('Fetch Report', error);
    const sanitized = sanitizeError(error);
    return NextResponse.json(
      { error: sanitized.message },
      { status: sanitized.statusCode }
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

    // Validate request size
    const bodyText = await request.text();
    try {
      validateRequestSize(bodyText, 5 * 1024 * 1024); // 5MB max
    } catch (sizeError) {
      return NextResponse.json(
        { error: 'Request body too large' },
        { status: 413 }
      );
    }

    const body = JSON.parse(bodyText);
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
      select: {
        id: true,
        title: true,
        executiveSummary: true,
        background: true,
        evidence: true,
        problemStatement: true,
        ageTokens: true,
        dutyOfCare: true,
        stateModules: true,
        privacyImplementation: true,
        antiFalseSecurity: true,
        equityArchitecture: true,
        securityModel: true,
        governance: true,
        kpis: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        // Don't return author email
      },
    });

    return NextResponse.json(updatedReport);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data. Please check all required fields.' },
        { status: 400 }
      );
    }

    safeLogError('Update Report', error);
    const sanitized = sanitizeError(error);
    return NextResponse.json(
      { error: sanitized.message },
      { status: sanitized.statusCode }
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
    safeLogError('Delete Report', error);
    const sanitized = sanitizeError(error);
    return NextResponse.json(
      { error: sanitized.message },
      { status: sanitized.statusCode }
    );
  }
}

