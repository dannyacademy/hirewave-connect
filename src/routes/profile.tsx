import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "My Profile — HireWave" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  useEffect(() => { if (!loading && !user) navigate({ to: "/auth" }); }, [loading, user, navigate]);

  const { data: profile } = useQuery({
    queryKey: ["my-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data;
    },
  });

  const [form, setForm] = useState({ display_name: "", headline: "", bio: "", hourly_rate: "", location: "", skills: "" });
  useEffect(() => {
    if (profile) setForm({
      display_name: profile.display_name ?? "",
      headline: profile.headline ?? "",
      bio: profile.bio ?? "",
      hourly_rate: profile.hourly_rate?.toString() ?? "",
      location: profile.location ?? "",
      skills: (profile.skills ?? []).join(", "),
    });
  }, [profile]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Card>
          <CardHeader><CardTitle>My Profile</CardTitle></CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                const { error } = await supabase.from("profiles").update({
                  display_name: form.display_name,
                  headline: form.headline || null,
                  bio: form.bio || null,
                  hourly_rate: form.hourly_rate ? Number(form.hourly_rate) : null,
                  location: form.location || null,
                  skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
                }).eq("id", user.id);
                if (error) toast.error(error.message);
                else { toast.success("Profile saved"); qc.invalidateQueries({ queryKey: ["my-profile", user.id] }); }
              }}
            >
              <div><Label>Display name</Label><Input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} required /></div>
              <div><Label>Headline</Label><Input value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} placeholder="Senior Full-Stack Developer" /></div>
              <div><Label>Bio</Label><Textarea rows={5} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><Label>Hourly rate ($)</Label><Input type="number" min="0" value={form.hourly_rate} onChange={(e) => setForm({ ...form, hourly_rate: e.target.value })} /></div>
                <div><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
              </div>
              <div><Label>Skills (comma separated)</Label><Input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} /></div>
              <Button type="submit">Save Profile</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
