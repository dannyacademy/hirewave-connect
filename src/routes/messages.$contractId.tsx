import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Send, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/messages/$contractId")({
  component: ChatPage,
});

function ChatPage() {
  const { contractId } = Route.useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: contract } = useQuery({
    queryKey: ["contract", contractId],
    queryFn: async () => {
      const { data } = await supabase.from("contracts").select("*, jobs(title)").eq("id", contractId).maybeSingle();
      return data;
    },
  });

  const { data: messages } = useQuery({
    queryKey: ["messages", contractId],
    queryFn: async () => {
      const { data } = await supabase.from("messages").select("*").eq("contract_id", contractId).order("created_at");
      return data ?? [];
    },
  });

  useEffect(() => {
    const channel = supabase.channel(`messages-${contractId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `contract_id=eq.${contractId}` },
        () => qc.invalidateQueries({ queryKey: ["messages", contractId] }))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [contractId, qc]);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }); }, [messages]);

  const [text, setText] = useState("");
  if (!contract) return <Card className="p-6">Loading...</Card>;

  const markComplete = async () => {
    const { error } = await supabase.from("contracts").update({ status: "completed" }).eq("id", contractId);
    if (error) toast.error(error.message);
    else {
      await supabase.from("jobs").update({ status: "completed" }).eq("id", contract.job_id);
      toast.success("Contract marked complete");
      qc.invalidateQueries({ queryKey: ["contract", contractId] });
    }
  };

  return (
    <Card className="flex h-[70vh] flex-col">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div>
          <h2 className="font-semibold">{contract.jobs?.title}</h2>
          <p className="text-xs text-muted-foreground">${contract.amount} · <Badge variant="outline">{contract.status}</Badge></p>
        </div>
        {contract.status === "active" && (
          <Button size="sm" variant="outline" onClick={markComplete}>
            <CheckCircle2 className="mr-1 h-4 w-4" /> Mark Complete
          </Button>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages?.length === 0 && <p className="text-center text-sm text-muted-foreground">No messages yet. Say hi 👋</p>}
        {messages?.map((m) => {
          const mine = m.sender_id === user?.id;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${mine ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                {m.content}
              </div>
            </div>
          );
        })}
      </div>

      <form
        className="flex items-center gap-2 border-t border-border p-3"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!text.trim() || !user) return;
          const content = text;
          setText("");
          const { error } = await supabase.from("messages").insert({
            contract_id: contractId, sender_id: user.id, content,
          });
          if (error) { toast.error(error.message); setText(content); }
        }}
      >
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message..." disabled={contract.status !== "active"} />
        <Button type="submit" size="icon" disabled={contract.status !== "active"}><Send className="h-4 w-4" /></Button>
      </form>
    </Card>
  );
}
