import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Briefcase, Users, Shield, Zap } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HireWave — Hire Top Freelance Talent" },
      { name: "description", content: "Post jobs, hire skilled freelancers, and manage contracts on HireWave." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="border-b border-border bg-gradient-to-b from-accent/30 to-background">
        <div className="container mx-auto px-4 py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-6xl">
              Hire experts. Get work done.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              HireWave connects clients with skilled freelancers across design, development, writing, marketing and more.
            </p>

            <form
              onSubmit={(e) => { e.preventDefault(); navigate({ to: "/jobs", search: { q } as any }); }}
              className="mx-auto mt-10 flex max-w-2xl items-center gap-2 rounded-full border border-border bg-card p-2 shadow-sm"
            >
              <Search className="ml-3 h-5 w-5 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search for any work — e.g. React developer, logo design"
                className="border-0 bg-transparent shadow-none focus-visible:ring-0"
              />
              <Button type="submit" className="rounded-full">Search</Button>
            </form>

            <div className="mt-6 flex flex-wrap justify-center gap-2 text-sm text-muted-foreground">
              <span>Popular:</span>
              {["Web Development", "Logo Design", "Content Writing", "Mobile Apps"].map((t) => (
                <Link key={t} to="/jobs" search={{ q: t } as any} className="hover:text-primary hover:underline">{t}</Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-8 md:grid-cols-4">
          {[
            { icon: Briefcase, title: "Post a job", desc: "Tell us what you need. It's free." },
            { icon: Users, title: "Get proposals", desc: "Receive bids from qualified freelancers." },
            { icon: Zap, title: "Hire instantly", desc: "Pick the right talent and start work." },
            { icon: Shield, title: "Track progress", desc: "Message and manage contracts in one place." },
          ].map((f) => (
            <div key={f.title} className="rounded-lg border border-border bg-card p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-accent/20">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold text-foreground">Ready to get started?</h2>
          <p className="mt-3 text-muted-foreground">Join HireWave and start hiring or earning today.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button size="lg" onClick={() => navigate({ to: "/auth", search: { mode: "signup" } as any })}>Create account</Button>
            <Button size="lg" variant="outline" onClick={() => navigate({ to: "/jobs" })}>Browse jobs</Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} HireWave. All rights reserved.
      </footer>
    </div>
  );
}
