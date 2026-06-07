import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect } from "react";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — HireWave" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (!loading && !user) navigate({ to: "/auth" }); }, [loading, user, navigate]);

  const { data: myJobs } = useQuery({
    queryKey: ["my-jobs", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("jobs").select("*").eq("client_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: myProposals } = useQuery({
    queryKey: ["my-proposals", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("proposals").select("*, jobs(title, status)").eq("freelancer_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: myContracts } = useQuery({
    queryKey: ["my-contracts", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("contracts").select("*, jobs(title)").or(`client_id.eq.${user!.id},freelancer_id.eq.${user!.id}`).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Manage your jobs, proposals, and contracts.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <StatCard label="My Jobs Posted" value={myJobs?.length ?? 0} />
          <StatCard label="My Proposals" value={myProposals?.length ?? 0} />
          <StatCard label="Active Contracts" value={myContracts?.filter((c) => c.status === "active").length ?? 0} />
        </div>

        <Tabs defaultValue="jobs" className="mt-8">
          <TabsList>
            <TabsTrigger value="jobs">My Jobs</TabsTrigger>
            <TabsTrigger value="proposals">My Proposals</TabsTrigger>
            <TabsTrigger value="contracts">Contracts</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="mt-4 space-y-3">
            {myJobs?.length === 0 && <p className="text-muted-foreground">You haven't posted any jobs yet. <Link to="/jobs/new" className="text-primary underline">Post one</Link></p>}
            {myJobs?.map((j) => (
              <Link key={j.id} to="/jobs/$id" params={{ id: j.id }}>
                <Card className="p-4 transition hover:border-primary/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{j.title}</h3>
                      <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(j.created_at), { addSuffix: true })}</p>
                    </div>
                    <Badge>{j.status}</Badge>
                  </div>
                </Card>
              </Link>
            ))}
          </TabsContent>

          <TabsContent value="proposals" className="mt-4 space-y-3">
            {myProposals?.length === 0 && <p className="text-muted-foreground">No proposals yet. <Link to="/jobs" className="text-primary underline">Browse jobs</Link></p>}
            {myProposals?.map((p: any) => (
              <Link key={p.id} to="/jobs/$id" params={{ id: p.job_id }}>
                <Card className="p-4 transition hover:border-primary/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{p.jobs?.title}</h3>
                      <p className="text-xs text-muted-foreground">Bid: ${p.bid_amount}</p>
                    </div>
                    <Badge variant={p.status === "accepted" ? "default" : "outline"}>{p.status}</Badge>
                  </div>
                </Card>
              </Link>
            ))}
          </TabsContent>

          <TabsContent value="contracts" className="mt-4 space-y-3">
            {myContracts?.length === 0 && <p className="text-muted-foreground">No active contracts.</p>}
            {myContracts?.map((c: any) => (
              <Link key={c.id} to="/messages/$contractId" params={{ contractId: c.id }}>
                <Card className="p-4 transition hover:border-primary/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{c.jobs?.title}</h3>
                      <p className="text-xs text-muted-foreground">${c.amount} · {c.status}</p>
                    </div>
                    <Badge>{c.status}</Badge>
                  </div>
                </Card>
              </Link>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle></CardHeader>
      <CardContent><p className="text-3xl font-bold text-foreground">{value}</p></CardContent>
    </Card>
  );
}
