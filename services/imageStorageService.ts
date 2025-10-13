import { supabase } from './supabaseClient';

export interface UploadResult {
  url: string;
  error: string | null;
}

/**
 * Upload an image to Supabase storage
 * @param file - The image file to upload
 * @param folder - The folder to upload to (e.g., 'appointment-photos')
 * @param fileName - Optional file name (will generate a unique one if not provided)
 * @returns Promise with upload result containing URL or error
 */
export const uploadImage = async (
  file: File,
  folder: string = 'appointment-photos',
  fileName?: string
): Promise<UploadResult> => {
  try {
    // Generate a unique file name if not provided
    const finalFileName =
      fileName ||
      `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${file.name.split('.').pop()}`;

    // Create the full path
    const filePath = `${folder}/${finalFileName}`;

    // Upload the file
    const { data, error } = await supabase.storage
      .from('appointment-photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Error uploading image:', error);
      return {
        url: '',
        error: error.message,
      };
    }

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('appointment-photos').getPublicUrl(filePath);

    return {
      url: publicUrl,
      error: null,
    };
  } catch (error) {
    console.error('Unexpected error uploading image:', error);
    return {
      url: '',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

/**
 * Delete an image from Supabase storage
 * @param url - The public URL of the image to delete
 * @returns Promise with success status or error
 */
export const deleteImage = async (
  url: string
): Promise<{ success: boolean; error: string | null }> => {
  try {
    // Extract the file path from the URL
    // Supabase URLs are typically: https://<project-ref>.supabase.co/storage/v1/object/public/<bucket>/<path>
    const urlParts = url.split('/storage/v1/object/public/');
    if (urlParts.length < 2) {
      return {
        success: false,
        error: 'Invalid URL format',
      };
    }

    const pathParts = urlParts[1].split('/');
    if (pathParts.length < 2) {
      return {
        success: false,
        error: 'Invalid URL path',
      };
    }

    // Remove the bucket name from the path
    const filePath = pathParts.slice(1).join('/');

    // Delete the file
    const { error } = await supabase.storage.from('appointment-photos').remove([filePath]);

    if (error) {
      console.error('Error deleting image:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error('Unexpected error deleting image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

/**
 * Create the appointment-photos bucket if it doesn't exist
 * @returns Promise with success status or error
 */
export const createAppointmentPhotosBucket = async (): Promise<{
  success: boolean;
  error: string | null;
}> => {
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('Error listing buckets:', listError);
      return {
        success: false,
        error: listError.message,
      };
    }

    // Check if our bucket already exists
    const bucketExists = buckets?.some(bucket => bucket.name === 'appointment-photos');

    if (bucketExists) {
      return {
        success: true,
        error: null,
      };
    }

    // Create the bucket
    const { error: createError } = await supabase.storage.createBucket('appointment-photos', {
      public: true,
      fileSizeLimit: 5242880, // 5MB limit
      allowedMimeTypes: ['image/*'],
    });

    if (createError) {
      console.error('Error creating bucket:', createError);
      return {
        success: false,
        error: createError.message,
      };
    }

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error('Unexpected error creating bucket:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};
