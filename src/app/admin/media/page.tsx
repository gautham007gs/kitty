'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { Image, Upload, Link as LinkIcon, Trash2, Eye, RefreshCw } from 'lucide-react';

interface MediaAsset {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video' | 'audio';
  size: number;
  enabled: boolean;
  category: string;
}

export default function MediaAssetsPage() {
  const [assets, setAssets] = useState<MediaAsset[]>([
    {
      id: '1',
      name: 'Maya Profile Picture',
      url: '/api/placeholder/400/400',
      type: 'image',
      size: 245760,
      enabled: true,
      category: 'profile'
    },
    {
      id: '2', 
      name: 'Status Story Image',
      url: '/api/placeholder/300/500',
      type: 'image',
      size: 189440,
      enabled: true,
      category: 'status'
    },
    {
      id: '3',
      name: 'Background Image',
      url: '/api/placeholder/800/600',
      type: 'image', 
      size: 567890,
      enabled: false,
      category: 'background'
    }
  ]);

  const [newAsset, setNewAsset] = useState({
    name: '',
    url: '',
    category: 'profile'
  });

  const handleAddAsset = () => {
    if (newAsset.name && newAsset.url) {
      const asset: MediaAsset = {
        id: Date.now().toString(),
        name: newAsset.name,
        url: newAsset.url,
        type: 'image',
        size: Math.floor(Math.random() * 1000000),
        enabled: true,
        category: newAsset.category
      };
      setAssets([...assets, asset]);
      setNewAsset({ name: '', url: '', category: 'profile' });
    }
  };

  const toggleAsset = (id: string) => {
    setAssets(assets.map(asset => 
      asset.id === id ? { ...asset, enabled: !asset.enabled } : asset
    ));
  };

  const removeAsset = (id: string) => {
    setAssets(assets.filter(asset => asset.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Media Assets</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">Manage images, videos, and other media files</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button className="bg-purple-600 hover:bg-purple-700" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Upload New
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1">
          <TabsTrigger value="all" className="text-xs sm:text-sm">All Assets</TabsTrigger>
          <TabsTrigger value="profile" className="text-xs sm:text-sm">Profile</TabsTrigger>
          <TabsTrigger value="status" className="text-xs sm:text-sm">Status</TabsTrigger>
          <TabsTrigger value="background" className="text-xs sm:text-sm hidden sm:block">Background</TabsTrigger>
          <TabsTrigger value="upload" className="text-xs sm:text-sm hidden md:block">Upload New</TabsTrigger>
        </TabsList>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  All Media Assets ({assets.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                  {assets.map((asset) => (
                    <div key={asset.id} className="border rounded-lg p-3 md:p-4 space-y-3 hover:shadow-md transition-shadow">
                      <div className="aspect-square sm:aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <img 
                          src={asset.url} 
                          alt={asset.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate text-sm md:text-base">{asset.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={asset.enabled ? 'default' : 'secondary'} className="text-xs">
                                {asset.enabled ? 'Active' : 'Disabled'}
                              </Badge>
                              <Badge variant="outline" className="text-xs capitalize">
                                {asset.category}
                              </Badge>
                            </div>
                          </div>
                          <Switch 
                            checked={asset.enabled} 
                            onCheckedChange={() => toggleAsset(asset.id)}
                            className="flex-shrink-0"
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{asset.type.toUpperCase()}</span>
                          <span>{(asset.size / 1024).toFixed(1)} KB</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(asset.url, '_blank')}
                            className="flex-1 text-xs"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAsset(asset.id)}
                            className="flex-1 text-xs text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 space-y-1">
                          <div>Category: {asset.category}</div>
                          <div>Size: {formatFileSize(asset.size)}</div>
                          <div>Type: {asset.type}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {assets.filter(asset => asset.category === 'profile').map((asset) => (
                    <div key={asset.id} className="border rounded-lg p-4 space-y-3">
                      <div className="aspect-square bg-gray-100 rounded-full overflow-hidden">
                        <img 
                          src={asset.url} 
                          alt={asset.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-center space-y-2">
                        <h3 className="font-medium">{asset.name}</h3>
                        <div className="flex items-center justify-center gap-2">
                          <Switch 
                            checked={asset.enabled} 
                            onCheckedChange={() => toggleAsset(asset.id)}
                          />
                          <Label className="text-sm">Enabled</Label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="status">
            <Card>
              <CardHeader>
                <CardTitle>Status Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {assets.filter(asset => asset.category === 'status').map((asset) => (
                    <div key={asset.id} className="border rounded-lg p-4 space-y-3">
                      <div className="aspect-[9/16] bg-gray-100 rounded-lg overflow-hidden">
                        <img 
                          src={asset.url} 
                          alt={asset.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-medium">{asset.name}</h3>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Switch 
                              checked={asset.enabled} 
                              onCheckedChange={() => toggleAsset(asset.id)}
                            />
                            <Label className="text-sm">Active</Label>
                          </div>
                          <Button variant="outline" size="sm">
                            Use as Story
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="background">
            <Card>
              <CardHeader>
                <CardTitle>Background Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assets.filter(asset => asset.category === 'background').map((asset) => (
                    <div key={asset.id} className="border rounded-lg p-4 space-y-3">
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <img 
                          src={asset.url} 
                          alt={asset.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-medium">{asset.name}</h3>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Switch 
                              checked={asset.enabled} 
                              onCheckedChange={() => toggleAsset(asset.id)}
                            />
                            <Label className="text-sm">Enabled</Label>
                          </div>
                          <Button variant="outline" size="sm">
                            Set as Default
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload New Asset
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="asset-name">Asset Name</Label>
                    <Input
                      id="asset-name"
                      placeholder="e.g., Maya Profile Picture"
                      value={newAsset.name}
                      onChange={(e) => setNewAsset({...newAsset, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="asset-category">Category</Label>
                    <select 
                      className="w-full p-2 border rounded-md"
                      value={newAsset.category}
                      onChange={(e) => setNewAsset({...newAsset, category: e.target.value})}
                    >
                      <option value="profile">Profile</option>
                      <option value="status">Status</option>
                      <option value="background">Background</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="asset-url">Image URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="asset-url"
                      placeholder="https://example.com/image.jpg"
                      value={newAsset.url}
                      onChange={(e) => setNewAsset({...newAsset, url: e.target.value})}
                      className="flex-1"
                    />
                    <Button variant="outline">
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Drag and drop your files here</p>
                  <p className="text-sm text-gray-500 mb-4">or click to browse (Max 10MB)</p>
                  <Button variant="outline">Browse Files</Button>
                </div>

                <Button onClick={handleAddAsset} className="w-full">
                  Add Media Asset
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}