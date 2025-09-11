
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Database, Shield, Bell, Globe } from 'lucide-react';

const SettingsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          System Settings
        </h1>
        <p className="text-gray-600 mt-2">Configure system-wide settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2 text-blue-500" />
              Database Settings
            </CardTitle>
            <CardDescription>Manage database connections and caching</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Connection Pool Size</span>
                <span className="text-sm text-gray-500">10</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Cache TTL</span>
                <span className="text-sm text-gray-500">300s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Query Timeout</span>
                <span className="text-sm text-gray-500">30s</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-green-500" />
              Security Settings
            </CardTitle>
            <CardDescription>Authentication and security configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Session Timeout</span>
                <span className="text-sm text-gray-500">24 hours</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Rate Limiting</span>
                <span className="text-sm text-green-600">Enabled</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">2FA Required</span>
                <span className="text-sm text-red-600">Disabled</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2 text-yellow-500" />
              Notification Settings
            </CardTitle>
            <CardDescription>Configure system notifications and alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Email Notifications</span>
                <span className="text-sm text-green-600">Enabled</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Error Alerts</span>
                <span className="text-sm text-green-600">Enabled</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Performance Alerts</span>
                <span className="text-sm text-gray-500">Disabled</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="h-5 w-5 mr-2 text-purple-500" />
              Global Settings
            </CardTitle>
            <CardDescription>Application-wide configuration options</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Default Language</span>
                <span className="text-sm text-gray-500">English</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Timezone</span>
                <span className="text-sm text-gray-500">UTC</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Maintenance Mode</span>
                <span className="text-sm text-red-600">Disabled</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
