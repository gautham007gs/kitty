
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

// Define the structure of the ad settings
interface AdSettings {
  ads_enabled_globally: boolean;
  show_ads_after_message_count: number;
  adsterra_direct_link: string;
  adsterra_direct_link_enabled: boolean;
  adsterra_banner_code: string;
  adsterra_banner_enabled: boolean;
  adsterra_native_banner_code: string;
  adsterra_native_banner_enabled: boolean;
  adsterra_social_bar_code: string;
  adsterra_social_bar_enabled: boolean;
  adsterra_popunder_code: string;
  adsterra_popunder_enabled: boolean;
  monetag_direct_link: string;
  monetag_direct_link_enabled: boolean;
  monetag_popunder_code: string;
  monetag_popunder_enabled: boolean;
}

export default function AdSettingsPage() {
  const [settings, setSettings] = useState<Partial<AdSettings>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('ad_settings')
          .select('*')
          .eq('id', 'default')
          .single();

        if (error) throw error;
        if (data) {
          setSettings(data);
        }
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Failed to load settings',
          description: error.message,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [toast]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('ad_settings')
        .update(settings)
        .eq('id', 'default');

      if (error) throw error;

      toast({
        title: 'Settings Saved',
        description: 'Your ad settings have been updated successfully.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to save settings',
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: keyof AdSettings, checked: boolean) => {
     setSettings(prev => ({ ...prev, [name]: checked }));
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-full p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Global Ad Settings</CardTitle>
                <CardDescription>Control all advertising settings across the application from here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <Label htmlFor="ads_enabled_globally" className="text-lg font-medium">Enable Ads Globally</Label>
                    <Switch id="ads_enabled_globally" checked={settings.ads_enabled_globally ?? true} onCheckedChange={(checked) => handleSwitchChange('ads_enabled_globally', checked)} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="show_ads_after_message_count">Show Ads After Message Count</Label>
                    <Input id="show_ads_after_message_count" name="show_ads_after_message_count" type="number" value={settings.show_ads_after_message_count || 8} onChange={handleInputChange} />
                </div>
            </CardContent>
        </Card>

        {/* Adsterra Settings */}
        <Card>
            <CardHeader>
                <CardTitle>Adsterra Settings</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
                 <div className="space-y-4 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="adsterra_direct_link_enabled">Direct Link</Label>
                        <Switch id="adsterra_direct_link_enabled" checked={settings.adsterra_direct_link_enabled ?? false} onCheckedChange={(checked) => handleSwitchChange('adsterra_direct_link_enabled', checked)} />
                    </div>
                    <Input id="adsterra_direct_link" name="adsterra_direct_link" placeholder="https://www.highrevenuegate.com/..." value={settings.adsterra_direct_link || ''} onChange={handleInputChange} />
                </div>
                <div className="space-y-4 p-4 border rounded-lg">
                     <div className="flex items-center justify-between">
                        <Label htmlFor="adsterra_popunder_enabled">Pop-under Code</Label>
                        <Switch id="adsterra_popunder_enabled" checked={settings.adsterra_popunder_enabled ?? false} onCheckedChange={(checked) => handleSwitchChange('adsterra_popunder_enabled', checked)} />
                    </div>
                    <textarea id="adsterra_popunder_code" name="adsterra_popunder_code" placeholder="<script>... a script ...</script>" value={settings.adsterra_popunder_code || ''} onChange={handleInputChange} className="w-full p-2 border rounded min-h-[100px] bg-background" />
                </div>
                 <div className="space-y-4 p-4 border rounded-lg">
                     <div className="flex items-center justify-between">
                        <Label htmlFor="adsterra_social_bar_enabled">Social Bar Code</Label>
                        <Switch id="adsterra_social_bar_enabled" checked={settings.adsterra_social_bar_enabled ?? false} onCheckedChange={(checked) => handleSwitchChange('adsterra_social_bar_enabled', checked)} />
                    </div>
                    <textarea id="adsterra_social_bar_code" name="adsterra_social_bar_code" placeholder="<script>... a script ...</script>" value={settings.adsterra_social_bar_code || ''} onChange={handleInputChange} className="w-full p-2 border rounded min-h-[100px] bg-background" />
                </div>
                 <div className="space-y-4 p-4 border rounded-lg">
                     <div className="flex items-center justify-between">
                        <Label htmlFor="adsterra_banner_enabled">Banner Code</Label>
                        <Switch id="adsterra_banner_enabled" checked={settings.adsterra_banner_enabled ?? false} onCheckedChange={(checked) => handleSwitchChange('adsterra_banner_enabled', checked)} />
                    </div>
                    <textarea id="adsterra_banner_code" name="adsterra_banner_code" placeholder="<script>... a script ...</script>" value={settings.adsterra_banner_code || ''} onChange={handleInputChange} className="w-full p-2 border rounded min-h-[100px] bg-background" />
                </div>
            </CardContent>
        </Card>

        {/* Monetag Settings */}
        <Card>
            <CardHeader>
                <CardTitle>Monetag Settings</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
                 <div className="space-y-4 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="monetag_direct_link_enabled">Direct Link</Label>
                        <Switch id="monetag_direct_link_enabled" checked={settings.monetag_direct_link_enabled ?? false} onCheckedChange={(checked) => handleSwitchChange('monetag_direct_link_enabled', checked)} />
                    </div>
                    <Input id="monetag_direct_link" name="monetag_direct_link" placeholder="https://www.monetag.com/..." value={settings.monetag_direct_link || ''} onChange={handleInputChange} />
                </div>
                <div className="space-y-4 p-4 border rounded-lg">
                     <div className="flex items-center justify-between">
                        <Label htmlFor="monetag_popunder_enabled">Pop-under Code</Label>
                        <Switch id="monetag_popunder_enabled" checked={settings.monetag_popunder_enabled ?? false} onCheckedChange={(checked) => handleSwitchChange('monetag_popunder_enabled', checked)} />
                    </div>
                    <textarea id="monetag_popunder_code" name="monetag_popunder_code" placeholder="<script>... a script ...</script>" value={settings.monetag_popunder_code || ''} onChange={handleInputChange} className="w-full p-2 border rounded min-h-[100px] bg-background" />
                </div>
            </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
            {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save All Settings'}
        </Button>
    </div>
  );
}
