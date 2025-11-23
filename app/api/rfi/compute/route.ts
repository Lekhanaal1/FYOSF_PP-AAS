import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import {
  parsePolicyData,
  buildPolicyMaster,
  computeRFI,
  computeRFITimeseries,
  PolicyRow,
  PolicyMaster
} from '@/lib/rfi/compute';

/**
 * POST /api/rfi/compute
 * 
 * Computes RFI (Regulatory Fragmentation Index) from PolicyData files
 * 
 * Request body:
 * {
 *   "policyDataIds": ["id1", "id2", ...],  // Optional: specific PolicyData file IDs
 *   "year": 2024  // Optional: specific year, otherwise uses latest
 * }
 * 
 * Response:
 * {
 *   "rfi": { year, RFI, H, H_max, SAS, adoptionMatrix, p_j },
 *   "timeseries": [{ year, RFI, H, H_max }, ...],
 *   "policyMaster": [{ state, year, element, adopted }, ...],
 *   "stats": { totalStates, totalElements, totalPolicies }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { policyDataIds, year } = body;

    // Fetch PolicyData files
    const whereClause: any = {
      uploadedById: session.user.id
    };

    if (policyDataIds && Array.isArray(policyDataIds) && policyDataIds.length > 0) {
      whereClause.id = { in: policyDataIds };
    }

    const policyDataFiles = await prisma.policyData.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (policyDataFiles.length === 0) {
      return NextResponse.json(
        { error: 'No policy data files found' },
        { status: 400 }
      );
    }

    // Parse all policy data into PolicyRow format
    const allRows: PolicyRow[] = [];
    for (const file of policyDataFiles) {
      const rows = parsePolicyData(file.rawData, file.fileName);
      allRows.push(...rows);
    }

    if (allRows.length === 0) {
      return NextResponse.json(
        { error: 'No valid policy data found in files' },
        { status: 400 }
      );
    }

    // Build policy master table
    const policyMaster = buildPolicyMaster(allRows);

    if (policyMaster.length === 0) {
      return NextResponse.json(
        { error: 'Could not build policy master table from data' },
        { status: 400 }
      );
    }

    // Compute RFI
    const rfi = computeRFI(policyMaster, year);

    // Compute timeseries
    const timeseries = computeRFITimeseries(policyMaster);

    // Compute statistics
    const states = new Set(policyMaster.map(p => p.state));
    const elements = new Set(policyMaster.map(p => p.element));

    const stats = {
      totalStates: states.size,
      totalElements: elements.size,
      totalPolicies: policyMaster.length,
      dataSources: policyDataFiles.map(f => f.id)
    };

    return NextResponse.json({
      rfi,
      timeseries,
      policyMaster: policyMaster.slice(0, 1000), // Limit to first 1000 rows for response
      stats
    });
  } catch (error: any) {
    console.error('Error computing RFI:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

