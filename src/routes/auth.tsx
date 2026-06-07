import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({ mode: (s.mode as string) ?? "login" }),
  head: () => ({ meta: [{ title: "Sign in — HireWave" }] }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [user, loading, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-accent/30 to-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Briefcase className="h-6 w-6" />
          </div>
          <span className="text-2xl font-bold text-foreground">HireWave</span>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>Sign in or create an account to continue.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={mode === "signup" ? "signup" : "login"}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Log in</TabsTrigger>
                <TabsTrigger value="signup">Sign up</TabsTrigger>
              </TabsList>
              <TabsContent value="login"><LoginForm /></TabsContent>
              <TabsContent value="signup"><SignupForm /></TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="space-y-4 pt-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        setBusy(false);
        if (error) toast.error(error.message);
        else toast.success("Welcome back!");
      }}
    >
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <Button type="submit" className="w-full" disabled={busy}>{busy ? "Signing in..." : "Log in"}</Button>
    </form>
  );
}

function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"freelancer" | "client">("freelancer");
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="space-y-4 pt-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: name },
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });
        if (error) { setBusy(false); toast.error(error.message); return; }
        // If client wanted, add client role (default freelancer added by trigger)
        if (data.user && role === "client") {
          await supabase.from("user_roles").insert({ user_id: data.user.id, role: "client" });
        }
        setBusy(false);
        toast.success("Account created! Check your email to confirm.");
      }}
    >
      <div>
        <Label htmlFor="name">Display name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="email-s">Email</Label>
        <Input id="email-s" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="password-s">Password (min 6 chars)</Label>
        <Input id="password-s" type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <div>
        <Label>I'm here to</Label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setRole("freelancer")}
            className={`rounded-md border p-3 text-sm font-medium ${role === "freelancer" ? "border-primary bg-primary/10 text-primary" : "border-border"}`}>
            Find Work
          </button>
          <button type="button" onClick={() => setRole("client")}
            className={`rounded-md border p-3 text-sm font-medium ${role === "client" ? "border-primary bg-primary/10 text-primary" : "border-border"}`}>
            Hire Talent
          </button>
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={busy}>{busy ? "Creating..." : "Create account"}</Button>
    </form>
  );
}
