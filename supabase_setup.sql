-- 1. Create Profiles Table
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id_text TEXT UNIQUE NOT NULL,
    pin_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Finance Data Tables
CREATE TABLE incomes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    category TEXT NOT NULL,
    date DATE NOT NULL,
    frequency TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE spendings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    category TEXT NOT NULL,
    date DATE NOT NULL,
    kind TEXT NOT NULL,
    linked_obligation_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE obligations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    total_months INTEGER,
    paid_months INTEGER,
    balance NUMERIC NOT NULL,
    interest_rate NUMERIC,
    status TEXT NOT NULL,
    start_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE spendings ENABLE ROW LEVEL SECURITY;
ALTER TABLE obligations ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies (Simplified for ID-based access)
-- Note: In a production app, use Supabase Auth for real security.
-- Here we trust the user_id matching for simplicity of the "User ID + PIN" requirement.

CREATE POLICY "Allow access by profile_id" ON incomes
    FOR ALL USING (true); -- We will filter by profile_id in the code for now

CREATE POLICY "Allow access by profile_id" ON spendings
    FOR ALL USING (true);

CREATE POLICY "Allow access by profile_id" ON obligations
    FOR ALL USING (true);

CREATE POLICY "Allow anyone to create/read profiles" ON profiles
    FOR ALL USING (true);
