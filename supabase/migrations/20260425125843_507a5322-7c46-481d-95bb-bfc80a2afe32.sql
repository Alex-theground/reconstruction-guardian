-- 1. History table for site_content
CREATE TABLE IF NOT EXISTS public.site_content_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text NOT NULL,
  content jsonb NOT NULL,
  changed_by uuid,
  changed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_site_content_history_section_changed
  ON public.site_content_history (section_key, changed_at DESC);

ALTER TABLE public.site_content_history ENABLE ROW LEVEL SECURITY;

-- Admins can view history
CREATE POLICY "Admins can read site content history"
  ON public.site_content_history
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can restore (insert manually)
CREATE POLICY "Admins can insert site content history"
  ON public.site_content_history
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 2. Trigger function: record snapshots on INSERT/UPDATE of site_content
CREATE OR REPLACE FUNCTION public.record_site_content_history()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.site_content_history (section_key, content, changed_by)
  VALUES (NEW.section_key, NEW.content, auth.uid());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_site_content_history ON public.site_content;
CREATE TRIGGER trg_site_content_history
AFTER INSERT OR UPDATE ON public.site_content
FOR EACH ROW
EXECUTE FUNCTION public.record_site_content_history();