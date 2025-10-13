import { supabase } from './supabaseClient';
import type { ClientPhotoPair } from '../types';

export interface ClientPhotoPairRecord {
  id: string;
  client_id: string;
  before_photo_url?: string;
  after_photo_url?: string;
  created_at: string;
  appointment_id?: string;
  user_id: string;
}

/**
 * Get all photo pairs for a client
 */
export const getClientPhotoPairs = async (
  clientId: string,
  userId: string
): Promise<ClientPhotoPair[]> => {
  try {
    const { data, error } = await supabase
      .from('client_photo_pairs')
      .select('*')
      .eq('client_id', clientId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching client photo pairs:', error);
      return [];
    }

    // Convert database format to application format
    return data.map((record: ClientPhotoPairRecord) => ({
      id: record.id,
      beforePhotoUrl: record.before_photo_url,
      afterPhotoUrl: record.after_photo_url,
      createdAt: record.created_at,
      appointmentId: record.appointment_id,
    }));
  } catch (error) {
    console.error('Error in getClientPhotoPairs:', error);
    return [];
  }
};

/**
 * Add a new photo pair for a client
 */
export const addClientPhotoPair = async (
  clientId: string,
  userId: string,
  beforePhotoUrl?: string,
  afterPhotoUrl?: string,
  appointmentId?: string
): Promise<ClientPhotoPair | null> => {
  try {
    const { data, error } = await supabase
      .from('client_photo_pairs')
      .insert({
        client_id: clientId,
        user_id: userId,
        before_photo_url: beforePhotoUrl,
        after_photo_url: afterPhotoUrl,
        appointment_id: appointmentId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding client photo pair:', error);
      return null;
    }

    // Convert database format to application format
    return {
      id: data.id,
      beforePhotoUrl: data.before_photo_url,
      afterPhotoUrl: data.after_photo_url,
      createdAt: data.created_at,
      appointmentId: data.appointment_id,
    };
  } catch (error) {
    console.error('Error in addClientPhotoPair:', error);
    return null;
  }
};

/**
 * Delete a photo pair
 */
export const deleteClientPhotoPair = async (
  photoPairId: string,
  userId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('client_photo_pairs')
      .delete()
      .eq('id', photoPairId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting client photo pair:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteClientPhotoPair:', error);
    return false;
  }
};
