/**
 * Assessment Materials Upload API
 * 
 * POST /api/teacher/assessments/upload
 * Uploads learning materials (PDFs, DOCs, PPTs, etc.) for assessment generation.
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminStorage } from '@/lib/firebaseAdmin';
import { v4 as uuidv4 } from 'uuid';
import { UploadedMaterial } from '@/types/assessment';

// Supported file types for assessment materials
const ALLOWED_TYPES: Record<string, string[]> = {
    pdf: ['application/pdf'],
    doc: [
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    ppt: [
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ],
    txt: ['text/plain'],
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

function getMaterialType(mimeType: string): 'pdf' | 'doc' | 'ppt' | 'txt' | 'other' | null {
    for (const [type, mimes] of Object.entries(ALLOWED_TYPES)) {
        if (mimes.includes(mimeType)) {
            return type as 'pdf' | 'doc' | 'ppt' | 'txt';
        }
    }
    return null;
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const teacherId = formData.get('teacherId') as string | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (!teacherId) {
            return NextResponse.json({ error: 'Teacher ID required' }, { status: 400 });
        }

        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
                { status: 400 }
            );
        }

        // Check file type
        const materialType = getMaterialType(file.type);
        if (!materialType) {
            return NextResponse.json(
                {
                    error: 'Unsupported file type. Please upload PDF, DOC, DOCX, PPT, PPTX, or TXT files.',
                    supportedTypes: ['PDF', 'DOC', 'DOCX', 'PPT', 'PPTX', 'TXT']
                },
                { status: 400 }
            );
        }

        // Generate unique filename
        const fileId = uuidv4();
        const extension = file.name.split('.').pop() || '';
        const filename = `assessments/${teacherId}/${fileId}.${extension}`;

        // Upload to Firebase Storage
        const bucket = adminStorage.bucket();
        const fileRef = bucket.file(filename);

        const buffer = Buffer.from(await file.arrayBuffer());
        await fileRef.save(buffer, {
            metadata: {
                contentType: file.type,
                metadata: {
                    uploadedBy: teacherId,
                    originalName: file.name,
                    purpose: 'assessment-material',
                },
            },
        });

        // Make file publicly accessible
        await fileRef.makePublic();

        // Get public URL
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

        const material: UploadedMaterial = {
            id: fileId,
            name: file.name,
            url: publicUrl,
            type: materialType,
            mimeType: file.type,
            size: file.size,
            uploadedAt: new Date(),
        };

        return NextResponse.json({
            success: true,
            material,
        });

    } catch (error) {
        console.error('Assessment material upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
