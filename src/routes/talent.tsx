import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/talent")({
  head: () => ({ meta: [{ title: "Find Talent — HireWave" }] }),
  component: TalentPage,
});

function TalentPage() {
  const [q, setQ] = useState("");
  const { data: talents } = useQuery({
    queryKey: ["talents", q],
    queryFn: async () => {
      let query = supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(50);
      if (q.trim()) query = query.or(`display_name.ilike.%${q}%,headline.ilike.%${q}%`);
      const { data } = await query;
      return data ?? [];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">Find Talent</h1>
        <p className="mt-1 text-muted-foreground">Browse freelancers and view their profiles.</p>

        <div className="mt-6 flex items-center gap-2 rounded-md border border-border bg-card p-2">
          <Search className="ml-2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or skill..." className="border-0 shadow-none focus-visible:ring-0" />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {talents?.length === 0 && <p className="text-muted-foreground">No freelancers yet.</p>}
          {talents?.map((t) => (
            <Link key={t.id} to="/profile/$id" params={{ id: t.id }}>
              <Card className="p-5 transition hover:border-primary/50">
                <h3 className="font-semibold">{t.display_name}</h3>
                {t.headline && <p className="text-sm text-muted-foreground">{t.headline}</p>}
                {t.hourly_rate && <p className="mt-1 text-sm">${t.hourly_rate}/hr</p>}
                {(t.skills?.length ?? 0) > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {t.skills!.slice(0, 5).map((s: string) => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
                  </div>
                )}
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
