// Modern Timeline Visualization Enhancement

// Helper function to create SVG elements
function createSVGElement(type, attributes) {
    const element = document.createElementNS('http://www.w3.org/2000/svg', type);
    for (const [key, value] of Object.entries(attributes)) {
        element.setAttribute(key, value);
    }
    return element;
}

// Override the timeline drawing to use modern layout
function modernizeTimeline() {
    const originalInit = window.initializeTimeline;
    
    window.initializeTimeline = function() {
        const svg = document.getElementById('timelineSvg');
        const container = document.getElementById('timelineContainer');
        const baseWidth = 3000; // Extra wide for better spacing
        const height = 600;
        
        // Calculate actual width based on zoom
        const width = baseWidth * currentZoom;
        
        // Set SVG dimensions
        svg.style.width = `${width}px`;
        svg.style.height = `${height}px`;
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        
        // Clear existing content
        svg.innerHTML = '';
        
        // Create main group
        const mainGroup = createSVGElement('g', {
            id: 'mainTimelineGroup'
        });
        
        // Draw eon backgrounds
        const totalTime = 4500; // 4.5 billion years
        const startX = 100;
        const endX = width - 100;
        const timelineWidth = endX - startX;
        
        // Draw eons with modern styling
        timelineData.eons.forEach(eon => {
            const eonStartX = startX + ((totalTime - eon.startMYA) / totalTime) * timelineWidth;
            const eonEndX = startX + ((totalTime - eon.endMYA) / totalTime) * timelineWidth;
            const eonWidth = eonEndX - eonStartX;
            
            // Eon background
            const rect = createSVGElement('rect', {
                x: eonStartX,
                y: 0,
                width: eonWidth,
                height: height,
                fill: eon.color,
                class: 'eon-bg'
            });
            mainGroup.appendChild(rect);
        });
        
        // Draw thin timeline axis
        const axisY = height / 2;
        const axis = createSVGElement('line', {
            class: 'timeline-axis',
            x1: startX,
            y1: axisY,
            x2: endX,
            y2: axisY
        });
        mainGroup.appendChild(axis);
        
        // Create time markers
        drawModernTimeMarkers(mainGroup, totalTime, timelineWidth, startX, axisY);
        
        // Draw events with smart positioning
        drawModernEvents(mainGroup, totalTime, timelineWidth, startX, axisY);
        
        // Draw eon labels at top
        drawEonLabels();
        
        svg.appendChild(mainGroup);
        
        // Enable smooth pan and zoom
        setTimeout(() => {
            enableSmoothInteractions(svg, mainGroup);
        }, 100);
        
        // Store all events globally for filtering
        if (window.allEvents === undefined) {
            window.allEvents = timelineData.events;
        }
        
        console.log(`Modern timeline initialized with ${timelineData.events.length} events`);
    };
}

// Draw modern time markers
function drawModernTimeMarkers(parent, totalTime, timelineWidth, startX, axisY) {
    const markerIntervals = [
        { interval: 1000, label: 'bya' },
        { interval: 500, label: 'mya' },
        { interval: 100, label: 'mya' }
    ];
    
    // Handle scale markers safely
    let scaleDiv = document.querySelector('.scale-markers');
    if (!scaleDiv) {
        const timeScale = document.getElementById('timeScale');
        if (timeScale && !timeScale.querySelector('.scale-markers')) {
            scaleDiv = document.createElement('div');
            scaleDiv.className = 'scale-markers';
            timeScale.appendChild(scaleDiv);
        }
    }
    
    if (scaleDiv) {
        scaleDiv.innerHTML = '';
    }
    
    // Draw major time markers
    for (let i = 0; i <= totalTime; i += 500) {
        const x = startX + ((totalTime - i) / totalTime) * timelineWidth;
        
        // Vertical tick
        const tick = createSVGElement('line', {
            x1: x,
            y1: axisY - 10,
            x2: x,
            y2: axisY + 10,
            stroke: 'rgba(255,255,255,0.3)',
            'stroke-width': 1
        });
        parent.appendChild(tick);
        
        // Add to bottom scale if exists
        if (scaleDiv && i % 1000 === 0) {
            const label = document.createElement('span');
            label.textContent = i === 0 ? 'Present' : `${i/1000} bya`;
            label.style.position = 'absolute';
            const parentWidth = parent.parentElement ? parent.parentElement.clientWidth : 3000;
            label.style.left = `${(x / parentWidth) * 100}%`;
            label.style.transform = 'translateX(-50%)';
            scaleDiv.appendChild(label);
        }
    }
}

// Smart event distribution to avoid overlaps
function drawModernEvents(parent, totalTime, timelineWidth, startX, axisY) {
    if (!timelineData || !timelineData.events) {
        console.warn('No timeline data available for drawing events');
        return;
    }
    
    const events = timelineData.events.sort((a, b) => b.dateMYA - a.dateMYA);
    const lanes = createEventLanes(events, timelineWidth, totalTime, startX);
    
    events.forEach((event, index) => {
        const eventX = startX + ((totalTime - event.dateMYA) / totalTime) * timelineWidth;
        const lane = lanes[index];
        const eventY = axisY + (lane * 80) * (lane % 2 === 0 ? -1 : 1);
        
        const group = createSVGElement('g', {
            class: 'event-marker',
            'data-event-id': index,
            style: `cursor: pointer;`
        });
        
        // Connection line
        const line = createSVGElement('line', {
            class: 'event-line',
            x1: eventX,
            y1: axisY,
            x2: eventX,
            y2: eventY
        });
        group.appendChild(line);
        
        // Event dot
        const circle = createSVGElement('circle', {
            class: 'event-circle',
            cx: eventX,
            cy: eventY,
            r: 6,
            fill: getEventColor(event.type),
            stroke: '#fff',
            'stroke-width': 2
        });
        group.appendChild(circle);
        
        // Hover label
        const label = createSVGElement('text', {
            class: 'event-label',
            x: eventX,
            y: eventY - 15,
            'text-anchor': 'middle'
        });
        label.textContent = truncateText(event.name, 20);
        group.appendChild(label);
        
        // Click handler
        group.addEventListener('click', () => showEventDetails(event));
        
        parent.appendChild(group);
    });
}

// Create lanes to avoid overlapping events
function createEventLanes(events, timelineWidth, totalTime, startX) {
    const lanes = [];
    const minDistance = 50; // Minimum pixel distance between events
    
    events.forEach((event, index) => {
        const eventX = startX + ((totalTime - event.dateMYA) / totalTime) * timelineWidth;
        let assignedLane = 0;
        
        // Find a lane where this event won't overlap
        for (let lane = 0; lane < 10; lane++) {
            let canUseLane = true;
            
            for (let i = 0; i < index; i++) {
                const otherEvent = events[i];
                const otherX = startX + ((totalTime - otherEvent.dateMYA) / totalTime) * timelineWidth;
                
                if (lanes[i] === lane && Math.abs(eventX - otherX) < minDistance) {
                    canUseLane = false;
                    break;
                }
            }
            
            if (canUseLane) {
                assignedLane = lane;
                break;
            }
        }
        
        lanes.push(assignedLane);
    });
    
    return lanes;
}

// Draw eon labels at the top
function drawEonLabels() {
    const eonLabelsDiv = document.getElementById('eonLabels');
    if (!eonLabelsDiv || !timelineData || !timelineData.eons) {
        console.warn('Eon labels div or timeline data not available');
        return;
    }
    
    eonLabelsDiv.innerHTML = '';
    eonLabelsDiv.style.display = 'flex';
    const totalTime = 4500;
    
    timelineData.eons.forEach(eon => {
        const startPercent = ((totalTime - eon.startMYA) / totalTime) * 100;
        const endPercent = ((totalTime - eon.endMYA) / totalTime) * 100;
        const width = endPercent - startPercent;
        
        const label = document.createElement('div');
        label.className = 'eon-label';
        label.style.left = `${startPercent}%`;
        label.style.width = `${width}%`;
        label.style.background = `linear-gradient(180deg, ${eon.color}40 0%, transparent 100%)`;
        label.textContent = eon.name;
        
        eonLabelsDiv.appendChild(label);
    });
}

// Enable smooth pan and zoom interactions
function enableSmoothInteractions(svg, mainGroup) {
    let isPanning = false;
    let startX = 0;
    let scrollLeft = 0;
    
    const container = document.getElementById('timelineContainer');
    if (!container || !container.parentElement) {
        console.warn('Timeline container not found');
        return;
    }
    
    container.addEventListener('mousedown', (e) => {
        isPanning = true;
        startX = e.pageX - container.offsetLeft;
        scrollLeft = container.parentElement.scrollLeft;
        container.style.cursor = 'grabbing';
    });
    
    container.addEventListener('mousemove', (e) => {
        if (!isPanning) return;
        e.preventDefault();
        const x = e.pageX - container.offsetLeft;
        const walk = (x - startX) * 2;
        container.parentElement.scrollLeft = scrollLeft - walk;
    });
    
    container.addEventListener('mouseup', () => {
        isPanning = false;
        container.style.cursor = 'grab';
    });
    
    container.addEventListener('mouseleave', () => {
        isPanning = false;
        container.style.cursor = 'grab';
    });
}

// Show modern event details panel
function showEventDetails(event) {
    let detailsPanel = document.querySelector('.event-details-modern');
    
    if (!detailsPanel) {
        detailsPanel = document.createElement('div');
        detailsPanel.className = 'event-details-modern';
        document.body.appendChild(detailsPanel);
    }
    
    const dateText = event.dateMYA < 1 
        ? `${(event.dateMYA * 1000).toFixed(0)} thousand years ago`
        : event.dateMYA < 1000 
        ? `${event.dateMYA} million years ago`
        : `${(event.dateMYA / 1000).toFixed(1)} billion years ago`;
    
    detailsPanel.innerHTML = `
        <button class="close-btn" onclick="this.parentElement.classList.remove('active')">&times;</button>
        <div class="event-details-header">
            <span class="event-type-indicator" style="background: ${getEventColor(event.type)}"></span>
            <h3 class="event-details-title">${event.name}</h3>
            <p class="event-details-date">${dateText} • ${event.eon}</p>
        </div>
        <p class="event-details-description">${event.description}</p>
        ${event.podcastEpisode ? `
            <a href="#${event.podcastEpisode}" class="podcast-link-modern">
                🎧 Listen to Episode
            </a>
        ` : ''}
    `;
    
    detailsPanel.classList.add('active');
}

// Auto-hide controls when scrolling
let scrollTimer;

document.addEventListener('DOMContentLoaded', () => {
    const floatingControls = document.querySelector('.floating-controls');
    
    if (floatingControls) {
        document.addEventListener('scroll', () => {
            floatingControls.classList.add('hide');
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => {
                floatingControls.classList.remove('hide');
            }, 1000);
        });
    }
});

// Helper functions
function getEventColor(type) {
    const colors = {
        catastrophe: '#ef4444',
        evolution: '#3b82f6',
        extinction: '#dc2626',
        geological: '#f59e0b',
        climate: '#8b5cf6',
        origin: '#10b981'
    };
    return colors[type] || '#64748b';
}

function truncateText(text, maxLength) {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

// Initialize modernization after timeline.js loads
// Wait a bit to ensure timeline.js has initialized first
setTimeout(() => {
    modernizeTimeline();
}, 50);