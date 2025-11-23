import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { rateLimiter } from '@/lib/security/rateLimit';
import { validateFile, sanitizeFileData } from '@/lib/security/fileValidation';
import { sanitizeError, safeLogError, validateRequestSize } from '@/lib/security/errorHandler';

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

    // Don't return email addresses
    const sanitizedFiles = files.map(file => ({
      id: file.id,
      fileName: file.fileName,
      fileType: file.fileType,
      country: file.country,
      state: file.state,
      category: file.category,
      createdAt: file.createdAt,
      // Exclude rawData and uploadedBy email
    }));

    return NextResponse.json(sanitizedFiles);
  } catch (error) {
    safeLogError('Fetch Files', error);
    const sanitized = sanitizeError(error);
    return NextResponse.json(
      { error: sanitized.message },
      { status: sanitized.statusCode }
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

    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const limit = rateLimiter.checkLimit(`${ip}-${session.user.id}`);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Validate request size
    const bodyText = await request.text();
    try {
      validateRequestSize(bodyText, 10 * 1024 * 1024); // 10MB max
    } catch (sizeError) {
      return NextResponse.json(
        { error: 'Request body too large' },
        { status: 413 }
      );
    }

    const body = JSON.parse(bodyText);

    // Validate file
    if (!body.fileName || !body.rawData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Estimate file size from rawData
    const estimatedSize = Buffer.byteLength(JSON.stringify(body.rawData), 'utf8');
    const fileValidation = validateFile(body.fileName, estimatedSize);
    if (!fileValidation.valid) {
      return NextResponse.json(
        { error: fileValidation.error },
        { status: 400 }
      );
    }

    // Sanitize file data
    const sanitizedData = sanitizeFileData(body.rawData);

    const file = await prisma.policyData.create({
      data: {
        fileName: body.fileName,
        fileType: body.fileType,
        country: body.country || null,
        state: body.state || null,
        category: body.category || null,
        rawData: JSON.stringify(sanitizedData),
        metadata: body.metadata || null,
        uploadedById: session.user.id,
      },
      select: {
        id: true,
        fileName: true,
        fileType: true,
        country: true,
        state: true,
        category: true,
        createdAt: true,
        updatedAt: true,
        // Don't return rawData or uploadedBy email
      },
    });

    return NextResponse.json(file, { status: 201 });
  } catch (error) {
    safeLogError('File Upload', error);
    const sanitized = sanitizeError(error);
    return NextResponse.json(
      { error: sanitized.message },
      { status: sanitized.statusCode }
    );
  }
}

