import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

// GET - List all policy data files
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const files = await prisma.policyData.findMany({
      where: {
        uploadedById: session.user.id,
      },
      include: {
        uploadedBy: {
          select: {
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(files);
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Upload new policy data file
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const file = await prisma.policyData.create({
      data: {
        fileName: body.fileName,
        fileType: body.fileType,
        country: body.country || null,
        state: body.state || null,
        category: body.category || null,
        rawData: body.rawData,
        metadata: body.metadata || null,
        uploadedById: session.user.id,
      },
      include: {
        uploadedBy: {
          select: {
            email: true,
          },
        },
      },
    });

    return NextResponse.json(file, { status: 201 });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

