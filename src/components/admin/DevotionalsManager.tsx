import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Devotional {
  id: string;
  date: string;
  whatsapp_link: string;
  created_at: string;
}

export const DevotionalsManager = () => {
  const [devotionals, setDevotionals] = useState<Devotional[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDate, setNewDate] = useState("");
  const [newLink, setNewLink] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchDevotionals();
  }, []);

  const fetchDevotionals = async () => {
    try {
      const { data, error } = await supabase
        .from('devotionals')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setDevotionals(data || []);
    } catch (error) {
      console.error('Error fetching devotionals:', error);
      toast.error('Failed to load devotionals');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('devotionals')
        .insert({ date: newDate, whatsapp_link: newLink });

      if (error) throw error;
      toast.success('Devotional added successfully');
      setNewDate("");
      setNewLink("");
      fetchDevotionals();
    } catch (error) {
      console.error('Error adding devotional:', error);
      toast.error('Failed to add devotional');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from('devotionals')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;
      toast.success('Devotional deleted');
      fetchDevotionals();
    } catch (error) {
      console.error('Error deleting devotional:', error);
      toast.error('Failed to delete devotional');
    } finally {
      setDeleteId(null);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Devotionals</CardTitle>
          <CardDescription>Manage daily devotional WhatsApp links</CardDescription>
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
                <Label htmlFor="link">WhatsApp Link</Label>
                <Input
                  id="link"
                  type="url"
                  placeholder="https://wa.me/..."
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button type="submit">
              <Plus className="mr-2 h-4 w-4" />
              Add Devotional
            </Button>
          </form>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>WhatsApp Link</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devotionals.map((devotional) => (
                <TableRow key={devotional.id}>
                  <TableCell>{new Date(devotional.date).toLocaleDateString()}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    <a href={devotional.whatsapp_link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {devotional.whatsapp_link}
                    </a>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteId(devotional.id)}
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

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Devotional</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this devotional link? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
