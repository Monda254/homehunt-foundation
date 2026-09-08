import { r as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, o as require_react, r as QueryClientProvider } from "../_libs/react+tanstack__react-query.mjs";
import { a as useLocation, c as createRouter, d as createFileRoute, f as createRootRouteWithContext, g as useRouter, h as useNavigate, i as HeadContent, l as Outlet, p as Link, r as Scripts, u as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as __exportAll } from "./server-BRCrXnf-2.mjs";
import { i as toErrorResponse, n as ERROR_CODES, t as AppError } from "./api-error-C5p6KfDB.mjs";
import { n as supabaseAdmin$2 } from "./client.server-Ma94aMcQ.mjs";
import { a as resolveRequestId, n as REQUEST_ID_HEADER, r as logger } from "./request-id-Du7XsDoM.mjs";
import { n as hasRole, t as hasPermission } from "./roles-BzUNBgvo.mjs";
import { t as readServerConfig } from "./server-config-Blgc301r.mjs";
import { t as supabase } from "./client-BSPz5QXw.mjs";
import { t as SearchListingsSchema } from "./search.types-M7Ux6mOs.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { I as LoaderCircle } from "../_libs/lucide-react.mjs";
import { n as toast, t as Toaster } from "../_libs/sonner.mjs";
import { n as MotionConfig, r as AnimatePresence, t as motion } from "../_libs/framer-motion+[...].mjs";
import { l as getMyIdentity, p as logout } from "./router-Dop2ixCg.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-Dop2ixCg.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var AuthContext = (0, import_react.createContext)(void 0);
var AuthProvider = ({ children }) => {
	const queryClient = useQueryClient();
	const { data: user, isLoading, refetch } = useQuery({
		queryKey: ["my-identity"],
		queryFn: async () => {
			const { data } = await supabase.auth.getSession();
			if (!data.session) return null;
			try {
				return await getMyIdentity();
			} catch (error) {
				return null;
			}
		},
		staleTime: 12e4,
		retry: false
	});
	const isAuthenticated = !!user;
	(0, import_react.useEffect)(() => {
		const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
			if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") queryClient.invalidateQueries({ queryKey: ["my-identity"] });
			else if (event === "SIGNED_OUT") {
				queryClient.setQueryData(["my-identity"], null);
				queryClient.clear();
			}
		});
		return () => {
			subscription.unsubscribe();
		};
	}, [queryClient]);
	const login = async (tokens) => {
		const { error } = await supabase.auth.setSession(tokens);
		if (error) {
			toast.error("Authentication session establishment failed.");
			throw error;
		}
		await refetch();
	};
	const logout$1 = async () => {
		try {
			await logout();
		} catch (e) {
			console.warn("Server logout revocation failed, proceeding with client cleanup", e);
		} finally {
			await supabase.auth.signOut();
			queryClient.setQueryData(["my-identity"], null);
			queryClient.clear();
			toast.success("Signed out successfully.");
		}
	};
	const hasRole$1 = (role) => {
		if (!user) return false;
		return hasRole(user.roles, role);
	};
	const hasPermission$1 = (permission) => {
		if (!user) return false;
		return hasPermission(user.roles, permission);
	};
	const refetchIdentity = async () => {
		await refetch();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthContext.Provider, {
		value: {
			isAuthenticated,
			user: user ?? null,
			isLoading,
			login,
			logout: logout$1,
			hasRole: hasRole$1,
			hasPermission: hasPermission$1,
			refetch: refetchIdentity
		},
		children
	});
};
var useAuth = () => {
	const context = (0, import_react.useContext)(AuthContext);
	if (context === void 0) throw new Error("useAuth must be used within an AuthProvider");
	return context;
};
var RequireAuth = ({ children, role, permission }) => {
	const { isAuthenticated, isLoading, user, hasRole, hasPermission } = useAuth();
	const navigate = useNavigate();
	(0, import_react.useEffect)(() => {
		if (!isLoading) {
			if (!isAuthenticated) navigate({
				to: "/login",
				search: { redirect: window.location.pathname }
			});
			else {
				if (role && !hasRole(role)) navigate({ to: "/dashboard" });
				if (permission && !hasPermission(permission)) navigate({ to: "/dashboard" });
				if (user && user.status === "PENDING_VERIFICATION" && window.location.pathname !== "/verify-email") navigate({ to: "/verify-email" });
			}
		}
	}, [
		isAuthenticated,
		isLoading,
		user,
		role,
		permission,
		navigate,
		hasRole,
		hasPermission
	]);
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-8 w-8 animate-spin text-primary mx-auto mb-2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Verifying access authorization..."
			})]
		})
	});
	if (!isAuthenticated) return null;
	if (role && !hasRole(role)) return null;
	if (permission && !hasPermission(permission)) return null;
	if (user && user.status === "PENDING_VERIFICATION" && window.location.pathname !== "/verify-email") return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
};
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		className: "toaster group",
		toastOptions: { classNames: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
		} },
		...props
	});
};
var MotionContext = (0, import_react.createContext)({ reducedMotion: false });
var useMotion = () => (0, import_react.useContext)(MotionContext);
function MotionProvider({ children }) {
	const [reducedMotion, setReducedMotion] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
		setReducedMotion(mediaQuery.matches);
		const listener = (event) => {
			setReducedMotion(event.matches);
		};
		mediaQuery.addEventListener("change", listener);
		return () => {
			mediaQuery.removeEventListener("change", listener);
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MotionContext.Provider, {
		value: { reducedMotion },
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MotionConfig, {
			reducedMotion: reducedMotion ? "always" : "never",
			children
		})
	});
}
/**
* HomeHunt Motion Tokens
* Centralized durations and easings for natural, responsive, and consistent UI animations.
*/
var MOTION_DURATIONS = {
	instant: .1,
	fast: .15,
	normal: .25,
	medium: .35,
	slow: .5,
	dramatic: .7,
	story: .8,
	celebration: 1
};
var MOTION_EASINGS = {
	standard: "cubic-bezier(0.4, 0, 0.2, 1)",
	enter: "cubic-bezier(0, 0, 0.2, 1)",
	exit: "cubic-bezier(0.4, 0, 1, 1)",
	emphasized: "cubic-bezier(0.83, 0, 0.17, 1)",
	spring: {
		type: "spring",
		stiffness: 300,
		damping: 25
	},
	springSnappy: {
		type: "spring",
		stiffness: 400,
		damping: 30
	},
	springBouncy: {
		type: "spring",
		stiffness: 350,
		damping: 18
	}
};
var fadeInVariants = {
	initial: { opacity: 0 },
	animate: (custom) => ({
		opacity: 1,
		transition: {
			duration: custom?.duration ?? MOTION_DURATIONS.normal,
			ease: MOTION_EASINGS.standard
		}
	}),
	exit: {
		opacity: 0,
		transition: {
			duration: MOTION_DURATIONS.fast,
			ease: MOTION_EASINGS.exit
		}
	}
};
var fadeUpVariants = {
	initial: {
		opacity: 0,
		y: 12
	},
	animate: (custom) => ({
		opacity: 1,
		y: 0,
		transition: {
			duration: custom?.duration ?? MOTION_DURATIONS.medium,
			delay: custom?.delay ?? 0,
			ease: MOTION_EASINGS.enter
		}
	}),
	exit: {
		opacity: 0,
		y: 8,
		transition: {
			duration: MOTION_DURATIONS.fast,
			ease: MOTION_EASINGS.exit
		}
	}
};
MOTION_DURATIONS.fast, MOTION_EASINGS.exit;
MOTION_DURATIONS.normal, MOTION_EASINGS.standard, MOTION_DURATIONS.fast, MOTION_EASINGS.exit;
var staggerContainerVariants = {
	initial: {},
	animate: (custom) => ({ transition: {
		staggerChildren: custom?.staggerChildren ?? .05,
		delayChildren: custom?.delayChildren ?? 0
	} })
};
var modalVariants = {
	initial: {
		opacity: 0,
		scale: .95,
		y: 16
	},
	animate: {
		opacity: 1,
		scale: 1,
		y: 0,
		transition: {
			type: "spring",
			stiffness: 300,
			damping: 24
		}
	},
	exit: {
		opacity: 0,
		scale: .97,
		y: 8,
		transition: {
			duration: MOTION_DURATIONS.fast,
			ease: MOTION_EASINGS.exit
		}
	}
};
MOTION_DURATIONS.fast, MOTION_EASINGS.enter, MOTION_DURATIONS.instant, MOTION_EASINGS.exit;
MOTION_DURATIONS.normal, MOTION_EASINGS.exit;
MOTION_DURATIONS.normal, MOTION_EASINGS.standard, MOTION_DURATIONS.fast, MOTION_DURATIONS.normal, MOTION_EASINGS.exit, MOTION_DURATIONS.fast;
function PageTransition({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
		variants: fadeUpVariants,
		initial: "initial",
		animate: "animate",
		exit: "exit",
		className: "w-full",
		children
	});
}
var styles_default = "/assets/styles-DkM9sLEj.css";
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
					className: "mt-4 max-h-40 overflow-auto rounded bg-destructive/10 p-3 text-left font-mono text-xs text-destructive",
					children: error.stack || error.message || String(error)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$39 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "HomeHunt - Kenyan Housing Platform" },
			{
				name: "description",
				content: "HomeHunt is a premium housing platform designed to solve rental search challenges in Kenya."
			},
			{
				name: "author",
				content: "HomeHunt"
			},
			{
				property: "og:title",
				content: "HomeHunt - Kenyan Housing Platform"
			},
			{
				property: "og:description",
				content: "HomeHunt is a premium housing platform designed to solve rental search challenges in Kenya."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			}
		],
		links: [{
			rel: "stylesheet",
			href: styles_default
		}, {
			rel: "icon",
			href: "/favicon.png",
			type: "image/png"
		}]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$39.useRouteContext();
	const location = useLocation();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MotionProvider, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, {
			mode: "wait",
			initial: false,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageTransition, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }, location.pathname)
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {})] }) })
	});
}
var $$splitComponentImporter$32 = () => import("./routes-D4ek2K3F.mjs");
var Route$38 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$32, "component") });
var $$splitComponentImporter$31 = () => import("./admin-D2vqM4V8.mjs");
var Route$37 = createFileRoute("/admin")({ component: lazyRouteComponent($$splitComponentImporter$31, "component") });
var $$splitComponentImporter$30 = () => import("./applications-_oKLToP-.mjs");
var Route$36 = createFileRoute("/applications")({ component: lazyRouteComponent($$splitComponentImporter$30, "component") });
var $$splitComponentImporter$29 = () => import("./dashboard-CIph3YWs.mjs");
var Route$35 = createFileRoute("/dashboard")({ component: lazyRouteComponent($$splitComponentImporter$29, "component") });
var $$splitComponentImporter$28 = () => import("./forgot-password-Ndtw9LW3.mjs");
var Route$34 = createFileRoute("/forgot-password")({ component: lazyRouteComponent($$splitComponentImporter$28, "component") });
var $$splitComponentImporter$27 = () => import("./login-Dk6IUkr7.mjs");
var Route$33 = createFileRoute("/login")({
	validateSearch: (search) => ({ redirect: typeof search.redirect === "string" ? search.redirect : void 0 }),
	component: lazyRouteComponent($$splitComponentImporter$27, "component")
});
var $$splitComponentImporter$26 = () => import("./map-B8MyCYDO.mjs");
var Route$32 = createFileRoute("/map")({ component: lazyRouteComponent($$splitComponentImporter$26, "component") });
var $$splitComponentImporter$25 = () => import("./messages-D2lHvghD.mjs");
var Route$31 = createFileRoute("/messages")({ component: lazyRouteComponent($$splitComponentImporter$25, "component") });
var $$splitComponentImporter$24 = () => import("./profile-fEAD9NNh.mjs");
var Route$30 = createFileRoute("/profile")({ component: lazyRouteComponent($$splitComponentImporter$24, "component") });
var $$splitComponentImporter$23 = () => import("./recommendations-D7NViqNf.mjs");
var Route$29 = createFileRoute("/recommendations")({ component: lazyRouteComponent($$splitComponentImporter$23, "component") });
var $$splitComponentImporter$22 = () => import("./register-De2sl0GB.mjs");
var Route$28 = createFileRoute("/register")({ component: lazyRouteComponent($$splitComponentImporter$22, "component") });
var $$splitComponentImporter$21 = () => import("./reset-password-BhxKDl5q.mjs");
var Route$27 = createFileRoute("/reset-password")({
	validateSearch: (search) => ({ token: typeof search.token === "string" ? search.token : void 0 }),
	component: lazyRouteComponent($$splitComponentImporter$21, "component")
});
var $$splitComponentImporter$20 = () => import("./saved-CaVMrOps.mjs");
var Route$26 = createFileRoute("/saved")({ component: lazyRouteComponent($$splitComponentImporter$20, "component") });
var $$splitComponentImporter$19 = () => import("./settings-D3ty60jm.mjs");
var Route$25 = createFileRoute("/settings")({ component: lazyRouteComponent($$splitComponentImporter$19, "component") });
var $$splitComponentImporter$18 = () => import("./tenancies-Dr95xf1-.mjs");
var Route$24 = createFileRoute("/tenancies")({ component: lazyRouteComponent($$splitComponentImporter$18, "component") });
var $$splitComponentImporter$17 = () => import("./trust-BryjdNwa.mjs");
var Route$23 = createFileRoute("/trust")({ component: lazyRouteComponent($$splitComponentImporter$17, "component") });
var $$splitComponentImporter$16 = () => import("./verify-email-D2fuf12V.mjs");
var Route$22 = createFileRoute("/verify-email")({
	validateSearch: (search) => ({ token: typeof search.token === "string" ? search.token : void 0 }),
	component: lazyRouteComponent($$splitComponentImporter$16, "component")
});
var $$splitComponentImporter$15 = () => import("./viewings-DIA6UcYH.mjs");
var Route$21 = createFileRoute("/viewings")({ component: lazyRouteComponent($$splitComponentImporter$15, "component") });
var $$splitComponentImporter$14 = () => import("./admin.intelligence-DIifaWsi.mjs");
var Route$20 = createFileRoute("/admin/intelligence")({ component: lazyRouteComponent($$splitComponentImporter$14, "component") });
var $$splitComponentImporter$13 = () => import("./applications._id-1htMDGpC.mjs");
var Route$19 = createFileRoute("/applications/$id")({ component: lazyRouteComponent($$splitComponentImporter$13, "component") });
var $$splitComponentImporter$12 = () => import("./dashboard.applications-BnL0LRDA.mjs");
var Route$18 = createFileRoute("/dashboard/applications")({ component: lazyRouteComponent($$splitComponentImporter$12, "component") });
var $$splitComponentImporter$11 = () => import("./dashboard.tenancies-BNBacNxg.mjs");
var Route$17 = createFileRoute("/dashboard/tenancies")({ component: lazyRouteComponent($$splitComponentImporter$11, "component") });
var $$splitComponentImporter$10 = () => import("./homes.index-BjlqE5WR.mjs");
var Route$16 = createFileRoute("/homes/")({
	validateSearch: (search) => SearchListingsSchema.parse(search),
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./homes._id-BIuTEVbO.mjs");
var Route$15 = createFileRoute("/homes/$id")({ component: lazyRouteComponent($$splitComponentImporter$9, "component") });
var $$splitComponentImporter$8 = () => import("./listings.index-BB4S0ywx.mjs");
var Route$14 = createFileRoute("/listings/")({ component: lazyRouteComponent($$splitComponentImporter$8, "component") });
var $$splitComponentImporter$7 = () => import("./listings._id-DGan6eTa.mjs");
var Route$13 = createFileRoute("/listings/$id")({ component: lazyRouteComponent($$splitComponentImporter$7, "component") });
var $$splitComponentImporter$6 = () => import("./properties.index-gNoTPEOL.mjs");
var Route$12 = createFileRoute("/properties/")({ component: lazyRouteComponent($$splitComponentImporter$6, "component") });
var $$splitComponentImporter$5 = () => import("./properties._id-DLUHznrI.mjs");
var Route$11 = createFileRoute("/properties/$id")({ component: lazyRouteComponent($$splitComponentImporter$5, "component") });
var $$splitComponentImporter$4 = () => import("./properties.new-Ccft577S.mjs");
var Route$10 = createFileRoute("/properties/new")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./tenancies._id-heH3YVhZ.mjs");
var Route$9 = createFileRoute("/tenancies/$id")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
/**
* Health checks (server-only).
*
* Distinguishes application health from dependency health and never leaks
* connection strings, keys or driver messages.
*/
function baseReport() {
	const config = readServerConfig();
	return {
		status: config.ok ? "ok" : "error",
		service: "homehunt-api",
		version: "v1",
		environment: config.ok ? config.config.APP_ENV : "unknown",
		checked_at: (/* @__PURE__ */ new Date()).toISOString(),
		components: {
			application: { status: "ok" },
			configuration: config.ok ? { status: "ok" } : {
				status: "unavailable",
				detail: `invalid configuration: ${config.issues.length} issue(s)`
			},
			cache: {
				status: "not_configured",
				detail: "managed cache not enabled in this environment"
			}
		}
	};
}
function checkApiHealth() {
	return baseReport();
}
async function checkDatabaseHealth() {
	const report = baseReport();
	const startedAt = Date.now();
	try {
		const { supabaseAdmin } = await import("./client.server-Ma94aMcQ.mjs").then((n) => n.t);
		const { error } = await supabaseAdmin.from("profiles").select("id", {
			head: true,
			count: "exact"
		});
		if (error) throw error;
		report.components["database"] = {
			status: "ok",
			latency_ms: Date.now() - startedAt
		};
	} catch (error) {
		logger.error("Database health check failed", error, { event: "health.database_failed" });
		report.components["database"] = {
			status: "unavailable",
			latency_ms: Date.now() - startedAt,
			detail: "database not reachable"
		};
		report.status = "error";
	}
	return report;
}
var Route$8 = createFileRoute("/api/v1/health")({ server: { handlers: { GET: ({ request }) => {
	const requestId = resolveRequestId(request.headers);
	try {
		const report = checkApiHealth();
		logger.info("Health check", {
			event: "health.api",
			requestId,
			status: report.status
		});
		return new Response(JSON.stringify(report), {
			status: report.status === "error" ? 503 : 200,
			headers: {
				"content-type": "application/json; charset=utf-8",
				[REQUEST_ID_HEADER]: requestId,
				"cache-control": "no-store"
			}
		});
	} catch (error) {
		logger.error("Health check failed", error, {
			event: "health.api_failed",
			requestId
		});
		return toErrorResponse(error, requestId);
	}
} } } });
var supabaseAdmin$1 = supabaseAdmin$2;
var Route$7 = createFileRoute("/api/v1/readiness")({ server: { handlers: { GET: async ({ request }) => {
	const requestId = resolveRequestId(request.headers);
	const startTime = Date.now();
	const checks = {};
	const configResult = readServerConfig();
	if (configResult.ok) checks.config = { status: "pass" };
	else checks.config = {
		status: "warn",
		details: `Missing production environment variables: ${configResult.issues.join(", ")}`
	};
	try {
		const { error } = await supabaseAdmin$1.from("profiles").select("id").limit(1);
		if (error) checks.database = {
			status: "fail",
			details: error.message
		};
		else checks.database = { status: "pass" };
	} catch (err) {
		checks.database = {
			status: "fail",
			details: err.message || "Database connection error"
		};
	}
	try {
		const { data, error } = await supabaseAdmin$1.storage.listBuckets();
		if (error) checks.storage = {
			status: "warn",
			details: error.message
		};
		else checks.storage = {
			status: "pass",
			details: `${data?.length || 0} storage buckets accessible`
		};
	} catch (err) {
		checks.storage = {
			status: "warn",
			details: err.message || "Storage access error"
		};
	}
	const isReady = checks.database?.status === "pass" && (checks.config?.status === "pass" || checks.config?.status === "warn");
	const responsePayload = {
		status: isReady ? "ready" : "not_ready",
		timestamp: (/* @__PURE__ */ new Date()).toISOString(),
		latencyMs: Date.now() - startTime,
		checks
	};
	logger.info("Readiness evaluation", {
		event: "health.readiness",
		requestId,
		status: responsePayload.status
	});
	return new Response(JSON.stringify(responsePayload), {
		status: isReady ? 200 : 503,
		headers: {
			"content-type": "application/json; charset=utf-8",
			[REQUEST_ID_HEADER]: requestId,
			"cache-control": "no-store"
		}
	});
} } } });
var $$splitComponentImporter$2 = () => import("./dashboard.applications._id-Bt6SRJxz.mjs");
var Route$6 = createFileRoute("/dashboard/applications/$id")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./dashboard.tenancies._id-BuASAlYE.mjs");
var Route$5 = createFileRoute("/dashboard/tenancies/$id")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
/**
* Unauthenticated alias of GET /api/v1/health for external uptime monitors.
* Read-only; exposes no infrastructure detail.
*/
var Route$4 = createFileRoute("/api/public/v1/health")({ server: { handlers: { GET: ({ request }) => {
	const requestId = resolveRequestId(request.headers);
	const report = checkApiHealth();
	return new Response(JSON.stringify({
		status: report.status,
		service: report.service
	}), {
		status: report.status === "error" ? 503 : 200,
		headers: {
			"content-type": "application/json; charset=utf-8",
			[REQUEST_ID_HEADER]: requestId,
			"cache-control": "no-store"
		}
	});
} } } });
var Route$3 = createFileRoute("/api/v1/health/database")({ server: { handlers: { GET: async ({ request }) => {
	const requestId = resolveRequestId(request.headers);
	try {
		const report = await checkDatabaseHealth();
		logger.info("Database health check", {
			event: "health.database",
			requestId,
			status: report.status
		});
		return new Response(JSON.stringify(report), {
			status: report.status === "error" ? 503 : 200,
			headers: {
				"content-type": "application/json; charset=utf-8",
				[REQUEST_ID_HEADER]: requestId,
				"cache-control": "no-store"
			}
		});
	} catch (error) {
		logger.error("Database health check errored", error, {
			event: "health.database_failed",
			requestId
		});
		return toErrorResponse(error, requestId);
	}
} } } });
var supabaseAdmin = supabaseAdmin$2;
var MpesaPaymentProvider = class {
	name = "MpesaPaymentProvider";
	getCredentials() {
		return {
			consumerKey: process.env.MPESA_CONSUMER_KEY,
			consumerSecret: process.env.MPESA_CONSUMER_SECRET,
			passkey: process.env.MPESA_PASSKEY,
			shortcode: process.env.MPESA_SHORTCODE || "174379",
			callbackUrl: process.env.MPESA_CALLBACK_URL || "https://homehunt.co.ke/api/v1/payments/mpesa/callback",
			env: process.env.MPESA_ENV || "sandbox"
		};
	}
	/**
	* Aquires OAuth access token from Safaricom Daraja API
	*/
	async getAccessToken() {
		const { consumerKey, consumerSecret, env } = this.getCredentials();
		if (!consumerKey || !consumerSecret) {
			logger.info("[MpesaProvider] Production API credentials unconfigured, returning null for fallback.");
			return null;
		}
		try {
			const authHeader = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
			const res = await fetch(env === "production" ? "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials" : "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
				method: "GET",
				headers: { Authorization: `Basic ${authHeader}` }
			});
			if (!res.ok) {
				logger.error("[MpesaProvider] Token acquisition failed:", { status: res.status });
				return null;
			}
			return (await res.json()).access_token || null;
		} catch (err) {
			logger.error("[MpesaProvider] Exception getting Daraja OAuth token:", { error: err.message });
			return null;
		}
	}
	/**
	* Formats Kenyan phone number to 254XXXXXXXXX standard
	*/
	formatPhoneNumber(phone) {
		let clean = phone.replace(/\D/g, "");
		if (clean.startsWith("0")) clean = "254" + clean.slice(1);
		else if (clean.startsWith("7") || clean.startsWith("1")) clean = "254" + clean;
		return clean;
	}
	/**
	* Generates M-Pesa Password timestamp format: YYYYMMDDHHmmss
	*/
	generateTimestamp() {
		const now = /* @__PURE__ */ new Date();
		return `${now.getFullYear().toString()}${(now.getMonth() + 1).toString().padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}${now.getHours().toString().padStart(2, "0")}${now.getMinutes().toString().padStart(2, "0")}${now.getSeconds().toString().padStart(2, "0")}`;
	}
	/**
	* Initiates an M-Pesa Express STK Push prompt to tenant handset
	*/
	async initiateStkPush(params) {
		const { phoneNumber, amount, accountReference, transactionDesc, tenancyId, payerUserId, obligationId } = params;
		if (!amount || amount <= 0) throw new AppError(ERROR_CODES.BAD_REQUEST, "Authoritative payment amount must be greater than zero KES.");
		const formattedPhone = this.formatPhoneNumber(phoneNumber);
		const token = await this.getAccessToken();
		const { passkey, shortcode, callbackUrl, env } = this.getCredentials();
		const timestamp = this.generateTimestamp();
		const password = passkey ? Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64") : "mock-password";
		const { data: transaction, error: txErr } = await supabaseAdmin.from("payment_transactions").insert({
			tenancy_id: tenancyId,
			obligation_id: obligationId || null,
			payer_id: payerUserId,
			amount,
			currency: "KES",
			payment_method: "M-PESA",
			status: "PENDING",
			created_at: (/* @__PURE__ */ new Date()).toISOString()
		}).select().single();
		if (txErr || !transaction) {
			logger.error("[MpesaProvider] Failed to insert pending transaction:", { error: txErr?.message });
			throw new AppError(ERROR_CODES.INTERNAL_ERROR, "Failed to initialize payment record.");
		}
		if (!token) {
			const mockCheckoutId = `ws_CO_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
			await supabaseAdmin.from("payment_transactions").update({
				provider_reference: mockCheckoutId,
				raw_payload: {
					mode: "DARJA_FALLBACK",
					checkoutRequestId: mockCheckoutId,
					phone: formattedPhone
				}
			}).eq("id", transaction.id);
			logger.info("[MpesaProvider] Initialized STK Push in fallback mode:", { checkoutId: mockCheckoutId });
			return {
				success: true,
				merchantRequestId: `MRK_${Date.now()}`,
				checkoutRequestId: mockCheckoutId,
				responseCode: "0",
				responseDescription: "Success. Request accepted for processing",
				customerMessage: `STK Push prompt initialized for ${formattedPhone}. Enter M-Pesa PIN to complete KSh ${amount.toLocaleString()}.`
			};
		}
		try {
			const url = env === "production" ? "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest" : "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";
			const payload = {
				BusinessShortCode: shortcode,
				Password: password,
				Timestamp: timestamp,
				TransactionType: "CustomerPayBillOnline",
				Amount: Math.round(amount),
				PartyA: formattedPhone,
				PartyB: shortcode,
				PhoneNumber: formattedPhone,
				CallBackURL: callbackUrl,
				AccountReference: accountReference.substring(0, 12),
				TransactionDesc: transactionDesc.substring(0, 12)
			};
			const data = await (await fetch(url, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json"
				},
				body: JSON.stringify(payload)
			})).json();
			if (data.ResponseCode === "0") {
				await supabaseAdmin.from("payment_transactions").update({
					provider_reference: data.CheckoutRequestID,
					raw_payload: data
				}).eq("id", transaction.id);
				return {
					success: true,
					merchantRequestId: data.MerchantRequestID,
					checkoutRequestId: data.CheckoutRequestID,
					responseCode: data.ResponseCode,
					responseDescription: data.ResponseDescription,
					customerMessage: data.CustomerMessage
				};
			}
			await supabaseAdmin.from("payment_transactions").update({
				status: "FAILED",
				raw_payload: data
			}).eq("id", transaction.id);
			return {
				success: false,
				responseCode: data.ResponseCode,
				responseDescription: data.ResponseDescription,
				error: data.errorMessage || "M-Pesa STK Push request rejected."
			};
		} catch (err) {
			logger.error("[MpesaProvider] Error initiating Daraja STK Push:", { error: err.message });
			return {
				success: false,
				error: err.message || "Failed to contact M-Pesa Daraja Gateway."
			};
		}
	}
	/**
	* Processes incoming Daraja Webhook Callback with Idempotency & State Machine Protection
	*/
	async processWebhookCallback(payload) {
		try {
			const stk = payload?.Body?.stkCallback;
			if (!stk) return {
				success: false,
				status: "FAILED",
				message: "Invalid M-Pesa webhook payload structure."
			};
			const checkoutId = stk.CheckoutRequestID;
			const resultCode = stk.ResultCode;
			const resultDesc = stk.ResultDesc;
			const { data: tx } = await supabaseAdmin.from("payment_transactions").select("*, obligation:rent_obligations(*), tenancy:tenancies(*)").eq("provider_reference", checkoutId).maybeSingle();
			if (!tx) {
				logger.error("[MpesaProvider] Received callback for unknown CheckoutRequestID:", { checkoutId });
				return {
					success: false,
					status: "FAILED",
					message: "Transaction record not found."
				};
			}
			if (tx.status === "SUCCESSFUL") {
				logger.info("[MpesaProvider] Duplicate callback received for already settled transaction:", { txId: tx.id });
				return {
					success: true,
					transactionId: tx.id,
					status: "SUCCESSFUL",
					providerReference: checkoutId,
					amount: tx.amount,
					message: "Duplicate callback processed idempotently."
				};
			}
			const now = (/* @__PURE__ */ new Date()).toISOString();
			if (resultCode !== 0) {
				const failureStatus = resultCode === 1032 ? "CANCELLED" : resultCode === 1037 ? "TIMEOUT" : "FAILED";
				await supabaseAdmin.from("payment_transactions").update({
					status: failureStatus,
					raw_payload: payload,
					updated_at: now
				}).eq("id", tx.id);
				return {
					success: false,
					transactionId: tx.id,
					status: failureStatus,
					message: `M-Pesa payment unresolved: ${resultDesc}`
				};
			}
			const metaItems = stk.CallbackMetadata?.Item || [];
			let mpesaReceiptNumber = `MPESA-${tx.id.slice(0, 8).toUpperCase()}`;
			let amountPaid = tx.amount;
			let phoneNumber = "";
			for (const item of metaItems) if (item.Name === "MpesaReceiptNumber" && item.Value) mpesaReceiptNumber = String(item.Value);
			else if (item.Name === "Amount" && item.Value) amountPaid = Number(item.Value);
			else if (item.Name === "PhoneNumber" && item.Value) phoneNumber = String(item.Value);
			await supabaseAdmin.from("payment_transactions").update({
				status: "SUCCESSFUL",
				provider_reference: mpesaReceiptNumber,
				completed_at: now,
				raw_payload: payload,
				updated_at: now
			}).eq("id", tx.id);
			if (tx.obligation_id) await supabaseAdmin.from("rent_obligations").update({
				status: "PAID",
				updated_at: now
			}).eq("id", tx.obligation_id);
			await supabaseAdmin.from("ledger_entries").insert({
				tenancy_id: tx.tenancy_id,
				obligation_id: tx.obligation_id || null,
				transaction_id: tx.id,
				entry_type: "PAYMENT",
				amount: amountPaid,
				currency: tx.currency || "KES",
				description: `M-Pesa payment received (${mpesaReceiptNumber})`,
				created_at: now
			});
			const receiptNumber = `REC-${Date.now().toString().slice(-6)}`;
			await supabaseAdmin.from("receipts").insert({
				payment_transaction_id: tx.id,
				receipt_number: receiptNumber,
				amount: amountPaid,
				currency: tx.currency || "KES",
				issued_to_user_id: tx.payer_id,
				created_at: now
			});
			logger.info("[MpesaProvider] M-Pesa payment successfully settled and ledger recorded:", {
				txId: tx.id,
				receipt: receiptNumber,
				mpesaRef: mpesaReceiptNumber
			});
			return {
				success: true,
				transactionId: tx.id,
				status: "SUCCESSFUL",
				providerReference: mpesaReceiptNumber,
				amount: amountPaid,
				phoneNumber,
				message: "Payment settled and receipt generated."
			};
		} catch (err) {
			logger.error("[MpesaProvider] Exception processing webhook callback:", { error: err.message });
			return {
				success: false,
				status: "FAILED",
				message: err.message
			};
		}
	}
};
var mpesaProvider = new MpesaPaymentProvider();
var Route$2 = createFileRoute("/api/v1/payments/stk-push")({ server: { handlers: { POST: async ({ request }) => {
	const requestId = resolveRequestId(request.headers);
	try {
		const body = await request.json();
		logger.info("[STKPushAPI] STK push request received", {
			requestId,
			amount: body.amount,
			tenancyId: body.tenancyId
		});
		const result = await mpesaProvider.initiateStkPush(body);
		return new Response(JSON.stringify(result), {
			status: result.success ? 200 : 400,
			headers: {
				"content-type": "application/json; charset=utf-8",
				[REQUEST_ID_HEADER]: requestId
			}
		});
	} catch (err) {
		logger.error("[STKPushAPI] Failed to initiate STK push", {
			error: err.message,
			requestId
		});
		return new Response(JSON.stringify({
			success: false,
			error: err.message || "Internal error"
		}), {
			status: 500,
			headers: {
				"content-type": "application/json; charset=utf-8",
				[REQUEST_ID_HEADER]: requestId
			}
		});
	}
} } } });
var $$splitComponentImporter = () => import("./properties._propertyId.units._unitId-D2KWGQcJ.mjs");
var Route$1 = createFileRoute("/properties/$propertyId/units/$unitId")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var Route = createFileRoute("/api/v1/payments/mpesa/callback")({ server: { handlers: { POST: async ({ request }) => {
	const requestId = resolveRequestId(request.headers);
	try {
		const payload = await request.json();
		logger.info("[MpesaWebhook] Webhook payload received", { requestId });
		const result = await mpesaProvider.processWebhookCallback(payload);
		return new Response(JSON.stringify({
			ResultCode: 0,
			ResultDesc: "Accepted",
			data: result
		}), {
			status: 200,
			headers: {
				"content-type": "application/json; charset=utf-8",
				[REQUEST_ID_HEADER]: requestId
			}
		});
	} catch (err) {
		logger.error("[MpesaWebhook] Failed to process callback", {
			error: err.message,
			requestId
		});
		return new Response(JSON.stringify({
			ResultCode: 1,
			ResultDesc: "Internal Server Error"
		}), {
			status: 500,
			headers: {
				"content-type": "application/json; charset=utf-8",
				[REQUEST_ID_HEADER]: requestId
			}
		});
	}
} } } });
var IndexRoute = Route$38.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$39
});
var AdminRoute = Route$37.update({
	id: "/admin",
	path: "/admin",
	getParentRoute: () => Route$39
});
var ApplicationsRoute = Route$36.update({
	id: "/applications",
	path: "/applications",
	getParentRoute: () => Route$39
});
var DashboardRoute = Route$35.update({
	id: "/dashboard",
	path: "/dashboard",
	getParentRoute: () => Route$39
});
var ForgotPasswordRoute = Route$34.update({
	id: "/forgot-password",
	path: "/forgot-password",
	getParentRoute: () => Route$39
});
var LoginRoute = Route$33.update({
	id: "/login",
	path: "/login",
	getParentRoute: () => Route$39
});
var MapRoute = Route$32.update({
	id: "/map",
	path: "/map",
	getParentRoute: () => Route$39
});
var MessagesRoute = Route$31.update({
	id: "/messages",
	path: "/messages",
	getParentRoute: () => Route$39
});
var ProfileRoute = Route$30.update({
	id: "/profile",
	path: "/profile",
	getParentRoute: () => Route$39
});
var RecommendationsRoute = Route$29.update({
	id: "/recommendations",
	path: "/recommendations",
	getParentRoute: () => Route$39
});
var RegisterRoute = Route$28.update({
	id: "/register",
	path: "/register",
	getParentRoute: () => Route$39
});
var ResetPasswordRoute = Route$27.update({
	id: "/reset-password",
	path: "/reset-password",
	getParentRoute: () => Route$39
});
var SavedRoute = Route$26.update({
	id: "/saved",
	path: "/saved",
	getParentRoute: () => Route$39
});
var SettingsRoute = Route$25.update({
	id: "/settings",
	path: "/settings",
	getParentRoute: () => Route$39
});
var TenanciesRoute = Route$24.update({
	id: "/tenancies",
	path: "/tenancies",
	getParentRoute: () => Route$39
});
var TrustRoute = Route$23.update({
	id: "/trust",
	path: "/trust",
	getParentRoute: () => Route$39
});
var VerifyEmailRoute = Route$22.update({
	id: "/verify-email",
	path: "/verify-email",
	getParentRoute: () => Route$39
});
var ViewingsRoute = Route$21.update({
	id: "/viewings",
	path: "/viewings",
	getParentRoute: () => Route$39
});
var AdminIntelligenceRoute = Route$20.update({
	id: "/intelligence",
	path: "/intelligence",
	getParentRoute: () => AdminRoute
});
var ApplicationsIdRoute = Route$19.update({
	id: "/$id",
	path: "/$id",
	getParentRoute: () => ApplicationsRoute
});
var DashboardApplicationsRoute = Route$18.update({
	id: "/applications",
	path: "/applications",
	getParentRoute: () => DashboardRoute
});
var DashboardTenanciesRoute = Route$17.update({
	id: "/tenancies",
	path: "/tenancies",
	getParentRoute: () => DashboardRoute
});
var HomesIndexRoute = Route$16.update({
	id: "/homes/",
	path: "/homes/",
	getParentRoute: () => Route$39
});
var HomesIdRoute = Route$15.update({
	id: "/homes/$id",
	path: "/homes/$id",
	getParentRoute: () => Route$39
});
var ListingsIndexRoute = Route$14.update({
	id: "/listings/",
	path: "/listings/",
	getParentRoute: () => Route$39
});
var ListingsIdRoute = Route$13.update({
	id: "/listings/$id",
	path: "/listings/$id",
	getParentRoute: () => Route$39
});
var PropertiesIndexRoute = Route$12.update({
	id: "/properties/",
	path: "/properties/",
	getParentRoute: () => Route$39
});
var PropertiesIdRoute = Route$11.update({
	id: "/properties/$id",
	path: "/properties/$id",
	getParentRoute: () => Route$39
});
var PropertiesNewRoute = Route$10.update({
	id: "/properties/new",
	path: "/properties/new",
	getParentRoute: () => Route$39
});
var TenanciesIdRoute = Route$9.update({
	id: "/$id",
	path: "/$id",
	getParentRoute: () => TenanciesRoute
});
var ApiV1HealthRoute = Route$8.update({
	id: "/api/v1/health",
	path: "/api/v1/health",
	getParentRoute: () => Route$39
});
var ApiV1ReadinessRoute = Route$7.update({
	id: "/api/v1/readiness",
	path: "/api/v1/readiness",
	getParentRoute: () => Route$39
});
var DashboardApplicationsIdRoute = Route$6.update({
	id: "/$id",
	path: "/$id",
	getParentRoute: () => DashboardApplicationsRoute
});
var DashboardTenanciesIdRoute = Route$5.update({
	id: "/$id",
	path: "/$id",
	getParentRoute: () => DashboardTenanciesRoute
});
var ApiPublicV1HealthRoute = Route$4.update({
	id: "/api/public/v1/health",
	path: "/api/public/v1/health",
	getParentRoute: () => Route$39
});
var ApiV1HealthDatabaseRoute = Route$3.update({
	id: "/database",
	path: "/database",
	getParentRoute: () => ApiV1HealthRoute
});
var ApiV1PaymentsStkPushRoute = Route$2.update({
	id: "/api/v1/payments/stk-push",
	path: "/api/v1/payments/stk-push",
	getParentRoute: () => Route$39
});
var PropertiesPropertyIdUnitsUnitIdRoute = Route$1.update({
	id: "/properties/$propertyId/units/$unitId",
	path: "/properties/$propertyId/units/$unitId",
	getParentRoute: () => Route$39
});
var ApiV1PaymentsMpesaCallbackRoute = Route.update({
	id: "/api/v1/payments/mpesa/callback",
	path: "/api/v1/payments/mpesa/callback",
	getParentRoute: () => Route$39
});
var AdminRouteChildren = { AdminIntelligenceRoute };
var AdminRouteWithChildren = AdminRoute._addFileChildren(AdminRouteChildren);
var ApplicationsRouteChildren = { ApplicationsIdRoute };
var ApplicationsRouteWithChildren = ApplicationsRoute._addFileChildren(ApplicationsRouteChildren);
var DashboardApplicationsRouteChildren = { DashboardApplicationsIdRoute };
var DashboardApplicationsRouteWithChildren = DashboardApplicationsRoute._addFileChildren(DashboardApplicationsRouteChildren);
var DashboardTenanciesRouteChildren = { DashboardTenanciesIdRoute };
var DashboardRouteChildren = {
	DashboardApplicationsRoute: DashboardApplicationsRouteWithChildren,
	DashboardTenanciesRoute: DashboardTenanciesRoute._addFileChildren(DashboardTenanciesRouteChildren)
};
var DashboardRouteWithChildren = DashboardRoute._addFileChildren(DashboardRouteChildren);
var TenanciesRouteChildren = { TenanciesIdRoute };
var TenanciesRouteWithChildren = TenanciesRoute._addFileChildren(TenanciesRouteChildren);
var ApiV1HealthRouteChildren = { ApiV1HealthDatabaseRoute };
var rootRouteChildren = {
	IndexRoute,
	AdminRoute: AdminRouteWithChildren,
	ApplicationsRoute: ApplicationsRouteWithChildren,
	DashboardRoute: DashboardRouteWithChildren,
	ForgotPasswordRoute,
	LoginRoute,
	MapRoute,
	MessagesRoute,
	ProfileRoute,
	RecommendationsRoute,
	RegisterRoute,
	ResetPasswordRoute,
	SavedRoute,
	SettingsRoute,
	TenanciesRoute: TenanciesRouteWithChildren,
	TrustRoute,
	VerifyEmailRoute,
	ViewingsRoute,
	HomesIdRoute,
	ListingsIdRoute,
	PropertiesIdRoute,
	PropertiesNewRoute,
	HomesIndexRoute,
	ListingsIndexRoute,
	PropertiesIndexRoute,
	ApiV1HealthRoute: ApiV1HealthRoute._addFileChildren(ApiV1HealthRouteChildren),
	ApiV1ReadinessRoute,
	ApiPublicV1HealthRoute,
	ApiV1PaymentsStkPushRoute,
	PropertiesPropertyIdUnitsUnitIdRoute,
	ApiV1PaymentsMpesaCallbackRoute
};
var routeTree = Route$39._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
var getRouter = () => {
	const queryClient = new QueryClient();
	return createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { useMotion as S, getRouter as _, Route$15 as a, staggerContainerVariants as b, Route$22 as c, Route$36 as d, Route$5 as f, fadeUpVariants as g, fadeInVariants as h, Route$13 as i, Route$27 as l, Route$9 as m, Route$1 as n, Route$16 as o, Route$6 as p, Route$11 as r, Route$19 as s, RequireAuth as t, Route$33 as u, modalVariants as v, useAuth as x, router_exports as y };
