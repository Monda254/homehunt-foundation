import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Phone,
  Mail,
  User,
  Copy,
  Check,
  Send,
  Home,
  ShieldCheck,
  ArrowRight,
  MessageSquare,
  Sparkles,
  MapPin,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

function ContactPage() {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [messageText, setMessageText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactData = {
    name: "Georgy Maina",
    phone: "0741407159",
    whatsappUrl:
      "https://wa.me/254741407159?text=Hi%20Georgy%2C%20I%27m%20reaching%20out%20from%20HomeHunt.",
    email: "elvisgee735@gmail.com",
    mailtoUrl: "mailto:elvisgee735@gmail.com?subject=HomeHunt%20Inquiry",
    role: "Founder & Lead Developer",
    location: "Nairobi, Kenya",
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !senderEmail.trim() || !messageText.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    // 1. Store inquiry in Supabase database
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from("contact_inquiries").insert({
        name: senderName.trim(),
        email: senderEmail.trim(),
        message: messageText.trim(),
      });
      if (error) {
        console.warn("Supabase inquiry insert note:", error.message);
      }
    } catch (err) {
      console.warn("Supabase inquiry fallback:", err);
    }

    // 2. Open email client prefilled with message details
    const subject = encodeURIComponent(`HomeHunt Inquiry from ${senderName.trim()}`);
    const body = encodeURIComponent(
      `Hello Georgy,\n\nName: ${senderName.trim()}\nEmail: ${senderEmail.trim()}\n\nMessage:\n${messageText.trim()}\n\n-- Sent via HomeHunt Platform`,
    );
    const mailtoUrl = `mailto:${contactData.email}?subject=${subject}&body=${body}`;

    toast.success("Opening your email client & message logged!");

    setTimeout(() => {
      window.location.href = mailtoUrl;
      setIsSubmitting(false);
    }, 400);
  };

  const handleWhatsAppMessage = () => {
    if (senderName.trim() || messageText.trim()) {
      const text = encodeURIComponent(
        `Hi Georgy, my name is ${senderName.trim() || "a HomeHunt user"} (${senderEmail.trim() || "no email provided"}).\n\nMessage:\n${messageText.trim() || "I'd like to inquire about HomeHunt."}`,
      );
      window.open(`https://wa.me/254741407159?text=${text}`, "_blank");
    } else {
      window.open(contactData.whatsappUrl, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-accent/20">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur-md">
        <div className="container-page flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md transition-transform group-hover:scale-105">
              <Home className="h-5 w-5" />
            </div>
            <span className="font-display text-2xl font-bold tracking-tight text-primary">
              Home<span className="text-accent">Hunt</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link
              to="/homes"
              search={{ page: 1, limit: 20, sort: "RECOMMENDED", amenities: [] }}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Discover
            </Link>
            <Link
              to="/homes"
              search={{ page: 1, limit: 20, sort: "RECOMMENDED", amenities: [] }}
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Map Search
            </Link>
            <Link
              to="/viewings"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Tenancy Support
            </Link>
            <Link
              to="/contact"
              className="text-sm font-semibold text-primary border-b-2 border-primary py-1"
            >
              Contact Us
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/95 hover:shadow-md"
            >
              Portal Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative overflow-hidden py-12 lg:py-20">
        {/* Background Gradient Orbs */}
        <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[500px] w-full -translate-x-1/2 bg-gradient-to-b from-primary/10 via-accent/5 to-transparent blur-3xl" />

        <div className="container-page max-w-5xl">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-12"
          >
            {/* Header Title */}
            <motion.div variants={fadeUp} className="text-center space-y-4 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary border border-primary/20">
                <Sparkles className="h-3.5 w-3.5" />
                Direct Communication
              </div>
              <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground">
                Get in Touch with <span className="text-gradient-brand">Georgy</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                Have questions about HomeHunt properties, platform features, or partnerships? Reach
                out directly via WhatsApp or Email.
              </p>
            </motion.div>

            {/* Contact Cards Grid */}
            <div className="grid gap-6 md:grid-cols-3">
              {/* Card 1: Contact Person */}
              <motion.div
                variants={fadeUp}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-elevated transition-colors hover:border-primary/40"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary mb-4">
                  <User className="h-6 w-6" />
                </div>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Contact Person
                </h3>
                <p className="mt-1 font-display text-xl font-bold text-foreground">
                  {contactData.name}
                </p>
                <p className="mt-1 text-xs font-medium text-accent">{contactData.role}</p>
                <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground pt-3 border-t border-border/50">
                  <MapPin className="h-3.5 w-3.5 text-primary" /> {contactData.location}
                </div>
              </motion.div>

              {/* Card 2: Phone & WhatsApp Redirection */}
              <motion.div
                variants={fadeUp}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-elevated transition-colors hover:border-primary/40 flex flex-col justify-between"
              >
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mb-4">
                    <MessageCircle className="h-6 w-6" />
                  </div>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    WhatsApp & Phone
                  </h3>
                  <a
                    href={contactData.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 font-display text-xl font-bold text-foreground tracking-wide hover:text-emerald-600 transition-colors block"
                  >
                    {contactData.phone}
                  </a>
                  <p className="mt-1 text-xs text-muted-foreground">Instant WhatsApp chat & call</p>
                </div>

                <div className="mt-6 flex items-center gap-2 pt-3 border-t border-border/50">
                  <a
                    href={contactData.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow transition-all hover:bg-emerald-700"
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> Chat on WhatsApp
                  </a>
                  <button
                    onClick={() => handleCopy(contactData.phone, "Phone number")}
                    className="inline-flex items-center justify-center rounded-lg border border-border bg-secondary/50 p-2 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
                    title="Copy Phone Number"
                  >
                    {copiedField === "Phone number" ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Card 3: Email Redirection */}
              <motion.div
                variants={fadeUp}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-elevated transition-colors hover:border-primary/40 flex flex-col justify-between"
              >
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent mb-4">
                    <Mail className="h-6 w-6" />
                  </div>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Email Address
                  </h3>
                  <a
                    href={contactData.mailtoUrl}
                    className="mt-1 font-display text-base font-bold text-foreground break-all hover:text-accent transition-colors block"
                  >
                    {contactData.email}
                  </a>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Opens your default email client
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-2 pt-3 border-t border-border/50">
                  <a
                    href={contactData.mailtoUrl}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground shadow transition-all hover:bg-accent/95"
                  >
                    <Mail className="h-3.5 w-3.5" /> Send Email
                  </a>
                  <button
                    onClick={() => handleCopy(contactData.email, "Email address")}
                    className="inline-flex items-center justify-center rounded-lg border border-border bg-secondary/50 p-2 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
                    title="Copy Email Address"
                  >
                    {copiedField === "Email address" ? (
                      <Check className="h-4 w-4 text-verified" />
                    ) : (
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Quick Message Form Section */}
            <motion.div
              variants={fadeUp}
              className="rounded-3xl border border-border bg-card/80 p-8 sm:p-12 shadow-elevated backdrop-blur-md relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

              <div className="max-w-2xl mx-auto space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="font-display text-2xl font-bold text-foreground flex items-center justify-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" /> Send a Quick Message
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Your message will be saved to the database and launched directly via Email or
                    WhatsApp.
                  </p>
                </div>

                <form onSubmit={handleSendMessage} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="sender-name"
                        className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                      >
                        Your Name <span className="text-destructive">*</span>
                      </label>
                      <input
                        id="sender-name"
                        type="text"
                        required
                        placeholder="e.g. Jane Doe"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-secondary/30 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm transition-all"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="sender-email"
                        className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                      >
                        Your Email <span className="text-destructive">*</span>
                      </label>
                      <input
                        id="sender-email"
                        type="email"
                        required
                        placeholder="e.g. jane@example.com"
                        value={senderEmail}
                        onChange={(e) => setSenderEmail(e.target.value)}
                        className="w-full px-4 py-2.5 bg-secondary/30 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="sender-msg"
                      className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2"
                    >
                      Message <span className="text-destructive">*</span>
                    </label>
                    <textarea
                      id="sender-msg"
                      rows={4}
                      required
                      placeholder="Hi Georgy, I'd like to inquire about..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="w-full px-4 py-2.5 bg-secondary/30 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm transition-all resize-none"
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 pt-2">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/95 disabled:opacity-50 cursor-pointer"
                    >
                      <Mail className="h-4 w-4" />
                      {isSubmitting ? "Processing..." : "Send via Email"}
                    </motion.button>

                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={handleWhatsAppMessage}
                      className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 font-semibold text-white shadow-md transition-all hover:bg-emerald-700 cursor-pointer"
                    >
                      <MessageCircle className="h-4 w-4" /> Send via WhatsApp
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container-page flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Home className="h-3.5 w-3.5" />
            </div>
            <span className="font-display font-semibold text-primary">HomeHunt Foundation</span>
          </div>
          <p>© {new Date().getFullYear()} Georgy Maina. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
