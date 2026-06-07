import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/messages/")({
  component: () => (
    <Card className="flex h-[60vh] items-center justify-center p-8 text-center text-muted-foreground">
      Select a contract to start messaging.
    </Card>
  ),
});
