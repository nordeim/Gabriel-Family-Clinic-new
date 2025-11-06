// Client-side Supabase Client
// Gabriel Family Clinic Healthcare Platform
// For use in Client Components

'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Type-safe database helpers
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

// Create Supabase client for client components
// This uses the auth-helpers package which is SSR-compatible
export function createClient() {
  return createClientComponentClient();
}
