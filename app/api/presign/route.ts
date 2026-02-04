import { NextResponse } from 'next/server';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const runtime = 'nodejs';

const bucket = process.env.AWS_S3_BUCKET;
const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION;

export async function POST(request: Request) {
    try {
        if (!bucket || !region) {
            return NextResponse.json(
                { error: 'Missing AWS_S3_BUCKET or AWS_REGION' },
                { status: 500 }
            );
        }

        const { key, contentType } = await request.json();
        if (!key || !contentType) {
            return NextResponse.json(
                { error: 'Missing key or contentType' },
                { status: 400 }
            );
        }

        const client = new S3Client({ region });
        const command = new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            ContentType: contentType,
        });

        const url = await getSignedUrl(client, command, { expiresIn: 60 });
        return NextResponse.json({ url, key });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create presigned URL';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
