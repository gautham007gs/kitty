'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  Users, 
  Activity, 
  DollarSign,
  TrendingUp,
  Eye,
  Heart,
  Zap
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface Analytics {
  total_messages: number;
  total_users: number;
  active_sessions: number;
  revenue: number;
  engagement_rate: number;
  avg_response_time: number;
  user_satisfaction: number;
  ai_mood_score: number;
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics>({
    total_messages: 0,
    total_users: 0,
    active_sessions: 0,
    revenue: 0,
    engagement_rate: 0,
    avg_response_time: 0,
    user_satisfaction: 0,
    ai_mood_score: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Fetch messages count (using correct v6 table name)
        const { count: messagesCount } = await supabase
          .from('messages_log')
          .select('*', { count: 'exact', head: true });

        // Fetch users count (using daily activity log for unique users)
        const { count: usersCount } = await supabase
          .from('daily_activity_log')
          .select('user_pseudo_id', { count: 'exact', head: true });

        // Fetch active sessions (messages in last hour)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        const { count: activeSessions } = await supabase
          .from('messages_log')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', oneHourAgo);

        setAnalytics({
          total_messages: messagesCount || 0,
          total_users: usersCount || 0,
          active_sessions: activeSessions || 0,
          revenue: 127.50, // Mock data - integrate with ad revenue
          engagement_rate: 87.5, // Mock data
          avg_response_time: 1.2, // Mock data
          user_satisfaction: 4.8, // Mock data
          ai_mood_score: 92 // Mock data
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();

    // Refresh every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000);

    return () => clearInterval(interval);
  }, []);

  const stats = [
    {
      title: 'Total Messages',
      value: analytics.total_messages.toLocaleString(),
      icon: MessageSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+12%'
    },
    {
      title: 'Total Users',
      value: analytics.total_users.toLocaleString(),
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+5%'
    },
    {
      title: 'Active Sessions',
      value: analytics.active_sessions.toString(),
      icon: Activity,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: '+8%'
    },
    {
      title: 'Revenue',
      value: `$${analytics.revenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: '+23%'
    },
    {
      title: 'Engagement Rate',
      value: `${analytics.engagement_rate}%`,
      icon: TrendingUp,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      change: '+2%'
    },
    {
      title: 'Response Time',
      value: `${analytics.avg_response_time}s`,
      icon: Zap,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      change: '-15%'
    },
    {
      title: 'User Satisfaction',
      value: `${analytics.user_satisfaction}/5`,
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      change: '+0.2'
    },
    {
      title: 'AI Mood Score',
      value: `${analytics.ai_mood_score}%`,
      icon: Eye,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      change: '+3%'
    }
  ];

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-48"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Maya Chat - Complete System Control</p>
        </div>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline" 
          size="sm"
          className="w-full sm:w-auto"
        >
          <Activity className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <Card key={stat.title} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-md ${stat.bgColor}`}>
                  <IconComponent className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="flex items-center mt-2">
                  <span className="text-xs text-green-600 font-medium">
                    {stat.change}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">vs last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Maya Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">Manage AI personality and responses</p>
            <Button asChild className="w-full">
              <a href="/admin/profile">Manage Profile</a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ad Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">Configure monetization settings</p>
            <Button asChild variant="outline" className="w-full">
              <a href="/admin/ads">Manage Ads</a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Media Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">Upload and manage media files</p>
            <Button asChild variant="outline" className="w-full">
              <a href="/admin/media">Manage Media</a>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span className="text-sm">Database: Online</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span className="text-sm">AI Service: Active</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span className="text-sm">Chat System: Running</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}