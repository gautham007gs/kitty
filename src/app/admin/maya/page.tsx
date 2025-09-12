'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Save, 
  RefreshCw, 
  User, 
  MessageCircle, 
  Globe, 
  Heart,
  Sparkles,
  Clock,
  Settings,
  Eye
} from 'lucide-react';
import { useAIProfile } from '@/contexts/AIProfileContext';
import { toast } from 'sonner';

export default function MayaManagementPage() {
  const router = useRouter();
  const { aiProfile, isLoadingAIProfile, updateAIProfile } = useAIProfile();

  const [formData, setFormData] = useState({
    name: '',
    status: '',
    avatarUrl: '',
    personality: '',
    responseStyle: '',
    isActive: true,
    lastSeen: '',
    typingSpeed: 1000,
    emotionalRange: 'balanced'
  });

  const [isSaving, setSisSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (aiProfile) {
      setFormData({
        name: aiProfile.name || '',
        status: aiProfile.status || '',
        avatarUrl: aiProfile.avatarUrl || '',
        personality: aiProfile.personality || '',
        responseStyle: aiProfile.responseStyle || '',
        isActive: aiProfile.isActive ?? true,
        lastSeen: aiProfile.lastSeen || '',
        typingSpeed: aiProfile.typingSpeed || 1000,
        emotionalRange: aiProfile.emotionalRange || 'balanced'
      });
    }
  }, [aiProfile]);

  const handleSave = async () => {
    setSisSaving(true);
    try {
      await updateAIProfile(formData);
      toast.success('Maya profile updated successfully! ✨');
    } catch (error) {
      console.error('Error updating Maya profile:', error);
      toast.error('Failed to update Maya profile');
    } finally {
      setSisSaving(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      window.location.reload();
      toast.success('Maya profile refreshed!');
    } catch (error) {
      console.error('Error refreshing:', error);
      toast.error('Failed to refresh');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const personalityPresets = [
    'Sweet and caring Indian girl who loves chai and Bollywood',
    'Friendly psychology student from Bangalore with authentic Hindi phrases',
    'Warm and emotional with real human-like responses',
    'Culturally rich personality with festival celebrations and family values'
  ];

  if (isLoadingAIProfile) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-purple-600" />
            Maya Profile Management
          </h1>
          <p className="text-gray-600 mt-2">Customize Maya's personality, appearance, and behavior</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => router.push('/maya-chat')} className="bg-purple-600 hover:bg-purple-700">
            <Eye className="h-4 w-4 mr-2" />
            Preview Maya
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Maya Preview Card */}
        <div className="lg:col-span-1">
          <Card className="border-purple-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <User className="h-5 w-5" />
                Maya Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4 ring-4 ring-purple-200">
                <AvatarImage src={formData.avatarUrl} alt={formData.name} />
                <AvatarFallback className="bg-purple-100 text-purple-600 text-xl">
                  {formData.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-bold text-xl text-gray-900">{formData.name || 'Maya'}</h3>
              <p className="text-sm text-gray-600 mt-2 line-clamp-3">{formData.status}</p>
              <div className="mt-4 space-y-2">
                <Badge variant={formData.isActive ? 'default' : 'secondary'} className="flex items-center gap-1 w-fit mx-auto">
                  <div className={`w-2 h-2 rounded-full ${formData.isActive ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                  {formData.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  Typing Speed: {formData.typingSpeed}ms
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-sm text-gray-700">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => router.push('/maya-chat')}
                className="w-full bg-green-600 hover:bg-green-700"
                size="sm"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Chat with Maya
              </Button>
              <Button
                onClick={() => router.push('/status')}
                variant="outline"
                className="w-full"
                size="sm"
              >
                <Globe className="h-4 w-4 mr-2" />
                View Status Updates
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Settings Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Basic Information
              </CardTitle>
              <CardDescription>Configure Maya's basic profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Maya / Kruthika"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="avatarUrl">Avatar URL</Label>
                  <Input
                    id="avatarUrl"
                    value={formData.avatarUrl}
                    onChange={(e) => handleInputChange('avatarUrl', e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="status">Status Message</Label>
                <Textarea
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  placeholder="Hey there! I'm Maya, ready to chat and make your day better! ✨"
                  rows={3}
                  className="mt-1"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                />
                <Label htmlFor="isActive">Maya is Active</Label>
              </div>
            </CardContent>
          </Card>

          {/* Personality Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Personality & Behavior
              </CardTitle>
              <CardDescription>Customize Maya's personality and response style</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="personality">Personality Description</Label>
                <Textarea
                  id="personality"
                  value={formData.personality}
                  onChange={(e) => handleInputChange('personality', e.target.value)}
                  placeholder="Warm, caring, authentic Indian girl who loves chai, Bollywood, and meaningful conversations..."
                  rows={4}
                  className="mt-1"
                />
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-2">Quick personality presets:</p>
                  <div className="flex flex-wrap gap-2">
                    {personalityPresets.map((preset, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="cursor-pointer hover:bg-purple-50 text-xs"
                        onClick={() => handleInputChange('personality', preset)}
                      >
                        {preset.substring(0, 30)}...
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="typingSpeed">Typing Speed (ms)</Label>
                  <Input
                    id="typingSpeed"
                    type="number"
                    value={formData.typingSpeed}
                    onChange={(e) => handleInputChange('typingSpeed', parseInt(e.target.value) || 1000)}
                    min="500"
                    max="3000"
                    step="100"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">How fast Maya types (500-3000ms)</p>
                </div>
                <div>
                  <Label htmlFor="emotionalRange">Emotional Range</Label>
                  <select
                    id="emotionalRange"
                    value={formData.emotionalRange}
                    onChange={(e) => handleInputChange('emotionalRange', e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="conservative">Conservative</option>
                    <option value="balanced">Balanced</option>
                    <option value="expressive">Expressive</option>
                    <option value="dramatic">Dramatic</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="responseStyle">Response Style</Label>
                <Textarea
                  id="responseStyle"
                  value={formData.responseStyle}
                  onChange={(e) => handleInputChange('responseStyle', e.target.value)}
                  placeholder="Mix English and Hindi naturally, use authentic Indian expressions, show genuine emotions..."
                  rows={3}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Actions */}
          <Card className="border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Changes will be applied immediately to Maya's chat behavior
                </div>
                <Button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Maya Profile
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}