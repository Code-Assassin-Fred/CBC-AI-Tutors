import { NextRequest, NextResponse } from 'next/server';
import { adminStorage } from '@/lib/firebaseAdmin';
import { v4 as uuidv4 } from 'uuid';

// Supported file types
const ALLOWED_TYPES: Record<string, string[]> = {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    video: ['video/mp4', 'video/webm', 'video/quicktime'],
    document: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
    ],
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

function getAttachmentType(mimeType: string): 'image' | 'video' | 'document' | null {
    for (const [type, mimes] of Object.entries(ALLOWED_TYPES)) {
        if (mimes.includes(mimeType)) {
            return type as 'image' | 'video' | 'document';
        }
    }
    return null;
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const userId = formData.get('userId') as string | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
                { status: 400 }
            );
        }

        // Check file type
        const attachmentType = getAttachmentType(file.type);
        if (!attachmentType) {
            return NextResponse.json(
                { error: 'Unsupported file type' },
                { status: 400 }
            );
        }

        // Generate unique filename
        const fileId = uuidv4();
        const extension = file.name.split('.').pop() || '';
        const filename = `community/${userId}/${fileId}.${extension}`;

        // Upload to Firebase Storage
        const bucket = adminStorage.bucket();
        const fileRef = bucket.file(filename);

        const buffer = Buffer.from(await file.arrayBuffer());
        await fileRef.save(buffer, {
            metadata: {
                contentType: file.type,
                metadata: {
                    uploadedBy: userId,
                    originalName: file.name,
                },
            },
        });

        // Make file publicly accessible
        await fileRef.makePublic();

        // Get public URL
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

        return NextResponse.json({
            success: true,
            attachment: {
                id: fileId,
                type: attachmentType,
                url: publicUrl,
                name: file.name,
                mimeType: file.type,
                size: file.size,
            },
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
