// Ancient Earth Locator - Best Possible Implementation
// This demonstrates what we can build with proper paleogeographic data

// Global variables
let globe = null;
let currentLocation = null;
let autoRotate = false;
let animationId = null;
let currentMYA = 0;
let textureCache = new Map();
let isAnimating = false;

// Paleogeographic time periods with available reconstructions
// In production, we'd have textures for every 5-10 MY
const PALEO_TIMES = {
    0: {
        name: "Present Day",
        texture: "present",
        description: "Modern continental configuration",
        seaLevel: 0,
        iceSheets: ["Antarctica", "Greenland"],
        supercontinents: []
    },
    20: {
        name: "Miocene",
        texture: "miocene",
        description: "Continents near modern positions, but India still moving north",
        seaLevel: 100,
        iceSheets: ["Antarctica"],
        supercontinents: []
    },
    66: {
        name: "End Cretaceous",
        texture: "cretaceous",
        description: "High sea levels, Western Interior Seaway splits North America",
        seaLevel: 250,
        iceSheets: [],
        supercontinents: []
    },
    150: {
        name: "Late Jurassic",
        texture: "jurassic",
        description: "Pangaea breaking apart, Atlantic Ocean opening",
        seaLevel: 200,
        iceSheets: [],
        supercontinents: ["Pangaea (breaking)"]
    },
    220: {
        name: "Late Triassic",
        texture: "triassic",
        description: "Supercontinent Pangaea at its peak",
        seaLevel: 50,
        iceSheets: [],
        supercontinents: ["Pangaea"]
    },
    300: {
        name: "Carboniferous",
        texture: "carboniferous",
        description: "Coal swamps, Pangaea forming",
        seaLevel: 0,
        iceSheets: ["Gondwana"],
        supercontinents: ["Euramerica", "Gondwana"]
    },
    450: {
        name: "Ordovician",
        texture: "ordovician",
        description: "Most continents in southern hemisphere",
        seaLevel: 200,
        iceSheets: ["Gondwana"],
        supercontinents: ["Gondwana"]
    },
    540: {
        name: "Cambrian",
        texture: "cambrian",
        description: "Continents scattered, mostly tropical",
        seaLevel: 100,
        iceSheets: [],
        supercontinents: ["Gondwana (forming)"]
    },
    750: {
        name: "Cryogenian",
        texture: "cryogenian",
        description: "Snowball Earth - planet covered in ice",
        seaLevel: -100,
        iceSheets: ["Global"],
        supercontinents: ["Rodinia (breaking)"]
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeEnhancedGlobe();
    setupEventListeners();
    loadPaleoTextures();
    updateTimeDisplay(0);
});

// Initialize enhanced globe with all features
function initializeEnhancedGlobe() {
    const globeContainer = document.getElementById('globeViz');
    
    // Create globe with enhanced features
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
        .pointLabel(d => createRichLabel(d))
        .polygonsData([]) // For plate boundaries
        .polygonStrokeColor(() => '#ffaa00')
        .polygonSideColor(() => 'rgba(255, 170, 0, 0.1)')
        .polygonCapColor(() => 'rgba(255, 170, 0, 0.1)')
        .arcsData([]) // For motion vectors
        .arcColor(d => d.color || '#00ff00')
        .arcDashLength(() => 0.5)
        .arcDashGap(() => 0.1)
        .arcDashAnimateTime(() => 2000)
        .labelsData([]) // For continent labels
        .labelText('text')
        .labelSize('size')
        .labelColor(() => '#ffffff')
        .labelDotRadius(0)
        .labelAltitude(0.01)
        .onGlobeClick(handleGlobeClick)
        (globeContainer);
    
    // Enhanced lighting
    setupEnhancedLighting();
    
    // Camera controls
    const controls = globe.controls();
    controls.minDistance = 150;
    controls.maxDistance = 500;
    
    // Initial view
    globe.pointOfView({ lat: 20, lng: 0, altitude: 2 }, 0);
}

// Create rich HTML labels
function createRichLabel(d) {
    return `
        <div class="globe-tooltip">
            <h4>${d.label}</h4>
            <p class="coords">${d.lat.toFixed(2)}°, ${d.lng.toFixed(2)}°</p>
            ${d.paleo ? `<p class="paleo">Paleo: ${d.paleo}</p>` : ''}
            ${d.environment ? `<p class="env">${d.environment}</p>` : ''}
            ${d.life ? `<p class="life">${d.life}</p>` : ''}
        </div>
    `;
}

// Enhanced lighting setup
function setupEnhancedLighting() {
    const scene = globe.scene();
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);
}

// Load paleogeographic textures
async function loadPaleoTextures() {
    // In production, we'd load actual paleogeographic textures
    // For now, simulate with modified modern textures
    
    for (const [mya, data] of Object.entries(PALEO_TIMES)) {
        const texture = await loadTexture(getPaleoTexture(mya));
        textureCache.set(parseInt(mya), texture);
    }
}

// Get paleogeographic texture URL
function getPaleoTexture(mya) {
    // In production, these would be actual reconstructed Earth textures
    // For demonstration, we'll use color-adjusted modern Earth
    
    if (mya === 0) {
        return 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg';
    }
    
    // Simulate different time periods with filters
    // In reality, continents would be in completely different positions
    const baseUrl = 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg';
    
    // For demo, return base URL
    // Real implementation would return URLs like:
    // return `/assets/paleomaps/earth_${mya}ma_8k.jpg`;
    
    return baseUrl;
}

// Load texture with caching
async function loadTexture(url) {
    return new Promise((resolve) => {
        const loader = new THREE.TextureLoader();
        loader.load(url, resolve);
    });
}

// Handle globe click
function handleGlobeClick(coords) {
    if (coords && coords.lat && coords.lng) {
        setLocationWithAnimation({
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
    
    // Use current location
    document.getElementById('useMyLocation').addEventListener('click', useCurrentLocation);
    
    // Time slider with smooth transitions
    const timeSlider = document.getElementById('timeSlider');
    let sliderTimeout;
    
    timeSlider.addEventListener('input', (e) => {
        const mya = parseInt(e.target.value);
        
        // Clear previous timeout
        clearTimeout(sliderTimeout);
        
        // Update display immediately
        updateTimeDisplay(mya);
        
        // Delay texture change for smooth interaction
        sliderTimeout = setTimeout(() => {
            animateToTime(mya);
        }, 100);
    });
    
    // Quick jump buttons with animation
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const mya = parseInt(e.target.dataset.mya);
            
            // Animate slider
            animateSlider(mya);
            
            // Update active state
            document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
        });
    });
    
    // Globe controls
    document.getElementById('resetView').addEventListener('click', resetGlobeView);
    document.getElementById('toggleRotation').addEventListener('click', toggleAutoRotation);
    
    // Add journey button
    const journeyBtn = document.createElement('button');
    journeyBtn.className = 'globe-btn journey-btn';
    journeyBtn.innerHTML = '🎬 Journey Through Time';
    journeyBtn.onclick = startTimeJourney;
    document.querySelector('.globe-controls').appendChild(journeyBtn);
}

// Animate to specific time
async function animateToTime(targetMYA) {
    if (isAnimating) return;
    isAnimating = true;
    
    const startMYA = currentMYA;
    const duration = 1000; // 1 second transition
    const startTime = Date.now();
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease-in-out curve
        const eased = progress < 0.5
            ? 2 * progress * progress
            : -1 + (4 - 2 * progress) * progress;
        
        const currentTime = startMYA + (targetMYA - startMYA) * eased;
        
        // Update globe for interpolated time
        updateGlobeForTime(currentTime, true);
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            isAnimating = false;
            updateGlobeForTime(targetMYA, false);
        }
    }
    
    animate();
}

// Animate slider smoothly
function animateSlider(targetValue) {
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
    if (!currentLocation) {
        showStatus('Please select a location first', 'error');
        return;
    }
    
    const journeyBtn = document.querySelector('.journey-btn');
    journeyBtn.disabled = true;
    journeyBtn.innerHTML = '⏸ Stop Journey';
    
    // Journey from present to 750 MYA and back
    const keyTimes = [0, 20, 66, 150, 220, 300, 450, 540, 750, 540, 450, 300, 220, 150, 66, 20, 0];
    let stopped = false;
    
    journeyBtn.onclick = () => {
        stopped = true;
        journeyBtn.disabled = false;
        journeyBtn.innerHTML = '🎬 Journey Through Time';
        journeyBtn.onclick = startTimeJourney;
    };
    
    for (const mya of keyTimes) {
        if (stopped) break;
        
        // Animate to this time
        animateSlider(mya);
        
        // Wait at each stop
        await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    journeyBtn.disabled = false;
    journeyBtn.innerHTML = '🎬 Journey Through Time';
    journeyBtn.onclick = startTimeJourney;
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
    showDemoLocation(query);
}

// Demo locations with paleogeographic data
function showDemoLocation(query) {
    const demoLocations = {
        'new york': { 
            lat: 40.7128, 
            lon: -74.0060, 
            name: 'New York, NY, USA',
            paleo: {
                150: { lat: 35, lon: -50, env: "Tropical coastline of Pangaea" },
                300: { lat: -5, lon: -20, env: "Equatorial swamps" },
                450: { lat: -40, lon: 30, env: "Southern ocean" }
            }
        },
        'london': { 
            lat: 51.5074, 
            lon: -0.1278, 
            name: 'London, UK',
            paleo: {
                150: { lat: 40, lon: 10, env: "Arid interior of Pangaea" },
                300: { lat: -10, lon: 20, env: "Tropical rainforest" },
                450: { lat: -60, lon: 40, env: "Near South Pole" }
            }
        }
        // ... more locations with paleo data
    };
    
    const queryLower = query.toLowerCase().trim();
    let location = demoLocations[queryLower] || demoLocations['new york'];
    
    setLocationWithAnimation(location);
    showStatus('Location found', 'success');
}

// Set location with animation
function setLocationWithAnimation(location) {
    currentLocation = location;
    
    // Animate to location
    globe.pointOfView({
        lat: location.lat,
        lng: location.lon,
        altitude: 1.5
    }, 1000);
    
    // Update displays
    updateLocationForTime(currentMYA);
    document.getElementById('locationInfo').style.display = 'block';
    updateLocationInfo();
    
    // Show plate boundaries near location
    showPlateBoundaries(location, currentMYA);
}

// Show plate boundaries
function showPlateBoundaries(location, mya) {
    // In production, load actual plate boundary data
    // For demo, show sample boundaries
    
    if (mya < 200) {
        // Show mid-Atlantic ridge
        const atlanticRidge = {
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: [
                    [-30, 60], [-28, 45], [-25, 30], [-22, 15], 
                    [-20, 0], [-18, -15], [-15, -30], [-10, -45]
                ]
            }
        };
        
        globe.polygonsData([atlanticRidge]);
    }
}

// Update location for current time
function updateLocationForTime(mya) {
    if (!currentLocation) return;
    
    // Calculate paleoposition
    const paleoPos = reconstructLocation(currentLocation, mya);
    
    // Show current position
    const markers = [{
        lat: currentLocation.lat,
        lng: currentLocation.lon,
        label: 'Modern Position',
        color: '#00ff00',
        radius: 0.3
    }];
    
    // Show paleo position if different
    if (mya > 0) {
        markers.push({
            lat: paleoPos.lat,
            lng: paleoPos.lon,
            label: `Position ${mya} MYA`,
            color: '#ff0000',
            radius: 0.5,
            paleo: `${paleoPos.lat.toFixed(1)}°N paleolatitude`,
            environment: paleoPos.environment,
            life: getLifeInfo(mya)
        });
        
        // Show motion path
        globe.arcsData([{
            startLat: currentLocation.lat,
            startLng: currentLocation.lon,
            endLat: paleoPos.lat,
            endLng: paleoPos.lon,
            color: '#ffff00'
        }]);
    } else {
        globe.arcsData([]);
    }
    
    globe.pointsData(markers);
}

// Reconstruct location for past time
function reconstructLocation(location, mya) {
    // In production, use actual GPlates reconstruction
    // For demo, simulate plate motion
    
    if (location.paleo && location.paleo[mya]) {
        return location.paleo[mya];
    }
    
    // Simple simulation
    const driftRate = 2.5; // cm/year
    const totalDrift = (mya * 1000000 * driftRate) / 100000; // to km
    const driftDegrees = totalDrift / 111; // km to degrees
    
    // Simulate northward drift
    const paleoLat = location.lat - driftDegrees * 0.7;
    const paleoLon = location.lon + driftDegrees * 0.3;
    
    return {
        lat: paleoLat,
        lon: paleoLon,
        environment: getEnvironmentInfo(location, mya)
    };
}

// Update time display
function updateTimeDisplay(mya) {
    currentMYA = mya;
    const timeValue = document.getElementById('timeValue');
    const myaValue = document.getElementById('myaValue');
    
    // Find closest time period
    const closest = Object.keys(PALEO_TIMES)
        .map(Number)
        .reduce((prev, curr) => 
            Math.abs(curr - mya) < Math.abs(prev - mya) ? curr : prev
        );
    
    const period = PALEO_TIMES[closest];
    timeValue.textContent = period.name;
    myaValue.textContent = `${mya} MYA`;
    
    // Update location if we have one
    if (currentLocation) {
        updateLocationForTime(mya);
        updateLocationInfo();
    }
}

// Update globe for time with smooth transitions
function updateGlobeForTime(mya, isTransitioning) {
    if (!globe) return;
    
    // Find closest available texture
    const closest = Object.keys(PALEO_TIMES)
        .map(Number)
        .reduce((prev, curr) => 
            Math.abs(curr - mya) < Math.abs(prev - mya) ? curr : prev
        );
    
    const period = PALEO_TIMES[closest];
    
    // Update globe texture
    if (!isTransitioning) {
        const textureUrl = getPaleoTexture(closest);
        globe.globeImageUrl(textureUrl);
    }
    
    // Update atmosphere based on time period
    updateAtmosphere(period);
    
    // Update labels
    updateContinentLabels(mya);
    
    // Update any markers
    if (currentLocation) {
        updateLocationForTime(mya);
    }
}

// Update atmosphere appearance
function updateAtmosphere(period) {
    if (period.iceSheets.includes("Global")) {
        // Snowball Earth
        globe.atmosphereColor('white');
        globe.atmosphereAltitude(0.25);
    } else if (period.seaLevel > 200) {
        // High sea level, humid
        globe.atmosphereColor('lightblue');
        globe.atmosphereAltitude(0.2);
    } else if (period.supercontinents.includes("Pangaea")) {
        // Dry continental climate
        globe.atmosphereColor('orange');
        globe.atmosphereAltitude(0.15);
    } else {
        // Normal
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
    } else if (mya >= 150 && mya <= 250) {
        // Pangaea
        labels.push(
            { text: 'PANGAEA', lat: 0, lng: 20, size: 2.5 },
            { text: 'Tethys Ocean', lat: 10, lng: 60, size: 1.8 },
            { text: 'Panthalassa Ocean', lat: 0, lng: -150, size: 2.0 }
        );
    } else if (mya > 300) {
        // Older supercontinents
        labels.push(
            { text: 'Gondwana', lat: -30, lng: 30, size: 2.0 },
            { text: 'Laurentia', lat: 20, lng: -60, size: 1.5 },
            { text: 'Baltica', lat: 40, lng: 20, size: 1.3 }
        );
    }
    
    globe.labelsData(labels);
}

// Update location info panel
function updateLocationInfo() {
    if (!currentLocation) return;
    
    const mya = currentMYA;
    const paleoPos = reconstructLocation(currentLocation, mya);
    
    document.getElementById('currentLocation').innerHTML = `
        <strong>Modern Location:</strong><br>
        ${currentLocation.name}<br>
        ${currentLocation.lat.toFixed(4)}°, ${currentLocation.lon.toFixed(4)}°
    `;
    
    document.getElementById('ancientLocation').innerHTML = `
        <strong>Position ${mya} MYA:</strong><br>
        Latitude: ${paleoPos.lat.toFixed(1)}°<br>
        Longitude: ${paleoPos.lon.toFixed(1)}°<br>
        Distance moved: ${calculateDistance(currentLocation, paleoPos).toFixed(0)} km
    `;
    
    document.getElementById('continentInfo').innerHTML = getContinentalConfig(mya);
    document.getElementById('environmentInfo').innerHTML = paleoPos.environment;
    document.getElementById('lifeInfo').innerHTML = getLifeInfo(mya);
}

// Calculate distance between two points
function calculateDistance(loc1, loc2) {
    const R = 6371; // Earth radius in km
    const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
    const dLon = (loc2.lon - loc1.lon) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Get continental configuration
function getContinentalConfig(mya) {
    const period = PALEO_TIMES[Object.keys(PALEO_TIMES)
        .map(Number)
        .reduce((prev, curr) => 
            Math.abs(curr - mya) < Math.abs(prev - mya) ? curr : prev
        )];
    
    let config = period.description + '<br><br>';
    
    if (period.supercontinents.length > 0) {
        config += `<strong>Supercontinents:</strong> ${period.supercontinents.join(', ')}<br>`;
    }
    
    if (period.seaLevel !== 0) {
        config += `<strong>Sea Level:</strong> ${period.seaLevel > 0 ? '+' : ''}${period.seaLevel}m from present<br>`;
    }
    
    if (period.iceSheets.length > 0) {
        config += `<strong>Ice Sheets:</strong> ${period.iceSheets.join(', ')}`;
    }
    
    return config;
}

// Get environment info
function getEnvironmentInfo(location, mya) {
    // This would use actual paleogeographic data
    if (mya === 0) return "Modern climate and environment";
    if (mya < 5) return "Ice ages, fluctuating climate, early humans spreading";
    if (mya < 50) return "Warm climate, no permanent ice caps, mammals diversifying";
    if (mya < 100) return "Very warm, high sea levels, dinosaurs dominant";
    if (mya < 200) return "Pangaea climate: extreme seasons, vast deserts";
    if (mya < 300) return "Coal swamps, high oxygen (35%), giant insects";
    if (mya < 400) return "First forests, amphibians dominant";
    if (mya < 500) return "No life on land, warm shallow seas";
    return "Very different atmosphere, simple life only";
}

// Get life info
function getLifeInfo(mya) {
    if (mya === 0) return "Modern ecosystems, human civilization";
    if (mya < 5) return "Mammoths, saber-tooths, early humans";
    if (mya < 50) return "Grasslands spreading, whales evolving, early primates";
    if (mya < 100) return "T. rex, Triceratops, flowering plants spreading";
    if (mya < 200) return "First dinosaurs, early mammals, conifers dominant";
    if (mya < 300) return "Sail-backed reptiles, giant dragonflies, seed plants";
    if (mya < 400) return "First tetrapods, massive eurypterids, fern forests";
    if (mya < 500) return "Trilobites, early fish, no land life";
    if (mya < 600) return "Cambrian explosion! Anomalocaris, early shells";
    return "Ediacaran fauna, first complex life";
}

// Other functions (useCurrentLocation, resetGlobeView, etc.) remain similar...

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

// Reset view
function resetGlobeView() {
    globe.pointOfView({
        lat: 20,
        lng: 0,
        altitude: 2
    }, 1000);
}

// Toggle rotation
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

// Rotation animation
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

// Use current location
function useCurrentLocation() {
    if (!navigator.geolocation) {
        showStatus('Geolocation not supported', 'error');
        return;
    }
    
    showStatus('Getting your location...', 'loading');
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            setLocationWithAnimation({
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