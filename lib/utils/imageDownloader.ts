/**
 * Image Downloader Utility
 * 
 * Fetches an image from a URL and stores it in Firebase Storage
 * to ensure persistence and consistent serving.
 */

import { adminStorage } from "@/lib/firebaseAdmin";
import axios from "axios";

const STORAGE_FOLDER = "textbook-images/agentic";

/**
 * Download an image from a URL and upload to Firebase Storage
 * @returns The public URL of the stored image
 */
export async function downloadAndStoreImage(
    url: string,
    imageId: string,
    metadata: {
        grade: string;
        subject: string;
        strand: string;
    }
): Promise<string> {
    try {
        console.log(`[ImageDownloader] Downloading: ${url}`);

        // 1. Fetch the image
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data, 'binary');
        const contentType = response.headers['content-type'] || 'image/png';

        // 2. Prepare Storage Path
        const sanitizedSubject = metadata.subject.replace(/[^a-zA-Z0-9]/g, "_");
        const fileName = `${imageId}.png`;
        const storagePath = `${STORAGE_FOLDER}/${metadata.grade}/${sanitizedSubject}/${fileName}`;

        // 3. Get Bucket
        const bucketName = process.env.FIREBASE_STORAGE_BUCKET ||
            process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
            `${process.env.FIREBASE_PROJECT_ID}.appspot.com`;
        const bucket = adminStorage.bucket(bucketName);
        const file = bucket.file(storagePath);

        // 4. Upload
        console.log(`[ImageDownloader] Uploading to Storage: ${storagePath}`);
        await file.save(buffer, {
            metadata: {
                contentType,
                metadata: {
                    originalUrl: url,
                    imageId,
                    ...metadata,
                    downloadedAt: new Date().toISOString()
                }
            }
        });

        // 5. Build Public URL
        await file.makePublic();
        return `https://storage.googleapis.com/${bucketName}/${storagePath}`;

    } catch (error: any) {
        console.error(`[ImageDownloader] Failed for ${url}:`, error.message);
        // Fallback to original URL if download fails (better than no image at all)
        return url;
    }
}
