import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, MessageSquare, Book, Video, FileText, LogOut } from "lucide-react";
import { PrayerRequestsManager } from "@/components/admin/PrayerRequestsManager";
import { DevotionalsManager } from "@/components/admin/DevotionalsManager";
import { MediaLinksManager } from "@/components/admin/MediaLinksManager";
import { AboutContentManager } from "@/components/admin/AboutContentManager";
import { UsersManager } from "@/components/admin/UsersManager";

const Admin = () => {
  const navigate = useNavigate();
  const { isAdmin, loading } = useAdminCheck();
  const [stats, setStats] = useState({
    users: 0,
    prayerRequests: 0,
    devotionals: 0,
    mediaLinks: 0
  });

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate("/");
    }
  }, [isAdmin, loading, navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      const [usersCount, prayerCount, devotionalsCount, mediaCount] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('prayer_requests').select('*', { count: 'exact', head: true }),
        supabase.from('devotionals').select('*', { count: 'exact', head: true }),
        supabase.from('media_links').select('*', { count: 'exact', head: true })
      ]);

      setStats({
        users: usersCount.count || 0,
        prayerRequests: prayerCount.count || 0,
        devotionals: devotionalsCount.count || 0,
        mediaLinks: mediaCount.count || 0
      });
    };

    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage TGLW Global content and users</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.users}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prayer Requests</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.prayerRequests}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Devotionals</CardTitle>
              <Book className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.devotionals}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Media Links</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.mediaLinks}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="prayer-requests" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="prayer-requests">Prayer Requests</TabsTrigger>
            <TabsTrigger value="devotionals">Devotionals</TabsTrigger>
            <TabsTrigger value="media">Media Links</TabsTrigger>
            <TabsTrigger value="about">About Content</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="prayer-requests">
            <PrayerRequestsManager />
          </TabsContent>

          <TabsContent value="devotionals">
            <DevotionalsManager />
          </TabsContent>

          <TabsContent value="media">
            <MediaLinksManager />
          </TabsContent>

          <TabsContent value="about">
            <AboutContentManager />
          </TabsContent>

          <TabsContent value="users">
            <UsersManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
