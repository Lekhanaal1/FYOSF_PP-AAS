import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { reportSchema } from '@/lib/security/validation';
import { ContentFilter, BasicFilterStrategy } from '@/lib/patterns/strategy';
import { ReportFactory, ReportType } from '@/lib/patterns/factory';

// GET - List all reports
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reports = await prisma.report.findMany({
      where: {
        authorId: session.user.id,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new report
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const validated = reportSchema.parse(body);

    // Apply content filtering (Strategy Pattern)
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

    // Create report using Factory Pattern
    const report = ReportFactory.createReport(
      ReportType.FULL_REPORT,
      'temp-id',
      filteredData.title,
      '',
      {
        executiveSummary: filteredData.executiveSummary,
        background: filteredData.background,
        evidence: filteredData.evidence,
      }
    );

    // Save to database
    const savedReport = await prisma.report.create({
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
        authorId: session.user.id,
        status: 'DRAFT',
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

    return NextResponse.json(savedReport, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

