CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    medical_license VARCHAR(100) UNIQUE NOT NULL,
    specialty_ids UUID[] DEFAULT '{}',
    qualifications TEXT[] DEFAULT '{}',
    experience_years INTEGER NOT NULL DEFAULT 0,
    languages TEXT[] DEFAULT ARRAY['English'],
    consultation_fee DECIMAL(10,
    2) NOT NULL,
    bio TEXT,
    profile_image_url TEXT,
    is_accepting_patients BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('Asia/Singapore',
    NOW()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('Asia/Singapore',
    NOW())
);