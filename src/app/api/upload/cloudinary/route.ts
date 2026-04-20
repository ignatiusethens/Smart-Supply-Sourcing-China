import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary/upload';
import { ApiResponse } from '@/types/api';
import { CloudinaryUploadResult } from '@/lib/cloudinary/upload';
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from '@/lib/utils/constants';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const folder = (formData.get('folder') as string) || 'smart-supply-sourcing';

    if (!files || files.length === 0) {
      const response: ApiResponse = {
        success: false,
        error: 'No files provided',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Validate files
    for (const file of files) {
      // Check file type
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        const response: ApiResponse = {
          success: false,
          error: `Invalid file type: ${file.type}. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`,
        };
        return NextResponse.json(response, { status: 400 });
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        const response: ApiResponse = {
          success: false,
          error: `File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    // Upload files to Cloudinary
    const uploadPromises = files.map(file => 
      uploadToCloudinary(file, folder)
    );

    const uploadResults = await Promise.all(uploadPromises);

    const response: ApiResponse<{ uploads: CloudinaryUploadResult[] }> = {
      success: true,
      data: {
        uploads: uploadResults,
      },
      message: `${uploadResults.length} file(s) uploaded successfully`,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error uploading files:', error);

    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload files',
    };

    return NextResponse.json(response, { status: 500 });
  }
}