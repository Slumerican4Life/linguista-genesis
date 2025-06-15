
-- Create lyra_instructions table for storing Lyra's custom instructions
CREATE TABLE public.lyra_instructions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.lyra_instructions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow admins to manage instructions
CREATE POLICY "admin_manage_instructions" ON public.lyra_instructions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('owner', 'manager')
    )
  );

-- Create policy for edge functions to read instructions
CREATE POLICY "edge_function_read_instructions" ON public.lyra_instructions
  FOR SELECT
  USING (true);
