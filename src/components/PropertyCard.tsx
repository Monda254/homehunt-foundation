import React from "react";
import { Link } from "@tanstack/react-router";
import { MapPin, Home, Bed, Bath, Calendar, Trash2, ArrowRight } from "lucide-react";

export interface PropertyData {
  id: string;
  name: string;
  property_type: string;
  county: string;
  town: string;
  status: string;
  units?: { count: number }[];
}

interface PropertyCardProps {
  property: PropertyData;
  onArchive?: (id: string) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onArchive }) => {
  const unitCount = property.units?.[0]?.count ?? 0;

  return (
    <div className="surface-card p-5 border border-border shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
      <div>
        <div className="flex justify-between items-start gap-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
            {property.property_type.replace("_", " ")}
          </span>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
              property.status === "ACTIVE"
                ? "bg-verified/10 text-verified border-verified/20"
                : property.status === "DRAFT"
                  ? "bg-secondary text-muted-foreground border-border"
                  : "bg-yellow-500/10 text-yellow-700 border-yellow-500/20"
            }`}
          >
            {property.status}
          </span>
        </div>

        <h3 className="font-display font-bold text-lg text-foreground mt-3 truncate">
          {property.name}
        </h3>

        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
          {property.town}, {property.county}
        </p>

        <div className="mt-4 flex items-center gap-4 text-xs font-semibold text-muted-foreground bg-secondary/30 p-2 rounded-lg border border-border/40">
          <span className="flex items-center gap-1">
            <Home className="h-4 w-4 text-primary" /> {unitCount}{" "}
            {unitCount === 1 ? "Unit" : "Units"}
          </span>
        </div>
      </div>

      <div className="flex gap-2 mt-6 pt-4 border-t border-border/60">
        <Link
          to="/properties/$id"
          params={{ id: property.id }}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/95 transition-all text-center"
        >
          Manage
        </Link>
        {onArchive && (
          <button
            onClick={() => onArchive(property.id)}
            className="p-2 border border-border rounded-lg text-destructive hover:bg-destructive/5 transition-all cursor-pointer"
            title="Archive Property"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export interface ListingCardData {
  id: string;
  title: string;
  price: number;
  currency: string;
  billing_period: string;
  availability_date: string;
  primaryImageUrl?: string | null;
  properties?: {
    property_type: string;
    county: string;
    town: string;
    neighborhood?: string | null;
  } | null;
  units?: {
    bedrooms: number;
    bathrooms: number;
  } | null;
}

interface ListingCardProps {
  listing: ListingCardData;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  const prop = listing.properties;
  const unit = listing.units;

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group">
      {/* Image Gallery Header */}
      <div className="relative aspect-[16/10] bg-secondary/30 overflow-hidden shrink-0">
        {listing.primaryImageUrl ? (
          <img
            src={listing.primaryImageUrl}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/60 gap-1.5">
            <Home className="h-10 w-10 stroke-[1.5]" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              No Image Uploaded
            </span>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-background bg-foreground/80 backdrop-blur-sm px-2.5 py-1 rounded-lg">
            {prop?.property_type.replace("_", " ") || "RENTAL"}
          </span>
        </div>
      </div>

      {/* Card Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-baseline gap-2">
            <p className="font-display font-extrabold text-lg text-primary">
              {listing.currency} {Number(listing.price).toLocaleString()}
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {" "}
                / {listing.billing_period.toLowerCase()}
              </span>
            </p>
          </div>

          <h4 className="font-display font-bold text-foreground text-base mt-2 group-hover:text-primary transition-colors line-clamp-2">
            {listing.title}
          </h4>

          {prop && (
            <p className="text-xs text-muted-foreground mt-2.5 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
              {prop.town}, {prop.county}
              {prop.neighborhood ? ` (${prop.neighborhood})` : ""}
            </p>
          )}

          {unit && (
            <div className="flex gap-4 items-center mt-4 text-xs font-semibold text-muted-foreground/85 border-t border-border/40 pt-3">
              <span className="flex items-center gap-1">
                <Bed className="h-4 w-4 text-primary" /> {unit.bedrooms}{" "}
                {unit.bedrooms === 1 ? "Bed" : "Beds"}
              </span>
              <span className="flex items-center gap-1">
                <Bath className="h-4 w-4 text-primary" /> {unit.bathrooms}{" "}
                {unit.bathrooms === 1 ? "Bath" : "Baths"}
              </span>
            </div>
          )}
        </div>

        <div className="mt-5 pt-3 border-t border-border/40 flex justify-between items-center text-xs">
          <span className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            Avail: {new Date(listing.availability_date).toLocaleDateString()}
          </span>
          <Link
            to="/homes/$id"
            params={{ id: listing.id }}
            className="inline-flex items-center gap-1 font-bold text-primary hover:underline hover:gap-1.5 transition-all"
          >
            Details <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
