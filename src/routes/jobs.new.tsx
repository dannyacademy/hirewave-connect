import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const CATEGORIES = ["Web Development", "Mobile Development", "Design", "Writing", "Marketing", "Data Science", "Video & Animation", "Admin Support", "Other"];

export const Route = createFileRoute("/jobs/new")({
  head: () => ({ meta: [{ title: "Post a Job — HireWave" }] }),
  component: NewJob,
});

function NewJob() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (!loading && !user) navigate({ to: "/auth" }); }, [loading, user, navigate]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Web Development");
  const [budgetType, setBudgetType] = useState("fixed");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [duration, setDuration] = useState("");
  const [skills, setSkills] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <Card>
          <CardHeader><CardTitle>Post a New Job</CardTitle></CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!user) return;
                setBusy(true);
                // Ensure client role
                await supabase.from("user_roles").upsert({ user_id: user.id, role: "client" }, { onConflict: "user_id,role" });
                const { data, error } = await supabase.from("jobs").insert({
                  client_id: user.id,
                  title, description, category,
                  budget_type: budgetType,
                  budget_min: budgetMin ? Number(budgetMin) : null,
                  budget_max: budgetMax ? Number(budgetMax) : null,
                  duration: duration || null,
                  skills_required: skills.split(",").map((s) => s.trim()).filter(Boolean),
                }).select().single();
                setBusy(false);
                if (error) toast.error(error.message);
                else { toast.success("Job posted!"); navigate({ to: "/jobs/$id", params: { id: data.id } }); }
              }}
            >
              <div>
                <Label>Job title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Build a responsive landing page" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea rows={6} value={description} onChange={(e) => setDescription(e.target.value)} required />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Budget type</Label>
                  <Select value={budgetType} onValueChange={setBudgetType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed price</SelectItem>
                      <SelectItem value="hourly">Hourly rate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Min budget ($)</Label>
                  <Input type="number" min="0" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} />
                </div>
                <div>
                  <Label>Max budget ($)</Label>
                  <Input type="number" min="0" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} />
                </div>
                <div>
                  <Label>Duration</Label>
                  <Input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g. 2 weeks" />
                </div>
                <div>
                  <Label>Skills (comma separated)</Label>
                  <Input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="React, TypeScript, Tailwind" />
                </div>
              </div>
              <Button type="submit" disabled={busy}>{busy ? "Posting..." : "Post Job"}</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
