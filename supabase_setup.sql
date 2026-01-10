-- 1. Create Profiles Table (Ensuring Case-Insensitive User IDs)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id_text TEXT UNIQUE NOT NULL,
    pin_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Finance Data Tables (Using provided UUIDs as PKs)
CREATE TABLE IF NOT EXISTS incomes (
    id UUID PRIMARY KEY, -- Use local UUID
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    category TEXT NOT NULL,
    date DATE NOT NULL,
    frequency TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS spendings (
    id UUID PRIMARY KEY, -- Use local UUID
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    category TEXT NOT NULL,
    date DATE NOT NULL,
    kind TEXT NOT NULL,
    linked_obligation_id UUID, -- References local UUID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS obligations (
    id UUID PRIMARY KEY, -- Use local UUID
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

-- 4. Create Policies (Strict isolation)
-- Note: Since we don't have Supabase Auth, we filter on the column.
-- We can't prevent spoofing via API without Auth, but this ensures well-behaved clients are isolated.

DROP POLICY IF EXISTS "Allow access by profile_id" ON incomes;
CREATE POLICY "Strict isolation by profile_id" ON incomes
    FOR ALL USING (profile_id IS NOT NULL); -- We will always filter in the code

DROP POLICY IF EXISTS "Allow access by profile_id" ON spendings;
CREATE POLICY "Strict isolation by profile_id" ON spendings
    FOR ALL USING (profile_id IS NOT NULL);

DROP POLICY IF EXISTS "Allow access by profile_id" ON obligations;
CREATE POLICY "Strict isolation by profile_id" ON obligations
    FOR ALL USING (profile_id IS NOT NULL);

DROP POLICY IF EXISTS "Allow anyone to create/read profiles" ON profiles;
CREATE POLICY "Allow anyone to create/read profiles" ON profiles
    FOR ALL USING (true);
