// Deep Time Whispers - Vertical Timeline
// A clean, scrollable vertical timeline showing ALL events

class VerticalTimeline {
    constructor() {
        this.container = document.getElementById('timelineContainer');
        this.allEvents = [];
        this.filteredEvents = [];
        this.activeFilters = new Set(['all']);
        this.currentOutsideClickHandler = null;
        
        this.init();
    }

    async init() {
        try {
            await this.loadData();
            this.setupDOM();
            this.renderTimeline();
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
        this.extractAllEvents(data);
    }

    extractAllEvents(data) {
        console.log('Starting event extraction from data:', data);
        
        // Extract events from each eon
        data.eons.forEach(eon => {
            console.log(`Processing eon: ${eon.name}`);
            
            // Get events directly in eon
            if (eon.keyEvents && Array.isArray(eon.keyEvents)) {
                console.log(`Found ${eon.keyEvents.length} events in ${eon.name} eon`);
                eon.keyEvents.forEach(event => {
                    this.allEvents.push({
                        ...event,
                        eon: eon.name,
                        eonColor: eon.color,
                        era: null,
                        period: null
                    });
                });
            }

            // Get events from eras (for Phanerozoic)
            if (eon.eras && Array.isArray(eon.eras)) {
                console.log(`Found ${eon.eras.length} eras in ${eon.name}`);
                eon.eras.forEach(era => {
                    console.log(`Processing era: ${era.name}`);
                    
                    // Get events directly in era
                    if (era.keyEvents && Array.isArray(era.keyEvents)) {
                        console.log(`Found ${era.keyEvents.length} events in ${era.name} era`);
                        era.keyEvents.forEach(event => {
                            this.allEvents.push({
                                ...event,
                                eon: eon.name,
                                eonColor: eon.color,
                                era: era.name,
                                period: null
                            });
                        });
                    }

                    // Get events from periods
                    if (era.periods && Array.isArray(era.periods)) {
                        console.log(`Found ${era.periods.length} periods in ${era.name}`);
                        era.periods.forEach(period => {
                            console.log(`Processing period: ${period.name}`);
                            if (period.keyEvents && Array.isArray(period.keyEvents)) {
                                console.log(`Found ${period.keyEvents.length} events in ${period.name} period`);
                                period.keyEvents.forEach(event => {
                                    this.allEvents.push({
                                        ...event,
                                        eon: eon.name,
                                        eonColor: eon.color,
                                        era: era.name,
                                        period: period.name
                                    });
                                });
                            }
                        });
                    }
                });
            }
        });

        // Sort all events by date (oldest first)
        this.allEvents.sort((a, b) => b.dateMYA - a.dateMYA);
        this.filteredEvents = [...this.allEvents];
        
        console.log(`Successfully extracted ${this.allEvents.length} total events!`);
        console.log('Sample events:', this.allEvents.slice(0, 5));
    }

    setupDOM() {
        this.container.innerHTML = `
            <div class="vertical-timeline">
                <!-- Sticky Header with Filters -->
                <div class="timeline-header">
                    <h1>Journey Through Deep Time</h1>
                    <p class="timeline-subtitle">${this.allEvents.length} moments across 4.5 billion years</p>
                    
                    <div class="timeline-controls">
                        <input type="text" id="eventSearch" placeholder="Search events..." class="search-input">
                        <div class="filter-buttons">
                            <button class="filter-btn active" data-filter="all">All</button>
                            <button class="filter-btn" data-filter="catastrophe">Catastrophes</button>
                            <button class="filter-btn" data-filter="evolution">Evolution</button>
                            <button class="filter-btn" data-filter="extinction">Extinctions</button>
                            <button class="filter-btn" data-filter="origin">Origins</button>
                            <button class="filter-btn" data-filter="climate">Climate</button>
                            <button class="filter-btn" data-filter="geological">Geological</button>
                        </div>
                    </div>
                </div>

                <!-- Timeline Track -->
                <div class="timeline-track-vertical">
                    <div class="timeline-line"></div>
                    <div class="timeline-events" id="timelineEvents"></div>
                </div>

                <!-- Floating Time Indicator -->
                <div class="time-indicator" id="timeIndicator">
                    <span class="time-value">4.5 billion years ago</span>
                    <div class="time-progress"></div>
                </div>
            </div>

            <!-- Event Detail Panel -->
            <div class="event-detail-panel" id="eventDetailPanel"></div>
        `;
    }

    renderTimeline() {
        const eventsContainer = document.getElementById('timelineEvents');
        eventsContainer.innerHTML = '';

        let lastEon = null;

        this.filteredEvents.forEach((event, index) => {
            // Add eon divider if entering new eon
            if (event.eon !== lastEon) {
                const divider = this.createEonDivider(event.eon, event.eonColor);
                eventsContainer.appendChild(divider);
                lastEon = event.eon;
            }

            // Create event element
            const eventEl = this.createEventElement(event, index);
            eventsContainer.appendChild(eventEl);
        });
    }

    createEonDivider(eonName, eonColor) {
        const divider = document.createElement('div');
        divider.className = 'eon-divider';
        divider.style.background = `linear-gradient(90deg, transparent, ${eonColor}40, transparent)`;
        divider.innerHTML = `<span class="eon-name">${eonName} Eon</span>`;
        return divider;
    }

    createEventElement(event, index) {
        const eventEl = document.createElement('div');
        eventEl.className = `timeline-event ${event.type} ${index % 2 === 0 ? 'left' : 'right'}`;
        eventEl.style.animationDelay = `${Math.min(index * 50, 2000)}ms`;

        // Create timeline connector
        const connector = document.createElement('div');
        connector.className = 'event-connector';
        connector.style.background = this.getEventColor(event.type);
        eventEl.appendChild(connector);

        // Create event card
        const card = document.createElement('div');
        card.className = 'event-card-vertical';
        
        // Time marker
        const timeMarker = document.createElement('div');
        timeMarker.className = 'time-marker';
        timeMarker.innerHTML = `
            <span class="time-value">${this.formatDate(event.dateMYA)}</span>
            ${event.period ? `<span class="time-period">${event.period}</span>` : 
              event.era ? `<span class="time-period">${event.era}</span>` : ''}
        `;
        card.appendChild(timeMarker);

        // Event content
        const content = document.createElement('div');
        content.className = 'event-content';
        content.innerHTML = `
            <h3>${event.name}</h3>
            <p>${event.description}</p>
            <div class="event-meta">
                <span class="event-type ${event.type}">${event.type}</span>
                ${event.podcastEpisode ? '<span class="podcast-indicator">🎧 Episode</span>' : ''}
            </div>
        `;
        card.appendChild(content);

        // Click handler
        card.addEventListener('click', () => this.showEventDetail(event));

        eventEl.appendChild(card);
        return eventEl;
    }

    showEventDetail(event) {
        const panel = document.getElementById('eventDetailPanel');
        
        panel.innerHTML = `
            <button class="close-detail" onclick="this.parentElement.classList.remove('active')">×</button>
            
            <div class="detail-header" style="border-left: 4px solid ${this.getEventColor(event.type)}">
                <span class="detail-type ${event.type}">${event.type}</span>
                <h2>${event.name}</h2>
                <div class="detail-meta">
                    <span>${this.formatDate(event.dateMYA)}</span>
                    <span>•</span>
                    <span>${event.eon} Eon</span>
                    ${event.era ? `<span>•</span><span>${event.era} Era</span>` : ''}
                    ${event.period ? `<span>•</span><span>${event.period} Period</span>` : ''}
                </div>
            </div>
            
            <div class="detail-description">
                <p>${event.description}</p>
            </div>
            
            <div class="detail-context">
                <h3>Historical Context</h3>
                <p>${this.getEventContext(event)}</p>
            </div>
            
            ${this.getEnvironmentalConditions(event)}
            
            ${this.getWhatLivedHere(event)}
            
            ${this.getTimeComparison(event)}
            
            <div class="detail-actions">
                ${event.podcastEpisode ? `
                    <a href="#${event.podcastEpisode}" class="btn-primary">
                        🎧 Listen to Episode
                    </a>
                ` : ''}
                <button class="btn-secondary" onclick="shareEvent('${event.name}')">
                    Share This Event
                </button>
                <button class="btn-secondary" onclick="generateCitation('${event.name}', '${event.dateMYA}')">
                    📋 Cite This Event
                </button>
            </div>
        `;
        
        panel.classList.add('active');
        
        // Remove any existing click handlers first
        this.removeOutsideClickHandler();
        
        // Add click outside to close functionality
        this.currentOutsideClickHandler = (e) => {
            // Don't close if clicking on an event card or inside the panel
            if (panel.contains(e.target) || e.target.closest('.event-card-vertical')) {
                return;
            }
            
            if (panel.classList.contains('active')) {
                panel.classList.remove('active');
                this.removeOutsideClickHandler();
            }
        };
        
        // Add the handler after a small delay to prevent immediate closing
        setTimeout(() => {
            document.addEventListener('click', this.currentOutsideClickHandler);
        }, 100);
    }

    removeOutsideClickHandler() {
        if (this.currentOutsideClickHandler) {
            document.removeEventListener('click', this.currentOutsideClickHandler);
            this.currentOutsideClickHandler = null;
        }
    }

    getEventContext(event) {
        // Specific contexts for well-known events
        const specificContexts = {
            'Formation of Earth': `The birth of our planet began 4.5 billion years ago through accretion - countless planetesimals and asteroid-sized objects colliding and sticking together in the early solar nebula. This process generated so much heat that Earth was initially molten. The first 500 million years, known as the Hadean Eon, were characterized by hellish conditions with temperatures exceeding 2200°F (1200°C), no solid surface, and constant bombardment from space debris.`,
            
            'The Birth of the Moon': `Around 4.4 billion years ago, a Mars-sized object called Theia collided with the early Earth at a glancing angle. This catastrophic impact ejected massive amounts of material into orbit, which eventually coalesced to form the Moon. This collision also tilted Earth's axis to 23.5 degrees, giving us our seasons, and the Moon's gravitational pull created tides that may have been crucial for early life development.`,
            
            'Great Oxidation Event': `This was Earth's first major environmental disaster, caused by success. Cyanobacteria had evolved photosynthesis and began pumping oxygen into the atmosphere around 2.4 billion years ago. But oxygen was toxic to almost all existing life forms - it was essentially a poisonous waste product. This led to the first mass extinction, but also paved the way for complex life that could harness oxygen's energy.`,
            
            'Snowball Earth': `Around 720-630 million years ago, Earth experienced its most extreme ice age. Ice covered the planet from poles to equator, with glaciers possibly reaching all the way to sea level even at the tropics. Ocean temperatures dropped to -58°F (-50°C). Life survived in refugia like hot springs and beneath thick ice. When volcanic CO₂ finally broke the ice age, the rapid warming may have triggered the evolution of complex multicellular life.`,
            
            'Cambrian Explosion': `In just 20-25 million years (a blink of an eye in geological time), most major animal groups appeared in the fossil record. This wasn't just evolution - it was evolution with a turbo boost. Hard shells, eyes, predator-prey relationships, complex ecosystems, and sophisticated body plans all emerged. The Burgess Shale preserves this moment when life experimented with body designs that seem alien to us today.`,
            
            'The Great Dying': `The end-Permian extinction was the closest life ever came to complete annihilation. Massive volcanic eruptions in Siberia released enormous amounts of CO₂, methane, and toxic gases, causing global warming, ocean acidification, and widespread toxic conditions. 96% of marine species and 70% of terrestrial species vanished. It took 10 million years for life to fully recover.`,
            
            'Chicxulub Impact': `A 6-mile-wide asteroid traveling at 45,000 mph slammed into the Yucatan Peninsula. The impact released energy equivalent to billions of atomic bombs, causing global fires, tsunamis hundreds of feet high, and a nuclear winter that lasted years. This event ended 165 million years of dinosaur dominance and paved the way for mammals - including eventually us.`
        };

        if (specificContexts[event.name]) {
            return specificContexts[event.name];
        }

        // Enhanced generic contexts with environmental details
        const contexts = {
            'catastrophe': `This catastrophic event fundamentally altered Earth's systems. Such events, while devastating in the short term, often create opportunities for life to evolve in new directions. They act as reset buttons, clearing ecological niches and forcing surviving species to adapt and diversify. Understanding these events helps us appreciate both life's fragility and its remarkable resilience.`,
            
            'evolution': `This evolutionary milestone represents a breakthrough that opened entirely new ways of life on Earth. Evolution doesn't progress in a straight line - instead, key innovations like this create opportunities that cascade through ecosystems. The effects rippled forward through millions of years, ultimately influencing the evolutionary path that led to all modern life, including us.`,
            
            'extinction': `Mass extinctions are among the most important events in Earth's history. While devastating, they clear ecological space for surviving groups to diversify and fill empty niches. Each major extinction event has been followed by rapid evolutionary radiations. This pattern of destruction and renewal has shaped the entire trajectory of life on Earth.`,
            
            'origin': `This represents a fundamental threshold in Earth's development - a moment when entirely new processes or forms of life began. Such origins rarely happen in isolation; they typically result from millions of years of gradual change suddenly reaching a tipping point. Understanding these moments helps us appreciate how today's familiar world emerged from radically different ancient conditions.`,
            
            'climate': `Climate changes in deep time dwarf anything in human experience. This event represents a shift that transformed global temperature patterns, ocean circulation, and atmospheric composition. Such changes force life to adapt, migrate, or face extinction. They reveal how interconnected Earth's systems are and how life both responds to and influences climate on geological timescales.`,
            
            'geological': `Geological processes operate on timescales that challenge human imagination. This transformation reshaped continents, altered ocean basins, and changed the very ground beneath ancient life's feet. Such changes affect everything from local weather patterns to global climate, creating new habitats while destroying others. They remind us that Earth itself is dynamic and ever-changing.`
        };

        return contexts[event.type] || `This significant moment in Earth's 4.5 billion year history represents a key transition point that influenced the development of our planet and the life it harbors. Each event in deep time connects to countless others, creating the complex web of cause and effect that ultimately led to the world we know today.`;
    }

    getEnvironmentalConditions(event) {
        const conditions = {
            'Formation of Earth': {
                temp: 'Surface temperatures over 2200°F (1200°C)',
                atmosphere: 'No atmosphere initially, then toxic hydrogen and methane',
                landscape: 'Molten surface with magma oceans',
                climate: 'Hellish conditions with constant asteroid impacts'
            },
            'The Birth of the Moon': {
                temp: 'Extreme heat from impact, gradual cooling',
                atmosphere: 'Atmosphere blown away by impact, slowly reformed',
                landscape: 'Massive debris disk, tidal forces reshaping Earth',
                climate: 'Chaotic conditions as Earth-Moon system stabilized'
            },
            'Great Oxidation Event': {
                temp: 'Moderate temperatures, 60-75°F (15-25°C) average',
                atmosphere: 'Rising oxygen levels (toxic to most life)',
                landscape: 'Vast shallow seas, iron formations turning red',
                climate: 'First ice age triggered by oxygen removing methane'
            },
            'Cambrian Explosion': {
                temp: 'Warm greenhouse conditions, 70°F (21°C) average',
                atmosphere: 'Low oxygen (13%) but rising',
                landscape: 'Shallow tropical seas, no land life yet',
                climate: 'Stable, warm conditions ideal for marine life'
            }
        };

        const condition = conditions[event.name];
        if (condition) {
            return `
                <div class="environmental-conditions">
                    <h3>🌍 Environmental Conditions</h3>
                    <div class="conditions-grid">
                        <div class="condition-item">
                            <strong>🌡️ Temperature:</strong> ${condition.temp}
                        </div>
                        <div class="condition-item">
                            <strong>🌬️ Atmosphere:</strong> ${condition.atmosphere}
                        </div>
                        <div class="condition-item">
                            <strong>🏔️ Landscape:</strong> ${condition.landscape}
                        </div>
                        <div class="condition-item">
                            <strong>🌤️ Climate:</strong> ${condition.climate}
                        </div>
                    </div>
                </div>
            `;
        }
        return '';
    }

    getWhatLivedHere(event) {
        const life = {
            'Formation of Earth': 'No life - conditions were too extreme for any known form of life.',
            'First Life': 'Simple prokaryotic cells - the first self-replicating organisms, likely similar to modern archaea.',
            'Great Oxidation Event': 'Cyanobacteria (blue-green algae) dominated, producing oxygen that was killing most other life forms.',
            'Cambrian Explosion': 'Trilobites, early arthropods, primitive mollusks, and the first animals with eyes and hard shells.',
            'First Dinosaurs': 'Small dinosaurs alongside primitive mammals, early crocodiles, and diverse plant life including early conifers.',
            'Chicxulub Impact': 'Large dinosaurs, early mammals, flowering plants, and marine reptiles - most would not survive the impact.',
            'Mammal Radiation': 'Rapid diversification of mammals into new ecological niches left empty by dinosaur extinction.'
        };

        const lifeInfo = life[event.name];
        if (lifeInfo) {
            return `
                <div class="what-lived-here">
                    <h3>🦕 What Lived Here?</h3>
                    <p>${lifeInfo}</p>
                </div>
            `;
        }
        return '';
    }

    getTimeComparison(event) {
        // Add relatable time comparisons
        const comparisons = {
            'Formation of Earth': 'If Earth\'s history was compressed into one year, this would be January 1st at midnight.',
            'Cambrian Explosion': 'This 25 million year "explosion" is like 2 days in Earth\'s year-long history.',
            'Chicxulub Impact': 'This happened on December 26th in Earth\'s year - just 5 days before humans appear.',
            'Human Civilization': 'Agriculture began in the last 2 minutes of December 31st in Earth\'s year.'
        };

        const comparison = comparisons[event.name];
        if (comparison) {
            return `
                <div class="time-comparison">
                    <h3>⏰ Time Perspective</h3>
                    <p>${comparison}</p>
                </div>
            `;
        }
        return '';
    }

    setupInteractions() {
        // Search functionality
        const searchInput = document.getElementById('eventSearch');
        searchInput.addEventListener('input', (e) => this.filterEvents(e.target.value));

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => this.toggleFilter(btn.dataset.filter));
        });

        // Scroll indicator
        this.setupScrollIndicator();
    }

    filterEvents(searchTerm) {
        const term = searchTerm.toLowerCase();
        
        this.filteredEvents = this.allEvents.filter(event => {
            // Check search term
            const matchesSearch = !term || 
                event.name.toLowerCase().includes(term) ||
                event.description.toLowerCase().includes(term) ||
                (event.era && event.era.toLowerCase().includes(term)) ||
                (event.period && event.period.toLowerCase().includes(term));

            // Check filters
            const matchesFilter = this.activeFilters.has('all') || 
                this.activeFilters.has(event.type);

            return matchesSearch && matchesFilter;
        });

        this.renderTimeline();
        this.updateEventCount();
    }

    toggleFilter(filter) {
        const btn = document.querySelector(`[data-filter="${filter}"]`);
        
        if (filter === 'all') {
            this.activeFilters.clear();
            this.activeFilters.add('all');
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        } else {
            this.activeFilters.delete('all');
            document.querySelector('[data-filter="all"]').classList.remove('active');
            
            if (this.activeFilters.has(filter)) {
                this.activeFilters.delete(filter);
                btn.classList.remove('active');
            } else {
                this.activeFilters.add(filter);
                btn.classList.add('active');
            }
            
            if (this.activeFilters.size === 0) {
                this.activeFilters.add('all');
                document.querySelector('[data-filter="all"]').classList.add('active');
            }
        }
        
        this.filterEvents(document.getElementById('eventSearch').value);
    }

    setupScrollIndicator() {
        const indicator = document.getElementById('timeIndicator');
        const track = document.querySelector('.timeline-track-vertical');
        
        track.addEventListener('scroll', () => {
            const scrollPercent = track.scrollTop / (track.scrollHeight - track.clientHeight);
            const currentTime = 4500 * (1 - scrollPercent);
            
            indicator.querySelector('.time-value').textContent = this.formatDate(currentTime);
            indicator.querySelector('.time-progress').style.width = `${scrollPercent * 100}%`;
        });
    }

    updateEventCount() {
        const subtitle = document.querySelector('.timeline-subtitle');
        if (this.filteredEvents.length === this.allEvents.length) {
            subtitle.textContent = `${this.allEvents.length} moments across 4.5 billion years`;
        } else {
            subtitle.textContent = `Showing ${this.filteredEvents.length} of ${this.allEvents.length} events`;
        }
    }

    animateIn() {
        setTimeout(() => {
            document.querySelector('.vertical-timeline').classList.add('loaded');
        }, 100);
    }

    // Utility methods
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

    formatDate(mya) {
        if (mya < 0.001) {
            return 'Present day';
        } else if (mya < 1) {
            return `${Math.round(mya * 1000)} thousand years ago`;
        } else if (mya < 1000) {
            return `${Math.round(mya)} million years ago`;
        } else {
            return `${(mya / 1000).toFixed(1)} billion years ago`;
        }
    }

    showError() {
        this.container.innerHTML = `
            <div class="timeline-error">
                <h2>Unable to load timeline</h2>
                <p>Please check your connection and try again.</p>
                <button onclick="location.reload()">Reload</button>
            </div>
        `;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.verticalTimeline = new VerticalTimeline();
});

// Share functionality
window.shareEvent = function(eventName) {
    const text = `Check out "${eventName}" from Earth's deep history on Deep Time Whispers`;
    
    if (navigator.share) {
        navigator.share({ title: eventName, text: text, url: window.location.href });
    } else {
        navigator.clipboard.writeText(text + ' - ' + window.location.href);
        alert('Event link copied to clipboard!');
    }
};

// Citation generator
window.generateCitation = function(eventName, dateMYA) {
    const today = new Date();
    const citation = `Deep Time Whispers. "${eventName}" (${dateMYA} million years ago). Deep Time Timeline. Retrieved ${today.toLocaleDateString()}, from ${window.location.href}`;
    
    navigator.clipboard.writeText(citation).then(() => {
        alert('Citation copied to clipboard!');
    }).catch(() => {
        prompt('Copy this citation:', citation);
    });
};