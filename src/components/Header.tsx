import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Briefcase, LogOut, MessageSquare, User as UserIcon, LayoutDashboard, Plus } from "lucide-react";

export function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Briefcase className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">HireWave</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link to="/jobs" activeProps={{ className: "bg-accent" }} className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent">
            Find Work
          </Link>
          <Link to="/talent" activeProps={{ className: "bg-accent" }} className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent">
            Find Talent
          </Link>
          {user && (
            <>
              <Link to="/dashboard" activeProps={{ className: "bg-accent" }} className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent">
                <LayoutDashboard className="mr-1 inline h-4 w-4" />
                Dashboard
              </Link>
              <Link to="/messages" activeProps={{ className: "bg-accent" }} className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent">
                <MessageSquare className="mr-1 inline h-4 w-4" />
                Messages
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button size="sm" onClick={() => navigate({ to: "/jobs/new" })}>
                <Plus className="mr-1 h-4 w-4" /> Post Job
              </Button>
              <Button size="sm" variant="ghost" onClick={() => navigate({ to: "/profile" })}>
                <UserIcon className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={async () => { await signOut(); navigate({ to: "/" }); }}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="ghost" onClick={() => navigate({ to: "/auth" })}>Log in</Button>
              <Button size="sm" onClick={() => navigate({ to: "/auth", search: { mode: "signup" } as any })}>Sign up</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
