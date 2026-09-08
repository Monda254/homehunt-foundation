import "../_runtime.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { p as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { Ct as ArrowRight, M as MapPin, U as House, bt as Bed, l as Trash2, mt as Calendar, xt as Bath } from "../_libs/lucide-react.mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
var PropertyCard = ({ property, onArchive }) => {
	const unitCount = property.units?.[0]?.count ?? 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "surface-card p-5 border border-border shadow-sm flex flex-col justify-between hover:shadow-md transition-all",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-between items-start gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20",
					children: property.property_type.replace("_", " ")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: `px-2 py-0.5 rounded text-[10px] font-bold border ${property.status === "ACTIVE" ? "bg-verified/10 text-verified border-verified/20" : property.status === "DRAFT" ? "bg-secondary text-muted-foreground border-border" : "bg-yellow-500/10 text-yellow-700 border-yellow-500/20"}`,
					children: property.status
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-display font-bold text-lg text-foreground mt-3 truncate",
				children: property.name
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted-foreground mt-1 flex items-center gap-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-3.5 w-3.5 text-primary shrink-0" }),
					property.town,
					", ",
					property.county
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 flex items-center gap-4 text-xs font-semibold text-muted-foreground bg-secondary/30 p-2 rounded-lg border border-border/40",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "h-4 w-4 text-primary" }),
						" ",
						unitCount,
						" ",
						unitCount === 1 ? "Unit" : "Units"
					]
				})
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex gap-2 mt-6 pt-4 border-t border-border/60",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/properties/$id",
				params: { id: property.id },
				className: "flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/95 transition-all text-center",
				children: "Manage"
			}), onArchive && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => onArchive(property.id),
				className: "p-2 border border-border rounded-lg text-destructive hover:bg-destructive/5 transition-all cursor-pointer",
				title: "Archive Property",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
			})]
		})]
	});
};
var ListingCard = ({ listing }) => {
	const prop = listing.properties;
	const unit = listing.units;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative aspect-[16/10] bg-secondary/30 overflow-hidden shrink-0",
			children: [listing.primaryImageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: listing.primaryImageUrl,
				alt: listing.title,
				className: "w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full h-full flex flex-col items-center justify-center text-muted-foreground/60 gap-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "h-10 w-10 stroke-[1.5]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[10px] font-bold uppercase tracking-wider",
					children: "No Image Uploaded"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute top-3 left-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[10px] font-bold uppercase tracking-wider text-background bg-foreground/80 backdrop-blur-sm px-2.5 py-1 rounded-lg",
					children: prop?.property_type.replace("_", " ") || "RENTAL"
				})
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "p-5 flex-1 flex flex-col justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex justify-between items-baseline gap-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-display font-extrabold text-lg text-primary",
						children: [
							listing.currency,
							" ",
							Number(listing.price).toLocaleString(),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide",
								children: [
									" ",
									"/ ",
									listing.billing_period.toLowerCase()
								]
							})
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
					className: "font-display font-bold text-foreground text-base mt-2 group-hover:text-primary transition-colors line-clamp-2",
					children: listing.title
				}),
				prop && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted-foreground mt-2.5 flex items-center gap-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-3.5 w-3.5 text-primary shrink-0" }),
						prop.town,
						", ",
						prop.county,
						prop.neighborhood ? ` (${prop.neighborhood})` : ""
					]
				}),
				unit && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-4 items-center mt-4 text-xs font-semibold text-muted-foreground/85 border-t border-border/40 pt-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bed, { className: "h-4 w-4 text-primary" }),
							" ",
							unit.bedrooms,
							" ",
							unit.bedrooms === 1 ? "Bed" : "Beds"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bath, { className: "h-4 w-4 text-primary" }),
							" ",
							unit.bathrooms,
							" ",
							unit.bathrooms === 1 ? "Bath" : "Baths"
						]
					})]
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 pt-3 border-t border-border/40 flex justify-between items-center text-xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-1 text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-3.5 w-3.5" }),
						"Avail: ",
						new Date(listing.availability_date).toLocaleDateString()
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/homes/$id",
					params: { id: listing.id },
					className: "inline-flex items-center gap-1 font-bold text-primary hover:underline hover:gap-1.5 transition-all",
					children: ["Details ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-3.5 w-3.5" })]
				})]
			})]
		})]
	});
};
//#endregion
export { PropertyCard as n, ListingCard as t };
