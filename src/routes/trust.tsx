import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  AlertTriangle,
  Lock,
  ArrowLeft,
  Info,
  CheckCircle2,
  AlertOctagon,
  Users,
  Compass,
} from "lucide-react";

export const Route = createFileRoute("/trust")({
  component: TrustCenterComponent,
});

function TrustCenterComponent() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-all"
          >
            <ArrowLeft className="h-4 w-4" /> Exit to Homepage
          </Link>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-secondary px-3 py-1 rounded-lg">
            Trust & Security Hub
          </span>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-primary/10 via-background to-background py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="inline-flex p-3 bg-primary/10 rounded-2xl text-primary border border-primary/20 mb-2">
            <ShieldCheck className="h-10 w-10 stroke-[1.2]" />
          </div>
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl tracking-tight text-foreground">
            HomeHunt Trust Center
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Find. Verify. Move In. Learn about our verification models, security practices, and safety instructions for renting in Kenya.
          </p>
        </div>
      </section>

      {/* Main Content Grid */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Core Trust Model */}
        <section className="space-y-6">
          <h2 className="font-display font-bold text-2xl text-foreground flex items-center gap-2">
            <Compass className="h-6 w-6 text-primary" /> Our Trust & Verification Model
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            HomeHunt operates a transparent, evidence-based verification layer. We never collapse different types of trust into a single score. Instead, we verify credentials and properties across separate dimensions so you know exactly what is backed by real evidence.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="p-5 bg-card border border-border rounded-2xl space-y-3">
              <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-verified/10 text-verified border border-verified/20 uppercase">
                Identity Verification
              </span>
              <h3 className="font-display font-bold text-base text-foreground">Verified Users</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We review government-issued identification uploads privately to ensure that the user representing themselves on the platform matches their real legal identity.
              </p>
            </div>

            <div className="p-5 bg-card border border-border rounded-2xl space-y-3">
              <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-verified/10 text-verified border border-verified/20 uppercase">
                Property Verification
              </span>
              <h3 className="font-display font-bold text-base text-foreground">Verified Property</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Property ownership or management authority is confirmed through title deed reviews, utility bill matching, and landmark existence checks in the local context.
              </p>
            </div>

            <div className="p-5 bg-card border border-border rounded-2xl space-y-3">
              <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-verified/10 text-verified border border-verified/20 uppercase">
                Agent / Manager Verification
              </span>
              <h3 className="font-display font-bold text-base text-foreground">Verified Landlord/Agent</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Agents, landlords, or caretakers claiming professional status must submit valid licensing, business verification, or property ownership documents before being marked verified.
              </p>
            </div>

            <div className="p-5 bg-card border border-border rounded-2xl space-y-3">
              <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-verified/10 text-verified border border-verified/20 uppercase">
                Listing Freshness
              </span>
              <h3 className="font-display font-bold text-base text-foreground">Availability Confirmed</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We track last confirmed availability timestamps. Owners must regularly re-validate that pricing is current and properties remain available.
              </p>
            </div>
          </div>
        </section>

        {/* Legal Boundary & Boundary Disclaimers */}
        <section className="bg-secondary/40 border border-border/80 p-6 rounded-2xl space-y-4">
          <div className="flex gap-2 items-center text-accent">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            <h3 className="font-display font-bold text-base text-foreground">Legal & Compliance Boundary</h3>
          </div>
          <div className="text-xs text-muted-foreground space-y-3 leading-relaxed">
            <p>
              HomeHunt verifies specified documents and records submitted by owners or users. We do <strong>NOT</strong> provide government certifications, safety guarantees, or financial insurance.
            </p>
            <p>
              A verified property means HomeHunt has checked ownership or existence records. It does not eliminate transaction risks entirely. Users must practice normal diligence, inspect properties in person before signing agreements, and verify identities physically.
            </p>
          </div>
        </section>

        {/* Safety Guidance - Kenyan Real Estate Context */}
        <section className="space-y-6">
          <h2 className="font-display font-bold text-2xl text-foreground flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-accent" /> Safety & Fraud Prevention Guidance
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Rental searching in Kenya involves unique challenges, including fake agents, duplicate listings, and advance deposit scams. Follow these essential safety guidelines to protect yourself:
          </p>

          <div className="space-y-4">
            <div className="flex gap-4 p-5 bg-card border rounded-2xl items-start">
              <div className="p-2 bg-destructive/10 text-destructive rounded-lg shrink-0">
                <AlertOctagon className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-foreground text-sm">Never Send Deposits Before Physical Viewing</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Be extremely cautious of agents asking for "booking fees" or "commitment fees" via MPesa before you physically visit the property. Legit property managers will show you the unit first.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-5 bg-card border rounded-2xl items-start">
              <div className="p-2 bg-accent/10 text-accent rounded-lg shrink-0">
                <Users className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-foreground text-sm">Beware of Off-Platform WhatsApp Requests</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  While we support WhatsApp and phone communication, always cross-check prices and details against the official HomeHunt listing. If an agent tries to change the price or terms via chat, report them immediately.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-5 bg-card border rounded-2xl items-start">
              <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0">
                <Info className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-foreground text-sm">Verify Landlords & Caretakers Physically</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  When visiting the estate or property, ask local caretakers or neighbors to confirm that the person presenting themselves has the legal right to lease units on that property.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How to Report & Privacy */}
        <section className="grid gap-6 sm:grid-cols-2">
          <div className="p-5 border rounded-2xl bg-card space-y-3">
            <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-destructive" /> Reporting Suspicious Listings
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every public listing includes a <strong>"Report this listing"</strong> button. If you spot wrong pricing, duplicate photos, misleading locations, or suspicious deposit requests, file a report. We process reports via our moderation queue and flag high-risk agents.
            </p>
          </div>

          <div className="p-5 border rounded-2xl bg-card space-y-3">
            <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" /> Privacy & Document Security
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Identity documents, utility bills, and title deeds submitted for verification are stored securely in encrypted private buckets. We never expose them to public searches, other landlords, or tenants. Only authorized reviewers have temporary access.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
