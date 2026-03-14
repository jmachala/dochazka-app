-- Create tables for Attendance Tracking App (Simplified Kiosk Version)

-- 1. Profiles table: Only for login accounts (Admin or Kiosk terminal)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT DEFAULT 'kiosk' CHECK (role IN ('admin', 'kiosk')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Employees table: The people who actually "pipají" on the terminal
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Attendance table: Tracks check-ins and check-outs for employees
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  check_in TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  check_out TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'present' CHECK (status IN ('present', 'late', 'excused', 'absent')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Absences table: Tracks absences for employees
CREATE TABLE IF NOT EXISTS public.absences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('vacation', 'sick_leave', 'home_office', 'other')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.absences ENABLE ROW LEVEL SECURITY;

-- --- Policies for Profiles ---
CREATE POLICY "Profiles are viewable by authenticated users." ON public.profiles
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- --- Policies for Employees ---
CREATE POLICY "Employees are viewable by authenticated users." ON public.employees
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage employees." ON public.employees
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- --- Policies for Attendance ---
CREATE POLICY "Attendance is viewable by authenticated users." ON public.attendance
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone authenticated can log attendance." ON public.attendance
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone authenticated can update attendance." ON public.attendance
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- --- Policies for Absences ---
CREATE POLICY "Absences are viewable by authenticated users." ON public.absences
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage absences." ON public.absences
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to handle new user signup (defaulting to kiosk if not specified)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', COALESCE(new.raw_user_meta_data->>'role', 'kiosk'));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
