// Deep Time Whispers Timeline - Modern Redesign
// A beautiful, interactive timeline that matches our cosmic aesthetic

class DeepTimeTimeline {
    constructor() {
        this.container = document.getElementById('timelineContainer');
        this.events = [];
        this.eons = [];
        this.currentView = 'overview'; // overview, focused, detail
        this.selectedEvent = null;
        this.filters = new Set(['all']);
        
        this.init();
    }

    async init() {
        try {
            await this.loadData();
            this.setupDOM();
            this.render();
            this.setupInteractions();
            this.animateIn();
        } catch (error) {
            console.error('Timeline initialization failed:', error);
            this.showError();
        }
    }

    async loadData() {
        const response = await fetch('data/timeline-events.json');
        const data = await response.json();
        this.processData(data);
    }

    processData(data) {
        this.eons = data.eons;
        
        // Flatten all events with their context
        data.eons.forEach(eon => {
            if (eon.keyEvents) {
                eon.keyEvents.forEach(event => {
                    this.events.push({
                        ...event,
                        eon: eon.name,
                        eonColor: eon.color
                    });
                });
            }
        });

        // Sort events by date
        this.events.sort((a, b) => b.dateMYA - a.dateMYA);
    }

    setupDOM() {
        this.container.innerHTML = `
            <div class="timeline-redesign">
                <!-- Eon Overview Bar -->
                <div class="eon-overview">
                    <div class="eon-track"></div>
                    <div class="current-position"></div>
                </div>

                <!-- Main Timeline Area -->
                <div class="timeline-main">
                    <div class="timeline-track">
                        <div class="timeline-content"></div>
                    </div>
                </div>

                <!-- Event Detail Panel -->
                <div class="event-panel" id="eventPanel">
                    <div class="event-panel-content"></div>
                </div>

                <!-- Time Navigator -->
                <div class="time-navigator">
                    <div class="time-scale">
                        <span class="time-start">4.5 billion years ago</span>
                        <div class="time-slider"></div>
                        <span class="time-end">Today</span>
                    </div>
                </div>
            </div>
        `;
    }

    render() {
        this.renderEonOverview();
        this.renderTimeline();
        this.renderNavigator();
    }

    renderEonOverview() {
        const track = this.container.querySelector('.eon-track');
        const totalTime = 4500; // million years
        
        this.eons.forEach(eon => {
            const width = ((eon.startMYA - eon.endMYA) / totalTime) * 100;
            const left = ((totalTime - eon.startMYA) / totalTime) * 100;
            
            const eonEl = document.createElement('div');
            eonEl.className = 'eon-segment';
            eonEl.style.width = `${width}%`;
            eonEl.style.left = `${left}%`;
            eonEl.style.background = this.getEonGradient(eon);
            eonEl.setAttribute('data-eon', eon.name);
            
            // Add label
            const label = document.createElement('span');
            label.className = 'eon-label';
            label.textContent = eon.name;
            eonEl.appendChild(label);
            
            track.appendChild(eonEl);
        });
    }

    renderTimeline() {
        const content = this.container.querySelector('.timeline-content');
        content.innerHTML = '';
        
        // Group events by time periods for better organization
        const periods = this.groupEventsByPeriod();
        
        periods.forEach((period, index) => {
            const periodEl = this.createPeriodElement(period, index);
            content.appendChild(periodEl);
        });
    }

    groupEventsByPeriod() {
        const periods = [];
        const periodSize = 500; // million years
        
        for (let i = 0; i <= 4500; i += periodSize) {
            const periodEvents = this.events.filter(e => 
                e.dateMYA >= i && e.dateMYA < i + periodSize
            );
            
            if (periodEvents.length > 0) {
                periods.push({
                    start: i,
                    end: i + periodSize,
                    events: periodEvents
                });
            }
        }
        
        return periods.reverse(); // Oldest first
    }

    createPeriodElement(period, index) {
        const periodEl = document.createElement('div');
        periodEl.className = 'timeline-period';
        periodEl.setAttribute('data-period', `${period.start}-${period.end}`);
        
        // Period header
        const header = document.createElement('div');
        header.className = 'period-header';
        header.innerHTML = `
            <h3>${this.formatTimeRange(period.start, period.end)}</h3>
            <span class="event-count">${period.events.length} events</span>
        `;
        periodEl.appendChild(header);
        
        // Events container
        const eventsContainer = document.createElement('div');
        eventsContainer.className = 'period-events';
        
        // Create event cards
        period.events.forEach((event, i) => {
            const card = this.createEventCard(event, i);
            eventsContainer.appendChild(card);
        });
        
        periodEl.appendChild(eventsContainer);
        
        return periodEl;
    }

    createEventCard(event, index) {
        const card = document.createElement('div');
        card.className = `event-card ${event.type} ${event.podcastEpisode ? 'has-episode' : ''}`;
        card.setAttribute('data-event-id', event.name);
        
        // Visual indicator
        const indicator = document.createElement('div');
        indicator.className = 'event-indicator';
        indicator.style.background = this.getEventColor(event.type);
        card.appendChild(indicator);
        
        // Content
        const content = document.createElement('div');
        content.className = 'event-content';
        content.innerHTML = `
            <h4>${event.name}</h4>
            <span class="event-date">${this.formatDate(event.dateMYA)}</span>
            <p>${this.truncateText(event.description, 100)}</p>
            ${event.podcastEpisode ? '<span class="podcast-badge">🎧 Episode Available</span>' : ''}
        `;
        card.appendChild(content);
        
        // Stagger animation delay
        card.style.animationDelay = `${index * 50}ms`;
        
        // Click handler
        card.addEventListener('click', () => this.showEventDetail(event));
        
        return card;
    }

    showEventDetail(event) {
        const panel = document.getElementById('eventPanel');
        const content = panel.querySelector('.event-panel-content');
        
        content.innerHTML = `
            <button class="close-panel" onclick="this.closest('.event-panel').classList.remove('active')">×</button>
            
            <div class="event-detail-header" style="border-left: 4px solid ${this.getEventColor(event.type)}">
                <span class="event-type-badge ${event.type}">${event.type}</span>
                <h2>${event.name}</h2>
                <div class="event-meta">
                    <span class="event-date">${this.formatDate(event.dateMYA)}</span>
                    <span class="event-eon">${event.eon} Eon</span>
                </div>
            </div>
            
            <div class="event-timeline-position">
                <div class="position-track">
                    <div class="position-marker" style="left: ${this.getTimelinePosition(event.dateMYA)}%"></div>
                </div>
                <div class="position-labels">
                    <span>4.5 billion years ago</span>
                    <span>Today</span>
                </div>
            </div>
            
            <div class="event-description">
                <p>${event.description}</p>
            </div>
            
            ${this.getEventContext(event)}
            
            <div class="event-actions">
                ${event.podcastEpisode ? `
                    <a href="#${event.podcastEpisode}" class="action-button primary">
                        <span>🎧</span> Listen to Episode
                    </a>
                ` : ''}
                <button class="action-button" onclick="shareEvent('${event.name}')">
                    <span>🔗</span> Share
                </button>
            </div>
        `;
        
        panel.classList.add('active');
    }

    getEventContext(event) {
        // Add contextual information based on event type
        const contexts = {
            'extinction': 'This extinction event dramatically reshaped Earth\'s biosphere.',
            'evolution': 'A major evolutionary milestone that changed life on Earth.',
            'catastrophe': 'A catastrophic event that left permanent marks on our planet.',
            'origin': 'A fundamental beginning that set the stage for future developments.',
            'climate': 'A significant climate shift that transformed global conditions.',
            'geological': 'A geological transformation that reshaped Earth\'s surface.'
        };

        return `
            <div class="event-context">
                <h3>Historical Significance</h3>
                <p>${contexts[event.type] || 'A significant moment in Earth\'s history.'}</p>
            </div>
        `;
    }

    renderNavigator() {
        // Time slider for navigation
        const slider = this.container.querySelector('.time-slider');
        
        // Add markers for major events
        this.events.filter(e => e.podcastEpisode).forEach(event => {
            const marker = document.createElement('div');
            marker.className = 'time-marker';
            marker.style.left = `${this.getTimelinePosition(event.dateMYA)}%`;
            marker.title = event.name;
            slider.appendChild(marker);
        });
    }

    setupInteractions() {
        // Filter interactions
        document.querySelectorAll('.filter-pill').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.toggleFilter(filter);
            });
        });

        // Search functionality
        const searchInput = document.getElementById('eventSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchEvents(e.target.value);
            });
        }

        // Smooth scrolling
        this.setupSmoothScroll();
    }

    toggleFilter(filter) {
        if (filter === 'all') {
            this.filters.clear();
            this.filters.add('all');
        } else {
            this.filters.delete('all');
            if (this.filters.has(filter)) {
                this.filters.delete(filter);
            } else {
                this.filters.add(filter);
            }
            if (this.filters.size === 0) {
                this.filters.add('all');
            }
        }
        
        this.applyFilters();
    }

    applyFilters() {
        const cards = this.container.querySelectorAll('.event-card');
        
        cards.forEach(card => {
            const shouldShow = this.filters.has('all') || 
                              Array.from(this.filters).some(f => card.classList.contains(f));
            
            card.style.display = shouldShow ? 'flex' : 'none';
        });
    }

    searchEvents(query) {
        const cards = this.container.querySelectorAll('.event-card');
        const searchTerm = query.toLowerCase();
        
        cards.forEach(card => {
            const text = card.textContent.toLowerCase();
            const matches = text.includes(searchTerm);
            
            if (searchTerm === '') {
                card.style.display = 'flex';
                card.classList.remove('search-match');
            } else {
                card.style.display = matches ? 'flex' : 'none';
                card.classList.toggle('search-match', matches);
            }
        });
    }

    setupSmoothScroll() {
        const track = this.container.querySelector('.timeline-track');
        if (!track) return;

        let isScrolling = false;
        let startX;
        let scrollLeft;

        track.addEventListener('mousedown', (e) => {
            isScrolling = true;
            startX = e.pageX - track.offsetLeft;
            scrollLeft = track.scrollLeft;
            track.style.cursor = 'grabbing';
        });

        track.addEventListener('mousemove', (e) => {
            if (!isScrolling) return;
            e.preventDefault();
            const x = e.pageX - track.offsetLeft;
            const walk = (x - startX) * 2;
            track.scrollLeft = scrollLeft - walk;
        });

        track.addEventListener('mouseup', () => {
            isScrolling = false;
            track.style.cursor = 'grab';
        });

        track.addEventListener('mouseleave', () => {
            isScrolling = false;
            track.style.cursor = 'grab';
        });
    }

    animateIn() {
        // Fade in the timeline elements
        setTimeout(() => {
            this.container.querySelector('.timeline-redesign').classList.add('loaded');
        }, 100);
    }

    // Utility methods
    getEonGradient(eon) {
        const gradients = {
            'Hadean': 'linear-gradient(135deg, #8B0000, #CD5C5C)',
            'Archean': 'linear-gradient(135deg, #8B008B, #DA70D6)',
            'Proterozoic': 'linear-gradient(135deg, #FF1493, #FFB6C1)',
            'Phanerozoic': 'linear-gradient(135deg, #2E7D32, #81C784)'
        };
        return gradients[eon.name] || 'linear-gradient(135deg, #333, #666)';
    }

    getEventColor(type) {
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

    getTimelinePosition(dateMYA) {
        return ((4500 - dateMYA) / 4500) * 100;
    }

    formatDate(mya) {
        if (mya < 1) {
            return `${Math.round(mya * 1000)} thousand years ago`;
        } else if (mya < 1000) {
            return `${mya} million years ago`;
        } else {
            return `${(mya / 1000).toFixed(1)} billion years ago`;
        }
    }

    formatTimeRange(start, end) {
        if (end >= 4500) {
            return `${(start / 1000).toFixed(1)} - ${(end / 1000).toFixed(1)} billion years ago`;
        } else if (start >= 1000) {
            return `${(start / 1000).toFixed(1)} - ${(end / 1000).toFixed(1)} billion years ago`;
        } else {
            return `${start} - ${end} million years ago`;
        }
    }

    truncateText(text, length) {
        return text.length > length ? text.substring(0, length) + '...' : text;
    }

    showError() {
        this.container.innerHTML = `
            <div class="timeline-error">
                <p>Failed to load timeline data.</p>
                <button onclick="location.reload()">Retry</button>
            </div>
        `;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.deepTimeTimeline = new DeepTimeTimeline();
});

// Global share function
window.shareEvent = function(eventName) {
    const shareText = `Check out this moment in Earth's history: ${eventName}`;
    
    if (navigator.share) {
        navigator.share({
            title: eventName,
            text: shareText,
            url: window.location.href
        });
    } else {
        navigator.clipboard.writeText(shareText + ' ' + window.location.href)
            .then(() => {
                alert('Link copied to clipboard!');
            });
    }
};