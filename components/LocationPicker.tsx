"use client";

import { useEffect, useRef, useState } from "react";

type SearchResult = {
  lat: number;
  lng: number;
  label: string;
};

declare global {
  interface Window {
    L?: any;
  }
}

let leafletPromise: Promise<any> | null = null;

function loadLeaflet() {
  if (typeof window === "undefined") return Promise.reject(new Error("Map unavailable."));
  if (window.L) return Promise.resolve(window.L);
  if (leafletPromise) return leafletPromise;

  leafletPromise = new Promise((resolve, reject) => {
    if (!document.querySelector('link[data-qah-leaflet="true"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.dataset.qahLeaflet = "true";
      document.head.appendChild(link);
    }

    const existing = document.querySelector<HTMLScriptElement>('script[data-qah-leaflet="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(window.L), { once: true });
      existing.addEventListener("error", () => reject(new Error("Map library failed to load.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.dataset.qahLeaflet = "true";
    script.onload = () => resolve(window.L);
    script.onerror = () => reject(new Error("Map library failed to load."));
    document.head.appendChild(script);
  });

  return leafletPromise;
}

export default function LocationPicker({
  initialLocation = "",
  initialLatitude = null,
  initialLongitude = null,
}: {
  initialLocation?: string;
  initialLatitude?: number | null;
  initialLongitude?: number | null;
}) {
  const [location, setLocation] = useState(initialLocation);
  const [latitude, setLatitude] = useState<number | null>(initialLatitude);
  const [longitude, setLongitude] = useState<number | null>(initialLongitude);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [message, setMessage] = useState("");
  const [searching, setSearching] = useState(false);
  const mapElement = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  function setPoint(lat: number, lng: number, label?: string) {
    setLatitude(lat);
    setLongitude(lng);
    if (label) setLocation(label);

    const L = window.L;
    const map = mapRef.current;
    if (!L || !map) return;

    if (!markerRef.current) {
      markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(map);
      markerRef.current.on("dragend", async (event: any) => {
        const next = event.target.getLatLng();
        setLatitude(next.lat);
        setLongitude(next.lng);
        await reverseLookup(next.lat, next.lng);
      });
    } else {
      markerRef.current.setLatLng([lat, lng]);
    }
    map.setView([lat, lng], Math.max(map.getZoom(), 15));
  }

  async function reverseLookup(lat: number, lng: number) {
    try {
      const response = await fetch(`/api/geocode?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`, { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      if (typeof data.label === "string" && data.label.trim()) setLocation(data.label.trim());
    } catch {
      // Coordinates are still valid even when address lookup is unavailable.
    }
  }

  useEffect(() => {
    if (!open || !mapElement.current || mapRef.current) return;
    let cancelled = false;

    loadLeaflet()
      .then((L) => {
        if (cancelled || !mapElement.current) return;
        const hasPoint = latitude !== null && longitude !== null;
        const center: [number, number] = hasPoint ? [latitude!, longitude!] : [7.2, 124.25];
        const map = L.map(mapElement.current, { zoomControl: true }).setView(center, hasPoint ? 15 : 7);
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
        }).addTo(map);
        map.on("click", async (event: any) => {
          setPoint(event.latlng.lat, event.latlng.lng);
          await reverseLookup(event.latlng.lat, event.latlng.lng);
        });
        mapRef.current = map;
        if (hasPoint) setPoint(latitude!, longitude!);
        window.setTimeout(() => map.invalidateSize(), 0);
      })
      .catch(() => setMessage("Map could not load. You can still type the location manually."));

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [open]);

  async function search() {
    const clean = query.trim();
    if (!clean) return;
    setSearching(true);
    setMessage("");
    setResults([]);
    try {
      const response = await fetch(`/api/geocode?q=${encodeURIComponent(clean)}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Search failed.");
      setResults(Array.isArray(data.results) ? data.results : []);
      if (!data.results?.length) setMessage("No matching place found. Try a broader place name or click the map.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Location search failed.");
    } finally {
      setSearching(false);
    }
  }

  function useCurrentLocation() {
    setMessage("");
    if (!navigator.geolocation) {
      setMessage("Current location is not supported by this browser.");
      return;
    }
    setMessage("Getting your current location…");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setPoint(lat, lng);
        setMessage("");
        await reverseLookup(lat, lng);
      },
      () => setMessage("Could not get your location. Check browser location permission or choose a point on the map."),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }

  function clearPin() {
    setLatitude(null);
    setLongitude(null);
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    setMessage("Map pin cleared. The typed location will still be saved.");
  }

  return (
    <div className="field full locationField">
      <label htmlFor="location">Location</label>
      <input
        className="input"
        id="location"
        name="location"
        value={location}
        onChange={(event) => setLocation(event.target.value)}
        placeholder="e.g. Datu Odin Sinsuat, Maguindanao del Norte"
        autoComplete="off"
        required
      />
      <input type="hidden" name="latitude" value={latitude ?? ""} />
      <input type="hidden" name="longitude" value={longitude ?? ""} />

      <div className="locationTools">
        <button className="button secondary small" type="button" onClick={() => setOpen((value) => !value)}>
          {open ? "Close map" : latitude !== null ? "Adjust map pin" : "Set on map"}
        </button>
        {latitude !== null && longitude !== null ? (
          <>
            <span className="coordinateReadout">Pin saved · {latitude.toFixed(5)}, {longitude.toFixed(5)}</span>
            <button className="textButton" type="button" onClick={clearPin}>Clear pin</button>
          </>
        ) : (
          <span className="fieldHint">Optional map pin. The written location is still required.</span>
        )}
      </div>

      {open ? (
        <div className="locationPanel">
          <div className="locationPanelTop">
            <div className="locationSearch">
              <input
                className="input"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void search();
                  }
                }}
                placeholder="Search barangay, municipality, or place"
                aria-label="Search map location"
              />
              <button className="button secondary small" type="button" onClick={() => void search()} disabled={searching}>{searching ? "Searching…" : "Search"}</button>
            </div>
            <button className="button ghost small" type="button" onClick={useCurrentLocation}>Use current location</button>
          </div>

          {results.length ? (
            <div className="locationResults" aria-label="Location search results">
              {results.map((result) => (
                <button
                  type="button"
                  className="locationResult"
                  key={`${result.lat}-${result.lng}-${result.label}`}
                  onClick={() => {
                    setPoint(result.lat, result.lng, result.label);
                    setResults([]);
                    setQuery("");
                  }}
                >
                  {result.label}
                </button>
              ))}
            </div>
          ) : null}

          {message ? <div className="locationMessage">{message}</div> : null}
          <div ref={mapElement} className="locationMap" aria-label="Project location map" />
          <p className="mapHint">Search, use your current location, or click the map. Drag the pin for a more exact site location.</p>
        </div>
      ) : null}
    </div>
  );
}
