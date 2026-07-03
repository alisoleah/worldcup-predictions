-- 1. Create the 'avatars' bucket if it doesn't already exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Drop the policy if it already exists to avoid errors
DROP POLICY IF EXISTS "Public Access" ON storage.objects;

-- 3. Create the policy to allow all operations (upload/read/delete) on the 'avatars' bucket
CREATE POLICY "Public Access" 
ON storage.objects FOR ALL 
USING (bucket_id = 'avatars')
WITH CHECK (bucket_id = 'avatars');
