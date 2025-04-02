-- This section of the schema defines the structure and security policies for the users table,
-- as well as the storage bucket for profile pictures and the trigger function to insert new users.

-- Create the users table
CREATE TABLE users (
  id UUID REFERENCES auth.users ON DELETE CASCADE, -- Links to Supabase auth users
  username TEXT UNIQUE NOT NULL, -- Unique username derived from email
  fullname TEXT, -- Full name of the user
  email TEXT UNIQUE NOT NULL, -- Email of the user
  profile_pic TEXT, -- URL to the profile picture
  date_of_birth DATE, -- Date of birth
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- Timestamp when the user was created
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- Timestamp when the user was last updated
  PRIMARY KEY (id)
);

-- Enable Row Level Security (RLS) for the users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow users to manage their own data
CREATE POLICY "Users can manage their own data" ON users
FOR ALL
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Create a storage bucket for profile pictures
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile_pics', 'profile_pics', true);

-- Allow all users to upload files to the profile_pics bucket
CREATE POLICY "Allow all uploads to profile_pics" ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'profile_pics');

-- Allow all users to view files in the profile_pics bucket
CREATE POLICY "Allow all reads from profile_pics" ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'profile_pics');

-- Create a trigger function to insert a new row into the `users` table when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  username TEXT;
BEGIN
  -- Extract the username from the email (remove everything after the '@')
  username := split_part(NEW.email, '@', 1);

  -- Insert the new user into the `users` table
  INSERT INTO public.users (id, email, username)
  VALUES (NEW.id, NEW.email, username);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach the trigger to the `auth.users` table
CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Turn on Real Time 
-- Enable realtime for the 'users' table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;


ALTER PUBLICATION supabase_realtime
  ADD TABLE users;

--                          POSTS

-- Create posts table with proper relationships
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable public read access" ON posts
FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON posts
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for post owners" ON posts
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable delete for post owners" ON posts
FOR DELETE USING (auth.uid() = user_id);

-- Create images bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true);

-- Set bucket policies
CREATE POLICY "Allow public read access to images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'images');

CREATE POLICY "Allow authenticated uploads to posts" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'images' AND
  (storage.foldername(name))[1] = 'posts'
);