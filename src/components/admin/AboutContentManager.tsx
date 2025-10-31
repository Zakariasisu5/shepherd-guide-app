import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface AboutContent {
  id: string;
  section: string;
  content: string;
  updated_at: string;
}

export const AboutContentManager = () => {
  const [content, setContent] = useState<AboutContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<string>("");
  const [editingContent, setEditingContent] = useState<string>("");

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('about_content')
        .select('*')
        .order('section');

      if (error) throw error;
      setContent(data || []);
    } catch (error) {
      console.error('Error fetching about content:', error);
      toast.error('Failed to load about content');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (section: string) => {
    try {
      const existing = content.find(c => c.section === section);
      
      if (existing) {
        const { error } = await supabase
          .from('about_content')
          .update({ content: editingContent })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('about_content')
          .insert({ section, content: editingContent });

        if (error) throw error;
      }

      toast.success('Content updated successfully');
      setEditingSection("");
      setEditingContent("");
      fetchContent();
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Failed to save content');
    }
  };

  const sections = ['mission', 'vision', 'location', 'man_of_god'];

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>About Content</CardTitle>
        <CardDescription>Manage church information and about sections</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {sections.map((section) => {
          const sectionContent = content.find(c => c.section === section);
          const isEditing = editingSection === section;

          return (
            <div key={section} className="border rounded-lg p-4">
              <Label className="text-lg font-semibold capitalize mb-2 block">
                {section.replace('_', ' ')}
              </Label>
              {isEditing ? (
                <div className="space-y-2">
                  <Textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    rows={6}
                    className="w-full"
                  />
                  <div className="flex gap-2">
                    <Button onClick={() => handleSave(section)}>Save</Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingSection("");
                        setEditingContent("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-muted-foreground mb-2">
                    {sectionContent?.content || 'No content yet'}
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingSection(section);
                      setEditingContent(sectionContent?.content || "");
                    }}
                  >
                    Edit
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
