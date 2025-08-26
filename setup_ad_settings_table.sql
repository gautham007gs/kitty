
-- Create app_configurations table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.app_configurations (
  id text PRIMARY KEY,
  settings jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.app_configurations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access to everyone
CREATE POLICY "Allow public read access to app_configurations" ON public.app_configurations FOR SELECT USING (true);

-- Create policy to allow insert/update access (you may want to restrict this)
CREATE POLICY "Allow public write access to app_configurations" ON public.app_configurations FOR ALL USING (true);

-- Insert default ad settings if they don't exist
INSERT INTO public.app_configurations (id, settings)
VALUES ('ad_settings_kruthika_chat_v1', '{
  "adsEnabledGlobally": true,
  "adsterraDirectLink": "https://www.highrevenuegate.com/p8ks4fn2?key=2dc1e58e3be02dd1e015a64b5d1d7d69",
  "adsterraDirectLinkEnabled": true,
  "adsterraBannerCode": "<!-- Adsterra Banner Code Placeholder -->",
  "adsterraBannerEnabled": false,
  "adsterraNativeBannerCode": "<!-- Adsterra Native Banner Code Placeholder -->",
  "adsterraNativeBannerEnabled": false,
  "adsterraSocialBarCode": "<!-- Adsterra Social Bar Code Placeholder -->",
  "adsterraSocialBarEnabled": false,
  "adsterraPopunderCode": "<!-- Adsterra Pop-under Script Placeholder -->",
  "adsterraPopunderEnabled": false,
  "monetagDirectLink": "https://monetag.com/direct-link-placeholder",
  "monetagDirectLinkEnabled": true,
  "monetagBannerCode": "<!-- Monetag Banner Code Placeholder -->",
  "monetagBannerEnabled": false,
  "monetagNativeBannerCode": "<!-- Monetag Native Banner Code Placeholder -->",
  "monetagNativeBannerEnabled": false,
  "monetagPopunderCode": "<!-- Monetag Pop-under Script Placeholder -->",
  "monetagPopunderEnabled": false
}')
ON CONFLICT (id) DO NOTHING;

-- Insert default AI profile if it doesn't exist
INSERT INTO public.app_configurations (id, settings)
VALUES ('ai_profile_kruthika_chat_v1', '{
  "name": "Kruthika",
  "avatarUrl": "https://i.postimg.cc/52S3BZrM/images-10.jpg",
  "status": "🌸 Tumse baat karne ka wait kar rahi hun! Let'\''s chat! 🌸",
  "statusStoryText": "Ask me anything! 💬 Main hamesha available hun!",
  "statusStoryImageUrl": "https://i.postimg.cc/52S3BZrM/images-10.jpg",
  "statusStoryHasUpdate": true
}')
ON CONFLICT (id) DO NOTHING;
