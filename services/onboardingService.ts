import { supabase } from './supabaseClient';
import type { Hairstylist, HairstylistAvailability, Service } from '../types';

interface PersistOnboardingParams {
  userId: string;
  services: Array<
    Pick<Service, 'name' | 'description' | 'duration' | 'price' | 'parentId' | 'serviceGroupId'>
  >;
  hairstylists: Array<
    Pick<
      Hairstylist,
      'name' | 'type' | 'email' | 'phone' | 'photoUrl' | 'hireDate' | 'isActive'
    > & {
      availability: HairstylistAvailability[];
    }
  >;
}

interface PersistOnboardingResult {
  serviceIds: string[];
  hairstylistIds: string[];
}

export const persistOnboardingData = async (
  params: PersistOnboardingParams
): Promise<PersistOnboardingResult> => {
  const { userId, services, hairstylists } = params;
  if (!userId) {
    throw new Error('persistOnboardingData requires a valid userId.');
  }

  const insertedServiceIds: string[] = [];
  const insertedHairstylistIds: string[] = [];

  try {
    if (services.length > 0) {
      const { data, error } = await supabase
        .from('services')
        .insert(
          services.map(service => ({
            user_id: userId,
            name: service.name,
            description: service.description ?? null,
            duration: service.duration,
            price: service.price,
            parent_id: service.parentId ?? null,
            service_group_id: service.serviceGroupId ?? null,
          }))
        )
        .select('id');

      if (error) throw error;
      if (data) {
        insertedServiceIds.push(...data.map(entry => entry.id));
      }
    }

    if (hairstylists.length > 0) {
      const { data, error } = await supabase
        .from('hairstylists')
        .insert(
          hairstylists.map(stylist => ({
            user_id: userId,
            name: stylist.name,
            type: stylist.type,
            email: stylist.email ?? null,
            phone: stylist.phone ?? null,
            photo_url: stylist.photoUrl ?? null,
            hire_date: stylist.hireDate ?? null,
            is_active: stylist.isActive ?? true,
          }))
        )
        .select('id');

      if (error) throw error;
      if (data) {
        insertedHairstylistIds.push(...data.map(entry => entry.id));

        const availabilityPayload = data.flatMap((row, index) => {
          const availability = hairstylists[index]?.availability ?? [];
          return availability.map(slot => ({
            hairstylist_id: row.id,
            day_of_week: slot.dayOfWeek,
            start_time: slot.startTime,
            end_time: slot.endTime,
            is_available: slot.isAvailable,
          }));
        });

        if (availabilityPayload.length > 0) {
          const { error: availabilityError } = await supabase
            .from('hairstylist_availability')
            .insert(availabilityPayload);

          if (availabilityError) throw availabilityError;
        }
      }
    }

    return { serviceIds: insertedServiceIds, hairstylistIds: insertedHairstylistIds };
  } catch (error) {
    if (insertedServiceIds.length > 0) {
      await supabase.from('services').delete().in('id', insertedServiceIds);
    }

    if (insertedHairstylistIds.length > 0) {
      await supabase.from('hairstylists').delete().in('id', insertedHairstylistIds);
      await supabase
        .from('hairstylist_availability')
        .delete()
        .in('hairstylist_id', insertedHairstylistIds);
    }

    throw error;
  }
};
