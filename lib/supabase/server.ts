// Server-side Supabase Client
// Gabriel Family Clinic Healthcare Platform
// For use in Server Components

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Reuse the same database types
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone: string;
          role: 'patient' | 'doctor' | 'admin' | 'staff';
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      patients: {
        Row: {
          id: string;
          user_id: string;
          nric: string;
          date_of_birth: string;
          gender: 'M' | 'F' | 'Other';
          address: string;
          postal_code: string | null;
          chas_card_number: string | null;
          chas_card_type: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      doctors: {
        Row: {
          id: string;
          user_id: string;
          medical_license: string;
          specialty_ids: string[];
          consultation_fee: number;
          bio: string | null;
          profile_image_url: string | null;
          is_accepting_patients: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      appointments: {
        Row: {
          id: string;
          patient_id: string;
          doctor_id: string;
          clinic_id: string;
          appointment_date: string;
          appointment_time: string;
          duration: number;
          appointment_type: string;
          status: string;
          reason: string;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
};

// Create Supabase client for server components
export function createClient() {
  const cookieStore = cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}