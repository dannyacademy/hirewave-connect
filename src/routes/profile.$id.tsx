import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, DollarSign } from "lucide-react";

export const Route = createFileRoute("/profile/$id")({
  head: () => ({ meta: [{ title: "Profile — HireWave" }] }),
  component: PublicProfile,
});

function PublicProfile() {
  const { id } = Route.useParams();
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto max-w-2xl px-4 py-8">
        {isLoading && <p>Loading...</p>}
        {!isLoading && !profile && <p>Profile not found.</p>}
        {profile && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{profile.display_name}</CardTitle>
              {profile.headline && <p className="text-muted-foreground">{profile.headline}</p>}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {profile.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{profile.location}</span>}
                {profile.hourly_rate && <span className="flex items-center gap-1"><DollarSign className="h-4 w-4" />${profile.hourly_rate}/hr</span>}
              </div>
              {profile.bio && <p className="whitespace-pre-wrap text-sm">{profile.bio}</p>}
              {(profile.skills?.length ?? 0) > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-semibold">Skills</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills!.map((s: string) => <Badge key={s} variant="secondary">{s}</Badge>)}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
