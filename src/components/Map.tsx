import React, { useEffect, useRef, useState } from "react";
import type { ListingSearchResult } from "@/features/properties/search.types";

interface MapProps {
  listings: ListingSearchResult[];
  activeListingId: string | null;
  onMarkerClick?: (listingId: string) => void;
  onBoundsChange?: (bounds: { north: number; south: number; east: number; west: number }) => void;
}

export const PropertyMap: React.FC<MapProps> = ({
  listings,
  activeListingId,
  onMarkerClick,
  onBoundsChange,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<Record<string, any>>({});
  const [isLeafletLoaded, setIsLeafletLoaded] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const LRef = useRef<any>(null);

  // 1. Dynamic import of Leaflet on client-side mounting
  useEffect(() => {
    if (typeof window === "undefined" || mapRef.current) return;

    // Load Leaflet CSS dynamically
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    // Import Leaflet JS
    import("leaflet").then((L) => {
      LRef.current = L;
      setIsLeafletLoaded(true);

      if (mapContainerRef.current) {
        // Default center: Nairobi coordinates
        const nairobiLat = -1.2921;
        const nairobiLng = 36.8219;

        const map = L.map(mapContainerRef.current, {
          center: [nairobiLat, nairobiLng],
          zoom: 12,
          zoomControl: false,
        });

        // Add Zoom Control at bottom right
        L.control.zoom({ position: "bottomright" }).addTo(map);

        // Add CartoDB Positron (modern light-mode map tiles)
        L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 20,
        }).addTo(map);

        mapRef.current = map;

        // Bounding box trigger
        map.on("moveend", () => {
          if (onBoundsChange) {
            const bounds = map.getBounds();
            onBoundsChange({
              north: bounds.getNorth(),
              south: bounds.getSouth(),
              east: bounds.getEast(),
              west: bounds.getWest(),
            });
          }
        });
      }
    });

    return () => {
      // Cleanup map on unmount
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      link.remove();
    };
  }, []);

  // 2. Render and update map markers when listings change
  useEffect(() => {
    if (!isLeafletLoaded || !mapRef.current) return;

    const L = LRef.current;
    const map = mapRef.current;

    // Remove existing markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    if (listings.length === 0) return;

    const markerBounds: [number, number][] = [];

    listings.forEach((listing) => {
      // Use display latitude/longitude (fuzzed coordinates for privacy)
      const lat = listing.displayLatitude ?? listing.latitude;
      const lng = listing.displayLongitude ?? listing.longitude;

      if (!lat || !lng) return;

      markerBounds.push([lat, lng]);

      // Format price for the tag (e.g. KES 25K)
      const formattedPrice =
        listing.price >= 1000 ? `${(listing.price / 1000).toFixed(0)}k` : listing.price.toString();

      const isActive = activeListingId === listing.id;

      // Custom premium HTML Price Badge DivIcon
      const icon = L.divIcon({
        className: "custom-div-icon",
        html: `
          <button class="flex items-center justify-center px-2.5 py-1.5 rounded-xl font-display font-extrabold text-[11px] shadow-md border transition-all duration-300 transform cursor-pointer whitespace-nowrap ${
            isActive
              ? "bg-accent border-accent text-accent-foreground scale-110 ring-2 ring-accent/30 z-50"
              : "bg-background border-border text-primary hover:border-primary/50 hover:scale-105 z-10"
          }">
            ${listing.currency} ${formattedPrice}
          </button>
        `,
        iconSize: [60, 28],
        iconAnchor: [30, 14],
      });

      const marker = L.marker([lat, lng], { icon }).addTo(map);

      // Info Popup markup
      const popupContent = `
        <div class="p-1 font-sans max-w-[200px]">
          ${
            listing.primaryImageUrl
              ? `<img src="${listing.primaryImageUrl}" class="w-full h-24 object-cover rounded-lg mb-2 border border-border/80" alt="${listing.title}" />`
              : ""
          }
          <h4 class="font-display font-bold text-xs text-foreground line-clamp-1 mb-0.5">${listing.title}</h4>
          <p class="text-[10px] text-muted-foreground font-semibold mb-1">${listing.town}, ${listing.county}</p>
          <div class="flex justify-between items-center mt-2 border-t border-border/40 pt-1.5">
            <span class="font-display font-extrabold text-xs text-primary">${listing.currency} ${Number(listing.price).toLocaleString()}</span>
            <a href="/homes/${listing.id}" class="text-[10px] font-bold text-accent hover:underline">Details &rarr;</a>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        closeButton: false,
        offset: [0, -10],
      });

      // Events
      marker.on("click", () => {
        marker.openPopup();
        if (onMarkerClick) {
          onMarkerClick(listing.id);
        }
      });

      markersRef.current[listing.id] = marker;
    });

    // Auto-fit bounds if we have pins, but avoid jarring map shifts on dynamic paging
    if (markerBounds.length > 0 && listings.length > 0) {
      map.fitBounds(markerBounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [listings, isLeafletLoaded, activeListingId]);

  // 3. Highlight / open popup when activeListingId changes
  useEffect(() => {
    if (!isLeafletLoaded || !mapRef.current || !activeListingId) return;

    const marker = markersRef.current[activeListingId];
    if (marker) {
      // Re-trigger layout updates on leaflet nodes for active elements
      const latLng = marker.getLatLng();
      mapRef.current.setView(latLng, mapRef.current.getZoom(), { animate: true });
      marker.openPopup();
    }
  }, [activeListingId, isLeafletLoaded]);

  return (
    <div className="relative w-full h-full min-h-[300px] rounded-2xl overflow-hidden border border-border shadow-inner bg-secondary/15 flex items-center justify-center">
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-10" />
      {!isLeafletLoaded && (
        <div className="flex flex-col items-center justify-center gap-2 z-20">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Loading maps system...
          </span>
        </div>
      )}
    </div>
  );
};
