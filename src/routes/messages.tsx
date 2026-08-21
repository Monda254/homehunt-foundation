import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/messages")({
  component: MessagesComponent,
});

function MessagesComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="surface-card p-8 max-w-md w-full text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent mx-auto mb-4">
          <MessageSquare className="h-6 w-6" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground">Secure Messaging</h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          The tenant-landlord communication and secure chat platform is scheduled for a future
          implementation phase.
        </p>
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-secondary/60 p-3 text-left border border-border/40">
          <AlertCircle className="h-5 w-5 text-accent shrink-0" />
          <p className="text-xs text-muted-foreground leading-snug">
            <strong>Phase 0 Active:</strong> We are currently establishing the core database
            schemas, API check layers, and route structures.
          </p>
        </div>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/95 shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" /> Go Back Home
          </Link>
        </div>
      </div>
    </div>
  );
}
