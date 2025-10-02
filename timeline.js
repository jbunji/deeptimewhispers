// Deep Time Explorer JavaScript

// Global variables
let timelineData = null;
let currentZoom = 1;
let currentPan = 0;

// Load timeline data
async function loadTimelineData() {
    try {
        const response = await fetch('data/timeline-events.json');
        timelineData = await response.json();
        initializeTimeline();
        populateEpisodes();
        setupEventListeners();
    } catch (error) {
        console.error('Error loading timeline data:', error);
        document.getElementById('timelineContainer').innerHTML = 
            '<div class="loading">Error loading timeline data. Please refresh the page.</div>';
    }
}

// Initialize the timeline visualization
function initializeTimeline() {
    const svg = document.getElementById('timelineSvg');
    const width = 1200;
    const height = 600;
    
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    
    // Clear any existing content
    svg.innerHTML = '';
    
    // Create main timeline group
    const mainGroup = createSVGElement('g', {
        id: 'mainTimelineGroup',
        transform: `translate(${currentPan}, 0) scale(${currentZoom}, 1)`
    });
    
    // Draw timeline axis
    const axisY = height - 100;
    const axis = createSVGElement('line', {
        class: 'timeline-axis',
        x1: 50,
        y1: axisY,
        x2: width - 50,
        y2: axisY
    });
    mainGroup.appendChild(axis);
    
    // Calculate positions for eons
    const totalTime = 4500; // Million years
    const timelineWidth = width - 100;
    const startX = 50;
    
    // Draw eons
    timelineData.eons.forEach((eon, index) => {
        const eonDuration = eon.startMYA - eon.endMYA;
        const eonWidth = (eonDuration / totalTime) * timelineWidth;
        const eonX = startX + ((totalTime - eon.startMYA) / totalTime) * timelineWidth;
        
        // Create eon group
        const eonGroup = createSVGElement('g', {
            class: 'eon-group',
            'data-eon': eon.name
        });
        
        // Eon rectangle
        const rect = createSVGElement('rect', {
            class: 'eon-rect',
            x: eonX,
            y: 50,
            width: eonWidth,
            height: 300,
            fill: eon.color,
            opacity: 0.3,
            rx: 5
        });
        eonGroup.appendChild(rect);
        
        // Eon label
        const label = createSVGElement('text', {
            class: 'eon-label',
            x: eonX + eonWidth / 2,
            y: 30,
            'text-anchor': 'middle',
            'font-size': '18'
        });
        label.textContent = eon.name;
        eonGroup.appendChild(label);
        
        // Add key events
        if (eon.keyEvents) {
            eon.keyEvents.forEach(event => {
                addEventMarker(eonGroup, event, totalTime, timelineWidth, startX, axisY);
            });
        }
        
        // Handle Phanerozoic eras
        if (eon.eras) {
            let eraY = 150;
            eon.eras.forEach(era => {
                const eraDuration = era.startMYA - era.endMYA;
                const eraWidth = (eraDuration / totalTime) * timelineWidth;
                const eraX = startX + ((totalTime - era.startMYA) / totalTime) * timelineWidth;
                
                // Era rectangle
                const eraRect = createSVGElement('rect', {
                    x: eraX,
                    y: eraY,
                    width: eraWidth,
                    height: 80,
                    fill: '#4a5568',
                    opacity: 0.5,
                    stroke: '#718096',
                    'stroke-width': 1,
                    rx: 3
                });
                eonGroup.appendChild(eraRect);
                
                // Era label
                const eraLabel = createSVGElement('text', {
                    x: eraX + eraWidth / 2,
                    y: eraY - 5,
                    'text-anchor': 'middle',
                    fill: '#e2e8f0',
                    'font-size': '14'
                });
                eraLabel.textContent = era.name;
                eonGroup.appendChild(eraLabel);
                
                // Add events from periods
                if (era.periods) {
                    era.periods.forEach(period => {
                        if (period.keyEvents) {
                            period.keyEvents.forEach(event => {
                                addEventMarker(eonGroup, event, totalTime, timelineWidth, startX, axisY);
                            });
                        }
                    });
                }
            });
        }
        
        mainGroup.appendChild(eonGroup);
    });
    
    // Add time labels
    for (let i = 0; i <= 4500; i += 500) {
        const x = startX + ((4500 - i) / totalTime) * timelineWidth;
        
        // Tick mark
        const tick = createSVGElement('line', {
            class: 'timeline-tick',
            x1: x,
            y1: axisY - 5,
            x2: x,
            y2: axisY + 5
        });
        mainGroup.appendChild(tick);
        
        // Time label
        const label = createSVGElement('text', {
            class: 'timeline-label',
            x: x,
            y: axisY + 20,
            'text-anchor': 'middle'
        });
        label.textContent = i === 0 ? 'Today' : `${i} MYA`;
        mainGroup.appendChild(label);
    }
    
    svg.appendChild(mainGroup);
}

// Add event marker to timeline
function addEventMarker(parent, event, totalTime, timelineWidth, startX, axisY) {
    const eventX = startX + ((totalTime - event.dateMYA) / totalTime) * timelineWidth;
    
    // Event line
    const line = createSVGElement('line', {
        class: 'event-line',
        x1: eventX,
        y1: axisY - 200,
        x2: eventX,
        y2: axisY
    });
    parent.appendChild(line);
    
    // Event marker circle
    const circle = createSVGElement('circle', {
        class: `event-marker ${event.podcastEpisode ? 'podcast-episode-marker' : ''}`,
        cx: eventX,
        cy: axisY - 200,
        r: event.podcastEpisode ? 8 : 6,
        fill: getEventColor(event.type),
        'data-event': JSON.stringify(event)
    });
    
    // Add click handler
    circle.addEventListener('click', () => showEventDetails(event));
    
    parent.appendChild(circle);
    
    // Event name (rotated)
    const text = createSVGElement('text', {
        x: eventX,
        y: axisY - 210,
        transform: `rotate(-45, ${eventX}, ${axisY - 210})`,
        'text-anchor': 'end',
        fill: '#a8a8b8',
        'font-size': '12'
    });
    text.textContent = event.name;
    parent.appendChild(text);
}

// Get color based on event type
function getEventColor(type) {
    const colors = {
        origin: '#10b981',
        catastrophe: '#ef4444',
        evolution: '#3b82f6',
        extinction: '#dc2626',
        geological: '#f59e0b',
        climate: '#8b5cf6'
    };
    return colors[type] || '#6b7280';
}

// Show event details
function showEventDetails(event) {
    const detailsPanel = document.getElementById('eventDetails');
    document.getElementById('eventTitle').textContent = event.name;
    document.getElementById('eventDate').textContent = `${event.dateMYA} million years ago`;
    document.getElementById('eventDescription').textContent = event.description;
    
    const podcastLink = document.getElementById('eventPodcastLink');
    if (event.podcastEpisode) {
        podcastLink.style.display = 'inline-block';
        podcastLink.href = `#${event.podcastEpisode}`;
    } else {
        podcastLink.style.display = 'none';
    }
    
    detailsPanel.style.display = 'block';
    detailsPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Populate episodes section
function populateEpisodes() {
    const episodesGrid = document.getElementById('episodesGrid');
    const episodes = [];
    
    // Extract all episodes from timeline data
    timelineData.eons.forEach(eon => {
        if (eon.keyEvents) {
            eon.keyEvents.forEach(event => {
                if (event.podcastEpisode) {
                    episodes.push({...event, eon: eon.name});
                }
            });
        }
        
        if (eon.eras) {
            eon.eras.forEach(era => {
                if (era.periods) {
                    era.periods.forEach(period => {
                        if (period.keyEvents) {
                            period.keyEvents.forEach(event => {
                                if (event.podcastEpisode) {
                                    episodes.push({...event, era: era.name, period: period.name});
                                }
                            });
                        }
                    });
                }
            });
        }
    });
    
    // Sort episodes by date (newest to oldest)
    episodes.sort((a, b) => a.dateMYA - b.dateMYA);
    
    // Create episode cards
    episodes.forEach(episode => {
        const card = document.createElement('div');
        card.className = 'episode-card';
        
        const era = episode.era || episode.eon;
        const timeAgo = episode.dateMYA < 1 ? 
            `${Math.round(episode.dateMYA * 1000)} thousand years ago` : 
            `${episode.dateMYA} million years ago`;
        
        card.innerHTML = `
            <div class="episode-era">${era}</div>
            <h3 class="episode-title">${episode.name}</h3>
            <div class="episode-time">${timeAgo}</div>
            <p class="episode-description">${episode.description}</p>
        `;
        
        card.addEventListener('click', () => {
            showEventDetails(episode);
            document.getElementById('timeline').scrollIntoView({ behavior: 'smooth' });
        });
        
        episodesGrid.appendChild(card);
    });
}

// Create basic glossary (will be expanded later)
function createGlossary() {
    const glossaryGrid = document.getElementById('glossaryGrid');
    
    const terms = [
        { term: 'MYA', definition: 'Million Years Ago - Standard unit for measuring deep geological time.' },
        { term: 'Eon', definition: 'The largest division of geological time, lasting hundreds of millions to billions of years.' },
        { term: 'Era', definition: 'A subdivision of an eon, typically lasting tens to hundreds of millions of years.' },
        { term: 'Period', definition: 'A subdivision of an era, the fundamental unit of the geological time scale.' },
        { term: 'Extinction Event', definition: 'A widespread and rapid decrease in biodiversity on Earth.' },
        { term: 'Orogeny', definition: 'The process of mountain building through tectonic plate collision.' },
        { term: 'Pangaea', definition: 'The supercontinent that existed 335-175 million years ago.' },
        { term: 'Stromatolite', definition: 'Layered rock structures created by ancient cyanobacteria.' }
    ];
    
    terms.forEach(item => {
        const termDiv = document.createElement('div');
        termDiv.className = 'glossary-term';
        termDiv.innerHTML = `
            <h4>${item.term}</h4>
            <p>${item.definition}</p>
        `;
        glossaryGrid.appendChild(termDiv);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Zoom controls
    document.getElementById('zoomIn').addEventListener('click', () => {
        if (currentZoom < 5) {
            currentZoom *= 1.5;
            updateTimelineTransform();
        }
    });
    
    document.getElementById('zoomOut').addEventListener('click', () => {
        if (currentZoom > 0.5) {
            currentZoom /= 1.5;
            updateTimelineTransform();
        }
    });
    
    document.getElementById('resetView').addEventListener('click', () => {
        currentZoom = 1;
        currentPan = 0;
        updateTimelineTransform();
    });
    
    // Glossary search
    document.getElementById('glossarySearch').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const terms = document.querySelectorAll('.glossary-term');
        
        terms.forEach(term => {
            const text = term.textContent.toLowerCase();
            term.style.display = text.includes(searchTerm) ? 'block' : 'none';
        });
    });
}

// Update timeline transform
function updateTimelineTransform() {
    const mainGroup = document.getElementById('mainTimelineGroup');
    if (mainGroup) {
        mainGroup.setAttribute('transform', `translate(${currentPan}, 0) scale(${currentZoom}, 1)`);
    }
}

// Helper function to create SVG elements
function createSVGElement(type, attributes) {
    const element = document.createElementNS('http://www.w3.org/2000/svg', type);
    for (const [key, value] of Object.entries(attributes)) {
        element.setAttribute(key, value);
    }
    return element;
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadTimelineData();
    createGlossary();
});