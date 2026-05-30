import { useState, useEffect, useRef } from "react";
import { 
  Search, 
  MapPin, 
  Filter, 
  Plus, 
  Compass, 
  MessageSquare, 
  ThumbsUp, 
  ShieldAlert, 
  Layers, 
  CheckCircle, 
  X, 
  Map as MapIcon, 
  Grid, 
  Phone, 
  CornerDownRight, 
  Clock, 
  Info,
  ExternalLink 
} from "lucide-react";
import "./PureGas.css";

const STATES_AND_PROVINCES = [
  { code: "TX", name: "Texas", country: "US" },
  { code: "CA", name: "California", country: "US" },
  { code: "FL", name: "Florida", country: "US" },
  { code: "NY", name: "New York", country: "US" },
  { code: "WA", name: "Washington", country: "US" },
  { code: "NC", name: "North Carolina", country: "US" },
  { code: "CO", name: "Colorado", country: "US" },
  { code: "ON", name: "Ontario", country: "CA" }
];

const BRANDS = [
  "Chevron",
  "Sunoco",
  "Shell",
  "Exxon",
  "Mobil",
  "Sinclair",
  "Cenex",
  "Wawa",
  "Sheetz",
  "Maverik",
  "Canadian Tire",
  "Petro-Canada",
  "Stewart's Shops",
  "Independent"
];

// Dynamic CDN Loader for Leaflet
const loadLeafletAssets = (onLoaded) => {
  if (window.L) {
    onLoaded();
    return;
  }

  // Load CSS
  const cssId = "leaflet-cdn-css";
  if (!document.getElementById(cssId)) {
    const link = document.createElement("link");
    link.id = cssId;
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
  }

  // Load JS
  const jsId = "leaflet-cdn-js";
  if (!document.getElementById(jsId)) {
    const script = document.createElement("script");
    script.id = jsId;
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => {
      onLoaded();
    };
    document.head.appendChild(script);
  }
};

export default function PureGas() {
  // Database State with LocalStorage Persistence
  const [stations, setStations] = useState(() => {
    const saved = localStorage.getItem("puregas_stations");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse custom stations", e);
      }
    }
    return [];
  });

  // Filter & UI States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("ALL");
  const [selectedBrand, setSelectedBrand] = useState("ALL");
  const [selectedOctane, setSelectedOctane] = useState("ALL");
  
  const [showMap, setShowMap] = useState(true);
  const [selectedStation, setSelectedStation] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isLiveLoading, setIsLiveLoading] = useState(false);

  // Map reference & library state
  const [isMapLibLoaded, setIsMapLibLoaded] = useState(false);
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const markersGroupRef = useRef(null);
  const hasAutoBoundedRef = useRef(false);

  // Form states for Add Station
  const [newStation, setNewStation] = useState({
    name: "",
    brand: "Chevron",
    address: "",
    city: "",
    state: "TX",
    postalCode: "",
    phone: "",
    octanes: ["91"],
    price: "",
    notes: "",
    lat: "",
    lng: ""
  });

  // Form state for comment
  const [newComment, setNewComment] = useState({
    author: "",
    text: ""
  });

  // Save stations to local storage on modification
  useEffect(() => {
    localStorage.setItem("puregas_stations", JSON.stringify(stations));
  }, [stations]);

  // Load Leaflet libraries
  useEffect(() => {
    if (showMap) {
      loadLeafletAssets(() => {
        setIsMapLibLoaded(true);
      });
    }
  }, [showMap]);

  // Filtered station computation
  const filteredStations = stations.filter(station => {
    const matchesSearch = 
      station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      station.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      station.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      station.postalCode.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesState = selectedState === "ALL" || station.state === selectedState;
    const matchesBrand = selectedBrand === "ALL" || station.brand === selectedBrand;
    const matchesOctane = selectedOctane === "ALL" || station.octanes.includes(selectedOctane);

    return matchesSearch && matchesState && matchesBrand && matchesOctane;
  });

  // Initialize and update map
  useEffect(() => {
    if (!showMap || !isMapLibLoaded || !mapContainerRef.current) return;

    // Initialize Map if not already created
    if (!mapRef.current) {
      // Centered generally on USA/Southern Canada
      mapRef.current = window.L.map(mapContainerRef.current, {
        center: [39.8, -98.5],
        zoom: 4,
        zoomControl: false
      });

      // Add Zoom Control at bottom right
      window.L.control.zoom({ position: "bottomright" }).addTo(mapRef.current);

      // Dark Mode tile layer from CartoDB (perfectly fits our dark premium theme!)
      window.L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20
      }).addTo(mapRef.current);

      markersGroupRef.current = window.L.layerGroup().addTo(mapRef.current);
    }

    const mapInstance = mapRef.current;
    const markersGroup = markersGroupRef.current;

    // Clear previous markers
    markersGroup.clearLayers();

    // Plot new markers
    const bounds = [];
    filteredStations.forEach(station => {
      if (!station.lat || !station.lng) return;

      // Premium glowing marker icon (Custom SVG DivIcon)
      const isReported = station.status === "reported";
      const iconColor = isReported ? "var(--warning)" : "var(--emerald)";
      
      const customIcon = window.L.divIcon({
        className: "custom-leaflet-marker",
        html: `
          <div class="marker-pin" style="background-color: ${iconColor}; box-shadow: 0 0 10px ${iconColor}">
            <span class="marker-inner"></span>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = window.L.marker([station.lat, station.lng], { icon: customIcon });

      // Click callback
      marker.on("click", () => {
        setSelectedStation(station);
        mapInstance.setView([station.lat, station.lng], 13, { animate: true });
      });

      // Popup on hover
      marker.bindTooltip(`
        <div class="map-tooltip">
          <strong>${station.brand} - ${station.name}</strong>
          <div>${station.city}, ${station.state}</div>
          <div class="tooltip-price">${station.price ? `$${station.price.toFixed(2)}/gal` : "E0 Fuel"}</div>
        </div>
      `, {
        direction: "top",
        offset: [0, -10],
        className: "custom-tooltip"
      });

      marker.addTo(markersGroup);
      bounds.push([station.lat, station.lng]);
    });

    // Auto fit map bounds to markers if we have matching stations, but only on first data load
    if (bounds.length > 0 && !hasAutoBoundedRef.current) {
      mapInstance.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
      hasAutoBoundedRef.current = true;
    }

  }, [filteredStations, showMap, isMapLibLoaded]);

  // Toast notifier
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  // OSM Overpass Live Fetch logic
  const fetchLiveOSMStations = async () => {
    if (!mapRef.current) {
      triggerToast("Map is not fully initialized yet.");
      return;
    }

    setIsLiveLoading(true);
    triggerToast("Scanning OpenStreetMap for E0 pumps...");

    try {
      const center = mapRef.current.getCenter();
      // Fetch within a 50km radius of the current map center
      const radius = 50000; 
      const query = `
        [out:json][timeout:25];
        (
          node["amenity"="fuel"]["fuel:ethanol_free"="yes"](around:${radius},${center.lat},${center.lng});
          way["amenity"="fuel"]["fuel:ethanol_free"="yes"](around:${radius},${center.lat},${center.lng});
        );
        out center;
      `;

      const response = await fetch(
        `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        throw new Error("Overpass API returned an error status.");
      }

      const data = await response.json();

      if (!data.elements || data.elements.length === 0) {
        triggerToast("No new ethanol-free stations found in this region.");
        setIsLiveLoading(false);
        return;
      }

      const newFetched = data.elements.map(el => {
        const t = el.tags || {};
        const lat = el.lat || (el.center && el.center.lat) || center.lat;
        const lng = el.lon || (el.center && el.center.lon) || center.lng;

        // Try to identify brand from tags
        let brandName = "Independent";
        const brandTag = t.brand || t.operator || "";
        if (brandTag) {
          const matchedBrand = BRANDS.find(b => brandTag.toLowerCase().includes(b.toLowerCase()));
          if (matchedBrand) brandName = matchedBrand;
        }

        return {
          id: `osm-${el.id}`,
          name: t.name || `${brandName} Fuel Station`,
          brand: brandName,
          address: t["addr:street"] ? `${t["addr:housenumber"] || ""} ${t["addr:street"]}`.trim() : "Street details not tagged",
          city: t["addr:city"] || "Local Area",
          state: t["addr:state"] || "",
          postalCode: t["addr:postcode"] || "",
          phone: t.phone || t["contact:phone"] || "N/A",
          lat,
          lng,
          octanes: t["fuel:octane_91"] === "yes" ? ["91"] : ["87"],
          status: "active",
          price: t["payment:price"] ? parseFloat(t["payment:price"]) : null,
          notes: "Imported live from OpenStreetMap community records.",
          likes: 1,
          comments: []
        };
      });

      // Merge and deduplicate
      setStations(prev => {
        const existingIds = new Set(prev.map(s => s.id));
        const uniqueNew = newFetched.filter(s => !existingIds.has(s.id));

        if (uniqueNew.length === 0) {
          triggerToast("All stations in this area are already mapped!");
          return prev;
        }

        triggerToast(`Successfully loaded ${uniqueNew.length} new stations!`);
        return [...uniqueNew, ...prev];
      });

    } catch (err) {
      console.error("OSM Overpass query failed:", err);
      triggerToast("Failed to fetch live data from OpenStreetMap.");
    } finally {
      setIsLiveLoading(false);
    }
  };

  // Station Actions
  const handleLike = (id) => {
    setStations(prev => prev.map(s => {
      if (s.id === id) {
        const hasLiked = localStorage.getItem(`liked_${id}`);
        if (hasLiked) {
          triggerToast("You already upvoted this station!");
          return s;
        }
        localStorage.setItem(`liked_${id}`, "true");
        triggerToast("Station status verified & upvoted!");
        return { ...s, likes: s.likes + 1 };
      }
      return s;
    }));

    // Update details drawer state if open
    if (selectedStation && selectedStation.id === id) {
      setSelectedStation(prev => ({ ...prev, likes: prev.likes + 1 }));
    }
  };

  const handleVerifyStatus = (id, newStatus) => {
    setStations(prev => prev.map(s => {
      if (s.id === id) {
        triggerToast(`Station status reported as ${newStatus}!`);
        return { ...s, status: newStatus };
      }
      return s;
    }));

    if (selectedStation && selectedStation.id === id) {
      setSelectedStation(prev => ({ ...prev, status: newStatus }));
    }
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.author.trim() || !newComment.text.trim()) return;

    const commentObj = {
      author: newComment.author,
      text: newComment.text,
      date: new Date().toISOString().split("T")[0]
    };

    setStations(prev => prev.map(s => {
      if (s.id === selectedStation.id) {
        return { ...s, comments: [commentObj, ...s.comments] };
      }
      return s;
    }));

    setSelectedStation(prev => ({
      ...prev,
      comments: [commentObj, ...prev.comments]
    }));

    setNewComment({ author: "", text: "" });
    triggerToast("Comment added to community notes!");
  };

  const handleAddStationSubmit = (e) => {
    e.preventDefault();
    const { name, brand, address, city, state, postalCode, phone, octanes, price, notes, lat, lng } = newStation;

    if (!name || !address || !city || !postalCode) {
      triggerToast("Please fill out all mandatory fields");
      return;
    }

    // Default or parsed coordinates
    let parsedLat = parseFloat(lat);
    let parsedLng = parseFloat(lng);

    // Fallback coordinates roughly centered around state capitals if not specified
    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      const stateCenters = {
        TX: { lat: 30.2672, lng: -97.7431 },
        CA: { lat: 38.5816, lng: -121.4944 },
        FL: { lat: 30.4383, lng: -84.2807 },
        NY: { lat: 42.6526, lng: -73.7562 },
        WA: { lat: 47.0379, lng: -122.9007 },
        NC: { lat: 35.7796, lng: -78.6382 },
        CO: { lat: 39.7392, lng: -104.9903 },
        ON: { lat: 43.6532, lng: -79.3832 }
      };
      const center = stateCenters[state] || { lat: 39.8, lng: -98.5 };
      // Introduce slight offset so markers don't overlap completely
      parsedLat = center.lat + (Math.random() - 0.5) * 0.15;
      parsedLng = center.lng + (Math.random() - 0.5) * 0.15;
    }

    const stationObj = {
      id: `custom-${Date.now()}`,
      name,
      brand,
      address,
      city,
      state,
      postalCode,
      phone: phone || "N/A",
      lat: parsedLat,
      lng: parsedLng,
      octanes,
      status: "active",
      price: price ? parseFloat(price) : null,
      notes: notes || "No additional comments added.",
      likes: 1,
      comments: []
    };

    setStations(prev => [stationObj, ...prev]);
    setIsAddModalOpen(false);
    triggerToast("Station added successfully!");

    // Reset Form
    setNewStation({
      name: "",
      brand: "Chevron",
      address: "",
      city: "",
      state: "TX",
      postalCode: "",
      phone: "",
      octanes: ["91"],
      price: "",
      notes: "",
      lat: "",
      lng: ""
    });

    // Automatically focus new station
    setSelectedStation(stationObj);
    if (showMap && mapRef.current) {
      mapRef.current.setView([parsedLat, parsedLng], 12, { animate: true });
    }
  };

  const handleOctaneCheckbox = (octane) => {
    setNewStation(prev => {
      const current = [...prev.octanes];
      if (current.includes(octane)) {
        return { ...prev, octanes: current.filter(o => o !== octane) };
      } else {
        return { ...prev, octanes: [...current, octane] };
      }
    });
  };

  // Center Map on a specific station
  const focusOnStation = (station) => {
    setSelectedStation(station);
    if (showMap && mapRef.current) {
      mapRef.current.setView([station.lat, station.lng], 13, { animate: true });
    }
  };

  return (
    <div className="pg-theme">
      {/* Toast Notification */}
      {toastMessage && <div className="pg-toast">{toastMessage}</div>}

      <main className="pg-main">
        {/* Modern Header */}
        <header className="pg-header">
          <div className="pg-header-left">
            <div className="pg-logo-wrapper">
              <Compass className="pg-logo-icon" />
              <div>
                <h1 className="pg-logo">PureGas</h1>
                <p className="pg-subtitle">Ethanol-Free Fuel Directory</p>
              </div>
            </div>
          </div>
          
          <div className="pg-header-stats">
            <div className="pg-stat-card">
              <span className="val">{stations.length}</span>
              <span className="lbl">Stations</span>
            </div>
            <div className="pg-stat-card">
              <span className="val">{STATES_AND_PROVINCES.length}</span>
              <span className="lbl">States/Provs</span>
            </div>
            <div className="pg-stat-card">
              <span className="val">{stations.reduce((acc, s) => acc + s.likes, 0)}</span>
              <span className="lbl">Verifications</span>
            </div>
          </div>

          <div className="pg-header-actions">
            {/* View Toggles */}
            <div className="pg-view-toggle">
              <button 
                className={`toggle-btn ${showMap ? "active" : ""}`} 
                onClick={() => setShowMap(true)}
                title="Show Map & List"
              >
                <MapIcon size={16} />
                <span>Map</span>
              </button>
              <button 
                className={`toggle-btn ${!showMap ? "active" : ""}`} 
                onClick={() => setShowMap(false)}
                title="Show List Only"
              >
                <Grid size={16} />
                <span>List Only</span>
              </button>
            </div>

            <button 
              className={`pg-add-btn ${isLiveLoading ? "loading" : ""}`}
              onClick={fetchLiveOSMStations}
              disabled={isLiveLoading}
              style={{ background: "linear-gradient(135deg, var(--emerald), #059669)" }}
            >
              <Compass className={isLiveLoading ? "spinning-compass" : ""} size={16} />
              <span>{isLiveLoading ? "Scanning..." : "Scan Area"}</span>
            </button>

            <button className="pg-add-btn" onClick={() => setIsAddModalOpen(true)}>
              <Plus size={16} />
              <span>Add Station</span>
            </button>
          </div>
        </header>

        {/* Filter Dashboard */}
        <section className="pg-filter-bar">
          <div className="pg-search-container">
            <Search className="search-icon" size={16} />
            <input 
              type="text" 
              placeholder="Search by city, station name, address..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pg-search-input"
            />
            {searchQuery && (
              <button className="search-clear" onClick={() => setSearchQuery("")}>
                <X size={14} />
              </button>
            )}
          </div>

          <div className="pg-filters">
            <div className="filter-wrapper">
              <Filter className="inline-icon" size={12} />
              <select 
                value={selectedState} 
                onChange={e => setSelectedState(e.target.value)}
                className="pg-select"
              >
                <option value="ALL">All States / Provinces</option>
                {STATES_AND_PROVINCES.map(sp => (
                  <option key={sp.code} value={sp.code}>{sp.name} ({sp.code})</option>
                ))}
              </select>
            </div>

            <select 
              value={selectedBrand} 
              onChange={e => setSelectedBrand(e.target.value)}
              className="pg-select"
            >
              <option value="ALL">All Brands</option>
              {BRANDS.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>

            <select 
              value={selectedOctane} 
              onChange={e => setSelectedOctane(e.target.value)}
              className="pg-select"
            >
              <option value="ALL">All Octane Grades</option>
              <option value="87">87 Regular</option>
              <option value="89">89 Midgrade</option>
              <option value="90">90 Recreational</option>
              <option value="91">91 Premium</option>
              <option value="92">92 Super</option>
              <option value="93">93 Ultra Premium</option>
              <option value="94">94 Racing Elite</option>
            </select>
          </div>
        </section>

        {/* Workspace Layout */}
        <div className={`pg-workspace ${showMap ? "with-map" : "list-only"}`}>
          
          {/* Main Leaflet Map Module */}
          {showMap && (
            <div className="pg-map-wrapper">
              <div id="pg-map-container" ref={mapContainerRef} className="pg-leaflet-map">
                {!isMapLibLoaded && (
                  <div className="map-loading-overlay">
                    <Compass className="spinning-compass" size={40} />
                    <p>Initializing OpenStreetMap Tiles...</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Directory Listings */}
          <div className="pg-directory-panel">
            <div className="directory-header">
              <h3>Available Gas Stations ({filteredStations.length})</h3>
              <p>Showing crowd-sourced E0 octane listings</p>
            </div>

            <div className="directory-grid">
              {filteredStations.length === 0 ? (
                <div className="pg-empty-state">
                  <ShieldAlert size={36} className="empty-icon" />
                  <p>No pure gas stations match your active filters.</p>
                  <button className="pg-reset-filters-btn" onClick={() => {
                    setSearchQuery("");
                    setSelectedState("ALL");
                    setSelectedBrand("ALL");
                    setSelectedOctane("ALL");
                  }}>Reset Active Filters</button>
                </div>
              ) : (
                filteredStations.map(station => (
                  <div 
                    key={station.id} 
                    className={`pg-station-card ${selectedStation?.id === station.id ? "active" : ""}`}
                    onClick={() => focusOnStation(station)}
                  >
                    <div className="card-top">
                      <span className="card-brand">{station.brand}</span>
                      <span className={`card-status ${station.status}`}>
                        {station.status === "active" ? "Verified" : "Flagged"}
                      </span>
                    </div>

                    <h4 className="card-name">{station.name}</h4>
                    
                    <div className="card-row">
                      <MapPin size={12} className="card-icon" />
                      <span className="card-address">{station.address}, {station.city}, {station.state}</span>
                    </div>

                    {station.phone && station.phone !== "N/A" && (
                      <div className="card-row">
                        <Phone size={12} className="card-icon" />
                        <span className="card-phone">{station.phone}</span>
                      </div>
                    )}

                    <div className="card-footer">
                      <div className="octane-badges">
                        {station.octanes.map(oct => (
                          <span key={oct} className="oct-pill">{oct}</span>
                        ))}
                      </div>
                      <div className="card-meta">
                        <span className="upvotes">
                          <ThumbsUp size={11} className="meta-icon" />
                          {station.likes}
                        </span>
                        {station.price && (
                          <span className="price">${station.price.toFixed(2)}/g</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Slide-out Station Profile Drawer */}
      {selectedStation && (
        <div className="pg-drawer-overlay" onClick={() => setSelectedStation(null)}>
          <div className="pg-drawer" onClick={e => e.stopPropagation()}>
            <header className="drawer-header">
              <div className="drawer-title-group">
                <span className="drawer-brand">{selectedStation.brand}</span>
                <span className={`drawer-status ${selectedStation.status}`}>
                  {selectedStation.status === "active" ? "Verified Active" : "Requires Verification"}
                </span>
              </div>
              <button className="drawer-close-btn" onClick={() => setSelectedStation(null)}>
                <X size={20} />
              </button>
            </header>

            <div className="drawer-body">
              <section className="drawer-profile">
                <h2 className="profile-name">{selectedStation.name}</h2>
                
                <div className="profile-detail-card">
                  <div className="detail-item">
                    <MapPin className="item-icon" size={16} />
                    <div>
                      <span className="lbl">Location Address</span>
                      <strong className="val">{selectedStation.address}, {selectedStation.city}, {selectedStation.state} {selectedStation.postalCode}</strong>
                    </div>
                  </div>

                  <div className="detail-item">
                    <Phone className="item-icon" size={16} />
                    <div>
                      <span className="lbl">Contact Number</span>
                      <strong className="val">{selectedStation.phone}</strong>
                    </div>
                  </div>

                  <div className="detail-item">
                    <Clock className="item-icon" size={16} />
                    <div>
                      <span className="lbl">Fuel Availability</span>
                      <div className="drawer-octanes">
                        {selectedStation.octanes.map(o => (
                          <span key={o} className="oct-pill large">{o} Octane</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="detail-item">
                    <Info className="item-icon" size={16} />
                    <div>
                      <span className="lbl">Crowdsourced Price</span>
                      <strong className="val text-emerald">
                        {selectedStation.price ? `$${selectedStation.price.toFixed(2)}/gal` : "Call to Verify"}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="profile-notes">
                  <h5>Community Notes</h5>
                  <p>{selectedStation.notes}</p>
                </div>
              </section>

              {/* Interaction Panel */}
              <section className="drawer-interactions">
                <h4>Verify Station Status</h4>
                <p className="interact-p">Is this station still offering ethanol-free gas? Help the community by upvoting active pumps or flagging issues.</p>
                
                <div className="action-row">
                  <button className="action-btn upvote" onClick={() => handleLike(selectedStation.id)}>
                    <ThumbsUp size={14} />
                    <span>Upvote Active Pump ({selectedStation.likes})</span>
                  </button>

                  {selectedStation.status === "active" ? (
                    <button className="action-btn report" onClick={() => handleVerifyStatus(selectedStation.id, "reported")}>
                      <ShieldAlert size={14} />
                      <span>Report Issues</span>
                    </button>
                  ) : (
                    <button className="action-btn resolve" onClick={() => handleVerifyStatus(selectedStation.id, "active")}>
                      <CheckCircle size={14} />
                      <span>Resolve & Verify</span>
                    </button>
                  )}
                </div>
              </section>

              {/* Reviews & Forum Section */}
              <section className="drawer-comments-section">
                <div className="comment-section-header">
                  <MessageSquare size={16} className="inline-icon" />
                  <h4>Community Reviews ({selectedStation.comments.length})</h4>
                </div>

                <form onSubmit={handleAddComment} className="comment-form">
                  <input 
                    type="text" 
                    placeholder="Your Name (e.g. VintageRider)"
                    value={newComment.author}
                    onChange={e => setNewComment(prev => ({ ...prev, author: e.target.value }))}
                    className="comment-input author"
                    required
                  />
                  <textarea 
                    placeholder="Leave a review or update about fuel prices..."
                    value={newComment.text}
                    onChange={e => setNewComment(prev => ({ ...prev, text: e.target.value }))}
                    className="comment-textarea"
                    rows="3"
                    required
                  ></textarea>
                  <button type="submit" className="comment-submit-btn">Post Comment</button>
                </form>

                <div className="comments-list">
                  {selectedStation.comments.length === 0 ? (
                    <p className="no-comments-msg">No community reviews yet. Be the first to leave one!</p>
                  ) : (
                    selectedStation.comments.map((c, i) => (
                      <div key={i} className="comment-card">
                        <div className="comment-meta">
                          <strong className="comment-author">{c.author}</strong>
                          <span className="comment-date">{c.date}</span>
                        </div>
                        <p className="comment-text">{c.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* Add Station Modal Overlay */}
      {isAddModalOpen && (
        <div className="pg-modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="pg-modal" onClick={e => e.stopPropagation()}>
            <header className="modal-header">
              <h3>Add Ethanol-Free Station</h3>
              <button className="modal-close-btn" onClick={() => setIsAddModalOpen(false)}>
                <X size={20} />
              </button>
            </header>

            <form onSubmit={handleAddStationSubmit} className="pg-modal-form">
              <div className="form-grid">
                <div className="form-group span-2">
                  <label>Station Name *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. M&M Fuel Service" 
                    value={newStation.name}
                    onChange={e => setNewStation(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Station Brand *</label>
                  <select 
                    value={newStation.brand}
                    onChange={e => setNewStation(prev => ({ ...prev, brand: e.target.value }))}
                  >
                    {BRANDS.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>State / Province *</label>
                  <select 
                    value={newStation.state}
                    onChange={e => setNewStation(prev => ({ ...prev, state: e.target.value }))}
                  >
                    {STATES_AND_PROVINCES.map(sp => (
                      <option key={sp.code} value={sp.code}>{sp.name} ({sp.code})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group span-2">
                  <label>Street Address *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 2401 Lake Austin Blvd" 
                    value={newStation.address}
                    onChange={e => setNewStation(prev => ({ ...prev, address: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>City *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Austin" 
                    value={newStation.city}
                    onChange={e => setNewStation(prev => ({ ...prev, city: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Zip / Postal Code *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 78703" 
                    value={newStation.postalCode}
                    onChange={e => setNewStation(prev => ({ ...prev, postalCode: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Contact Phone</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 512-472-1012" 
                    value={newStation.phone}
                    onChange={e => setNewStation(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label>Fuel Price ($ / Gal)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    placeholder="e.g. 3.89" 
                    value={newStation.price}
                    onChange={e => setNewStation(prev => ({ ...prev, price: e.target.value }))}
                  />
                </div>

                <div className="form-group span-2">
                  <label>Available Octanes * (Select at least one)</label>
                  <div className="octane-checkbox-group">
                    {["87", "89", "90", "91", "92", "93", "94"].map(oct => (
                      <label key={oct} className="octane-checkbox-label">
                        <input 
                          type="checkbox"
                          checked={newStation.octanes.includes(oct)}
                          onChange={() => handleOctaneCheckbox(oct)}
                        />
                        <span>{oct} Octane</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group span-2">
                  <label>Station Latitude & Longitude (Optional - leave empty for auto-centering)</label>
                  <div className="coords-row">
                    <input 
                      type="number" 
                      step="0.0001" 
                      placeholder="Latitude (e.g. 30.2818)" 
                      value={newStation.lat}
                      onChange={e => setNewStation(prev => ({ ...prev, lat: e.target.value }))}
                    />
                    <input 
                      type="number" 
                      step="0.0001" 
                      placeholder="Longitude (e.g. -97.7785)" 
                      value={newStation.lng}
                      onChange={e => setNewStation(prev => ({ ...prev, lng: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="form-group span-2">
                  <label>Pumps Details / Location Notes</label>
                  <textarea 
                    placeholder="Describe how to locate the E0 pumps (e.g. Labeled blue hose on pump 4)" 
                    value={newStation.notes}
                    onChange={e => setNewStation(prev => ({ ...prev, notes: e.target.value }))}
                    rows="3"
                  ></textarea>
                </div>
              </div>

              <footer className="form-footer">
                <button type="button" className="cancel-btn" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                <button type="submit" className="submit-btn">Publish Station</button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
