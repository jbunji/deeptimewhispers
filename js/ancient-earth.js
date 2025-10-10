// Ancient Earth Locator JavaScript

// Global variables
let globe = null;
let currentLocation = null;
let autoRotate = false;
let animationId = null;

// Time period data
const timePeriods = {
    0: { name: "Present Day", description: "Modern Earth" },
    20: { name: "Miocene", description: "Early human ancestors appear" },
    66: { name: "End Cretaceous", description: "Dinosaur extinction event" },
    150: { name: "Late Jurassic", description: "Age of giant dinosaurs" },
    252: { name: "End Permian", description: "The Great Dying" },
    359: { name: "Carboniferous", description: "Coal swamp forests" },
    443: { name: "Ordovician", description: "First land plants" },
    541: { name: "Cambrian", description: "Explosion of life" },
    750: { name: "Cryogenian", description: "Snowball Earth" }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeGlobe();
    setupEventListeners();
    
    // Set initial time to present
    updateTimeDisplay(0);
});

// Initialize the globe
function initializeGlobe() {
    const globeContainer = document.getElementById('globeViz');
    
    globe = Globe()
        .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
        .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
        .backgroundImageUrl('https://unpkg.com/three-globe/example/img/night-sky.png')
        .showAtmosphere(true)
        .atmosphereColor('lightskyblue')
        .atmosphereAltitude(0.15)
        .pointsData([]) // Will be populated when user searches
        .pointAltitude(0.01)
        .pointColor(() => '#ff0000')
        .pointRadius(0.5)
        .pointLabel('label')
        (globeContainer);
    
    // Set initial camera position
    globe.camera().position.z = 350;
    
    // Handle window resize
    window.addEventListener('resize', () => {
        const width = globeContainer.offsetWidth;
        const height = globeContainer.offsetHeight;
        globe.width(width);
        globe.height(height);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    document.getElementById('searchBtn').addEventListener('click', handleLocationSearch);
    document.getElementById('locationSearch').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLocationSearch();
    });
    
    // Use current location button
    document.getElementById('useMyLocation').addEventListener('click', useCurrentLocation);
    
    // Time slider
    const timeSlider = document.getElementById('timeSlider');
    timeSlider.addEventListener('input', (e) => {
        updateTimeDisplay(parseInt(e.target.value));
    });
    
    // Quick jump buttons
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const mya = parseInt(e.target.dataset.mya);
            document.getElementById('timeSlider').value = mya;
            updateTimeDisplay(mya);
            
            // Update active state
            document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
        });
    });
    
    // Globe controls
    document.getElementById('resetView').addEventListener('click', resetGlobeView);
    document.getElementById('toggleRotation').addEventListener('click', toggleAutoRotation);
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
    
    try {
        // Note: Due to CORS restrictions, this will only work on a proper server
        // For local testing, we'll use demo coordinates
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            // Demo mode for local testing
            showDemoLocation(query);
            return;
        }
        
        // For production, use a proxy or server-side API
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`, {
            headers: {
                'User-Agent': 'DeepTimeWhispers/1.0'
            }
        });
        const data = await response.json();
        
        if (data && data.length > 0) {
            const location = data[0];
            const lat = parseFloat(location.lat);
            const lon = parseFloat(location.lon);
            
            setLocation({
                lat: lat,
                lon: lon,
                name: location.display_name
            });
            
            showStatus('Location found!', 'success');
        } else {
            showStatus('Location not found. Try a different search.', 'error');
        }
    } catch (error) {
        console.error('Search error:', error);
        // Fallback to demo mode
        showDemoLocation(query);
    }
}

// Demo location for testing
function showDemoLocation(query) {
    // Simulate some major cities for demo
    const demoLocations = {
        'new york': { lat: 40.7128, lon: -74.0060, name: 'New York, NY, USA' },
        'london': { lat: 51.5074, lon: -0.1278, name: 'London, UK' },
        'tokyo': { lat: 35.6762, lon: 139.6503, name: 'Tokyo, Japan' },
        'paris': { lat: 48.8566, lon: 2.3522, name: 'Paris, France' },
        'sydney': { lat: -33.8688, lon: 151.2093, name: 'Sydney, Australia' }
    };
    
    const queryLower = query.toLowerCase();
    const demoLocation = demoLocations[queryLower] || {
        lat: 40.7128,
        lon: -74.0060,
        name: `Demo location for: ${query}`
    };
    
    setLocation(demoLocation);
    showStatus('Demo mode: Showing example location', 'success');
}

// Use current location
function useCurrentLocation() {
    if (!navigator.geolocation) {
        showStatus('Geolocation is not supported by your browser', 'error');
        return;
    }
    
    showStatus('Getting your location...', 'loading');
    
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            
            try {
                // Reverse geocode to get location name
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                const data = await response.json();
                
                setLocation({
                    lat: lat,
                    lon: lon,
                    name: data.display_name || `${lat.toFixed(2)}, ${lon.toFixed(2)}`
                });
                
                showStatus('Location found!', 'success');
            } catch (error) {
                // Still set location even if reverse geocoding fails
                setLocation({
                    lat: lat,
                    lon: lon,
                    name: `${lat.toFixed(2)}, ${lon.toFixed(2)}`
                });
                
                showStatus('Location set!', 'success');
            }
        },
        (error) => {
            console.error('Geolocation error:', error);
            showStatus('Unable to get your location. Please search manually.', 'error');
        }
    );
}

// Set location on globe
function setLocation(location) {
    currentLocation = location;
    
    // Update globe
    globe.pointsData([{
        lat: location.lat,
        lng: location.lon,
        label: 'Your Location'
    }]);
    
    // Center view on location
    globe.pointOfView({
        lat: location.lat,
        lng: location.lon,
        altitude: 1.5
    }, 1000);
    
    // Show location info
    document.getElementById('locationInfo').style.display = 'block';
    updateLocationInfo();
}

// Update time display
function updateTimeDisplay(mya) {
    const timeValue = document.getElementById('timeValue');
    const myaValue = document.getElementById('myaValue');
    
    // Find closest time period
    let periodName = "Custom Time";
    let closestPeriod = null;
    let minDiff = Infinity;
    
    for (const [periodMya, period] of Object.entries(timePeriods)) {
        const diff = Math.abs(mya - parseInt(periodMya));
        if (diff < minDiff) {
            minDiff = diff;
            closestPeriod = period;
            if (diff < 5) periodName = period.name;
        }
    }
    
    timeValue.textContent = periodName;
    myaValue.textContent = `${mya} MYA`;
    
    // Update location info if we have a location
    if (currentLocation) {
        updateLocationInfo();
    }
    
    // Update globe appearance based on time
    updateGlobeForTime(mya);
}

// Update location info panel
function updateLocationInfo() {
    if (!currentLocation) return;
    
    const mya = parseInt(document.getElementById('timeSlider').value);
    
    // Update current location
    document.getElementById('currentLocation').innerHTML = `
        <strong>Current Location:</strong><br>
        ${currentLocation.name}<br>
        ${currentLocation.lat.toFixed(4)}°, ${currentLocation.lon.toFixed(4)}°
    `;
    
    // Calculate ancient position (simplified - in reality this would use paleogeographic data)
    const drift = calculateContinentalDrift(currentLocation, mya);
    document.getElementById('ancientLocation').innerHTML = `
        <strong>Ancient Position:</strong><br>
        ${drift.description}<br>
        Approximately ${drift.distance} km ${drift.direction}
    `;
    
    // Update environment info
    document.getElementById('environmentInfo').innerHTML = getEnvironmentInfo(currentLocation, mya);
    
    // Update life info
    document.getElementById('lifeInfo').innerHTML = getLifeInfo(mya);
}

// Calculate continental drift (simplified demonstration)
function calculateContinentalDrift(location, mya) {
    // This is a simplified calculation for demonstration
    // Real implementation would use paleogeographic reconstruction data
    
    const driftRate = 2.5; // cm/year average
    const totalDrift = (mya * 1000000 * driftRate) / 100000; // Convert to km
    
    // Simplified drift direction based on latitude
    let direction = "from its current position";
    if (location.lat > 30) {
        direction = "south";
    } else if (location.lat < -30) {
        direction = "north";
    } else {
        direction = "west";
    }
    
    let description = "Near current location";
    if (mya > 200) {
        description = "Part of supercontinent Pangaea";
    } else if (mya > 100) {
        description = "On a different continent";
    } else if (mya > 50) {
        description = "Significantly displaced";
    }
    
    return {
        distance: Math.round(totalDrift),
        direction: direction,
        description: description
    };
}

// Get environment information for time period
function getEnvironmentInfo(location, mya) {
    // Simplified environmental descriptions based on time period
    if (mya === 0) return "Modern climate and environment";
    if (mya < 3) return "Ice ages coming and going, similar to modern climate";
    if (mya < 35) return "Warmer than today, no permanent ice caps";
    if (mya < 66) return "Warm, humid, tropical seas, no ice at poles";
    if (mya < 150) return "Very warm, high sea levels, shallow seas common";
    if (mya < 250) return "Variable climate, formation of Pangaea";
    if (mya < 360) return "Tropical swamps, first forests, high oxygen";
    if (mya < 450) return "Warming after ice age, first land plants";
    if (mya < 550) return "Explosion of marine life, warm shallow seas";
    return "Ancient Earth, very different atmosphere";
}

// Get life information for time period
function getLifeInfo(mya) {
    if (mya === 0) return "Modern ecosystems, humans, familiar animals";
    if (mya < 3) return "Mammoths, saber-tooth cats, early humans";
    if (mya < 25) return "Early apes, grasslands spreading, horses evolving";
    if (mya < 66) return "Dinosaurs! T-Rex, Triceratops, early birds";
    if (mya < 150) return "Giant dinosaurs, first flowers, pterosaurs";
    if (mya < 250) return "Early dinosaurs, mammal ancestors, conifers";
    if (mya < 360) return "Giant insects, early reptiles, fern forests";
    if (mya < 450) return "First land animals, primitive plants, sea life";
    if (mya < 550) return "Cambrian explosion! Trilobites, early shells";
    return "Simple life forms, mostly microscopic";
}

// Update globe appearance for different time periods
function updateGlobeForTime(mya) {
    if (!globe) return;
    
    // This would ideally load different textures for different time periods
    // For now, we'll adjust the atmosphere to hint at different conditions
    
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
    
    // Update any location markers if they exist
    if (currentLocation) {
        // Simulate continental drift by adjusting marker position
        const drift = calculateContinentalDrift(currentLocation, mya);
        const adjustedLat = currentLocation.lat + (drift.distance / 111); // rough km to degrees
        const adjustedLon = currentLocation.lon + (drift.distance / 111);
        
        globe.pointsData([{
            lat: adjustedLat,
            lng: adjustedLon,
            label: `Your Location ${mya} MYA`
        }]);
    }
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

// Start globe rotation
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

// Stop globe rotation
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
    
    // Clear success/error messages after 3 seconds
    if (type !== 'loading') {
        setTimeout(() => {
            statusEl.textContent = '';
            statusEl.className = 'search-status';
        }, 3000);
    }
}

// Add some CSS for status messages
const style = document.createElement('style');
style.textContent = `
    .search-status.loading { color: #e8d4b0; }
    .search-status.success { color: #10b981; }
    .search-status.error { color: #ef4444; }
`;
document.head.appendChild(style);