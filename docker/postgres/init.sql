-- Academia Pro Database Initialization
-- This script sets up the initial database structure and configurations

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- Create custom types
CREATE TYPE user_role AS ENUM ('super-admin', 'school-admin', 'teacher', 'student', 'parent');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'pending');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'excused');
CREATE TYPE fee_status AS ENUM ('paid', 'pending', 'overdue', 'waived');
CREATE TYPE notification_type AS ENUM ('email', 'sms', 'push', 'in-app');
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE exam_type AS ENUM ('unit-test', 'term-exam', 'final-exam', 'entrance-exam', 'practical');
CREATE TYPE transport_mode AS ENUM ('bus', 'van', 'car', 'walking', 'other');
CREATE TYPE hostel_room_type AS ENUM ('single', 'double', 'triple', 'dormitory');
CREATE TYPE asset_status AS ENUM ('active', 'maintenance', 'retired', 'lost');
CREATE TYPE book_status AS ENUM ('available', 'borrowed', 'reserved', 'lost', 'damaged');
CREATE TYPE payment_method AS ENUM ('cash', 'card', 'bank-transfer', 'mobile-money', 'cheque');

-- Create indexes for better performance
-- These will be created after tables are set up in the application

-- Set up default configurations
ALTER DATABASE academia_pro SET timezone = 'UTC';
ALTER DATABASE academia_pro SET default_text_search_config = 'english';

-- Create audit function for tracking changes
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function for generating slugs
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN LOWER(REPLACE(REPLACE(REPLACE(input_text, ' ', '-'), '[^a-zA-Z0-9\-]', ''), '--', '-'));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create function for calculating age
CREATE OR REPLACE FUNCTION calculate_age(birth_date DATE)
RETURNS INTEGER AS $$
BEGIN
    RETURN EXTRACT(YEAR FROM AGE(birth_date));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create function for generating student ID
CREATE OR REPLACE FUNCTION generate_student_id(school_prefix TEXT DEFAULT 'STD')
RETURNS TEXT AS $$
DECLARE
    next_id INTEGER;
    student_id TEXT;
BEGIN
    -- Get next sequence number
    SELECT COALESCE(MAX(CAST(SUBSTRING(student_id_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
    INTO next_id
    FROM students
    WHERE student_id_number LIKE school_prefix || '%';

    -- Generate student ID with padding
    student_id := school_prefix || LPAD(next_id::TEXT, 6, '0');

    RETURN student_id;
END;
$$ LANGUAGE plpgsql;

-- Create function for attendance percentage calculation
CREATE OR REPLACE FUNCTION calculate_attendance_percentage(
    student_id UUID,
    start_date DATE DEFAULT NULL,
    end_date DATE DEFAULT NULL
)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    total_days INTEGER;
    present_days INTEGER;
    attendance_percentage DECIMAL(5,2);
BEGIN
    -- Set default date range if not provided
    start_date := COALESCE(start_date, CURRENT_DATE - INTERVAL '30 days');
    end_date := COALESCE(end_date, CURRENT_DATE);

    -- Calculate total working days
    SELECT COUNT(*)
    INTO total_days
    FROM attendance_records
    WHERE student_id = student_id
    AND attendance_date BETWEEN start_date AND end_date;

    -- Calculate present days
    SELECT COUNT(*)
    INTO present_days
    FROM attendance_records
    WHERE student_id = student_id
    AND status IN ('present', 'late')
    AND attendance_date BETWEEN start_date AND end_date;

    -- Calculate percentage
    IF total_days > 0 THEN
        attendance_percentage := ROUND((present_days::DECIMAL / total_days::DECIMAL) * 100, 2);
    ELSE
        attendance_percentage := 0.00;
    END IF;

    RETURN attendance_percentage;
END;
$$ LANGUAGE plpgsql;

-- Create function for GPA calculation
CREATE OR REPLACE FUNCTION calculate_gpa(student_id UUID, academic_year TEXT DEFAULT NULL)
RETURNS DECIMAL(3,2) AS $$
DECLARE
    total_credits INTEGER := 0;
    weighted_sum DECIMAL(10,2) := 0.00;
    gpa DECIMAL(3,2);
BEGIN
    -- Calculate GPA based on grades and credits
    SELECT
        COALESCE(SUM(grade_points * credits), 0),
        COALESCE(SUM(credits), 0)
    INTO weighted_sum, total_credits
    FROM student_grades sg
    JOIN subjects s ON sg.subject_id = s.id
    WHERE sg.student_id = student_id
    AND (academic_year IS NULL OR sg.academic_year = academic_year);

    -- Calculate GPA
    IF total_credits > 0 THEN
        gpa := ROUND(weighted_sum / total_credits, 2);
    ELSE
        gpa := 0.00;
    END IF;

    RETURN gpa;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better query performance
-- Note: These will be created after tables are set up by the application

-- Set up row level security (RLS) policies
-- These will be configured by the application

-- Create default admin user (for development)
-- Password: admin123 (hashed)
INSERT INTO users (
    id,
    email,
    password_hash,
    first_name,
    last_name,
    role,
    status,
    is_email_verified,
    created_at,
    updated_at
) VALUES (
    uuid_generate_v4(),
    'admin@academia-pro.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6fM9q7Y7K6', -- admin123
    'System',
    'Administrator',
    'super-admin',
    'active',
    true,
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- Create default school (for development)
INSERT INTO schools (
    id,
    name,
    code,
    address,
    phone,
    email,
    website,
    status,
    created_at,
    updated_at
) VALUES (
    uuid_generate_v4(),
    'Academia Pro Demo School',
    'APDS',
    '123 Education Street, Academic City, AC 12345',
    '+1-555-0123',
    'info@academiapro.com',
    'https://academiapro.com',
    'active',
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- Log initialization completion
DO $$
BEGIN
    RAISE NOTICE 'Academia Pro database initialized successfully at %', NOW();
END $$;