import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { sanitizeError, safeLogError } from '@/lib/security/errorHandler';

// GET - Get single policy data file
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const file = await prisma.policyData.findFirst({
      where: {
        id: params.id,
        uploadedById: session.user.id,
      },
    });

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Limit rawData size in response (prevent DoS)
    let rawData = null;
    if (file.rawData) {
      try {
        const parsed = JSON.parse(file.rawData);
        // Only return first 1000 rows to prevent large responses
        if (Array.isArray(parsed) && parsed.length > 1000) {
          rawData = parsed.slice(0, 1000);
        } else {
          rawData = parsed;
        }
      } catch {
        rawData = null;
      }
    }

    return NextResponse.json({
      id: file.id,
      fileName: file.fileName,
      fileType: file.fileType,
      country: file.country,
      state: file.state,
      category: file.category,
      rawData,
      createdAt: file.createdAt,
      // Don't return uploadedBy email
    });
  } catch (error) {
    safeLogError('Fetch File', error);
    const sanitized = sanitizeError(error);
    return NextResponse.json(
      { error: sanitized.message },
      { status: sanitized.statusCode }
    );
  }
}

// DELETE - Delete policy data file
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const file = await prisma.policyData.findFirst({
      where: {
        id: params.id,
        uploadedById: session.user.id,
      },
    });

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    await prisma.policyData.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'File deleted successfully' });
  } catch (error) {
    safeLogError('Delete File', error);
    const sanitized = sanitizeError(error);
    return NextResponse.json(
      { error: sanitized.message },
      { status: sanitized.statusCode }
    );
  }
}

