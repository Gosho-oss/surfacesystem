# Wallpaper B2B Platform

A clean, production-ready MVP for a B2B web platform where interior designers can order custom printed wallpapers.

## Tech Stack
- Frontend: React 19, Vite, Tailwind CSS, TypeScript
- Backend: Express (integrated with Vite for full-stack capabilities)
- Database & Auth: Supabase
- Emails: Resend (optional)

## Setup Instructions

### 1. Supabase Setup
1. Create a new project on [Supabase](https://supabase.com/).
2. Go to the SQL Editor and run the following schema. This handles user profiles, client IDs, and orders.

```sql
-- 1. Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  client_id SERIAL UNIQUE,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'client' CHECK (role IN ('client', 'admin')),
  total_orders INTEGER DEFAULT 0,
  total_spent NUMERIC DEFAULT 0,
  discount_percentage NUMERIC DEFAULT 0,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Set client_id to start from 100001
ALTER SEQUENCE profiles_client_id_seq RESTART WITH 100001;

-- 2. Create orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id INTEGER REFERENCES profiles(client_id),
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT NOT NULL,
  width NUMERIC NOT NULL,
  height NUMERIC NOT NULL,
  material TEXT NOT NULL,
  base_price NUMERIC NOT NULL,
  discount_applied NUMERIC DEFAULT 0,
  large_format_fee NUMERIC DEFAULT 0,
  final_price NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  file_url TEXT NOT NULL,
  file_size NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 4. Profiles Policies
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update profiles" ON profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 5. Orders Policies
CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all orders" ON orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can insert their own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update orders" ON orders FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 6. Storage Policies (Bucket: 'wallpapers')
-- Create bucket manually in dashboard first
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'wallpapers');
CREATE POLICY "Auth Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'wallpapers' AND auth.role() = 'authenticated');

-- 7. Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'client');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 8. Function to update user stats on order completion
CREATE OR REPLACE FUNCTION update_user_stats_on_order()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status = 'pending' THEN
    UPDATE profiles
    SET 
      total_orders = total_orders + 1,
      total_spent = total_spent + NEW.final_price
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_order_completed
  AFTER UPDATE ON orders
  FOR EACH ROW EXECUTE PROCEDURE update_user_stats_on_order();
```

### 2. Environment Variables
Create a `.env` file in the root directory (copy from `.env.example`):

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```

### 5. Build for Production
```bash
npm run build
```

### 6. Deploy to Vercel
1. Push your code to GitHub.
2. Import the repository in Vercel.
3. Vercel will automatically detect Vite.
4. Add the environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in the Vercel dashboard.
5. Click **Deploy**.
*(Note: The email functionality has been temporarily disabled as requested).*
# surfacesystem
