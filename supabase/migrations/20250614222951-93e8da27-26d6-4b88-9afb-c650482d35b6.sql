
-- Add RLS policies to existing tables (if not already enabled)
DO $$ 
BEGIN
    -- Enable RLS on knowledge_files if not already enabled
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'knowledge_files' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE knowledge_files ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Create RLS policies for knowledge files storage (with IF NOT EXISTS equivalent)
DO $$ 
BEGIN
    -- Storage policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can upload knowledge files' AND tablename = 'objects') THEN
        CREATE POLICY "Authenticated users can upload knowledge files"
        ON storage.objects FOR INSERT
        WITH CHECK (
          bucket_id = 'knowledge-files' AND
          auth.role() = 'authenticated'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view knowledge files' AND tablename = 'objects') THEN
        CREATE POLICY "Users can view knowledge files"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'knowledge-files');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can delete knowledge files' AND tablename = 'objects') THEN
        CREATE POLICY "Admins can delete knowledge files"
        ON storage.objects FOR DELETE
        USING (
          bucket_id = 'knowledge-files' AND
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('owner', 'manager')
          )
        );
    END IF;

    -- Knowledge files table policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view active knowledge files' AND tablename = 'knowledge_files') THEN
        CREATE POLICY "Anyone can view active knowledge files"
        ON knowledge_files FOR SELECT
        USING (is_active = true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can upload knowledge files' AND tablename = 'knowledge_files') THEN
        CREATE POLICY "Authenticated users can upload knowledge files"
        ON knowledge_files FOR INSERT
        WITH CHECK (auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage knowledge files' AND tablename = 'knowledge_files') THEN
        CREATE POLICY "Admins can manage knowledge files"
        ON knowledge_files FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('owner', 'manager')
          )
        );
    END IF;
END $$;

-- Create website crawl status table
CREATE TABLE IF NOT EXISTS website_crawl_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  progress JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  result_data JSONB
);

-- Enable RLS and create policies for crawl status
ALTER TABLE website_crawl_status ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own crawl status' AND tablename = 'website_crawl_status') THEN
        CREATE POLICY "Users can view their own crawl status"
        ON website_crawl_status FOR SELECT
        USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can create crawl requests' AND tablename = 'website_crawl_status') THEN
        CREATE POLICY "Users can create crawl requests"
        ON website_crawl_status FOR INSERT
        WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own crawl status' AND tablename = 'website_crawl_status') THEN
        CREATE POLICY "Users can update their own crawl status"
        ON website_crawl_status FOR UPDATE
        USING (auth.uid() = user_id);
    END IF;
END $$;
