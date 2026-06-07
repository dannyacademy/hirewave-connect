import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { useEffect } from "react";

export const Route = createFileRoute("/messages")({
  head: () => ({ meta: [{ title: "Messages — HireWave" }] }),
  component: MessagesLayout,
});

function MessagesLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (!loading && !user) navigate({ to: "/auth" }); }, [loading, user, navigate]);

  const { data: contracts } = useQuery({
    queryKey: ["contracts-list", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("contracts")
        .select("*, jobs(title)")
        .or(`client_id.eq.${user!.id},freelancer_id.eq.${user!.id}`)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto grid gap-4 px-4 py-8 md:grid-cols-[280px_1fr]">
        <aside>
          <h2 className="mb-3 text-lg font-semibold">Contracts</h2>
          <div className="space-y-2">
            {contracts?.length === 0 && <p className="text-sm text-muted-foreground">No contracts yet.</p>}
            {contracts?.map((c: any) => (
              <Link key={c.id} to="/messages/$contractId" params={{ contractId: c.id }}
                activeProps={{ className: "border-primary bg-accent" }}>
                <Card className="p-3 text-sm transition hover:border-primary/50">
                  <p className="line-clamp-1 font-medium">{c.jobs?.title}</p>
                  <p className="text-xs text-muted-foreground">${c.amount} · {c.status}</p>
                </Card>
              </Link>
            ))}
          </div>
        </aside>
        <div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
