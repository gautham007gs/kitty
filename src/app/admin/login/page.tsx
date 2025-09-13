
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

export default function AdminLoginPage() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simple demo credentials (replace with proper auth in production)
      if (credentials.username === 'admin' && credentials.password === 'admin123') {
        // Set admin session cookie with proper attributes (no Secure flag for HTTP dev)
        document.cookie = 'admin-session=true; Path=/; Max-Age=86400; SameSite=Lax'; // 24 hours
        
        // Also set in sessionStorage as backup
        sessionStorage.setItem('isAdminLoggedIn_KruthikaChat', 'true');
        sessionStorage.setItem('admin_user_id', 'admin');
        
        console.log('🔓 Admin logged in successfully');
        toast({
          title: "Success",
          description: "Login successful! Redirecting...",
        });
        
        // Immediate redirect with window.location for better cookie handling
        setTimeout(() => {
          window.location.href = '/admin';
        }, 500);
      } else {
        toast({
          title: "Error",
          description: "Invalid credentials",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "Login failed",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Admin Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Enter username"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Enter password"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          <div className="mt-4 text-sm text-gray-600 text-center">
            Demo: admin / admin123
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
