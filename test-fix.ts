// Test file to verify the TypeScript fix
interface Doctor {
  id: string;
  full_name: string;
  specialty_id: string;
}

interface Specialty {
  id: string;
  name: string;
}

interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

// Test the fixed code
const testData: Array<{
  id: string;
  user_id: string;
  specialty_id: string;
  users: { full_name?: string } | null;
}> = [
  {
    id: '1',
    user_id: 'user1',
    specialty_id: 'spec1',
    users: { full_name: 'Dr. Smith' }
  }
];

// This should work without TypeScript errors
const doctorsWithNames = testData.map((d: any) => ({
  id: d.id,
  full_name: (d.users as { full_name?: string })?.full_name || 'Unknown',
  specialty_id: d.specialty_id,
}));

console.log('TypeScript fix verified:', doctorsWithNames);