-- USERS
CREATE TABLE users (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  fullname TEXT,
  fullname_Hindi TEXT,
  email TEXT UNIQUE NOT NULL,
  profile_pic TEXT,
  date_of_birth DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own data" ON users
FOR ALL
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- PROFILE PICTURES STORAGE
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile_pics', 'profile_pics', true);

CREATE POLICY "Allow all uploads to profile_pics" ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'profile_pics');

CREATE POLICY "Allow all reads from profile_pics" ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'profile_pics');

-- USER SIGNUP TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  username TEXT;
BEGIN
  username := split_part(NEW.email, '@', 1);
  INSERT INTO public.users (id, email, username)
  VALUES (NEW.id, NEW.email, username);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

ALTER PUBLICATION supabase_realtime ADD TABLE users;

-- POSTS
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT,
  content_Hindi TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_posts_updated_at
BEFORE UPDATE ON posts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable public read access" ON posts
FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON posts
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for post owners" ON posts
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable delete for post owners" ON posts
FOR DELETE USING (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE posts;

-- IMAGES STORAGE
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true);

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

-- SAVED POSTS
CREATE TABLE saved_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

ALTER TABLE saved_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their saved posts" ON saved_posts
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can save posts" ON saved_posts
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave posts" ON saved_posts
FOR DELETE USING (auth.uid() = user_id);

-- COMMENTS
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  content_Hindi TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_comment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_comments_updated_at
BEFORE UPDATE ON comments
FOR EACH ROW
EXECUTE FUNCTION update_comment_updated_at();

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access to comments" ON comments
FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON comments
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for comment owners" ON comments
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable delete for comment owners" ON comments
FOR DELETE USING (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE comments;
