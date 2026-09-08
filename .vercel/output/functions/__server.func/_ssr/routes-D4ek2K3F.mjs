import { r as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, n as useQuery, o as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { h as useNavigate, p as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as Menu, Ct as ArrowRight, M as MapPin, S as Search, U as House, gt as Building, j as Map, k as MessageSquare, mt as Calendar, t as X, tt as DollarSign, ut as CircleAlert, v as ShieldCheck } from "../_libs/lucide-react.mjs";
import { r as AnimatePresence, t as motion } from "../_libs/framer-motion+[...].mjs";
import { b as staggerContainerVariants, g as fadeUpVariants, h as fadeInVariants, v as modalVariants, x as useAuth } from "./router-Dop2ixCg2.mjs";
import { p as getPublicListings } from "./properties.functions-DDrKs7rG.mjs";
import { t as ListingCard } from "./PropertyCard-BAZG8EfF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-D4ek2K3F.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AnimatedModal({ isOpen, onClose, title, children, className = "" }) {
	(0, import_react.useEffect)(() => {
		if (isOpen) document.body.style.overflow = "hidden";
		else document.body.style.overflow = "unset";
		return () => {
			document.body.style.overflow = "unset";
		};
	}, [isOpen]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: isOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-50 flex items-center justify-center p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
			variants: fadeInVariants,
			initial: "initial",
			animate: "animate",
			exit: "exit",
			onClick: onClose,
			className: "fixed inset-0 bg-background/80 backdrop-blur-sm cursor-pointer"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			variants: modalVariants,
			initial: "initial",
			animate: "animate",
			exit: "exit",
			className: `surface-card w-full max-w-lg p-6 shadow-xl border border-border/80 rounded-2xl relative z-10 bg-card ${className}`,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between pb-4 border-b border-border/40 mb-4",
				children: [title && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display font-bold text-base text-foreground",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: onClose,
					className: "rounded-lg p-1 text-muted-foreground hover:bg-secondary/40 hover:text-foreground transition-colors",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4.5 w-4.5" })
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-y-auto max-h-[70vh]",
				children
			})]
		})]
	}) });
}
function Index() {
	const navigate = useNavigate();
	const [mobileMenuOpen, setMobileMenuOpen] = (0, import_react.useState)(false);
	const [activeModal, setActiveModal] = (0, import_react.useState)(null);
	const { isAuthenticated, logout } = useAuth();
	const { data: listings, isLoading } = useQuery({
		queryKey: ["public-listings"],
		queryFn: () => getPublicListings()
	});
	const [location, setLocation] = (0, import_react.useState)("Kilimani, Nairobi");
	const [propType, setPropType] = (0, import_react.useState)("2 Bedroom Apartment");
	const [budget, setBudget] = (0, import_react.useState)("35,000 - 50,000");
	const handleSearch = () => {
		let county;
		let q;
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
		let propertyType;
		let unitType;
		let bedrooms;
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
		} else if (propType === "Townhouse") propertyType = "TOWNHOUSE";
		let minPrice;
		let maxPrice;
		if (budget === "10,000 - 15,000") {
			minPrice = 1e4;
			maxPrice = 15e3;
		} else if (budget === "15,000 - 25,000") {
			minPrice = 15e3;
			maxPrice = 25e3;
		} else if (budget === "25,000 - 35,000") {
			minPrice = 25e3;
			maxPrice = 35e3;
		} else if (budget === "35,000 - 50,000") {
			minPrice = 35e3;
			maxPrice = 5e4;
		} else if (budget === "50,000+") minPrice = 5e4;
		navigate({
			to: "/homes",
			search: {
				q,
				county,
				propertyType,
				unitType,
				bedrooms,
				minPrice,
				maxPrice,
				sort: "RECOMMENDED",
				page: 1,
				limit: 20,
				amenities: []
			}
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background font-sans text-foreground selection:bg-accent/20",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur-md",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "container-page flex h-16 items-center justify-between",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md transition-transform hover:scale-105",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "h-5 w-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-display text-2xl font-bold tracking-tight text-primary",
									children: ["Home", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-accent",
										children: "Hunt"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "hidden rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground md:inline-block border border-border",
									children: "Phase 6 Active"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
							className: "hidden items-center gap-6 md:flex",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/homes",
									search: {
										page: 1,
										limit: 20,
										sort: "RECOMMENDED",
										amenities: []
									},
									className: "text-sm font-medium text-muted-foreground transition-colors hover:text-primary",
									children: "Discover"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/homes",
									search: {
										page: 1,
										limit: 20,
										sort: "RECOMMENDED",
										amenities: []
									},
									className: "flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Map, { className: "h-4 w-4" }), " Map Search"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/viewings",
									className: "text-sm font-medium text-muted-foreground transition-colors hover:text-primary",
									children: "Tenancy Support"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/properties",
									className: "text-sm font-medium text-muted-foreground transition-colors hover:text-primary",
									children: "For Landlords"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "hidden items-center gap-3 md:flex",
							children: isAuthenticated ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/dashboard",
								className: "text-sm font-medium text-muted-foreground hover:text-primary",
								children: "Dashboard"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => logout(),
								className: "inline-flex items-center justify-center rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-foreground border border-border shadow-sm transition-all hover:bg-secondary/80 hover:translate-y-[-1px] active:translate-y-[0px] cursor-pointer",
								children: "Sign Out"
							})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/login",
								className: "text-sm font-medium text-muted-foreground hover:text-primary",
								children: "Sign In"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/register",
								className: "inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/95 hover:shadow-md hover:translate-y-[-1px] active:translate-y-[0px]",
								children: "Create Account"
							})] })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setMobileMenuOpen(!mobileMenuOpen),
							className: "flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-secondary md:hidden",
							"aria-label": "Toggle menu",
							children: mobileMenuOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-5 w-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "h-5 w-5" })
						})
					]
				})
			}),
			mobileMenuOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 top-16 z-30 bg-background/98 backdrop-blur-lg md:hidden animate-in fade-in duration-200",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "container-page py-6 flex flex-col gap-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-4 border-b border-border/60 pb-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/homes",
								search: {
									page: 1,
									limit: 20,
									sort: "RECOMMENDED",
									amenities: []
								},
								onClick: () => setMobileMenuOpen(false),
								className: "text-left text-lg font-medium text-muted-foreground hover:text-primary",
								children: "Discover Rentals"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/homes",
								search: {
									page: 1,
									limit: 20,
									sort: "RECOMMENDED",
									amenities: []
								},
								onClick: () => setMobileMenuOpen(false),
								className: "flex items-center gap-2 text-left text-lg font-medium text-muted-foreground hover:text-primary",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Map, { className: "h-5 w-5" }), " Map Search"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/viewings",
								onClick: () => setMobileMenuOpen(false),
								className: "text-left text-lg font-medium text-muted-foreground hover:text-primary",
								children: "Tenancy Support"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/properties",
								onClick: () => setMobileMenuOpen(false),
								className: "text-left text-lg font-medium text-muted-foreground hover:text-primary",
								children: "For Landlords"
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-col gap-3 pt-2",
						children: isAuthenticated ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/dashboard",
							onClick: () => setMobileMenuOpen(false),
							className: "w-full rounded-lg border border-border py-2.5 text-center font-medium text-muted-foreground hover:bg-secondary",
							children: "Go to Dashboard"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => {
								setMobileMenuOpen(false);
								logout();
							},
							className: "w-full rounded-lg bg-destructive py-2.5 text-center font-semibold text-destructive-foreground shadow cursor-pointer",
							children: "Sign Out"
						})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/login",
							onClick: () => setMobileMenuOpen(false),
							className: "w-full rounded-lg border border-border py-2.5 text-center font-medium text-muted-foreground hover:bg-secondary",
							children: "Sign In"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/register",
							onClick: () => setMobileMenuOpen(false),
							className: "w-full rounded-lg bg-primary py-2.5 text-center font-semibold text-primary-foreground shadow",
							children: "Create Account"
						})] })
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "relative overflow-hidden py-12 lg:py-20",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "container-page grid gap-12 lg:grid-cols-12 lg:items-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						variants: staggerContainerVariants,
						initial: "initial",
						animate: "animate",
						className: "flex flex-col lg:col-span-7",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
								variants: fadeUpVariants,
								className: "inline-flex max-w-fit items-center gap-1.5 rounded-full bg-secondary/80 px-3.5 py-1.5 text-xs font-semibold text-primary border border-primary/10 mb-6",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-3.5 w-3.5 text-verified" }), "100% Scam-Free Rental Guarantee"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.h1, {
								variants: fadeUpVariants,
								className: "font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground leading-[1.1]",
								children: [
									"Find your next home in Kenya,",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-gradient-brand",
										children: "with confidence."
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.p, {
								variants: fadeUpVariants,
								className: "mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed",
								children: "Tired of deposit scams, fake listings, and middleman viewing fees? HomeHunt verifies every landlord, property, and listing so you can search securely."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
								variants: fadeUpVariants,
								className: "mt-8 rounded-2xl border border-border bg-card p-4 shadow-elevated",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-3 sm:grid-cols-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-col gap-1.5 rounded-xl bg-secondary/30 p-3 border border-border/40 hover:border-primary/20 transition-colors",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-3.5 w-3.5 text-primary" }), " Location"]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
												value: location,
												onChange: (e) => setLocation(e.target.value),
												className: "bg-transparent text-sm font-medium text-foreground focus:outline-none cursor-pointer",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "Kilimani, Nairobi",
														children: "Kilimani, Nairobi"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "Westlands, Nairobi",
														children: "Westlands, Nairobi"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "Kileleshwa, Nairobi",
														children: "Kileleshwa, Nairobi"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "Syokimau, Machakos",
														children: "Syokimau, Machakos"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "Nyali, Mombasa",
														children: "Nyali, Mombasa"
													})
												]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-col gap-1.5 rounded-xl bg-secondary/30 p-3 border border-border/40 hover:border-primary/20 transition-colors",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building, { className: "h-3.5 w-3.5 text-primary" }), " Type"]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
												value: propType,
												onChange: (e) => setPropType(e.target.value),
												className: "bg-transparent text-sm font-medium text-foreground focus:outline-none cursor-pointer",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "Bedsitter",
														children: "Bedsitter"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "1 Bedroom Apartment",
														children: "1 Bedroom Apartment"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "2 Bedroom Apartment",
														children: "2 Bedroom Apartment"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "3 Bedroom Apartment",
														children: "3 Bedroom Apartment"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "Townhouse",
														children: "Townhouse"
													})
												]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-col gap-1.5 rounded-xl bg-secondary/30 p-3 border border-border/40 hover:border-primary/20 transition-colors",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "h-3.5 w-3.5 text-primary" }), " Monthly Budget (KSh)"]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
												value: budget,
												onChange: (e) => setBudget(e.target.value),
												className: "bg-transparent text-sm font-medium text-foreground focus:outline-none cursor-pointer",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "10,000 - 15,000",
														children: "10,000 - 15,000"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "15,000 - 25,000",
														children: "15,000 - 25,000"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "25,000 - 35,000",
														children: "25,000 - 35,000"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "35,000 - 50,000",
														children: "35,000 - 50,000"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "50,000+",
														children: "50,000+"
													})
												]
											})]
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: handleSearch,
									className: "mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/95 hover:shadow-lg active:scale-[0.99]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-5 w-5" }), " Search Available Properties"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
								variants: fadeUpVariants,
								className: "mt-8 grid grid-cols-3 gap-4 border-t border-border/60 pt-6",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-display text-2xl sm:text-3xl font-extrabold text-primary",
										children: "100%"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs sm:text-sm text-muted-foreground",
										children: "Verified Listings"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-display text-2xl sm:text-3xl font-extrabold text-primary",
										children: "0 KSh"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs sm:text-sm text-muted-foreground",
										children: "Upfront Viewing Fees"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-display text-2xl sm:text-3xl font-extrabold text-primary",
										children: "Nairobi+"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs sm:text-sm text-muted-foreground",
										children: "Major Cities Covered"
									})] })
								]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						initial: {
							opacity: 0,
							scale: .95
						},
						animate: {
							opacity: 1,
							scale: 1
						},
						transition: {
							duration: .5,
							delay: .1
						},
						className: "relative lg:col-span-5 flex justify-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -inset-1 rounded-3xl bg-gradient-to-r from-primary to-accent opacity-15 blur-lg" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative overflow-hidden rounded-2xl border border-border bg-card p-2 shadow-elevated transition-transform hover:scale-[1.01] hover:rotate-[0.5deg] duration-300",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: "/homehunt_hero.png",
								alt: "Modern Apartment Building in Nairobi, Kenya",
								className: "h-[320px] w-full object-cover rounded-xl sm:h-[420px] lg:h-[480px]"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "absolute bottom-6 left-6 right-6 rounded-xl bg-background/90 backdrop-blur-md p-4 border border-border/80 shadow-md",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-bold text-accent uppercase tracking-wide",
										children: "Featured Partner Estate"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
										className: "font-display font-bold text-foreground",
										children: "The Azura Residences"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: "Kilimani, Nairobi • Verified Luxury Rentals"
									})
								]
							})]
						})]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "bg-secondary/40 py-16 sm:py-24 border-y border-border/60",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "container-page",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-auto max-w-3xl text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-3xl font-bold tracking-tight sm:text-4xl",
							children: "Engineered for Trustworthy Tenancies"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-base sm:text-lg text-muted-foreground",
							children: "We are tackling the root issues of housing search in Kenya with a robust Relational Database, Geographic boundaries (PostGIS), and cryptographically verified identities."
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "surface-card p-6 flex flex-col justify-between hover:translate-y-[-4px] transition-all duration-300 hover:shadow-elevated",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex h-10 w-10 items-center justify-center rounded-lg bg-verified/15 text-verified mb-4",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-5 w-5" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "font-display font-semibold text-lg text-foreground",
										children: "Verification Engine"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-sm text-muted-foreground leading-relaxed",
										children: "Physical agents check each property. Landlords undergo rigorous validation before uploading active listings."
									})
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/trust",
									className: "mt-6 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-accent transition-colors self-start",
									children: ["Learn Verification ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-3 w-3" })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "surface-card p-6 flex flex-col justify-between hover:translate-y-[-4px] transition-all duration-300 hover:shadow-elevated",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15 text-accent mb-4",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Map, { className: "h-5 w-5" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "font-display font-semibold text-lg text-foreground",
										children: "PostGIS Spatial Search"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-sm text-muted-foreground leading-relaxed",
										children: "Find properties exact distances from major landmarks, bus terminals, schools, and workplaces in your targeted zones."
									})
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/homes",
									search: {
										page: 1,
										limit: 20,
										sort: "RECOMMENDED",
										amenities: []
									},
									className: "mt-6 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-accent transition-colors self-start",
									children: ["Learn Spatial Search ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-3 w-3" })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "surface-card p-6 flex flex-col justify-between hover:translate-y-[-4px] transition-all duration-300 hover:shadow-elevated",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary mb-4",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-5 w-5" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "font-display font-semibold text-lg text-foreground",
										children: "Direct Viewing Booking"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-sm text-muted-foreground leading-relaxed",
										children: "No conmen charging registration fees. Schedule viewings directly in-app, sync with calendars, and rate agents."
									})
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/viewings",
									className: "mt-6 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-accent transition-colors self-start",
									children: ["Learn Bookings ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-3 w-3" })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "surface-card p-6 flex flex-col justify-between hover:translate-y-[-4px] transition-all duration-300 hover:shadow-elevated",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 mb-4",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "h-5 w-5" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "font-display font-semibold text-lg text-foreground",
										children: "Structured Disputes"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-sm text-muted-foreground leading-relaxed",
										children: "Got a deposit return conflict or maintenance issue? Manage, submit logs, and escalate structured claims easily."
									})
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/dashboard",
									className: "mt-6 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-accent transition-colors self-start",
									children: ["Learn Dispute Tools ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-3 w-3" })]
								})]
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "py-16 sm:py-24",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "container-page space-y-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-center max-w-3xl mx-auto space-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground",
							children: "Discover Verified Homes"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm sm:text-base text-muted-foreground leading-relaxed",
							children: "Explore actual rental assets uploaded directly by checked landlords and agents. Zero upfront viewing fees."
						})]
					}), isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-40 items-center justify-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted-foreground font-semibold",
							children: "Loading listings..."
						})
					}) : listings && listings.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-8",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid gap-6 sm:grid-cols-2 lg:grid-cols-3",
							children: listings.slice(0, 6).map((list) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListingCard, { listing: list }, list.id))
						}), listings.length > 6 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-center pt-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/homes",
								search: {
									page: 1,
									limit: 20,
									sort: "RECOMMENDED",
									amenities: []
								},
								className: "inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/95 hover:shadow cursor-pointer",
								children: ["See More Verified Homes ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })]
							})
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "surface-card p-12 text-center max-w-md mx-auto border border-dashed border-border/80",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building, { className: "h-8 w-8 text-accent mx-auto mb-3" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-semibold text-foreground",
								children: "No active rentals right now"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground mt-1",
								children: "Check back later or register as a landlord to post a listing draft."
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "py-16 sm:py-24",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "container-page",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative rounded-3xl bg-secondary/80 border border-border p-8 sm:p-12 lg:p-16 overflow-hidden shadow-elevated",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute top-0 right-0 h-64 w-64 translate-x-20 translate-y-[-60px] rounded-full bg-accent/5 blur-3xl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative max-w-3xl",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-extrabold text-accent uppercase tracking-widest",
									children: "Architectural Status"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-display text-3xl font-bold tracking-tight sm:text-4xl text-primary mt-2",
									children: "Phase 6 Active (Full-Stack Deployed)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed",
									children: "We have fully deployed Phases 0 through 6: authentication, listing management, discovery/search maps, trust verification, matching recommendations, and viewing bookings & messaging."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-8 flex flex-wrap gap-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
										href: "/api/v1/health",
										target: "_blank",
										className: "inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/95 hover:shadow",
										children: ["Check System Health API ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/dashboard",
										className: "inline-flex items-center justify-center rounded-xl border border-input bg-card px-5 py-3 text-sm font-semibold text-foreground shadow-sm hover:bg-secondary/40",
										children: "View Monorepo Dashboard"
									})]
								})
							]
						})]
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
				className: "border-t border-border bg-card py-12",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "container-page flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between text-sm text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "h-4 w-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display font-semibold text-primary",
							children: "HomeHunt Foundation"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						"© ",
						(/* @__PURE__ */ new Date()).getFullYear(),
						" HomeHunt. All rights reserved. Built for Kenyan tenants and landlords."
					] })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatedModal, {
				isOpen: !!activeModal,
				onClose: () => setActiveModal(null),
				title: "Foundation Mode (Phase 0)",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-5 w-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-sm text-muted-foreground leading-relaxed",
							children: [
								"You triggered:",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
									className: "text-foreground font-semibold",
									children: [
										"\"",
										activeModal,
										"\""
									]
								}),
								"."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-muted-foreground leading-relaxed",
							children: "This feature belongs to a future implementation phase. We are currently establishing the Phase 0 core architecture (database, routes, authentication skeleton). Live business features will go online as subsequent stages deploy."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-6 flex justify-end",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setActiveModal(null),
								className: "rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-colors",
								children: "Understood"
							})
						})
					] })]
				})
			})
		]
	});
}
//#endregion
export { Index as component };
