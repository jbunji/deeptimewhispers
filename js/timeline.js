// Deep Time Explorer JavaScript

// Global variables
let timelineData = null;
let currentZoom = 1;
let currentPan = 0;
let currentFilter = 'all';
let searchTerm = '';
let allEvents = []; // Store all events for filtering

// Load timeline data with improved error handling and loading states
async function loadTimelineData() {
    const loadingEl = document.getElementById('timelineLoading');
    const controlsEl = document.getElementById('timelineControls');
    const filtersEl = document.getElementById('timelineFilters');
    const scaleEl = document.getElementById('timelineScale');
    const svgEl = document.getElementById('timelineSvg');
    const errorEl = document.getElementById('timelineError');
    
    try {
        // Show loading state
        if (loadingEl) loadingEl.style.display = 'block';
        
        const response = await fetch('data/timeline-events.json');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        timelineData = await response.json();
        
        // Validate data structure
        if (!timelineData || !timelineData.eons || !Array.isArray(timelineData.eons)) {
            throw new Error('Invalid timeline data format');
        }
        
        // Extract all events from eons
        timelineData.events = [];
        if (timelineData.eons && Array.isArray(timelineData.eons)) {
            timelineData.eons.forEach(eon => {
                if (eon && eon.keyEvents && Array.isArray(eon.keyEvents)) {
                    eon.keyEvents.forEach(event => {
                        if (event) {
                            // Add eon information to each event
                            timelineData.events.push({
                                ...event,
                                eon: eon.name || 'Unknown',
                                eonColor: eon.color || '#666666'
                            });
                        }
                    });
                }
            });
        }
        
        // Hide loading, show controls
        if (loadingEl) loadingEl.style.display = 'none';
        if (controlsEl) controlsEl.style.display = 'flex';
        if (filtersEl) filtersEl.style.display = 'block';
        if (scaleEl) scaleEl.style.display = 'flex';
        if (svgEl) svgEl.style.display = 'block';
        
        // Initialize components
        initializeTimeline();
        
        // Only call these if the elements exist
        if (document.getElementById('episodesGrid')) {
            populateEpisodes();
        }
        if (document.getElementById('glossaryGrid')) {
            createGlossary();
        }
        
        setupEventListeners();
        setupSearchAndFilter();
        
        console.log(`Timeline loaded: ${timelineData.events ? timelineData.events.length : 0} events`);
        
    } catch (error) {
        console.error('Error loading timeline data:', error);
        
        // Hide loading, show error
        if (loadingEl) loadingEl.style.display = 'none';
        if (errorEl) {
            errorEl.style.display = 'block';
            errorEl.innerHTML = `<p>⚠️ Failed to load timeline: ${error.message}<br><button onclick="location.reload()">Reload Page</button></p>`;
        }
    }
}

// Initialize the timeline visualization
function initializeTimeline() {
    const svg = document.getElementById('timelineSvg');
    const container = document.getElementById('timelineContainer');
    
    if (!svg) {
        console.error('Timeline SVG element not found');
        return;
    }
    
    if (!container) {
        console.error('Timeline container element not found');
        return;
    }
    
    const baseWidth = 1200;
    const height = 700;
    
    // Calculate actual width based on zoom
    const width = baseWidth * currentZoom;
    
    // Set SVG dimensions for proper scrolling
    svg.style.width = `${width}px`;
    svg.style.height = `${height}px`;
    // IMPORTANT: viewBox should match the actual width to prevent stretching
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    
    // Clear any existing content
    svg.innerHTML = '';
    
    // Reset event positions
    eventPositions.length = 0;
    
    // Create main timeline group (no transform here)
    const mainGroup = createSVGElement('g', {
        id: 'mainTimelineGroup'
    });
    
    // Draw timeline axis
    const axisY = height - 100;
    const axis = createSVGElement('line', {
        class: 'timeline-axis',
        x1: 50,
        y1: axisY,
        x2: width - 50, // This now uses the zoomed width
        y2: axisY
    });
    mainGroup.appendChild(axis);
    
    // Calculate positions for eons
    const totalTime = 4500; // Million years
    const timelineWidth = width - 100;
    const startX = 50;
    
    // Draw eons
    if (timelineData.eons && Array.isArray(timelineData.eons)) {
        timelineData.eons.forEach((eon, index) => {
            if (!eon || typeof eon.startMYA !== 'number' || typeof eon.endMYA !== 'number') {
                console.warn('Invalid eon data:', eon);
                return;
            }
            
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
            'text-anchor': 'middle'
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
                    class: 'era-label',
                    x: eraX + eraWidth / 2,
                    y: eraY - 5,
                    'text-anchor': 'middle',
                    fill: '#e2e8f0'
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
    }
    
    // Add dual timeline labels
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
        
        // Primary time label (MYA)
        const label = createSVGElement('text', {
            class: 'timeline-label',
            x: x,
            y: axisY + 20,
            'text-anchor': 'middle'
        });
        label.textContent = i === 0 ? 'Today' : `${i} MYA`;
        mainGroup.appendChild(label);
        
        // Secondary time label (time until present)
        const timeUntilPresent = createSVGElement('text', {
            class: 'timeline-label-secondary',
            x: x,
            y: axisY + 40,
            'text-anchor': 'middle',
            fill: '#6a6a7a',
            'font-size': '0.85em'
        });
        if (i === 0) {
            timeUntilPresent.textContent = 'Present';
        } else if (i < 1000) {
            timeUntilPresent.textContent = `${i} million years ago`;
        } else {
            timeUntilPresent.textContent = `${(i / 1000).toFixed(1)} billion years ago`;
        }
        mainGroup.appendChild(timeUntilPresent);
    }
    
    // Store all events globally for filtering
    allEvents = timelineData.events || [];
    
    svg.appendChild(mainGroup);
    console.log(`Timeline initialized with ${allEvents.length} events`);
}

// Track event positions for collision detection
const eventPositions = [];

// Add event marker to timeline
function addEventMarker(parent, event, totalTime, timelineWidth, startX, axisY) {
    const eventX = startX + ((totalTime - event.dateMYA) / totalTime) * timelineWidth;
    
    // Calculate Y position to avoid overlaps
    let eventY = axisY - 200;
    let textRotation = -45;
    
    // For recent events (< 100 MYA), stagger heights more aggressively
    if (event.dateMYA < 100) {
        // Check for nearby events
        const nearbyEvents = eventPositions.filter(pos => 
            Math.abs(pos.x - eventX) < 50 && Math.abs(pos.y - eventY) < 30
        );
        
        if (nearbyEvents.length > 0) {
            // Stagger the height
            const staggerLevels = [200, 250, 150, 300, 100];
            const levelIndex = eventPositions.length % staggerLevels.length;
            eventY = axisY - staggerLevels[levelIndex];
            
            // Alternate text rotation for readability
            textRotation = levelIndex % 2 === 0 ? -45 : -65;
        }
    }
    
    // Store position
    eventPositions.push({ x: eventX, y: eventY });
    
    // Event line
    const line = createSVGElement('line', {
        class: 'event-line',
        x1: eventX,
        y1: eventY,
        x2: eventX,
        y2: axisY
    });
    parent.appendChild(line);
    
    // Event marker circle
    const circle = createSVGElement('circle', {
        class: `event-marker ${event.podcastEpisode ? 'podcast-episode-marker' : ''}`,
        cx: eventX,
        cy: eventY,
        r: event.podcastEpisode ? 8 : 6,
        fill: getEventColor(event.type),
        stroke: getEventColor(event.type),
        'stroke-width': '1',
        'data-event': JSON.stringify(event)
    });
    
    // Add hover handlers for tooltip
    circle.addEventListener('mouseenter', (e) => showTooltip(e, event));
    circle.addEventListener('mouseleave', hideTooltip);
    // Remove mousemove listener to prevent tooltip from following mouse
    
    // Store event reference for filtering
    circle.eventData = event;
    circle.eventType = event.type;
    
    // Also ensure data attribute is set
    circle.setAttribute('data-event-type', event.type);
    circle.setAttribute('data-event-name', event.name);
    
    // Add click handler
    circle.addEventListener('click', (e) => {
        // Don't allow clicking on dimmed events
        if (e.target.classList.contains('dimmed')) {
            return;
        }
        // Add loading feedback
        circle.style.opacity = '0.5';
        setTimeout(() => {
            circle.style.opacity = '1';
            showEventDetails(event);
        }, 150);
    });
    
    parent.appendChild(circle);
    
    // Event name (rotated) - show for all events temporarily for debugging
    if (true || event.dateMYA > 50 || event.podcastEpisode) {
        const text = createSVGElement('text', {
            x: eventX,
            y: eventY - 10,
            transform: `rotate(${textRotation}, ${eventX}, ${eventY - 10})`,
            'text-anchor': 'end',
            fill: '#a8a8b8',
            class: event.podcastEpisode ? 'event-label-podcast' : 'event-label',
            'font-weight': event.podcastEpisode ? '600' : '400'
        });
        text.textContent = event.name;
        // Store event data on text element too
        text.eventData = event;
        text.classList.add('event-text');
        parent.appendChild(text);
    }
}

// Tooltip functions
let currentTooltip = null;

function showTooltip(e, event) {
    // Remove existing tooltip
    hideTooltip();
    
    // Create tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'event-tooltip';
    tooltip.style.position = 'fixed'; // Use fixed positioning
    
    const timeAgo = event.dateMYA < 1 ? 
        `${Math.round(event.dateMYA * 1000)} thousand years ago` : 
        `${event.dateMYA} million years ago`;
    
    tooltip.innerHTML = `
        <h4>${event.name}</h4>
        <div class="event-date">${timeAgo}</div>
        <p>${event.description}</p>
        ${event.podcastEpisode ? '<p style="margin-top: 8px; color: #a78bfa;">🎧 Click to see episode</p>' : ''}
    `;
    
    document.body.appendChild(tooltip);
    currentTooltip = tooltip;
    
    // Initial position
    updateTooltipPosition(e);
    
    // Trigger animation
    setTimeout(() => tooltip.classList.add('visible'), 10);
}

function updateTooltipPosition(e) {
    if (!currentTooltip) return;
    
    const tooltip = currentTooltip;
    const tooltipRect = tooltip.getBoundingClientRect();
    
    // Get the actual SVG element (circle) that triggered the event
    const circle = e.target;
    if (!circle || !circle.getBoundingClientRect) return;
    
    // Get the bounding rectangle of the circle element
    const circleRect = circle.getBoundingClientRect();
    
    // Position tooltip centered above the circle
    let left = circleRect.left + (circleRect.width / 2) - (tooltipRect.width / 2);
    let top = circleRect.top - tooltipRect.height - 15; // 15px gap above the circle
    
    // Keep tooltip on screen
    const padding = 10;
    if (left < padding) left = padding;
    if (left + tooltipRect.width > window.innerWidth - padding) {
        left = window.innerWidth - tooltipRect.width - padding;
    }
    if (top < padding) {
        // Show below circle if no room above
        top = circleRect.bottom + 15;
    }
    
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
}

function hideTooltip() {
    if (currentTooltip) {
        currentTooltip.classList.remove('visible');
        setTimeout(() => {
            if (currentTooltip) {
                currentTooltip.remove();
                currentTooltip = null;
            }
        }, 300);
    }
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
    
    // Title and basic info
    document.getElementById('eventTitle').textContent = event.name;
    
    // Format date display
    const timeAgo = event.dateMYA < 1 ? 
        `${Math.round(event.dateMYA * 1000)} thousand years ago` : 
        `${event.dateMYA} million years ago`;
    document.getElementById('eventDate').textContent = timeAgo;
    
    // Add eon/era context
    const eonInfo = getEonContext(event.dateMYA);
    document.getElementById('eventEon').textContent = eonInfo;
    
    // Event type badge
    const typeBadge = document.getElementById('eventTypeBadge');
    typeBadge.textContent = event.type;
    typeBadge.className = `event-type-badge ${event.type}`;
    
    // Description
    document.getElementById('eventDescription').textContent = event.description;
    
    // Add context and significance (these would ideally come from extended data)
    const contextSection = document.getElementById('eventContext');
    const significanceSection = document.getElementById('eventSignificance');
    
    // Generate context based on event type and time period
    const context = generateEventContext(event);
    if (context) {
        document.getElementById('eventContextText').textContent = context;
        contextSection.style.display = 'block';
    } else {
        contextSection.style.display = 'none';
    }
    
    // Generate significance
    const significance = generateEventSignificance(event);
    if (significance) {
        document.getElementById('eventSignificanceText').textContent = significance;
        significanceSection.style.display = 'block';
    } else {
        significanceSection.style.display = 'none';
    }
    
    // Podcast link
    const podcastLink = document.getElementById('eventPodcastLink');
    if (event.podcastEpisode) {
        podcastLink.style.display = 'inline-flex';
        podcastLink.href = `#${event.podcastEpisode}`;
    } else {
        podcastLink.style.display = 'none';
    }
    
    // Share button functionality
    const shareBtn = document.getElementById('shareEventBtn');
    shareBtn.onclick = () => shareEvent(event);
    
    // Citation button functionality
    const citationBtn = document.getElementById('citationBtn');
    const citationModal = document.getElementById('citationModal');
    
    citationBtn.onclick = () => {
        citationModal.style.display = citationModal.style.display === 'none' ? 'block' : 'none';
        if (citationModal.style.display === 'block') {
            generateCitation(event, 'apa');
            setupCitationHandlers(event);
        }
    };
    
    // Hide citation modal initially
    citationModal.style.display = 'none';
    
    // Timeline position indicator
    updateTimelinePosition(event.dateMYA);
    
    // Find and display related events
    displayRelatedEvents(event);
    
    detailsPanel.style.display = 'block';
    // Don't scroll to panel since it's now fixed position
}

// Close event details
function closeEventDetails() {
    const detailsPanel = document.getElementById('eventDetails');
    detailsPanel.style.opacity = '0';
    detailsPanel.style.transform = 'translateY(20px)';
    setTimeout(() => {
        detailsPanel.style.display = 'none';
        detailsPanel.style.opacity = '1';
        detailsPanel.style.transform = 'translateY(0)';
    }, 300);
}

// Get eon/era context for a given date
function getEonContext(dateMYA) {
    if (!timelineData) return '';
    
    for (const eon of timelineData.eons) {
        if (dateMYA <= eon.startMYA && dateMYA >= eon.endMYA) {
            if (eon.eras) {
                for (const era of eon.eras) {
                    if (dateMYA <= era.startMYA && dateMYA >= era.endMYA) {
                        return `${era.name} Era, ${eon.name} Eon`;
                    }
                }
            }
            return `${eon.name} Eon`;
        }
    }
    return '';
}

// Generate contextual information based on event
function generateEventContext(event) {
    const contexts = {
        origin: 'This event marks a fundamental beginning in Earth\'s history, setting the stage for everything that followed.',
        catastrophe: 'A devastating event that reshaped Earth\'s surface, atmosphere, or biosphere, often clearing the way for new evolutionary experiments.',
        evolution: 'A major evolutionary innovation that changed the course of life on Earth, opening new ecological niches and possibilities.',
        extinction: 'A mass die-off that eliminated numerous species, creating opportunities for surviving lineages to diversify and fill empty ecological roles.',
        geological: 'A significant change in Earth\'s physical structure, affecting continents, oceans, and the planet\'s overall geography.',
        climate: 'A major shift in global climate patterns that transformed ecosystems and drove evolutionary adaptations.'
    };
    
    return contexts[event.type] || null;
}

// Generate significance text
function generateEventSignificance(event) {
    // Special significance for certain well-known events
    const specialEvents = {
        'Formation of Earth': 'Without this accretion of dust and gas 4.5 billion years ago, nothing else in Earth\'s history would have been possible.',
        'The Birth of the Moon': 'Our large moon stabilizes Earth\'s tilt, creating stable seasons and making complex life possible.',
        'First Life': 'The appearance of life fundamentally changed Earth from a dead rock to a living world.',
        'Great Oxidation Event': 'Oxygen transformed Earth\'s chemistry and paved the way for complex, energy-hungry organisms.',
        'Cambrian Explosion': 'Most modern animal body plans appeared in this evolutionary \'big bang,\' setting the stage for all future animal evolution.',
        'The Great Dying': 'The closest life has ever come to complete extinction, this event cleared the way for the age of dinosaurs.',
        'Chicxulub Impact': 'The asteroid that ended the Mesozoic Era created the opportunity for mammals - and eventually humans - to dominate the planet.'
    };
    
    return specialEvents[event.name] || null;
}

// Share event functionality
function shareEvent(event) {
    const shareText = `Check out this moment in Deep Time: ${event.name} - ${event.dateMYA} million years ago. ${event.description}`;
    
    if (navigator.share) {
        navigator.share({
            title: event.name,
            text: shareText,
            url: window.location.href
        }).catch(err => console.log('Error sharing:', err));
    } else {
        // Fallback to copying to clipboard
        navigator.clipboard.writeText(shareText + ' ' + window.location.href)
            .then(() => {
                const btn = document.getElementById('shareEventBtn');
                const originalText = btn.innerHTML;
                btn.innerHTML = '✓ Copied!';
                setTimeout(() => {
                    btn.innerHTML = originalText;
                }, 2000);
            });
    }
}

// Update timeline position indicator
function updateTimelinePosition(dateMYA) {
    const marker = document.getElementById('eventPositionMarker');
    const totalTime = 4500; // Total timeline span in million years
    const position = ((totalTime - dateMYA) / totalTime) * 100;
    marker.style.left = `${position}%`;
}

// Find and display related events
function displayRelatedEvents(currentEvent) {
    const relatedSection = document.getElementById('relatedEvents');
    const relatedList = document.getElementById('relatedEventsList');
    
    // Clear previous related events
    relatedList.innerHTML = '';
    
    // Find events within 500 million years
    const timeWindow = 500;
    const relatedEvents = [];
    
    // Search through all events in timeline data
    timelineData.eons.forEach(eon => {
        if (eon.keyEvents) {
            eon.keyEvents.forEach(event => {
                if (event.name !== currentEvent.name && 
                    Math.abs(event.dateMYA - currentEvent.dateMYA) <= timeWindow) {
                    relatedEvents.push({...event, eon: eon.name});
                }
            });
        }
        
        if (eon.eras) {
            eon.eras.forEach(era => {
                if (era.periods) {
                    era.periods.forEach(period => {
                        if (period.keyEvents) {
                            period.keyEvents.forEach(event => {
                                if (event.name !== currentEvent.name && 
                                    Math.abs(event.dateMYA - currentEvent.dateMYA) <= timeWindow) {
                                    relatedEvents.push({...event, era: era.name, eon: eon.name});
                                }
                            });
                        }
                    });
                }
            });
        }
    });
    
    // Sort by date proximity to current event
    relatedEvents.sort((a, b) => 
        Math.abs(a.dateMYA - currentEvent.dateMYA) - Math.abs(b.dateMYA - currentEvent.dateMYA)
    );
    
    // Display up to 3 related events
    const eventsToShow = relatedEvents.slice(0, 3);
    
    if (eventsToShow.length > 0) {
        eventsToShow.forEach(event => {
            const item = createRelatedEventItem(event);
            relatedList.appendChild(item);
        });
        relatedSection.style.display = 'block';
    } else {
        relatedSection.style.display = 'none';
    }
}

// Create related event item element
function createRelatedEventItem(event) {
    const item = document.createElement('div');
    item.className = 'related-event-item';
    
    const timeAgo = event.dateMYA < 1 ? 
        `${Math.round(event.dateMYA * 1000)}k years` : 
        `${event.dateMYA} MYA`;
    
    item.innerHTML = `
        <span class="related-event-time">${timeAgo}</span>
        <span class="related-event-name">${event.name}</span>
        <span class="related-event-type event-type-badge ${event.type}" 
              style="background: rgba(255,255,255,0.1); padding: 2px 8px; font-size: 0.7rem;">
            ${event.type}
        </span>
    `;
    
    item.addEventListener('click', () => {
        showEventDetails(event);
    });
    
    return item;
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
            // Add loading feedback
            card.style.opacity = '0.7';
            setTimeout(() => {
                card.style.opacity = '1';
                showEventDetails(episode);
                document.getElementById('timeline').scrollIntoView({ behavior: 'smooth' });
            }, 150);
        });
        
        if (episodesGrid) {
            episodesGrid.appendChild(card);
        }
    });
}

// Create basic glossary (will be expanded later)
function createGlossary() {
    const glossaryGrid = document.getElementById('glossaryGrid');
    
    // Check if glossary grid exists (it was removed in our streamlined design)
    if (!glossaryGrid) {
        console.log('Glossary grid not found - glossary section was streamlined out');
        return;
    }
    
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
        if (glossaryGrid) {
            glossaryGrid.appendChild(termDiv);
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    const timelineContainer = document.getElementById('timelineContainer');
    
    // Zoom controls - check if they exist
    const zoomInBtn = document.getElementById('zoomIn');
    const zoomOutBtn = document.getElementById('zoomOut');
    const resetBtn = document.getElementById('resetView');
    
    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', () => {
            if (currentZoom < 5) {
                const container = document.getElementById('timelineContainer');
                const scrollPercent = container.scrollLeft / container.scrollWidth;
                currentZoom *= 1.5;
                initializeTimeline(); // Redraw timeline at new zoom
                // Restore scroll position
                setTimeout(() => {
                    container.scrollLeft = container.scrollWidth * scrollPercent;
                }, 10);
            }
        });
    }
    
    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', () => {
            if (currentZoom > 0.5) {
                const container = document.getElementById('timelineContainer');
                const scrollPercent = container.scrollLeft / container.scrollWidth;
                currentZoom /= 1.5;
                initializeTimeline(); // Redraw timeline at new zoom
                // Restore scroll position
                setTimeout(() => {
                    container.scrollLeft = container.scrollWidth * scrollPercent;
                }, 10);
            }
        });
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            currentZoom = 1;
            currentPan = 0;
            const container = document.getElementById('timelineContainer');
            container.scrollLeft = 0;
            initializeTimeline(); // Redraw timeline at default zoom
        });
    }
    
    // Mouse wheel zoom - COMPLETELY REMOVED
    // Only use buttons for zooming
    
    // Pan functionality - DISABLED since we now use native scrolling
    // The timeline container will handle scrolling automatically
    
    // Glossary search - check if element exists
    const glossarySearch = document.getElementById('glossarySearch');
    if (glossarySearch) {
        glossarySearch.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const terms = document.querySelectorAll('.glossary-term');
            
            terms.forEach(term => {
                const text = term.textContent.toLowerCase();
                term.style.display = text.includes(searchTerm) ? 'block' : 'none';
            });
        });
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Escape key
        if (e.key === 'Escape') {
            const detailsPanel = document.getElementById('eventDetails');
            if (detailsPanel && detailsPanel.style.display === 'block') {
                closeEventDetails();
            } else if (searchTerm) {
                // Clear search if no details panel is open
                const searchInput = document.getElementById('eventSearch');
                const clearSearch = document.getElementById('clearSearch');
                if (searchInput) {
                    searchInput.value = '';
                    searchTerm = '';
                }
                if (clearSearch) {
                    clearSearch.style.display = 'none';
                }
                applyFilters();
            }
        }
        
        // Quick filter shortcuts (1-7 keys)
        if (e.key >= '1' && e.key <= '7' && !e.ctrlKey && !e.metaKey && !e.altKey) {
            // Don't trigger if user is typing in search box
            if (document.activeElement.id === 'eventSearch') return;
            
            const filterMap = {
                '1': 'all',
                '2': 'catastrophe',
                '3': 'evolution',
                '4': 'extinction',
                '5': 'geological',
                '6': 'climate',
                '7': 'origin'
            };
            
            const filterType = filterMap[e.key];
            if (filterType) {
                // Find and click the corresponding filter button
                const btn = document.querySelector(`[data-filter="${filterType}"]`);
                if (btn) btn.click();
            }
        }
        
        // Slash key to focus search
        if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            document.getElementById('eventSearch').focus();
        }
    });
}

// Update timeline transform - NO LONGER USED
// We now redraw the timeline at different sizes instead of transforming it
function updateTimelineTransform() {
    // Deprecated - kept for compatibility
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

// Setup search and filter functionality
function setupSearchAndFilter() {
    const searchInput = document.getElementById('eventSearch');
    const clearBtn = document.getElementById('clearSearch');
    const filterBtns = document.querySelectorAll('.filter-btn, .filter-pill');
    
    // Check if search elements exist
    if (!searchInput) {
        console.log('Search elements not found - using streamlined filters');
        return;
    }
    
    // Layer checkboxes - check if they exist
    const layerGeological = document.getElementById('layerGeological');
    const layerClimate = document.getElementById('layerClimate');
    const layerLife = document.getElementById('layerLife');
    const layerExtinctions = document.getElementById('layerExtinctions');
    
    console.log('Setting up search and filter...', { searchInput, filterBtns: filterBtns.length });
    
    // Test: Add a manual filter test
    window.testFilter = (term) => {
        searchTerm = term.toLowerCase();
        console.log('Testing filter with term:', searchTerm);
        applyFilters();
    };
    
    // Search functionality
    searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value.toLowerCase();
        console.log('Search term changed:', searchTerm);
        if (clearBtn) {
            clearBtn.style.display = searchTerm ? 'block' : 'none';
        }
        applyFilters();
    });
    
    // Also handle keyup for better responsiveness
    searchInput.addEventListener('keyup', (e) => {
        searchTerm = e.target.value.toLowerCase();
        applyFilters();
    });
    
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            searchTerm = '';
            clearBtn.style.display = 'none';
            applyFilters();
        });
    }
    
    // Filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            currentFilter = btn.getAttribute('data-filter');
            applyFilters();
        });
    });
    
    // Layer toggle event listeners
    const layerToggles = [
        { checkbox: layerGeological, types: ['geological'] },
        { checkbox: layerClimate, types: ['climate'] },
        { checkbox: layerLife, types: ['evolution', 'origin'] },
        { checkbox: layerExtinctions, types: ['extinction'] }
    ];
    
    layerToggles.forEach(layer => {
        if (layer.checkbox) {
            layer.checkbox.addEventListener('change', () => {
                applyFilters();
            });
        }
    });
    
    // Store layer toggles globally for access in applyFilters
    window.layerToggles = layerToggles;
    
    // Setup timeline comparison tool
    setupTimelineComparison();
}

// Apply search and filter to timeline
function applyFilters() {
    const eventMarkers = document.querySelectorAll('.event-marker');
    let visibleCount = 0;
    let totalCount = 0;
    
    // Debug log
    console.log('Applying filters:', { searchTerm, currentFilter, markersFound: eventMarkers.length });
    
    eventMarkers.forEach(marker => {
        // Try multiple ways to get event data
        let eventData = marker.eventData;
        
        // Fallback: try parsing from data attribute
        if (!eventData) {
            try {
                const dataAttr = marker.getAttribute('data-event');
                if (dataAttr) {
                    eventData = JSON.parse(dataAttr);
                }
            } catch (e) {
                console.error('Failed to parse event data:', e);
            }
        }
        
        if (!eventData) {
            console.warn('No event data for marker:', marker);
            return;
        }
        
        totalCount++;
        
        // Check if event matches search term
        const matchesSearch = !searchTerm || 
            eventData.name.toLowerCase().includes(searchTerm) ||
            eventData.description.toLowerCase().includes(searchTerm);
        
        // Check if event matches filter
        const matchesFilter = currentFilter === 'all' || eventData.type === currentFilter;
        
        // Check if event type is enabled in layer toggles
        let matchesLayers = true;
        if (window.layerToggles) {
            const enabledTypes = [];
            window.layerToggles.forEach(layer => {
                if (layer.checkbox && layer.checkbox.checked) {
                    enabledTypes.push(...layer.types);
                }
            });
            
            // Check if event type is in any enabled layer
            matchesLayers = enabledTypes.includes(eventData.type) || 
                           (eventData.type === 'catastrophe' && enabledTypes.length === 0); // Show catastrophes by default
        }
        
        // Apply visual state without changing position
        if (matchesSearch && matchesFilter && matchesLayers) {
            marker.classList.remove('dimmed');
            marker.classList.add('visible');
            if (searchTerm) {
                marker.classList.add('highlighted');
            } else {
                marker.classList.remove('highlighted');
            }
            visibleCount++;
        } else {
            marker.classList.add('dimmed');
            marker.classList.remove('visible', 'highlighted');
        }
    });
    
    console.log(`Filter results: ${visibleCount} of ${totalCount} visible`);
    
    // Update result count
    updateFilterStatus(visibleCount, totalCount);
    
    // Also apply filtering to event text labels
    const eventTexts = document.querySelectorAll('.event-text');
    eventTexts.forEach(text => {
        if (text.eventData) {
            const matchesSearch = !searchTerm || 
                text.eventData.name.toLowerCase().includes(searchTerm) ||
                text.eventData.description.toLowerCase().includes(searchTerm);
            const matchesFilter = currentFilter === 'all' || text.eventData.type === currentFilter;
            
            // Check layer toggles for text as well
            let matchesLayers = true;
            if (window.layerToggles) {
                const enabledTypes = [];
                window.layerToggles.forEach(layer => {
                    if (layer.checkbox && layer.checkbox.checked) {
                        enabledTypes.push(...layer.types);
                    }
                });
                matchesLayers = enabledTypes.includes(text.eventData.type) || 
                               (text.eventData.type === 'catastrophe' && enabledTypes.length === 0);
            }
            
            text.style.opacity = (matchesSearch && matchesFilter && matchesLayers) ? '1' : '0.2';
        }
    });
}

// Update filter status message
function updateFilterStatus(visible, total) {
    const statusEl = document.getElementById('filterStatus');
    const visibleEl = document.getElementById('visibleCount');
    const totalEl = document.getElementById('totalCount');
    
    if (searchTerm || currentFilter !== 'all') {
        statusEl.style.display = 'inline-block';
        visibleEl.textContent = visible;
        totalEl.textContent = total;
    } else {
        statusEl.style.display = 'none';
    }
}

// Generate citation for an event
function generateCitation(event, format = 'apa') {
    const citationText = document.getElementById('citationText');
    const today = new Date();
    const year = today.getFullYear();
    const month = today.toLocaleString('default', { month: 'long' });
    const day = today.getDate();
    
    let citation = '';
    
    switch(format) {
        case 'apa':
            citation = `Deep Time Whispers. (${year}). ${event.name} [Interactive timeline event]. Retrieved ${month} ${day}, ${year}, from ${window.location.href}`;
            break;
            
        case 'mla':
            citation = `"${event.name}." Deep Time Whispers, ${year}, ${window.location.href}. Accessed ${day} ${month} ${year}.`;
            break;
            
        case 'chicago':
            citation = `Deep Time Whispers. "${event.name}." Accessed ${month} ${day}, ${year}. ${window.location.href}.`;
            break;
    }
    
    citationText.textContent = citation;
}

// Setup citation format switchers and copy functionality
function setupCitationHandlers(event) {
    const formatBtns = document.querySelectorAll('.citation-format-btn');
    const copyBtn = document.getElementById('copyCitation');
    
    // Format switchers
    formatBtns.forEach(btn => {
        btn.onclick = () => {
            formatBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            generateCitation(event, btn.dataset.format);
        };
    });
    
    // Copy functionality
    copyBtn.onclick = () => {
        const citationText = document.getElementById('citationText').textContent;
        navigator.clipboard.writeText(citationText)
            .then(() => {
                copyBtn.classList.add('copied');
                copyBtn.textContent = 'Copied to Clipboard';
                setTimeout(() => {
                    copyBtn.classList.remove('copied');
                    copyBtn.textContent = 'Copy to Clipboard';
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy citation:', err);
            });
    };
}

// Setup timeline comparison tool
function setupTimelineComparison() {
    const periodSelect = document.getElementById('periodSelect');
    const resultDiv = document.getElementById('comparisonResult');
    
    if (!periodSelect) return;
    
    periodSelect.addEventListener('change', (e) => {
        const selectedValue = parseFloat(e.target.value);
        if (!selectedValue) {
            resultDiv.style.display = 'none';
            return;
        }
        
        // Calculate comparisons
        const earthAge = 4500; // million years
        const comparisons = [];
        
        // Convert to millions of years for consistency
        const selectedMYA = selectedValue < 1 ? selectedValue / 1000000 : selectedValue;
        
        // Calculate how many times this period fits into Earth's history
        const timesInEarth = Math.floor(earthAge / selectedMYA);
        
        // Calculate percentage of Earth's history
        const percentage = ((selectedMYA / earthAge) * 100).toFixed(6);
        
        // Create comparison text
        let comparisonText = `<strong>${e.target.options[e.target.selectedIndex].text}</strong><br><br>`;
        
        if (timesInEarth > 1) {
            comparisonText += `This period could fit into Earth's history <strong>${timesInEarth.toLocaleString()}</strong> times.<br>`;
        }
        
        comparisonText += `This represents <strong>${percentage}%</strong> of Earth's total history.<br><br>`;
        
        // Add relatable comparisons
        if (selectedValue < 1) {
            comparisonText += `If Earth's history was compressed into a single year, this period would be just the last <strong>${Math.round((selectedMYA / earthAge) * 365 * 24 * 60 * 60)} seconds</strong>!<br>`;
        } else if (selectedValue < 100) {
            const days = Math.round((selectedMYA / earthAge) * 365);
            comparisonText += `If Earth's history was compressed into a single year, this period would be the last <strong>${days} ${days === 1 ? 'day' : 'days'}</strong>.<br>`;
        } else if (selectedValue < 1000) {
            const months = Math.round((selectedMYA / earthAge) * 12);
            comparisonText += `If Earth's history was compressed into a single year, this period would span <strong>${months} ${months === 1 ? 'month' : 'months'}</strong>.<br>`;
        }
        
        // Add visual representation
        comparisonText += `<div class="comparison-visual">`;
        comparisonText += `<div style="width: 100%; height: 30px; background: rgba(255,255,255,0.1); border-radius: 5px; overflow: hidden;">`;
        comparisonText += `<div style="width: ${Math.max(0.5, percentage)}%; height: 100%; background: #a78bfa; transition: width 1s ease;"></div>`;
        comparisonText += `</div>`;
        comparisonText += `<small style="color: #a8a8b8; margin-top: 5px; display: block;">Visual scale of this period relative to Earth's history</small>`;
        comparisonText += `</div>`;
        
        resultDiv.innerHTML = comparisonText;
        resultDiv.style.display = 'block';
    });
}

// Toggle comparison tool
window.toggleComparison = function() {
    const modal = document.getElementById('comparisonModal');
    if (modal.style.display === 'none' || !modal.style.display) {
        modal.style.display = 'flex';
        // Reset the select when opening
        document.getElementById('periodSelect').value = '';
        document.getElementById('comparisonResult').style.display = 'none';
    } else {
        modal.style.display = 'none';
    }
};

// Close event details
window.closeEventDetails = function() {
    const detailsPanel = document.getElementById('eventDetails');
    detailsPanel.style.display = 'none';
};

// Initialize when DOM is ready with performance monitoring
document.addEventListener('DOMContentLoaded', () => {
    const startTime = performance.now();
    
    loadTimelineData().then(() => {
        const loadTime = performance.now() - startTime;
        console.log(`Timeline fully loaded in ${loadTime.toFixed(2)}ms`);
    }).catch(error => {
        console.error('Timeline initialization failed:', error);
    });
});