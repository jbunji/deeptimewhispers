// Ancient Earth Locator v2 - With Real Paleogeographic Maps
// Using Ancient Earth by Ian Webster's tile service

// Global variables
let globe = null;
let currentLocation = null;
let autoRotate = false;
let animationId = null;
let currentMYA = 0;
let isAnimating = false;

// Time period data with available map resolutions
const timePeriods = {
    0: { name: "Present Day", description: "Modern Earth", mapAvailable: true },
    20: { name: "Miocene", description: "Early human ancestors appear", mapAvailable: true },
    35: { name: "Eocene-Oligocene", description: "Modern mammal families appear", mapAvailable: true },
    50: { name: "Early Eocene", description: "Warm period, no ice caps", mapAvailable: true },
    66: { name: "End Cretaceous", description: "Dinosaur extinction event", mapAvailable: true },
    90: { name: "Cretaceous", description: "High sea levels, warm climate", mapAvailable: true },
    105: { name: "Early Cretaceous", description: "Flowering plants appear", mapAvailable: true },
    120: { name: "Early Cretaceous", description: "Breakup of Gondwana", mapAvailable: true },
    150: { name: "Late Jurassic", description: "Age of giant dinosaurs", mapAvailable: true },
    170: { name: "Middle Jurassic", description: "Pangaea breaking apart", mapAvailable: true },
    200: { name: "Early Jurassic", description: "Dinosaurs diversifying", mapAvailable: true },
    220: { name: "Late Triassic", description: "First dinosaurs", mapAvailable: true },
    240: { name: "Middle Triassic", description: "Recovery from Great Dying", mapAvailable: true },
    260: { name: "Late Permian", description: "Formation of Pangaea complete", mapAvailable: true },
    280: { name: "Early Permian", description: "Reptiles diversifying", mapAvailable: true },
    300: { name: "Late Carboniferous", description: "Coal swamps", mapAvailable: true },
    340: { name: "Early Carboniferous", description: "First reptiles", mapAvailable: true },
    370: { name: "Late Devonian", description: "First forests", mapAvailable: true },
    400: { name: "Early Devonian", description: "First land vertebrates", mapAvailable: true },
    430: { name: "Silurian", description: "First land plants", mapAvailable: true },
    450: { name: "Late Ordovician", description: "First land life", mapAvailable: true },
    470: { name: "Middle Ordovician", description: "Marine diversification", mapAvailable: true },
    500: { name: "Late Cambrian", description: "Trilobite diversity", mapAvailable: true },
    540: { name: "Early Cambrian", description: "Cambrian explosion", mapAvailable: true },
    560: { name: "Ediacaran", description: "First animals", mapAvailable: true },
    600: { name: "Cryogenian", description: "Snowball Earth", mapAvailable: true },
    750: { name: "Cryogenian", description: "Rodinia breaking up", mapAvailable: true }
};

// Get closest available map time
function getClosestMapTime(mya) {
    const times = Object.keys(timePeriods).map(Number).sort((a, b) => a - b);
    let closest = times[0];
    let minDiff = Math.abs(mya - closest);
    
    for (const time of times) {
        const diff = Math.abs(mya - time);
        if (diff < minDiff) {
            minDiff = diff;
            closest = time;
        }
    }
    
    return closest;
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeGlobe();
    setupEventListeners();
    updateTimeDisplay(0);
});

// Initialize the globe with Ancient Earth textures
function initializeGlobe() {
    const globeContainer = document.getElementById('globeViz');
    
    // Use standard globe first
    globe = Globe()
        .globeImageUrl(getAncientEarthTexture(0))
        .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
        .backgroundImageUrl('https://unpkg.com/three-globe/example/img/night-sky.png')
        .showAtmosphere(true)
        .atmosphereColor('lightskyblue')
        .atmosphereAltitude(0.15)
        .pointsData([])
        .pointAltitude(0.01)
        .pointColor(() => '#ff0000')
        .pointRadius(0.5)
        .pointLabel(d => `
            <div style="color: #e8d4b0; font-family: Arial, sans-serif;">
                <strong>${d.label}</strong><br/>
                ${d.lat.toFixed(2)}°, ${d.lng.toFixed(2)}°<br/>
                ${d.info || ''}
            </div>
        `)
        .onGlobeClick(coords => {
            // Handle click on globe to set location
            setLocation({
                lat: coords.lat,
                lon: coords.lng,
                name: `Selected location: ${coords.lat.toFixed(2)}°, ${coords.lng.toFixed(2)}°`
            });
        })
        (globeContainer);
    
    // Set initial camera position
    globe.camera().position.z = 350;
    
    // Enhance lighting and materials
    const scene = globe.scene();
    const directionalLight = scene.children.find(obj => obj.type === 'DirectionalLight');
    if (directionalLight) {
        directionalLight.intensity = 1.2;
        directionalLight.position.set(1, 1, 1);
    }
    
    // Add ambient light for better visibility
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    // Enhance globe material properties  
    globe.globeMaterial().shininess = 10;
    
    // Handle window resize
    window.addEventListener('resize', () => {
        const width = globeContainer.offsetWidth;
        const height = globeContainer.offsetHeight;
        globe.width(width);
        globe.height(height);
    });
    
    // Hide loading overlay
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
        }, 1000);
    }
}

// Get Ancient Earth texture URL
function getAncientEarthTexture(mya) {
    // Map time periods to available textures
    const textureMap = {
        0: 'textures/paleomap/timeline/Map1a PALEOMAP PaleoAtlas_000.jpg',
        1: 'textures/paleomap/timeline/Map2a Last Glacial Maximum_001.jpg', 
        4: 'textures/paleomap/timeline/Map3a Pliocene_004.jpg',
        6: 'textures/paleomap/timeline/Map4a Messinian Event_006.jpg',
        10: 'textures/paleomap/timeline/Map5a Late Miocene_010.jpg',
        15: 'textures/paleomap/timeline/Map6a  Middle Miocene_015.jpg',
        20: 'textures/paleomap/timeline/Map7a  Early Miocene_020.jpg',
        25: 'textures/paleomap/timeline/Map8a Late Oligocene_025.jpg',
        30: 'textures/paleomap/timeline/Map9a  Early Oligocene_030.jpg',
        35: 'textures/paleomap/timeline/Map10a Late Eocene_035.jpg',
        40: 'textures/paleomap/timeline/Map11a MIddle Eocene_040.jpg',
        45: 'textures/paleomap/timeline/Map12a early Middle Eocene_045.jpg',
        50: 'textures/paleomap/timeline/Map13a Early Eocene_050.jpg',
        55: 'textures/paleomap/timeline/Map14a PETM_055.jpg',
        60: 'textures/paleomap/timeline/Map15a Paleocene_060.jpg',
        66: 'textures/paleomap/timeline/Map16a KT Boundary_066.jpg',
        70: 'textures/paleomap/timeline/Map17a LtK Maastrichtian_070.jpg',
        75: 'textures/paleomap/timeline/Map18a LtK Late Campanian_075.jpg',
        80: 'textures/paleomap/timeline/Map19a LtK Early Campanian_080.jpg',
        90: 'textures/paleomap/timeline/Map21a LtK Turonian_090.jpg',
        95: 'textures/paleomap/timeline/Map22a LtK Cenomanian_095.jpg',
        100: 'textures/paleomap/timeline/Map23a EK Late Albian_100.jpg',
        105: 'textures/paleomap/timeline/Map24a EK Middle Albian_105.jpg',
        110: 'textures/paleomap/timeline/Map25a EK Early Albian_110.jpg',
        115: 'textures/paleomap/timeline/Map26a EK Late Aptian_115.jpg',
        120: 'textures/paleomap/timeline/Map27a EK Early Albian_120.jpg',
        125: 'textures/paleomap/timeline/Map28a EK Barremian_125.jpg',
        130: 'textures/paleomap/timeline/Map29a EK Hauterivian_130.jpg',
        135: 'textures/paleomap/timeline/Map30a EK Valangian_135.jpg',
        140: 'textures/paleomap/timeline/Map31a EK Berriasian_140.jpg',
        145: 'textures/paleomap/timeline/Map32a Jurassic-Cretaceous Boundary_145.jpg',
        150: 'textures/paleomap/timeline/Map33a LtJ Tithonian_150.jpg',
        200: 'textures/paleomap/timeline/Map43a Triassic-Jurassic Boundary_200.jpg',
        250: 'textures/paleomap/timeline/Map49a Permo-Triassic Boundary_250.jpg',
        300: 'textures/paleomap/timeline/Map57a LtCarb Gzhelian_300.jpg',
        400: 'textures/paleomap/timeline/Map70a ED Emsian_400.jpg',
        450: 'textures/paleomap/timeline/Map78a LtO Sandbian-Katian_450.jpg',
        540: 'textures/paleomap/timeline/Map88a Precambrian-Cambrian Boundary_540.jpg',
        600: 'textures/paleomap/timeline/Map90a Middle Ediacaran_600.jpg',
        750: 'textures/paleomap/timeline/Map93a MIddle Cryogenian_750.jpg'
    };
    
    // Find the closest available texture
    const times = Object.keys(textureMap).map(Number).sort((a, b) => a - b);
    let closestTime = times[0];
    let minDiff = Math.abs(mya - closestTime);
    
    for (const time of times) {
        const diff = Math.abs(mya - time);
        if (diff < minDiff) {
            minDiff = diff;
            closestTime = time;
        }
    }
    
    return textureMap[closestTime];
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality (if elements exist)
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', handleLocationSearch);
    }
    
    const locationSearch = document.getElementById('locationSearch');
    if (locationSearch) {
        locationSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleLocationSearch();
        });
    }
    
    // Use current location button
    const myLocationBtn = document.getElementById('useMyLocation');
    if (myLocationBtn) {
        myLocationBtn.addEventListener('click', useCurrentLocation);
    }
    
    // Time slider
    const timeSlider = document.getElementById('timeSlider');
    if (timeSlider) {
        timeSlider.addEventListener('input', (e) => {
            jumpToMYA(parseInt(e.target.value));
        });
    }
    
    // Quick jump buttons (if they exist)
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const mya = parseInt(e.target.dataset.mya);
            jumpToMYA(mya);
            
            // Update active state
            document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
        });
    });
    
    // Globe controls (if they exist)
    const resetViewBtn = document.getElementById('resetView');
    if (resetViewBtn) {
        resetViewBtn.addEventListener('click', resetGlobeView);
    }
    
    const toggleRotationBtn = document.getElementById('toggleRotation');
    if (toggleRotationBtn) {
        toggleRotationBtn.addEventListener('click', toggleAutoRotation);
    }
}

// Handle location search (using demo mode)
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

// Demo locations
function showDemoLocation(query) {
    const demoLocations = {
        'new york': { lat: 40.7128, lon: -74.0060, name: 'New York, NY, USA' },
        'london': { lat: 51.5074, lon: -0.1278, name: 'London, UK' },
        'tokyo': { lat: 35.6762, lon: 139.6503, name: 'Tokyo, Japan' },
        'paris': { lat: 48.8566, lon: 2.3522, name: 'Paris, France' },
        'sydney': { lat: -33.8688, lon: 151.2093, name: 'Sydney, Australia' },
        'mumbai': { lat: 19.0760, lon: 72.8777, name: 'Mumbai, India' },
        'beijing': { lat: 39.9042, lon: 116.4074, name: 'Beijing, China' },
        'cairo': { lat: 30.0444, lon: 31.2357, name: 'Cairo, Egypt' },
        'rio': { lat: -22.9068, lon: -43.1729, name: 'Rio de Janeiro, Brazil' },
        'moscow': { lat: 55.7558, lon: 37.6173, name: 'Moscow, Russia' }
    };
    
    const queryLower = query.toLowerCase().trim();
    let location = demoLocations[queryLower];
    
    if (!location) {
        for (const [key, loc] of Object.entries(demoLocations)) {
            if (key.includes(queryLower) || queryLower.includes(key)) {
                location = loc;
                break;
            }
        }
    }
    
    if (!location) {
        location = {
            lat: 40.7128,
            lon: -74.0060,
            name: `Location: ${query} (showing New York)`
        };
    }
    
    setLocation(location);
    showStatus('Location found', 'success');
}

// Set location on globe
function setLocation(location) {
    currentLocation = location;
    updateLocationForTime(currentMYA);
    
    // Show location info
    document.getElementById('locationInfo').style.display = 'block';
    updateLocationInfo();
}

// Update location marker for current time
async function updateLocationForTime(mya) {
    if (!currentLocation) return;
    
    // Use paleogeographic reconstruction to find where this location was in the past
    const drift = await calculateContinentalDrift(currentLocation, mya);
    
    globe.pointsData([{
        lat: drift.ancientLat,
        lng: drift.ancientLon,
        label: currentLocation.name,
        info: `${mya} MYA: ${drift.paleolatitude}°N paleolatitude`
    }]);
    
    // Center view on location
    globe.pointOfView({
        lat: drift.ancientLat,
        lng: drift.ancientLon,
        altitude: 1.5
    }, 1000);
}

// Calculate continental drift using GPlates API
async function calculateContinentalDrift(location, mya) {
    try {
        // Check if we're on the deployed site or running locally
        const isProduction = window.location.hostname === 'deeptimewhispers.com';
        
        let url;
        if (isProduction) {
            // Use the proxy in production
            const endpoint = '/api/gplates/reconstruct';
            url = `${endpoint}?points=${location.lon},${location.lat}&time=${mya}&model=MULLER2019`;
        } else {
            // For local development, just use the fallback calculation
            // Direct API calls would face CORS issues
            throw new Error('Using fallback for local development');
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.type === 'MultiPoint' && data.coordinates && data.coordinates.length > 0) {
            const coords = data.coordinates[0];
            return {
                ancientLat: coords[1],
                ancientLon: coords[0],
                paleolatitude: Math.round(coords[1])
            };
        }
    } catch (error) {
        console.log('Using simplified drift calculation');
    }
    
    // Fallback to simplified calculation if API fails
    let ancientLat = location.lat;
    let ancientLon = location.lon;
    let paleolatitude = location.lat;
    
    // Simulate northward drift for Northern Hemisphere
    if (location.lat > 0) {
        ancientLat = location.lat - (mya * 0.05);
        paleolatitude = ancientLat;
    }
    
    // Simulate westward drift
    ancientLon = location.lon - (mya * 0.1);
    
    return {
        ancientLat,
        ancientLon,
        paleolatitude: Math.round(paleolatitude)
    };
}

// Update time display
function updateTimeDisplay(mya) {
    currentMYA = mya;
    
    // Update period info instead of non-existent elements
    updatePeriodInfo(mya);
    
    // Update location if we have one
    if (currentLocation) {
        updateLocationForTime(mya);
        updateLocationInfo();
    }
}

// Update globe for different time periods
function updateGlobeForTime(mya) {
    if (!globe) return;
    
    // Update the globe texture
    const textureUrl = getAncientEarthTexture(mya);
    globe.globeImageUrl(textureUrl);
    
    // Update atmosphere based on time period
    if (mya > 600) {
        // Snowball Earth
        globe.atmosphereColor('white');
        globe.atmosphereAltitude(0.25);
    } else if (mya > 250) {
        // Different atmosphere
        globe.atmosphereColor('orange');
        globe.atmosphereAltitude(0.2);
    } else {
        // More recent times
        globe.atmosphereColor('lightskyblue');
        globe.atmosphereAltitude(0.15);
    }
}

// Update location info panel
function updateLocationInfo() {
    if (!currentLocation) return;
    
    const mya = currentMYA;
    
    document.getElementById('currentLocation').innerHTML = `
        <strong>Current Location:</strong><br>
        ${currentLocation.name}<br>
        ${currentLocation.lat.toFixed(4)}°, ${currentLocation.lon.toFixed(4)}°
    `;
    
    const drift = calculateContinentalDrift(currentLocation, mya);
    document.getElementById('ancientLocation').innerHTML = `
        <strong>Position ${mya} MYA:</strong><br>
        Paleolatitude: ${drift.paleolatitude}°<br>
        Continental drift: Active
    `;
    
    document.getElementById('continentInfo').innerHTML = getContinentalConfig(mya);
    document.getElementById('environmentInfo').innerHTML = getEnvironmentInfo(currentLocation, mya);
    document.getElementById('lifeInfo').innerHTML = getLifeInfo(mya);
}

// Get continental configuration
function getContinentalConfig(mya) {
    if (mya === 0) return "Seven continents in modern positions";
    if (mya < 50) return "Continents approaching modern positions, India colliding with Asia";
    if (mya < 100) return "Atlantic Ocean widening, India moving north";
    if (mya < 180) return "Pangaea breaking apart, Atlantic Ocean forming";
    if (mya < 250) return "Supercontinent Pangaea fully assembled";
    if (mya < 350) return "Continents converging to form Pangaea";
    if (mya < 450) return "Gondwana in south, smaller continents scattered";
    if (mya < 550) return "Continents mostly in Southern Hemisphere";
    return "Ancient supercontinents, very different configuration";
}

// Get environment info
function getEnvironmentInfo(location, mya) {
    if (mya === 0) return "Modern climate and environment";
    if (mya < 5) return "Ice ages, fluctuating climate";
    if (mya < 50) return "Warm period, no permanent ice caps";
    if (mya < 100) return "Very warm, high sea levels, no ice";
    if (mya < 200) return "Variable climate, seasonal extremes";
    if (mya < 300) return "Tropical wetlands, high oxygen levels";
    if (mya < 400) return "First forests, arthropods on land";
    if (mya < 500) return "Warm seas, no life on land yet";
    return "Very different atmosphere, simple life only";
}

// Get life info
function getLifeInfo(mya) {
    if (mya === 0) return "Modern ecosystems";
    if (mya < 5) return "Megafauna, early humans";
    if (mya < 50) return "Modern mammal groups evolving";
    if (mya < 100) return "Dinosaurs dominant, early birds";
    if (mya < 200) return "First dinosaurs, mammal ancestors";
    if (mya < 300) return "Early reptiles, giant insects";
    if (mya < 400) return "First tetrapods, early land plants";
    if (mya < 500) return "Marine life only, trilobites common";
    if (mya < 600) return "First animals appearing";
    return "Microbial life only";
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
            setLocation({
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

// Reset globe view
function resetGlobeView() {
    globe.pointOfView({
        lat: 0,
        lng: 0,
        altitude: 2.5
    }, 1000);
}

// Toggle auto rotation
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

// Start rotation
function startRotation() {
    if (animationId) return;
    
    function animate() {
        const currentPOV = globe.pointOfView();
        globe.pointOfView({
            lat: currentPOV.lat,
            lng: currentPOV.lng + 0.2,
            altitude: currentPOV.altitude
        });
        
        if (autoRotate) {
            animationId = requestAnimationFrame(animate);
        }
    }
    
    animate();
}

// Stop rotation
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

// Track custom location from user input
function trackCustomLocation() {
    const latInput = document.getElementById('customLat').value;
    const lngInput = document.getElementById('customLng').value;
    
    const lat = parseFloat(latInput);
    const lng = parseFloat(lngInput);
    
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        alert('Please enter valid coordinates (Latitude: -90 to 90, Longitude: -180 to 180)');
        return;
    }
    
    trackLocation('Custom Location', lat, lng);
}

// Share current location and time
function shareLocation() {
    if (!currentLocation) {
        alert('Please select a location first');
        return;
    }
    
    const params = new URLSearchParams({
        lat: currentLocation.lat.toFixed(4),
        lng: currentLocation.lng.toFixed(4),
        name: currentLocation.name,
        mya: currentMYA
    });
    
    const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    
    // Copy to clipboard
    if (navigator.clipboard) {
        navigator.clipboard.writeText(shareUrl).then(() => {
            alert('Share link copied to clipboard!');
        }).catch(() => {
            prompt('Copy this link to share:', shareUrl);
        });
    } else {
        prompt('Copy this link to share:', shareUrl);
    }
}

// Load shared location from URL parameters
function loadSharedLocation() {
    const params = new URLSearchParams(window.location.search);
    
    if (params.has('lat') && params.has('lng')) {
        const lat = parseFloat(params.get('lat'));
        const lng = parseFloat(params.get('lng'));
        const name = params.get('name') || 'Shared Location';
        const mya = parseInt(params.get('mya') || '0');
        
        // Set the time first
        document.getElementById('timeSlider').value = mya;
        jumpToMYA(mya);
        
        // Then track the location
        setTimeout(() => {
            trackLocation(name, lat, lng);
        }, 500);
    }
}

// Call loadSharedLocation when page loads
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(loadSharedLocation, 1000);
});

// Track a specific location
function trackLocation(name, lat, lng) {
    setLocation({
        lat: lat,
        lon: lng,
        name: name
    });
    
    // Update the location display
    const locationName = document.getElementById('locationName');
    const locationCoords = document.getElementById('locationCoords');
    
    if (locationName) locationName.textContent = name;
    if (locationCoords) locationCoords.textContent = `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`;
    
    // Update time display with current location info
    updateTimeDisplay(currentMYA);
}

// Toggle time animation
function toggleAnimation() {
    const playBtn = document.getElementById('playBtn');
    const playText = document.getElementById('playText');
    
    if (!isAnimating) {
        isAnimating = true;
        if (playText) playText.textContent = '⏸ Pause Journey';
        if (playBtn) playBtn.classList.add('active');
        animateThroughTime();
    } else {
        isAnimating = false;
        if (playText) playText.textContent = '▶ Journey Through Time';
        if (playBtn) playBtn.classList.remove('active');
    }
}

// Animate through time
function animateThroughTime() {
    if (!isAnimating) return;
    
    const slider = document.getElementById('timeSlider');
    let value = parseInt(slider.value);
    
    // Increment time
    value += 5;
    if (value > 750) {
        value = 0;
    }
    
    slider.value = value;
    jumpToMYA(value);
    
    // Continue animation
    setTimeout(animateThroughTime, 100);
}

// Reset to present day
function resetToPresent() {
    const slider = document.getElementById('timeSlider');
    if (slider) {
        slider.value = 0;
        jumpToMYA(0);
    }
    isAnimating = false;
    const playText = document.getElementById('playText');
    if (playText) playText.textContent = '▶ Journey Through Time';
}

// Jump to specific MYA
function jumpToMYA(mya) {
    currentMYA = parseInt(mya);
    updateTimeDisplay(currentMYA);
    updateGlobeForTime(currentMYA);
    updatePeriodInfo(currentMYA);
}

// Update period information panel
function updatePeriodInfo(mya) {
    const closestTime = getClosestMapTime(mya);
    const period = timePeriods[closestTime];
    
    const periodName = document.getElementById('periodName');
    const periodTime = document.getElementById('periodTime');
    const periodDescription = document.getElementById('periodDescription');
    
    if (periodName) periodName.textContent = period ? period.name : 'Unknown Period';
    if (periodTime) periodTime.textContent = `${mya} Million Years Ago`;
    if (periodDescription) periodDescription.textContent = period ? period.description : 'No data available for this time period.';
    
    // Update environment and life info
    updateEnvironmentInfo(mya);
    updateLifeInfo(mya);
    updateChrononautQuote(mya);
}

// Update environment info based on time period
function updateEnvironmentInfo(mya) {
    const environmentText = document.getElementById('environmentText');
    if (!environmentText) return;
    
    let info = '';
    if (mya > 600) {
        info = 'Global ice sheets, frozen oceans, extreme cold';
    } else if (mya > 400) {
        info = 'Low oxygen atmosphere, warm shallow seas';
    } else if (mya > 250) {
        info = 'Pangaea supercontinent, seasonal monsoons';
    } else if (mya > 66) {
        info = 'Warm greenhouse climate, high sea levels';
    } else {
        info = 'Modern climate patterns';
    }
    
    environmentText.textContent = info;
}

// Update life info based on time period
function updateLifeInfo(mya) {
    const lifeText = document.getElementById('lifeText');
    if (!lifeText) return;
    
    let info = '';
    if (mya > 600) {
        info = 'Simple bacteria and archaea only';
    } else if (mya > 540) {
        info = 'First multicellular life, Ediacaran fauna';
    } else if (mya > 250) {
        info = 'Early reptiles, amphibians, primitive plants';
    } else if (mya > 66) {
        info = 'Dinosaurs, marine reptiles, early mammals';
    } else if (mya > 0.01) {
        info = 'Modern mammals, birds, flowering plants';
    } else {
        info = 'Human civilization and modern ecosystems';
    }
    
    lifeText.textContent = info;
}

// Update location info display
async function updateLocationInfo() {
    if (!currentLocation) return;
    
    const paleoCoords = document.getElementById('paleoCoords');
    if (paleoCoords) {
        const drift = await calculateContinentalDrift(currentLocation, currentMYA);
        paleoCoords.textContent = `Ancient position: ${drift.ancientLat.toFixed(2)}°, ${drift.ancientLon.toFixed(2)}°`;
    }
}

// Update Chrononaut quote based on time period
function updateChrononautQuote(mya) {
    const quoteEl = document.getElementById('chrononautQuote');
    if (!quoteEl) return;
    
    let quote = '';
    if (mya === 0) {
        quote = "You stand at the edge of now, looking back into the abyss of was...";
    } else if (mya < 1) {
        quote = "The ice remembers what the stones forget. Listen to its whispers...";
    } else if (mya < 10) {
        quote = "Your ancestors walked here, though the land wore a different face...";
    } else if (mya < 66) {
        quote = "The mammals huddle in the shadows of giants, waiting for their moment...";
    } else if (mya < 100) {
        quote = "Flowers bloom for the first time, painting the world in colors never seen...";
    } else if (mya < 200) {
        quote = "The thunder lizards rule a world we would barely recognize as Earth...";
    } else if (mya < 250) {
        quote = "Pangaea stretches from pole to pole, one land under an alien sky...";
    } else if (mya < 300) {
        quote = "In the coal swamps, tomorrow's fuel grows beneath a copper sun...";
    } else if (mya < 400) {
        quote = "The first forests rise, and with them, the architecture of terrestrial life...";
    } else if (mya < 540) {
        quote = "Life experiments in the shallows, testing forms that defy imagination...";
    } else if (mya < 650) {
        quote = "The ice advances, turning Earth into a pearl of white and blue...";
    } else {
        quote = "Before complex life, before the first predator, the world dreams in stromatolites...";
    }
    
    quoteEl.textContent = `"${quote}"`;
}