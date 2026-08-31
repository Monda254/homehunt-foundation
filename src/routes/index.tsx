import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/features/identity/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { getPublicListings } from "@/features/properties/properties.functions";
import { ListingCard, type ListingCardData } from "@/components/PropertyCard";
import { motion } from "framer-motion";
import { staggerContainerVariants, fadeUpVariants } from "@/components/motion/motionVariants";
import { AnimatedModal } from "@/components/motion/AnimatedModal";
import {
  Search,
  MapPin,
  Building,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  ArrowRight,
  Map,
  MessageSquare,
  Home,
  Menu,
  X,
  DollarSign,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const { isAuthenticated, logout } = useAuth();

  const { data: listings, isLoading } = useQuery({
    queryKey: ["public-listings"],
    queryFn: () => getPublicListings(),
  });

  // Search state
  const [location, setLocation] = useState("Kilimani, Nairobi");
  const [propType, setPropType] = useState("2 Bedroom Apartment");
  const [budget, setBudget] = useState("35,000 - 50,000");

  const handleSearch = () => {
    let county: string | undefined;
    let q: string | undefined;
    if (location === "Kilimani, Nairobi") {
      county = "Nairobi";
      q = "Kilimani";
    } else if (location === "Westlands, Nairobi") {
      county = "Nairobi";
      q = "Westlands";
    } else if (location === "Kileleshwa, Nairobi") {
      county = "Nairobi";
      q = "Kileleshwa";
    } else if (location === "Syokimau, Machakos") {
      county = "Machakos";
      q = "Syokimau";
    } else if (location === "Nyali, Mombasa") {
      county = "Mombasa";
      q = "Nyali";
    }

    let propertyType: string | undefined;
    let unitType: string | undefined;
    let bedrooms: number | undefined;
    if (propType === "Bedsitter") {
      propertyType = "BEDSITTER";
      unitType = "BEDSITTER";
    } else if (propType === "1 Bedroom Apartment") {
      propertyType = "APARTMENT";
      bedrooms = 1;
    } else if (propType === "2 Bedroom Apartment") {
      propertyType = "APARTMENT";
      bedrooms = 2;
    } else if (propType === "3 Bedroom Apartment") {
      propertyType = "APARTMENT";
      bedrooms = 3;
    } else if (propType === "Townhouse") {
      propertyType = "TOWNHOUSE";
    }

    let minPrice: number | undefined;
    let maxPrice: number | undefined;
    if (budget === "10,000 - 15,000") {
      minPrice = 10000;
      maxPrice = 15000;
    } else if (budget === "15,000 - 25,000") {
      minPrice = 15000;
      maxPrice = 25000;
    } else if (budget === "25,000 - 35,000") {
      minPrice = 25000;
      maxPrice = 35000;
    } else if (budget === "35,000 - 50,000") {
      minPrice = 35000;
      maxPrice = 50000;
    } else if (budget === "50,000+") {
      minPrice = 50000;
    }

    navigate({
      to: "/homes",
      search: {
        q,
        county,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        propertyType: propertyType as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        unitType: unitType as any,
        bedrooms,
        minPrice,
        maxPrice,
        sort: "RECOMMENDED",
        page: 1,
        limit: 20,
        amenities: [],
      },
    });
  };

  const openPhaseNotice = (featureName: string) => {
    setActiveModal(featureName);
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-accent/20">
      {/* Header / Navigation */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur-md">
        <div className="container-page flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md transition-transform hover:scale-105">
              <Home className="h-5 w-5" />
            </div>
            <span className="font-display text-2xl font-bold tracking-tight text-primary">
              Home<span className="text-accent">Hunt</span>
            </span>
            <span className="hidden rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground md:inline-block border border-border">
              Phase 6 Active
            </span>
          </div>

          {/* Desktop Nav */}
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
              <Map className="h-4 w-4" /> Map Search
            </Link>
            <Link
              to="/viewings"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Tenancy Support
            </Link>
            <Link
              to="/properties"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              For Landlords
            </Link>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-sm font-medium text-muted-foreground hover:text-primary"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => logout()}
                  className="inline-flex items-center justify-center rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-foreground border border-border shadow-sm transition-all hover:bg-secondary/80 hover:translate-y-[-1px] active:translate-y-[0px] cursor-pointer"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-muted-foreground hover:text-primary"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/95 hover:shadow-md hover:translate-y-[-1px] active:translate-y-[0px]"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-secondary md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-30 bg-background/98 backdrop-blur-lg md:hidden animate-in fade-in duration-200">
          <div className="container-page py-6 flex flex-col gap-5">
            <div className="flex flex-col gap-4 border-b border-border/60 pb-6">
              <Link
                to="/homes"
                search={{ page: 1, limit: 20, sort: "RECOMMENDED", amenities: [] }}
                onClick={() => setMobileMenuOpen(false)}
                className="text-left text-lg font-medium text-muted-foreground hover:text-primary"
              >
                Discover Rentals
              </Link>
              <Link
                to="/homes"
                search={{ page: 1, limit: 20, sort: "RECOMMENDED", amenities: [] }}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-left text-lg font-medium text-muted-foreground hover:text-primary"
              >
                <Map className="h-5 w-5" /> Map Search
              </Link>
              <Link
                to="/viewings"
                onClick={() => setMobileMenuOpen(false)}
                className="text-left text-lg font-medium text-muted-foreground hover:text-primary"
              >
                Tenancy Support
              </Link>
              <Link
                to="/properties"
                onClick={() => setMobileMenuOpen(false)}
                className="text-left text-lg font-medium text-muted-foreground hover:text-primary"
              >
                For Landlords
              </Link>
            </div>
            <div className="flex flex-col gap-3 pt-2">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full rounded-lg border border-border py-2.5 text-center font-medium text-muted-foreground hover:bg-secondary"
                  >
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full rounded-lg bg-destructive py-2.5 text-center font-semibold text-destructive-foreground shadow cursor-pointer"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full rounded-lg border border-border py-2.5 text-center font-medium text-muted-foreground hover:bg-secondary"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full rounded-lg bg-primary py-2.5 text-center font-semibold text-primary-foreground shadow"
                  >
                    Create Account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 lg:py-20">
        <div className="container-page grid gap-12 lg:grid-cols-12 lg:items-center">
          <motion.div
            variants={staggerContainerVariants}
            initial="initial"
            animate="animate"
            className="flex flex-col lg:col-span-7"
          >
            <motion.div
              variants={fadeUpVariants}
              className="inline-flex max-w-fit items-center gap-1.5 rounded-full bg-secondary/80 px-3.5 py-1.5 text-xs font-semibold text-primary border border-primary/10 mb-6"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-verified" />
              100% Scam-Free Rental Guarantee
            </motion.div>
            <motion.h1
              variants={fadeUpVariants}
              className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground leading-[1.1]"
            >
              Find your next home in Kenya,{" "}
              <span className="text-gradient-brand">with confidence.</span>
            </motion.h1>
            <motion.p
              variants={fadeUpVariants}
              className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed"
            >
              Tired of deposit scams, fake listings, and middleman viewing fees? HomeHunt verifies
              every landlord, property, and listing so you can search securely.
            </motion.p>

            {/* Mock Search Bar */}
            <motion.div
              variants={fadeUpVariants}
              className="mt-8 rounded-2xl border border-border bg-card p-4 shadow-elevated"
            >
              <div className="grid gap-3 sm:grid-cols-3">
                {/* Location Input */}
                <div className="flex flex-col gap-1.5 rounded-xl bg-secondary/30 p-3 border border-border/40 hover:border-primary/20 transition-colors">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <MapPin className="h-3.5 w-3.5 text-primary" /> Location
                  </span>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="bg-transparent text-sm font-medium text-foreground focus:outline-none cursor-pointer"
                  >
                    <option value="Kilimani, Nairobi">Kilimani, Nairobi</option>
                    <option value="Westlands, Nairobi">Westlands, Nairobi</option>
                    <option value="Kileleshwa, Nairobi">Kileleshwa, Nairobi</option>
                    <option value="Syokimau, Machakos">Syokimau, Machakos</option>
                    <option value="Nyali, Mombasa">Nyali, Mombasa</option>
                  </select>
                </div>

                {/* Property Type */}
                <div className="flex flex-col gap-1.5 rounded-xl bg-secondary/30 p-3 border border-border/40 hover:border-primary/20 transition-colors">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <Building className="h-3.5 w-3.5 text-primary" /> Type
                  </span>
                  <select
                    value={propType}
                    onChange={(e) => setPropType(e.target.value)}
                    className="bg-transparent text-sm font-medium text-foreground focus:outline-none cursor-pointer"
                  >
                    <option value="Bedsitter">Bedsitter</option>
                    <option value="1 Bedroom Apartment">1 Bedroom Apartment</option>
                    <option value="2 Bedroom Apartment">2 Bedroom Apartment</option>
                    <option value="3 Bedroom Apartment">3 Bedroom Apartment</option>
                    <option value="Townhouse">Townhouse</option>
                  </select>
                </div>

                {/* Budget */}
                <div className="flex flex-col gap-1.5 rounded-xl bg-secondary/30 p-3 border border-border/40 hover:border-primary/20 transition-colors">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <DollarSign className="h-3.5 w-3.5 text-primary" /> Monthly Budget (KSh)
                  </span>
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="bg-transparent text-sm font-medium text-foreground focus:outline-none cursor-pointer"
                  >
                    <option value="10,000 - 15,000">10,000 - 15,000</option>
                    <option value="15,000 - 25,000">15,000 - 25,000</option>
                    <option value="25,000 - 35,000">25,000 - 35,000</option>
                    <option value="35,000 - 50,000">35,000 - 50,000</option>
                    <option value="50,000+">50,000+</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleSearch}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/95 hover:shadow-lg active:scale-[0.99]"
              >
                <Search className="h-5 w-5" /> Search Available Properties
              </button>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              variants={fadeUpVariants}
              className="mt-8 grid grid-cols-3 gap-4 border-t border-border/60 pt-6"
            >
              <div>
                <p className="font-display text-2xl sm:text-3xl font-extrabold text-primary">
                  100%
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">Verified Listings</p>
              </div>
              <div>
                <p className="font-display text-2xl sm:text-3xl font-extrabold text-primary">
                  0 KSh
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">Upfront Viewing Fees</p>
              </div>
              <div>
                <p className="font-display text-2xl sm:text-3xl font-extrabold text-primary">
                  Nairobi+
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">Major Cities Covered</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Image Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative lg:col-span-5 flex justify-center"
          >
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-primary to-accent opacity-15 blur-lg"></div>
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-2 shadow-elevated transition-transform hover:scale-[1.01] hover:rotate-[0.5deg] duration-300">
              <img
                src="/homehunt_hero.png"
                alt="Modern Apartment Building in Nairobi, Kenya"
                className="h-[320px] w-full object-cover rounded-xl sm:h-[420px] lg:h-[480px]"
              />
              <div className="absolute bottom-6 left-6 right-6 rounded-xl bg-background/90 backdrop-blur-md p-4 border border-border/80 shadow-md">
                <p className="text-xs font-bold text-accent uppercase tracking-wide">
                  Featured Partner Estate
                </p>
                <h4 className="font-display font-bold text-foreground">The Azura Residences</h4>
                <p className="text-xs text-muted-foreground">
                  Kilimani, Nairobi • Verified Luxury Rentals
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="bg-secondary/40 py-16 sm:py-24 border-y border-border/60">
        <div className="container-page">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Engineered for Trustworthy Tenancies
            </h2>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground">
              We are tackling the root issues of housing search in Kenya with a robust Relational
              Database, Geographic boundaries (PostGIS), and cryptographically verified identities.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Feature 1 */}
            <div className="surface-card p-6 flex flex-col justify-between hover:translate-y-[-4px] transition-all duration-300 hover:shadow-elevated">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-verified/15 text-verified mb-4">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground">
                  Verification Engine
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Physical agents check each property. Landlords undergo rigorous validation before
                  uploading active listings.
                </p>
              </div>
              <Link
                to="/trust"
                className="mt-6 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-accent transition-colors self-start"
              >
                Learn Verification <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {/* Feature 2 */}
            <div className="surface-card p-6 flex flex-col justify-between hover:translate-y-[-4px] transition-all duration-300 hover:shadow-elevated">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15 text-accent mb-4">
                  <Map className="h-5 w-5" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground">
                  PostGIS Spatial Search
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Find properties exact distances from major landmarks, bus terminals, schools, and
                  workplaces in your targeted zones.
                </p>
              </div>
              <Link
                to="/homes"
                search={{ page: 1, limit: 20, sort: "RECOMMENDED", amenities: [] }}
                className="mt-6 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-accent transition-colors self-start"
              >
                Learn Spatial Search <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {/* Feature 3 */}
            <div className="surface-card p-6 flex flex-col justify-between hover:translate-y-[-4px] transition-all duration-300 hover:shadow-elevated">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary mb-4">
                  <Calendar className="h-5 w-5" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground">
                  Direct Viewing Booking
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  No conmen charging registration fees. Schedule viewings directly in-app, sync with
                  calendars, and rate agents.
                </p>
              </div>
              <Link
                to="/viewings"
                className="mt-6 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-accent transition-colors self-start"
              >
                Learn Bookings <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {/* Feature 4 */}
            <div className="surface-card p-6 flex flex-col justify-between hover:translate-y-[-4px] transition-all duration-300 hover:shadow-elevated">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 mb-4">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground">
                  Structured Disputes
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Got a deposit return conflict or maintenance issue? Manage, submit logs, and
                  escalate structured claims easily.
                </p>
              </div>
              <Link
                to="/dashboard"
                className="mt-6 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-accent transition-colors self-start"
              >
                Learn Dispute Tools <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Discovery Listings Grid */}
      <section className="py-16 sm:py-24">
        <div className="container-page space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
              Discover Verified Homes
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Explore actual rental assets uploaded directly by checked landlords and agents. Zero
              upfront viewing fees.
            </p>
          </div>

          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <span className="text-xs text-muted-foreground font-semibold">
                Loading listings...
              </span>
            </div>
          ) : listings && listings.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((list) => (
                <ListingCard key={list.id} listing={list as unknown as ListingCardData} />
              ))}
            </div>
          ) : (
            <div className="surface-card p-12 text-center max-w-md mx-auto border border-dashed border-border/80">
              <Building className="h-8 w-8 text-accent mx-auto mb-3" />
              <p className="text-sm font-semibold text-foreground">No active rentals right now</p>
              <p className="text-xs text-muted-foreground mt-1">
                Check back later or register as a landlord to post a listing draft.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Info Callout Section */}
      <section className="py-16 sm:py-24">
        <div className="container-page">
          <div className="relative rounded-3xl bg-secondary/80 border border-border p-8 sm:p-12 lg:p-16 overflow-hidden shadow-elevated">
            <div className="absolute top-0 right-0 h-64 w-64 translate-x-20 translate-y-[-60px] rounded-full bg-accent/5 blur-3xl"></div>
            <div className="relative max-w-3xl">
              <span className="text-xs font-extrabold text-accent uppercase tracking-widest">
                Architectural Status
              </span>
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl text-primary mt-2">
                Phase 6 Active (Full-Stack Deployed)
              </h2>
              <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
                We have fully deployed Phases 0 through 6: authentication, listing management,
                discovery/search maps, trust verification, matching recommendations, and viewing
                bookings & messaging.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="/api/v1/health"
                  target="_blank"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/95 hover:shadow"
                >
                  Check System Health API <ArrowRight className="h-4 w-4" />
                </a>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center justify-center rounded-xl border border-input bg-card px-5 py-3 text-sm font-semibold text-foreground shadow-sm hover:bg-secondary/40"
                >
                  View Monorepo Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="container-page flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Home className="h-4 w-4" />
            </div>
            <span className="font-display font-semibold text-primary">HomeHunt Foundation</span>
          </div>
          <p>
            © {new Date().getFullYear()} HomeHunt. All rights reserved. Built for Kenyan tenants and
            landlords.
          </p>
        </div>
      </footer>

      {/* Phase Info Modal Dialog */}
      <AnimatedModal
        isOpen={!!activeModal}
        onClose={() => setActiveModal(null)}
        title="Foundation Mode (Phase 0)"
      >
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              You triggered:{" "}
              <strong className="text-foreground font-semibold">"{activeModal}"</strong>.
            </p>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              This feature belongs to a future implementation phase. We are currently establishing
              the Phase 0 core architecture (database, routes, authentication skeleton). Live
              business features will go online as subsequent stages deploy.
            </p>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-colors"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      </AnimatedModal>
    </div>
  );
}
