-- SQL Schema for CET Mentor Hub Cutoffs Database

-- Create Colleges Table
CREATE TABLE IF NOT EXISTS public.colleges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dtem_code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    type VARCHAR(50),      -- 'Government', 'Aided', 'Unaided'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Branches Table
CREATE TABLE IF NOT EXISTS public.branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
    course_code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Cutoffs Table
CREATE TABLE IF NOT EXISTS public.cutoffs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    academic_year VARCHAR(10) NOT NULL, -- e.g., '2024-25', '2025-26'
    cap_round SMALLINT NOT NULL,        -- 1, 2, or 3
    category VARCHAR(20) NOT NULL,      -- e.g., 'GOPENS', 'LOBCS', 'EWS', 'TFWS'
    percentile DECIMAL(10, 4) NOT NULL, -- e.g., 99.8512
    merit_no INTEGER,                   -- State Merit Number
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Indexes for fast querying (Prediction Feature)
CREATE INDEX idx_cutoffs_percentile ON public.cutoffs(percentile);
CREATE INDEX idx_cutoffs_category ON public.cutoffs(category);
CREATE INDEX idx_cutoffs_year_round ON public.cutoffs(academic_year, cap_round);

-- Enable RLS (Row Level Security) ensuring public read access
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cutoffs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to colleges" on public.colleges for SELECT using (true);
CREATE POLICY "Allow public read access to branches" on public.branches for SELECT using (true);
CREATE POLICY "Allow public read access to cutoffs" on public.cutoffs for SELECT using (true);
