-- Create albums table
CREATE TABLE IF NOT EXISTS public.albums (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_names TEXT NOT NULL,
  event_date DATE NOT NULL,
  cover_photo_url TEXT,
  cover_photo_drive_id TEXT,
  drive_folder_id TEXT,
  access_code TEXT UNIQUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create photos table
CREATE TABLE IF NOT EXISTS public.photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  album_id UUID NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
  drive_file_id TEXT NOT NULL,
  drive_file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_name TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create album_access table for permissions
CREATE TABLE IF NOT EXISTS public.album_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  album_id UUID NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(album_id, user_email)
);

-- Enable RLS
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.album_access ENABLE ROW LEVEL SECURITY;

-- Albums policies
CREATE POLICY "Anyone can view albums"
  ON public.albums FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create albums"
  ON public.albums FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Album creators can update their albums"
  ON public.albums FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Album creators can delete their albums"
  ON public.albums FOR DELETE
  USING (auth.uid() = created_by);

-- Photos policies
CREATE POLICY "Anyone can view photos"
  ON public.photos FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can upload photos"
  ON public.photos FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.albums 
    WHERE id = album_id AND created_by = auth.uid()
  ));

CREATE POLICY "Album creators can delete photos"
  ON public.photos FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.albums 
    WHERE id = album_id AND created_by = auth.uid()
  ));

-- Album access policies
CREATE POLICY "Users can view their access grants"
  ON public.album_access FOR SELECT
  USING (true);

CREATE POLICY "Album creators can grant access"
  ON public.album_access FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.albums 
    WHERE id = album_id AND created_by = auth.uid()
  ));

CREATE POLICY "Album creators can revoke access"
  ON public.album_access FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.albums 
    WHERE id = album_id AND created_by = auth.uid()
  ));

-- Create indexes
CREATE INDEX idx_photos_album_id ON public.photos(album_id);
CREATE INDEX idx_album_access_album_id ON public.album_access(album_id);
CREATE INDEX idx_album_access_user_email ON public.album_access(user_email);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_albums_updated_at
  BEFORE UPDATE ON public.albums
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();