// Ancient Earth Locator - Real Paleogeographic Visualization
// This implementation shows actual continental positions through time

// Global variables
let globe = null;
let currentLocation = null;
let autoRotate = false;
let animationId = null;
let currentMYA = 0;
let textureCache = new Map();
let isAnimating = false;

// Paleogeographic texture URLs
// These are placeholder URLs - in production, replace with actual paleomap textures
const PALEOMAP_TEXTURES = {
    0: 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg', // Modern Earth
    20: '/assets/paleomaps/020ma.jpg',   // Miocene
    35: '/assets/paleomaps/035ma.jpg',   // Eocene-Oligocene
    50: '/assets/paleomaps/050ma.jpg',   // Eocene  
    66: '/assets/paleomaps/066ma.jpg',   // K-Pg boundary
    90: '/assets/paleomaps/090ma.jpg',   // Late Cretaceous
    105: '/assets/paleomaps/105ma.jpg',  // Early Cretaceous
    120: '/assets/paleomaps/120ma.jpg',  // Early Cretaceous
    150: '/assets/paleomaps/150ma.jpg',  // Late Jurassic
    170: '/assets/paleomaps/170ma.jpg',  // Middle Jurassic
    200: '/assets/paleomaps/200ma.jpg',  // Early Jurassic
    220: '/assets/paleomaps/220ma.jpg',  // Late Triassic
    240: '/assets/paleomaps/240ma.jpg',  // Middle Triassic
    260: '/assets/paleomaps/260ma.jpg',  // Late Permian
    280: '/assets/paleomaps/280ma.jpg',  // Early Permian
    300: '/assets/paleomaps/300ma.jpg',  // Late Carboniferous
    340: '/assets/paleomaps/340ma.jpg',  // Early Carboniferous
    370: '/assets/paleomaps/370ma.jpg',  // Late Devonian
    400: '/assets/paleomaps/400ma.jpg',  // Early Devonian
    430: '/assets/paleomaps/430ma.jpg',  // Silurian
    450: '/assets/paleomaps/450ma.jpg',  // Late Ordovician
    470: '/assets/paleomaps/470ma.jpg',  // Middle Ordovician
    500: '/assets/paleomaps/500ma.jpg',  // Late Cambrian
    540: '/assets/paleomaps/540ma.jpg',  // Early Cambrian
    600: '/assets/paleomaps/600ma.jpg',  // Ediacaran
    750: '/assets/paleomaps/750ma.jpg'   // Cryogenian
};

// Time period data with descriptions
const TIME_PERIODS = {
    0: { 
        name: "Present Day", 
        description: "Modern continental configuration",
        continents: ["North America", "South America", "Africa", "Europe", "Asia", "Australia", "Antarctica"]
    },
    20: { 
        name: "Miocene", 
        description: "Continents near modern positions, India still moving north",
        continents: ["Major continents recognizable", "Mediterranean smaller", "Panama seaway open"]
    },
    66: { 
        name: "End Cretaceous", 
        description: "High sea levels, Western Interior Seaway splits North America",
        continents: ["India is an island", "Atlantic narrower", "No Panama"]
    },
    150: { 
        name: "Late Jurassic", 
        description: "Pangaea breaking apart, Atlantic Ocean opening",
        continents: ["Pangaea splitting", "Tethys Ocean", "Proto-Atlantic"]
    },
    220: { 
        name: "Late Triassic", 
        description: "Supercontinent Pangaea at its peak",
        continents: ["Pangaea supercontinent", "Panthalassa Ocean", "Tethys Sea"]
    },
    300: { 
        name: "Late Carboniferous", 
        description: "Coal swamps, continents assembling into Pangaea",
        continents: ["Euramerica", "Gondwana", "Siberia", "China blocks"]
    },
    450: { 
        name: "Late Ordovician", 
        description: "Most continents in southern hemisphere",
        continents: ["Gondwana dominates south", "Laurentia at equator", "Baltica separate"]
    },
    540: { 
        name: "Early Cambrian", 
        description: "Continents scattered, explosion of life",
        continents: ["Gondwana forming", "Laurentia", "Siberia", "Many small plates"]
    },
    750: { 
        name: "Cryogenian", 
        description: "Snowball Earth - planet covered in ice",
        continents: ["Rodinia breaking up", "Global glaciation", "Scattered fragments"]
    }
};

// GPlates reconstruction service endpoints
const GPLATES_API = {
    reconstruct_points: 'https://gws.gplates.org/reconstruct/reconstruct_points/',
    reconstruct_feature_collection: 'https://gws.gplates.org/reconstruct/reconstruct_feature_collection/'
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializePaleoGlobe();
    setupEventListeners();
    preloadTextures();
    updateTimeDisplay(0);
});

// Initialize globe with paleogeographic features
function initializePaleoGlobe() {
    const globeContainer = document.getElementById('globeViz');
    
    // Create enhanced globe
    globe = Globe()
        .globeImageUrl(getPaleoTexture(0))
        .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
        .backgroundImageUrl('https://unpkg.com/three-globe/example/img/night-sky.png')
        .showAtmosphere(true)
        .atmosphereColor('lightskyblue')
        .atmosphereAltitude(0.15)
        .pointsData([])
        .pointAltitude(0.02)
        .pointColor(d => d.color || '#ff0000')
        .pointRadius(d => d.radius || 0.5)
        .pointLabel(d => createLocationLabel(d))
        .arcsData([]) // For showing continental motion paths
        .arcColor(d => d.color || '#ffaa00')
        .arcDashLength(() => 0.4)
        .arcDashGap(() => 0.2)
        .arcDashAnimateTime(() => 1500)
        .polygonsData([]) // For plate boundaries
        .polygonStrokeColor(() => '#ff6600')
        .polygonSideColor(() => 'rgba(255, 100, 0, 0.1)')
        .polygonCapColor(() => 'rgba(255, 100, 0, 0.05)')
        .labelsData([]) // For continent labels
        .labelText('text')
        .labelSize('size')
        .labelColor(() => '#ffffff')
        .labelDotRadius(0)
        .labelAltitude(0.01)
        .onGlobeClick(handleGlobeClick)
        (globeContainer);
    
    // Enhanced lighting for better visualization
    setupLighting();
    
    // Camera setup
    const controls = globe.controls();
    controls.minDistance = 150;
    controls.maxDistance = 500;
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    
    // Initial position - centered on Earth
    globe.pointOfView({ lat: 0, lng: 0, altitude: 2.5 }, 1000);
}

// Setup enhanced lighting
function setupLighting() {
    const scene = globe.scene();
    
    // Remove default lights
    scene.children = scene.children.filter(obj => obj.type !== 'DirectionalLight' && obj.type !== 'AmbientLight');
    
    // Add custom lighting using the scene's existing lights
    // The globe library already sets up appropriate lighting
    // We'll just adjust the existing lights
    const lights = scene.children.filter(obj => obj.isLight);
    lights.forEach(light => {
        if (light.isAmbientLight) {
            light.intensity = 0.6;
        } else if (light.isDirectionalLight) {
            light.intensity = 0.8;
        }
    });
}

// Preload textures for smooth transitions
async function preloadTextures() {
    const loadPromises = [];
    
    for (const [mya, url] of Object.entries(PALEOMAP_TEXTURES)) {
        if (mya > 0) { // Skip loading if texture doesn't exist yet
            // In production, these would be actual texture URLs
            // For now, we'll cache the placeholder
            textureCache.set(parseInt(mya), url);
        }
    }
}

// Get paleogeographic texture for given time
function getPaleoTexture(mya) {
    // Find closest available texture
    const times = Object.keys(PALEOMAP_TEXTURES).map(Number).sort((a, b) => a - b);
    let closest = 0;
    let minDiff = Math.abs(mya - 0);
    
    for (const time of times) {
        const diff = Math.abs(mya - time);
        if (diff < minDiff) {
            minDiff = diff;
            closest = time;
        }
    }
    
    return PALEOMAP_TEXTURES[closest];
}

// Create rich location label
function createLocationLabel(d) {
    return `
        <div class="globe-tooltip">
            <h4>${d.label}</h4>
            <p class="coords">${d.lat.toFixed(2)}°, ${d.lng.toFixed(2)}°</p>
            ${d.paleo ? `<p class="paleo">Paleo position: ${d.paleo}</p>` : ''}
            ${d.environment ? `<p class="env">Environment: ${d.environment}</p>` : ''}
            ${d.distance ? `<p class="distance">Moved: ${d.distance} km</p>` : ''}
        </div>
    `;
}

// Handle globe click
function handleGlobeClick(coords) {
    if (coords && coords.lat && coords.lng) {
        setLocationAnimated({
            lat: coords.lat,
            lon: coords.lng,
            name: `Selected: ${coords.lat.toFixed(2)}°, ${coords.lng.toFixed(2)}°`
        });
    }
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    document.getElementById('searchBtn').addEventListener('click', handleLocationSearch);
    document.getElementById('locationSearch').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLocationSearch();
    });
    
    // Current location
    document.getElementById('useMyLocation').addEventListener('click', useCurrentLocation);
    
    // Time slider with smooth transitions
    const timeSlider = document.getElementById('timeSlider');
    let sliderTimeout;
    
    timeSlider.addEventListener('input', (e) => {
        const mya = parseInt(e.target.value);
        
        clearTimeout(sliderTimeout);
        updateTimeDisplay(mya);
        
        // Debounce texture changes
        sliderTimeout = setTimeout(() => {
            animateToTime(mya);
        }, 100);
    });
    
    // Quick jump buttons
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const mya = parseInt(e.target.dataset.mya);
            animateSliderTo(mya);
            
            // Update active state
            document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
        });
    });
    
    // Globe controls
    document.getElementById('resetView').addEventListener('click', resetGlobeView);
    document.getElementById('toggleRotation').addEventListener('click', toggleAutoRotation);
    
    // Add journey button
    addJourneyButton();
}

// Add journey through time button
function addJourneyButton() {
    const controls = document.querySelector('.globe-controls');
    const journeyBtn = document.createElement('button');
    journeyBtn.id = 'journeyBtn';
    journeyBtn.className = 'globe-btn journey-btn';
    journeyBtn.innerHTML = '🎬 Journey Through Time';
    journeyBtn.onclick = startTimeJourney;
    controls.appendChild(journeyBtn);
}

// Smooth animation to target time
async function animateToTime(targetMYA) {
    if (isAnimating) return;
    isAnimating = true;
    
    const startMYA = currentMYA;
    const duration = 800;
    const startTime = Date.now();
    
    // Get start and end textures
    const startTexture = getPaleoTexture(startMYA);
    const endTexture = getPaleoTexture(targetMYA);
    
    // If textures are different, do smooth transition
    if (startTexture !== endTexture) {
        // In production, we'd morph between textures
        // For now, switch at midpoint
        setTimeout(() => {
            globe.globeImageUrl(endTexture);
            updateContinentLabels(targetMYA);
            updatePlateBoundaries(targetMYA);
        }, duration / 2);
    }
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const eased = progress < 0.5
            ? 2 * progress * progress
            : -1 + (4 - 2 * progress) * progress;
        
        const currentTime = startMYA + (targetMYA - startMYA) * eased;
        
        // Update location tracking
        if (currentLocation) {
            updateLocationForTime(currentTime);
        }
        
        // Update atmosphere
        updateAtmosphereForTime(currentTime);
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            currentMYA = targetMYA;
            isAnimating = false;
        }
    }
    
    animate();
}

// Animate slider smoothly
function animateSliderTo(targetValue) {
    const slider = document.getElementById('timeSlider');
    const start = parseInt(slider.value);
    const duration = 1000;
    const startTime = Date.now();
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = progress < 0.5
            ? 2 * progress * progress
            : -1 + (4 - 2 * progress) * progress;
        
        slider.value = start + (targetValue - start) * eased;
        updateTimeDisplay(parseInt(slider.value));
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            animateToTime(targetValue);
        }
    }
    
    animate();
}

// Journey through time animation
async function startTimeJourney() {
    const journeyBtn = document.getElementById('journeyBtn');
    journeyBtn.disabled = true;
    journeyBtn.innerHTML = '⏸ Stop Journey';
    
    let stopped = false;
    journeyBtn.onclick = () => {
        stopped = true;
        journeyBtn.disabled = false;
        journeyBtn.innerHTML = '🎬 Journey Through Time';
        journeyBtn.onclick = startTimeJourney;
    };
    
    // Key geological times to visit
    const keyTimes = [0, 20, 66, 90, 150, 200, 220, 260, 300, 370, 450, 540, 600, 750];
    
    // Go back in time
    for (let i = 0; i < keyTimes.length && !stopped; i++) {
        animateSliderTo(keyTimes[i]);
        await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    // Return to present
    if (!stopped) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        for (let i = keyTimes.length - 2; i >= 0 && !stopped; i--) {
            animateSliderTo(keyTimes[i]);
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
    
    journeyBtn.disabled = false;
    journeyBtn.innerHTML = '🎬 Journey Through Time';
    journeyBtn.onclick = startTimeJourney;
}

// Reconstruct location using GPlates API
async function reconstructLocation(lat, lon, targetMYA) {
    if (targetMYA === 0) {
        return { lat, lon };
    }
    
    try {
        // Use GPlates Web Service to reconstruct point
        const response = await fetch(
            `${GPLATES_API.reconstruct_points}?` +
            `points=${lon},${lat}&time=${targetMYA}&model=MULLER2016`
        );
        
        if (!response.ok) {
            throw new Error('Reconstruction failed');
        }
        
        const data = await response.json();
        if (data.features && data.features.length > 0) {
            const coords = data.features[0].geometry.coordinates;
            return { lat: coords[1], lon: coords[0] };
        }
    } catch (error) {
        console.log('Using fallback reconstruction');
        // Fallback: simplified plate motion simulation
        return simulatePlateMotion(lat, lon, targetMYA);
    }
}

// Simplified plate motion simulation
function simulatePlateMotion(lat, lon, mya) {
    // Very simplified simulation based on general plate motion trends
    let paleoLat = lat;
    let paleoLon = lon;
    
    // North America: moving northwest
    if (lon > -140 && lon < -50 && lat > 25 && lat < 70) {
        paleoLat = lat - (mya * 0.1); // southward
        paleoLon = lon + (mya * 0.15); // eastward
    }
    // Europe: moving north
    else if (lon > -10 && lon < 40 && lat > 35 && lat < 70) {
        paleoLat = lat - (mya * 0.2); // southward
        paleoLon = lon - (mya * 0.05); // westward
    }
    // India: dramatic northward motion
    else if (lon > 68 && lon < 97 && lat > 8 && lat < 37) {
        paleoLat = lat - (mya * 0.5); // much further south
        paleoLon = lon - (mya * 0.1);
    }
    // Australia: northward motion
    else if (lon > 110 && lon < 160 && lat > -45 && lat < -10) {
        paleoLat = lat - (mya * 0.3); // southward
        paleoLon = lon - (mya * 0.1);
    }
    // South America: westward motion
    else if (lon > -80 && lon < -35 && lat > -55 && lat < 15) {
        paleoLat = lat - (mya * 0.05);
        paleoLon = lon + (mya * 0.2); // eastward
    }
    // Africa: relatively stable but some northward motion
    else if (lon > -20 && lon < 55 && lat > -35 && lat < 40) {
        paleoLat = lat - (mya * 0.1);
        paleoLon = lon - (mya * 0.02);
    }
    
    return { lat: paleoLat, lon: paleoLon };
}

// Update location for current time
async function updateLocationForTime(mya) {
    if (!currentLocation) return;
    
    const modernPos = {
        lat: currentLocation.lat,
        lon: currentLocation.lon
    };
    
    // Get paleo position
    const paleoPos = await reconstructLocation(modernPos.lat, modernPos.lon, mya);
    
    // Calculate distance moved
    const distance = calculateDistance(modernPos, paleoPos);
    
    // Create marker data
    const markers = [];
    
    // Modern position marker (green)
    if (mya > 0) {
        markers.push({
            lat: modernPos.lat,
            lng: modernPos.lon,
            label: 'Modern Position',
            color: '#00ff00',
            radius: 0.3
        });
    }
    
    // Paleo position marker (red)
    markers.push({
        lat: paleoPos.lat,
        lng: paleoPos.lon,
        label: currentLocation.name,
        color: '#ff0000',
        radius: 0.5,
        paleo: `${paleoPos.lat.toFixed(1)}°, ${paleoPos.lon.toFixed(1)}°`,
        environment: getEnvironmentForLocation(paleoPos, mya),
        distance: distance.toFixed(0)
    });
    
    // Show motion path if significant movement
    if (mya > 0 && distance > 100) {
        globe.arcsData([{
            startLat: modernPos.lat,
            startLng: modernPos.lon,
            endLat: paleoPos.lat,
            endLng: paleoPos.lon,
            color: '#ffaa00'
        }]);
    } else {
        globe.arcsData([]);
    }
    
    globe.pointsData(markers);
}

// Calculate distance between two points
function calculateDistance(pos1, pos2) {
    const R = 6371; // Earth radius in km
    const dLat = (pos2.lat - pos1.lat) * Math.PI / 180;
    const dLon = (pos2.lon - pos1.lon) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(pos1.lat * Math.PI / 180) * Math.cos(pos2.lat * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Update atmosphere based on time period
function updateAtmosphereForTime(mya) {
    if (mya > 600) {
        // Snowball Earth
        globe.atmosphereColor('white');
        globe.atmosphereAltitude(0.25);
    } else if (mya > 350 && mya < 450) {
        // Ordovician-Silurian ice age
        globe.atmosphereColor('lightcyan');
        globe.atmosphereAltitude(0.18);
    } else if (mya > 250 && mya < 350) {
        // Carboniferous - high oxygen
        globe.atmosphereColor('lightgreen');
        globe.atmosphereAltitude(0.2);
    } else if (mya > 50 && mya < 250) {
        // Mesozoic - warm
        globe.atmosphereColor('orange');
        globe.atmosphereAltitude(0.15);
    } else {
        // Recent
        globe.atmosphereColor('lightskyblue');
        globe.atmosphereAltitude(0.15);
    }
}

// Update continent labels
function updateContinentLabels(mya) {
    const labels = [];
    
    if (mya < 50) {
        // Modern continents
        labels.push(
            { text: 'North America', lat: 45, lng: -100, size: 1.5 },
            { text: 'South America', lat: -15, lng: -60, size: 1.5 },
            { text: 'Africa', lat: 0, lng: 20, size: 1.5 },
            { text: 'Europe', lat: 50, lng: 10, size: 1.2 },
            { text: 'Asia', lat: 35, lng: 90, size: 1.8 },
            { text: 'Australia', lat: -25, lng: 135, size: 1.3 },
            { text: 'Antarctica', lat: -80, lng: 0, size: 1.3 }
        );
    } else if (mya >= 180 && mya <= 250) {
        // Pangaea
        labels.push(
            { text: 'PANGAEA', lat: 0, lng: 20, size: 2.5 },
            { text: 'Tethys Sea', lat: 10, lng: 60, size: 1.8 },
            { text: 'Panthalassa Ocean', lat: 0, lng: -150, size: 2.0 }
        );
    } else if (mya > 300) {
        // Older supercontinents
        labels.push(
            { text: 'Gondwana', lat: -30, lng: 30, size: 2.0 },
            { text: 'Laurentia', lat: 20, lng: -60, size: 1.5 },
            { text: 'Baltica', lat: 40, lng: 20, size: 1.3 },
            { text: 'Siberia', lat: 60, lng: 90, size: 1.3 }
        );
    }
    
    globe.labelsData(labels);
}

// Update plate boundaries
function updatePlateBoundaries(mya) {
    // In production, load actual plate boundary data for each time
    // For demo, show some example boundaries
    
    const boundaries = [];
    
    if (mya < 100) {
        // Modern plate boundaries (simplified)
        boundaries.push({
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [[
                    [-30, 60], [-28, 45], [-25, 30], [-22, 15],
                    [-20, 0], [-18, -15], [-15, -30], [-10, -45],
                    [-10, -45], [-30, 60] // Close the polygon
                ]]
            }
        });
    }
    
    globe.polygonsData(boundaries);
}

// Handle location search
async function handleLocationSearch() {
    const searchInput = document.getElementById('locationSearch');
    const query = searchInput.value.trim();
    
    if (!query) {
        showStatus('Please enter a location', 'error');
        return;
    }
    
    showStatus('Searching for location...', 'loading');
    
    // Try geocoding service first
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?` +
            `format=json&q=${encodeURIComponent(query)}&limit=1`
        );
        
        if (!response.ok) throw new Error('Geocoding failed');
        
        const results = await response.json();
        if (results && results.length > 0) {
            const location = {
                lat: parseFloat(results[0].lat),
                lon: parseFloat(results[0].lon),
                name: results[0].display_name
            };
            setLocationAnimated(location);
            showStatus('Location found', 'success');
            return;
        }
    } catch (error) {
        console.log('Geocoding failed, using demo locations');
    }
    
    // Fallback to demo locations
    showDemoLocation(query);
}

// Demo locations
function showDemoLocation(query) {
    const demoLocations = {
        'new york': { lat: 40.7128, lon: -74.0060, name: 'New York, NY, USA' },
        'london': { lat: 51.5074, lon: -0.1278, name: 'London, UK' },
        'tokyo': { lat: 35.6762, lon: 139.6503, name: 'Tokyo, Japan' },
        'paris': { lat: 48.8566, lon: 2.3522, name: 'Paris, France' },
        'los angeles': { lat: 34.0522, lon: -118.2437, name: 'Los Angeles, CA, USA' },
        'chicago': { lat: 41.8781, lon: -87.6298, name: 'Chicago, IL, USA' },
        'seattle': { lat: 47.6062, lon: -122.3321, name: 'Seattle, WA, USA' },
        'miami': { lat: 25.7617, lon: -80.1918, name: 'Miami, FL, USA' },
        'denver': { lat: 39.7392, lon: -104.9903, name: 'Denver, CO, USA' },
        'sydney': { lat: -33.8688, lon: 151.2093, name: 'Sydney, Australia' },
        'mumbai': { lat: 19.0760, lon: 72.8777, name: 'Mumbai, India' },
        'beijing': { lat: 39.9042, lon: 116.4074, name: 'Beijing, China' },
        'cairo': { lat: 30.0444, lon: 31.2357, name: 'Cairo, Egypt' },
        'rio': { lat: -22.9068, lon: -43.1729, name: 'Rio de Janeiro, Brazil' },
        'moscow': { lat: 55.7558, lon: 37.6173, name: 'Moscow, Russia' },
        'dubai': { lat: 25.2048, lon: 55.2708, name: 'Dubai, UAE' },
        'singapore': { lat: 1.3521, lon: 103.8198, name: 'Singapore' },
        'hong kong': { lat: 22.3193, lon: 114.1694, name: 'Hong Kong' },
        'mexico city': { lat: 19.4326, lon: -99.1332, name: 'Mexico City, Mexico' },
        'toronto': { lat: 43.6532, lon: -79.3832, name: 'Toronto, Canada' }
    };
    
    const queryLower = query.toLowerCase().trim();
    let location = demoLocations[queryLower];
    
    if (!location) {
        // Try partial match
        for (const [key, loc] of Object.entries(demoLocations)) {
            if (key.includes(queryLower) || queryLower.includes(key)) {
                location = loc;
                break;
            }
        }
    }
    
    if (location) {
        setLocationAnimated(location);
        showStatus('Demo location found', 'success');
    } else {
        showStatus('Location not found in demo. Try: New York, London, Tokyo...', 'error');
    }
}

// Set location with animation
function setLocationAnimated(location) {
    currentLocation = location;
    
    // Animate to location
    globe.pointOfView({
        lat: location.lat,
        lng: location.lon,
        altitude: 1.5
    }, 1000);
    
    // Update location for current time
    updateLocationForTime(currentMYA);
    
    // Show location info
    document.getElementById('locationInfo').style.display = 'block';
    updateLocationInfo();
}

// Update time display
function updateTimeDisplay(mya) {
    currentMYA = mya;
    const timeValue = document.getElementById('timeValue');
    const myaValue = document.getElementById('myaValue');
    
    // Find closest time period
    const times = Object.keys(TIME_PERIODS).map(Number).sort((a, b) => a - b);
    let closest = 0;
    let minDiff = Math.abs(mya - 0);
    
    for (const time of times) {
        const diff = Math.abs(mya - time);
        if (diff < minDiff) {
            minDiff = diff;
            closest = time;
        }
    }
    
    const period = TIME_PERIODS[closest];
    timeValue.textContent = period.name;
    myaValue.textContent = `${mya} MYA`;
    
    // Update location if we have one
    if (currentLocation && !isAnimating) {
        updateLocationForTime(mya);
        updateLocationInfo();
    }
}

// Update location info panel
async function updateLocationInfo() {
    if (!currentLocation) return;
    
    const mya = currentMYA;
    const paleoPos = await reconstructLocation(currentLocation.lat, currentLocation.lon, mya);
    const distance = calculateDistance(currentLocation, paleoPos);
    
    document.getElementById('currentLocation').innerHTML = `
        <strong>Modern Location:</strong><br>
        ${currentLocation.name}<br>
        ${currentLocation.lat.toFixed(4)}°, ${currentLocation.lon.toFixed(4)}°
    `;
    
    document.getElementById('ancientLocation').innerHTML = `
        <strong>Position ${mya} MYA:</strong><br>
        Latitude: ${paleoPos.lat.toFixed(1)}°<br>
        Longitude: ${paleoPos.lon.toFixed(1)}°<br>
        Distance moved: ${distance.toFixed(0)} km
    `;
    
    document.getElementById('continentInfo').innerHTML = getContinentalConfig(mya);
    document.getElementById('environmentInfo').innerHTML = getEnvironmentForLocation(paleoPos, mya);
    document.getElementById('lifeInfo').innerHTML = getLifeInfo(mya);
}

// Get continental configuration
function getContinentalConfig(mya) {
    const times = Object.keys(TIME_PERIODS).map(Number).sort((a, b) => a - b);
    let closest = 0;
    
    for (const time of times) {
        if (Math.abs(mya - time) < Math.abs(mya - closest)) {
            closest = time;
        }
    }
    
    const period = TIME_PERIODS[closest];
    return period.description + '<br><br>Continents: ' + period.continents.join(', ');
}

// Get environment for location
function getEnvironmentForLocation(pos, mya) {
    // Consider paleolatitude and time period
    const paleoLat = Math.abs(pos.lat);
    
    if (mya > 600) {
        return "Global glaciation - 'Snowball Earth' conditions";
    } else if (mya > 400) {
        if (paleoLat < 30) return "Warm shallow seas, no land life";
        else return "Open ocean or barren land";
    } else if (mya > 300) {
        if (paleoLat < 30) return "Tropical coal swamps";
        else if (paleoLat < 60) return "Temperate forests";
        else return "Glaciated regions";
    } else if (mya > 200) {
        if (paleoLat < 30) return "Arid desert conditions";
        else return "Seasonal monsoons";
    } else if (mya > 65) {
        if (paleoLat < 30) return "Tropical rainforest";
        else if (paleoLat < 60) return "Warm temperate forest";
        else return "Polar forests (no ice)";
    } else if (mya > 5) {
        return "Climate similar to modern, but warmer";
    } else {
        return "Ice age cycles, fluctuating climate";
    }
}

// Get life info
function getLifeInfo(mya) {
    if (mya === 0) return "Modern ecosystems, human civilization";
    if (mya < 5) return "Megafauna: mammoths, saber-toothed cats, early humans";
    if (mya < 25) return "Grasslands spreading, great apes evolving";
    if (mya < 50) return "Modern mammal families, whales in oceans";
    if (mya < 66) return "Last non-avian dinosaurs, early primates";
    if (mya < 100) return "T. rex, Triceratops, flowering plants diversifying";
    if (mya < 150) return "Stegosaurus, Allosaurus, first birds";
    if (mya < 200) return "First large dinosaurs, early mammals";
    if (mya < 250) return "Recovery from mass extinction, archosaurs rising";
    if (mya < 300) return "Dimetrodon, giant dragonflies, seed plants";
    if (mya < 400) return "First tetrapods on land, fern forests";
    if (mya < 450) return "Sea scorpions, early land plants";
    if (mya < 500) return "Trilobites abundant, no land life";
    if (mya < 550) return "Cambrian explosion - anomalocaris, early shells";
    return "Ediacaran fauna - first complex animals";
}

// Use current location
function useCurrentLocation() {
    if (!navigator.geolocation) {
        showStatus('Geolocation not supported', 'error');
        return;
    }
    
    showStatus('Getting your location...', 'loading');
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            setLocationAnimated({
                lat: position.coords.latitude,
                lon: position.coords.longitude,
                name: `Your location: ${position.coords.latitude.toFixed(2)}°, ${position.coords.longitude.toFixed(2)}°`
            });
            showStatus('Location found', 'success');
        },
        (error) => {
            showStatus('Unable to get location', 'error');
        }
    );
}

// Globe controls
function resetGlobeView() {
    globe.pointOfView({
        lat: 0,
        lng: 0,
        altitude: 2.5
    }, 1000);
}

function toggleAutoRotation() {
    autoRotate = !autoRotate;
    const btn = document.getElementById('toggleRotation');
    
    if (autoRotate) {
        btn.classList.add('active');
        startRotation();
    } else {
        btn.classList.remove('active');
        stopRotation();
    }
}

function startRotation() {
    if (animationId) return;
    
    function animate() {
        const pov = globe.pointOfView();
        globe.pointOfView({
            lat: pov.lat,
            lng: pov.lng + 0.2,
            altitude: pov.altitude
        });
        
        if (autoRotate) {
            animationId = requestAnimationFrame(animate);
        }
    }
    
    animate();
}

function stopRotation() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
}

// Show status message
function showStatus(message, type = 'info') {
    const statusEl = document.getElementById('searchStatus');
    statusEl.textContent = message;
    statusEl.className = `search-status ${type}`;
    
    if (type !== 'loading') {
        setTimeout(() => {
            statusEl.textContent = '';
            statusEl.className = 'search-status';
        }, 3000);
    }
}