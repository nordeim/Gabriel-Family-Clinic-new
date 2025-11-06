// Authentication Utilities
// Gabriel Family Clinic Healthcare Platform

import { createClient } from './client';

export interface AuthUser {
  id: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin' | 'staff';
  full_name: string;
  phone: string;
}

/**
 * Get the current authenticated user
 * @returns The current user or null if not authenticated
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      console.error('Error getting user:', error);
      return null;
    }

    // Fetch user details from users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (userError || !userData) {
      console.error('Error fetching user data:', userError);
      return null;
    }

    return {
      id: userData.id,
      email: userData.email,
      role: userData.role,
      full_name: userData.full_name,
      phone: userData.phone,
    };
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return null;
  }
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Sign in error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Sign up new user
 */
export async function signUp(email: string, password: string, userData: {
  full_name: string;
  phone: string;
  role?: 'patient' | 'doctor' | 'admin' | 'staff';
}) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      throw error;
    }

    // Create user record in users table
    if (data.user) {
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email,
          full_name: userData.full_name,
          phone: userData.phone,
          role: userData.role || 'patient',
        });

      if (insertError) {
        console.error('Error creating user record:', insertError);
      }
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Sign up error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Sign out current user
 */
export async function signOut() {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }

    return { error: null };
  } catch (error: any) {
    console.error('Sign out error:', error);
    return { error: error.message };
  }
}

/**
 * Reset password
 */
export async function resetPassword(email: string) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Reset password error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Update user password
 */
export async function updatePassword(newPassword: string) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Update password error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Check if user has specific role
 */
export async function hasRole(requiredRole: string | string[]): Promise<boolean> {
  const user = await getCurrentUser();
  
  if (!user) return false;

  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(user.role);
  }

  return user.role === requiredRole;
}

/**
 * Get user's patient record
 */
export async function getPatientRecord(userId: string) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Get patient record error:', error);
    return { data: null, error: error.message };
  }
}

/**
 * Get user's doctor record
 */
export async function getDoctorRecord(userId: string) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Get doctor record error:', error);
    return { data: null, error: error.message };
  }
}
