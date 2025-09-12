
-- Create ad_settings table if not exists
CREATE TABLE IF NOT EXISTS public.ad_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Global ad settings
    ads_enabled_globally BOOLEAN DEFAULT true,
    max_direct_link_ads_per_day INTEGER DEFAULT 6,
    max_direct_link_ads_per_session INTEGER DEFAULT 3,
    
    -- Adsterra settings
    adsterra_direct_link TEXT DEFAULT '',
    adsterra_direct_link_enabled BOOLEAN DEFAULT false,
    adsterra_banner_code TEXT DEFAULT '',
    adsterra_banner_enabled BOOLEAN DEFAULT false,
    adsterra_native_banner_code TEXT DEFAULT '',
    adsterra_native_banner_enabled BOOLEAN DEFAULT false,
    adsterra_social_bar_code TEXT DEFAULT '',
    adsterra_social_bar_enabled BOOLEAN DEFAULT false,
    adsterra_popunder_code TEXT DEFAULT '',
    adsterra_popunder_enabled BOOLEAN DEFAULT false,
    
    -- Monetag settings
    monetag_direct_link TEXT DEFAULT '',
    monetag_direct_link_enabled BOOLEAN DEFAULT false,
    monetag_banner_code TEXT DEFAULT '',
    monetag_banner_enabled BOOLEAN DEFAULT false,
    monetag_native_banner_code TEXT DEFAULT '',
    monetag_native_banner_enabled BOOLEAN DEFAULT false,
    monetag_social_bar_code TEXT DEFAULT '',
    monetag_social_bar_enabled BOOLEAN DEFAULT false,
    monetag_popunder_code TEXT DEFAULT '',
    monetag_popunder_enabled BOOLEAN DEFAULT false
);

-- Insert default settings if table is empty
INSERT INTO public.ad_settings (
    ads_enabled_globally,
    max_direct_link_ads_per_day,
    max_direct_link_ads_per_session,
    adsterra_banner_code,
    adsterra_banner_enabled
) 
SELECT 
    true,
    6,
    3,
    '<script type="text/javascript">
	atOptions = {
		''key'' : ''2a86a3b22e8c1477e8a83d56c0386bb3'',
		''format'' : ''iframe'',
		''height'' : 90,
		''width'' : 728,
		''params'' : {}
	};
</script>
<script type="text/javascript" src="//judicialphilosophical.com/2a86a3b22e8c1477e8a83d56c0386bb3/invoke.js"></script>',
    true
WHERE NOT EXISTS (SELECT 1 FROM public.ad_settings);

-- Enable RLS
ALTER TABLE public.ad_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read ad settings
CREATE POLICY "Allow read access to ad_settings" ON public.ad_settings
    FOR SELECT USING (true);

-- Create policy for authenticated users to update ad settings
CREATE POLICY "Allow authenticated users to update ad_settings" ON public.ad_settings
    FOR UPDATE TO authenticated USING (true);

-- Create policy for authenticated users to insert ad settings
CREATE POLICY "Allow authenticated users to insert ad_settings" ON public.ad_settings
    FOR INSERT TO authenticated WITH CHECK (true);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ad_settings_updated_at BEFORE UPDATE ON public.ad_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
