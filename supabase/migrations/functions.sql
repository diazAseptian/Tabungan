-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS
$function$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', 'User'));
  
  -- Create default expense categories
  INSERT INTO public.categories (user_id, name, type, color) VALUES
    (new.id, 'Makanan', 'expense', '#EF4444'),
    (new.id, 'Transportasi', 'expense', '#F97316'),
    (new.id, 'Hiburan', 'expense', '#8B5CF6'),
    (new.id, 'Kesehatan', 'expense', '#06B6D4'),
    (new.id, 'Belanja', 'expense', '#EC4899'),
    (new.id, 'Utilitas', 'expense', '#6B7280');
  
  -- Create default income categories
  INSERT INTO public.categories (user_id, name, type, color) VALUES
    (new.id, 'Cash', 'income', '#10B981'),
    (new.id, 'Debit', 'income', '#059669');
  
  RETURN new;
END;
$function$ 
LANGUAGE plpgsql SECURITY definer;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();