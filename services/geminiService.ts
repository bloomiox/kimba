import { supabase } from './supabaseClient';
import { UserImage } from '../types';

/**
 * Invokes a Supabase Edge Function to securely generate a hairstyle.
 * The Gemini API key is handled server-side in the function.
 */
export const generateHairstyle = async (
  base64Image: string,
  mimeType: string,
  prompt: string,
  referenceImage?: UserImage
): Promise<string | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-hairstyle', {
      body: {
        base64Image,
        mimeType,
        prompt,
        referenceImage,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data.error) {
      // Handle application-specific errors returned from the function
      throw new Error(data.error);
    }

    // The function is expected to return the base64 string of the generated image
    return data.base64Image || null;
  } catch (error) {
    console.error('Error invoking Supabase function:', error);
    if (error instanceof Error) {
      if (error.message.includes('429') || error.message.toLowerCase().includes('rate limit')) {
        throw new Error('API rate limit exceeded. Please wait a moment before trying again.');
      }
      throw error;
    }
    throw new Error('Failed to communicate with the AI model via the secure function.');
  }
};
