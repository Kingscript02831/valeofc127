
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL,
  read boolean DEFAULT false,
  reference_id uuid,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_sender_id_idx ON public.notifications(sender_id);
CREATE INDEX IF NOT EXISTS notifications_read_idx ON public.notifications(read);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies for notifications
CREATE POLICY "Users can see their own notifications" 
ON public.notifications
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create notifications" 
ON public.notifications
FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications
FOR UPDATE USING (auth.uid() = user_id);

-- Create function to create follow notification
CREATE OR REPLACE FUNCTION public.create_follow_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (
    user_id, 
    sender_id, 
    title, 
    message, 
    type, 
    reference_id
  )
  VALUES (
    NEW.following_id, 
    NEW.follower_id, 
    'Novo seguidor', 
    'começou a seguir você', 
    'follow', 
    NEW.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for follow notifications
DROP TRIGGER IF EXISTS create_follow_notification_trigger ON public.follows;
CREATE TRIGGER create_follow_notification_trigger
AFTER INSERT ON public.follows
FOR EACH ROW
EXECUTE FUNCTION public.create_follow_notification();

-- Let's add a sample notification for testing - this will be removed in production
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.notifications LIMIT 1
  ) THEN
    INSERT INTO public.notifications (
      user_id,
      sender_id,
      title,
      message,
      type,
      read
    )
    SELECT 
      (SELECT id FROM auth.users LIMIT 1),
      (SELECT id FROM auth.users LIMIT 1 OFFSET 1),
      'Notificação de teste',
      'Esta é uma notificação de teste',
      'test',
      false
    WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1 OFFSET 1);
  END IF;
END $$;
