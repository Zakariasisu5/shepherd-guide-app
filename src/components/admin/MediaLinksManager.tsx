import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface MediaLink {
  id: string;
  date: string;
  youtube_link: string;
  created_at: string;
}

export const MediaLinksManager = () => {
  const [mediaLinks, setMediaLinks] = useState<MediaLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDate, setNewDate] = useState("");
  const [newLink, setNewLink] = useState("");

  useEffect(() => {
    fetchMediaLinks();
  }, []);

  const fetchMediaLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('media_links')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setMediaLinks(data || []);
    } catch (error) {
      console.error('Error fetching media links:', error);
      toast.error('Failed to load media links');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('media_links')
        .insert({ date: newDate, youtube_link: newLink });

      if (error) throw error;
      toast.success('Media link added successfully');
      setNewDate("");
      setNewLink("");
      fetchMediaLinks();
    } catch (error) {
      console.error('Error adding media link:', error);
      toast.error('Failed to add media link');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('media_links')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Media link deleted');
      fetchMediaLinks();
    } catch (error) {
      console.error('Error deleting media link:', error);
      toast.error('Failed to delete media link');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Media Links</CardTitle>
        <CardDescription>Manage daily meditation YouTube links</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAdd} className="mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="link">YouTube Link</Label>
              <Input
                id="link"
                type="url"
                placeholder="https://youtube.com/..."
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                required
              />
            </div>
          </div>
          <Button type="submit">
            <Plus className="mr-2 h-4 w-4" />
            Add Media Link
          </Button>
        </form>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>YouTube Link</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mediaLinks.map((media) => (
              <TableRow key={media.id}>
                <TableCell>{new Date(media.date).toLocaleDateString()}</TableCell>
                <TableCell className="max-w-xs truncate">
                  <a href={media.youtube_link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {media.youtube_link}
                  </a>
                </TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(media.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
