import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Search, MapPin, DollarSign, Clock } from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/jobs")({
  validateSearch: (s: Record<string, unknown>) => ({ q: (s.q as string) ?? "" }),
  head: () => ({ meta: [{ title: "Browse Jobs — HireWave" }] }),
  component: JobsPage,
});

function JobsPage() {
  const { q: initialQ } = Route.useSearch();
  const [q, setQ] = useState(initialQ);

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["jobs", q],
    queryFn: async () => {
      let query = supabase.from("jobs").select("*").eq("status", "open").order("created_at", { ascending: false });
      if (q.trim()) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,category.ilike.%${q}%`);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground">Browse Jobs</h1>
        <p className="mt-1 text-muted-foreground">Find your next opportunity from the latest open jobs.</p>

        <div className="mt-6 flex items-center gap-2 rounded-md border border-border bg-card p-2">
          <Search className="ml-2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search jobs..." className="border-0 shadow-none focus-visible:ring-0" />
        </div>

        <div className="mt-6 space-y-4">
          {isLoading && <p className="text-muted-foreground">Loading...</p>}
          {jobs && jobs.length === 0 && (
            <Card className="p-8 text-center text-muted-foreground">No jobs yet. Be the first to post one!</Card>
          )}
          {jobs?.map((j) => (
            <Link key={j.id} to="/jobs/$id" params={{ id: j.id }} className="block">
              <Card className="p-6 transition hover:border-primary/50 hover:shadow-md">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground hover:text-primary">{j.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{j.description}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />
                        {j.budget_type === "hourly" ? "Hourly" : "Fixed"} · ${j.budget_min ?? 0} – ${j.budget_max ?? 0}
                      </span>
                      {j.duration && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{j.duration}</span>}
                      <span>{formatDistanceToNow(new Date(j.created_at), { addSuffix: true })}</span>
                    </div>
                    {j.skills_required && j.skills_required.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {j.skills_required.slice(0, 6).map((s: string) => (
                          <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <Badge variant="outline">{j.category}</Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
