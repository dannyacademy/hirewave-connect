import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { DollarSign, Clock, ArrowLeft, Check, X } from "lucide-react";

export const Route = createFileRoute("/jobs/$id")({
  head: () => ({ meta: [{ title: "Job Details — HireWave" }] }),
  component: JobDetail,
});

function JobDetail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data: job, isLoading } = useQuery({
    queryKey: ["job", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("jobs").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: clientProfile } = useQuery({
    queryKey: ["profile", job?.client_id],
    enabled: !!job?.client_id,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", job!.client_id).maybeSingle();
      return data;
    },
  });

  const { data: proposals } = useQuery({
    queryKey: ["proposals", id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("proposals").select("*").eq("job_id", id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div className="min-h-screen bg-background"><Header /><div className="container mx-auto p-8">Loading...</div></div>;
  if (!job) return <div className="min-h-screen bg-background"><Header /><div className="container mx-auto p-8">Job not found.</div></div>;

  const isOwner = user?.id === job.client_id;
  const myProposal = proposals?.find((p) => p.freelancer_id === user?.id);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Link to="/jobs" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to jobs
        </Link>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">{job.title}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Posted by {clientProfile?.display_name ?? "—"} · {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                </p>
              </div>
              <Badge>{job.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-1"><DollarSign className="h-4 w-4 text-primary" />
                {job.budget_type === "hourly" ? "Hourly" : "Fixed"} · ${job.budget_min ?? 0} – ${job.budget_max ?? 0}
              </span>
              {job.duration && <span className="flex items-center gap-1"><Clock className="h-4 w-4 text-primary" />{job.duration}</span>}
              <Badge variant="outline">{job.category}</Badge>
            </div>
            <div>
              <h3 className="mb-2 font-semibold">Description</h3>
              <p className="whitespace-pre-wrap text-sm text-foreground">{job.description}</p>
            </div>
            {(job.skills_required?.length ?? 0) > 0 && (
              <div>
                <h3 className="mb-2 font-semibold">Skills Required</h3>
                <div className="flex flex-wrap gap-1.5">
                  {job.skills_required!.map((s: string) => <Badge key={s} variant="secondary">{s}</Badge>)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {!user && (
          <Card className="mt-6 p-6 text-center">
            <p className="text-muted-foreground">Sign in to submit a proposal.</p>
            <Button className="mt-3" onClick={() => navigate({ to: "/auth" })}>Sign in</Button>
          </Card>
        )}

        {user && !isOwner && job.status === "open" && (
          myProposal ? (
            <Card className="mt-6 p-6">
              <h3 className="font-semibold">Your proposal</h3>
              <p className="mt-2 text-sm text-muted-foreground">Bid: ${myProposal.bid_amount} · Status: <Badge>{myProposal.status}</Badge></p>
              <p className="mt-2 whitespace-pre-wrap text-sm">{myProposal.cover_letter}</p>
            </Card>
          ) : (
            <ProposalForm jobId={job.id} onDone={() => qc.invalidateQueries({ queryKey: ["proposals", id] })} />
          )
        )}

        {isOwner && proposals && (
          <div className="mt-6 space-y-3">
            <h2 className="text-xl font-semibold">Proposals ({proposals.length})</h2>
            {proposals.length === 0 && <p className="text-sm text-muted-foreground">No proposals yet.</p>}
            {proposals.map((p) => (
              <ProposalCard key={p.id} proposal={p} job={job} onChange={() => qc.invalidateQueries({ queryKey: ["proposals", id] })} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProposalForm({ jobId, onDone }: { jobId: string; onDone: () => void }) {
  const { user } = useAuth();
  const [cover, setCover] = useState("");
  const [bid, setBid] = useState("");
  const [days, setDays] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <Card className="mt-6">
      <CardHeader><CardTitle>Submit a Proposal</CardTitle></CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!user) return;
            setBusy(true);
            const { error } = await supabase.from("proposals").insert({
              job_id: jobId,
              freelancer_id: user.id,
              cover_letter: cover,
              bid_amount: Number(bid),
              estimated_days: days ? Number(days) : null,
            });
            setBusy(false);
            if (error) toast.error(error.message);
            else { toast.success("Proposal submitted!"); onDone(); }
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Your bid ($)</Label>
              <Input type="number" min="1" step="0.01" value={bid} onChange={(e) => setBid(e.target.value)} required />
            </div>
            <div>
              <Label>Estimated days</Label>
              <Input type="number" min="1" value={days} onChange={(e) => setDays(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Cover letter</Label>
            <Textarea rows={6} value={cover} onChange={(e) => setCover(e.target.value)} required placeholder="Why are you the right fit for this job?" />
          </div>
          <Button type="submit" disabled={busy}>{busy ? "Submitting..." : "Submit Proposal"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}

function ProposalCard({ proposal, job, onChange }: { proposal: any; job: any; onChange: () => void }) {
  const { user } = useAuth();
  const { data: freelancer } = useQuery({
    queryKey: ["profile", proposal.freelancer_id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", proposal.freelancer_id).maybeSingle();
      return data;
    },
  });

  const accept = async () => {
    const { data: contract, error: cErr } = await supabase.from("contracts").insert({
      job_id: job.id, proposal_id: proposal.id, client_id: user!.id,
      freelancer_id: proposal.freelancer_id, amount: proposal.bid_amount,
    }).select().single();
    if (cErr) { toast.error(cErr.message); return; }
    await supabase.from("proposals").update({ status: "accepted" }).eq("id", proposal.id);
    await supabase.from("jobs").update({ status: "in_progress" }).eq("id", job.id);
    toast.success("Proposal accepted — contract created!");
    onChange();
  };
  const reject = async () => {
    await supabase.from("proposals").update({ status: "rejected" }).eq("id", proposal.id);
    toast.success("Rejected");
    onChange();
  };

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Link to="/profile/$id" params={{ id: proposal.freelancer_id }} className="font-medium hover:text-primary">
              {freelancer?.display_name ?? "Freelancer"}
            </Link>
            <Badge variant="outline">{proposal.status}</Badge>
          </div>
          {freelancer?.headline && <p className="text-xs text-muted-foreground">{freelancer.headline}</p>}
          <p className="mt-1 text-sm">
            Bid: <strong>${proposal.bid_amount}</strong>
            {proposal.estimated_days && <> · {proposal.estimated_days} days</>}
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{proposal.cover_letter}</p>
        </div>
        {proposal.status === "pending" && job.status === "open" && (
          <div className="flex flex-col gap-2">
            <Button size="sm" onClick={accept}><Check className="mr-1 h-4 w-4" />Accept</Button>
            <Button size="sm" variant="outline" onClick={reject}><X className="mr-1 h-4 w-4" />Reject</Button>
          </div>
        )}
      </div>
    </Card>
  );
}
