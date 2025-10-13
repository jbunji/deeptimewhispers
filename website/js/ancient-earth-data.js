// Geological period data for Ancient Earth

const PERIOD_DATA = {
    0: {
        name: "Present Day",
        description: "The modern world as we know it. Seven continents spread across the globe, with humans as the dominant species. Ice caps at both poles define our current ice age interglacial period.",
        climate: "Interglacial - warming trend",
        life: "Human civilization, diverse ecosystems",
        configuration: "Seven continents",
        events: []
    },
    4: {
        name: "Pliocene",
        description: "The world was warmer and sea levels higher. The Isthmus of Panama formed, connecting North and South America and reshaping ocean currents. Early human ancestors appeared in Africa.",
        climate: "Warm, gradually cooling",
        life: "Early hominids, modern mammals",
        configuration: "Near-modern continents",
        events: ["Formation of Panama Isthmus", "Human evolution begins"]
    },
    10: {
        name: "Late Miocene",
        description: "Grasslands expanded globally as the climate cooled and dried. The Himalayas continued rising as India pushed into Asia. Many modern mammal families evolved.",
        climate: "Cooling and drying",
        life: "Grassland fauna expansion",
        configuration: "Recognizable continents",
        events: ["Himalayan uplift", "C4 grassland expansion"]
    },
    20: {
        name: "Early Miocene",
        description: "A warm period known as the Miocene Climate Optimum. Antarctica was fully glaciated. Kelp forests and grasslands expanded, supporting new grazing mammals.",
        climate: "Miocene Climate Optimum",
        life: "Modern mammal families",
        configuration: "Continents near modern positions",
        events: ["Antarctic ice sheet forms"]
    },
    35: {
        name: "Late Eocene",
        description: "The transition from a greenhouse to icehouse world. Antarctica began to freeze as it separated from South America, creating the Antarctic Circumpolar Current.",
        climate: "Cooling from greenhouse",
        life: "Modern mammal orders appear",
        configuration: "India colliding with Asia",
        events: ["Antarctic glaciation begins", "Grande Coupure extinction"]
    },
    50: {
        name: "Early Eocene",
        description: "The Eocene Climate Optimum - one of the warmest periods in Earth's history. Palm trees grew in the Arctic, and early primates, horses, and whales evolved.",
        climate: "Extremely warm - no ice caps",
        life: "Early primates and whales",
        configuration: "Atlantic Ocean widening",
        events: ["Eocene Climate Optimum", "Early primate evolution"]
    },
    55: {
        name: "PETM",
        description: "The Paleocene-Eocene Thermal Maximum - a rapid global warming event. Temperatures rose 5-8°C in just thousands of years, causing major extinctions and evolution.",
        climate: "Extreme warming spike",
        life: "Major mammal diversification",
        configuration: "Continents dispersing",
        events: ["PETM warming event", "Mammal dispersal"]
    },
    66: {
        name: "K-T Boundary", 
        description: "The asteroid impact that ended the age of dinosaurs. A 10-kilometer asteroid struck the Yucatan Peninsula, causing global wildfires, tsunamis, and a nuclear winter.",
        climate: "Impact winter",
        life: "Mass extinction - 75% of species",
        configuration: "Continents spreading",
        events: ["Chicxulub impact", "Dinosaur extinction", "Deccan Traps volcanism"]
    },
    100: {
        name: "Late Cretaceous",
        description: "The peak of the dinosaur era. Sea levels were 200 meters higher than today, creating vast inland seas. Flowering plants diversified alongside dinosaurs.",
        climate: "Very warm - no polar ice",
        life: "Dinosaurs, early flowers",
        configuration: "Fragmenting continents",
        events: ["Flowering plant radiation", "Western Interior Seaway"]
    },
    150: {
        name: "Late Jurassic",
        description: "The golden age of dinosaurs. Pangaea continued to break apart, with the Atlantic Ocean opening. Giant sauropods like Brachiosaurus dominated the land.",
        climate: "Warm and humid",
        life: "Giant dinosaurs, early birds",
        configuration: "Pangaea breaking up",
        events: ["First birds (Archaeopteryx)", "Atlantic Ocean opening"]
    },
    200: {
        name: "Triassic-Jurassic",
        description: "The supercontinent Pangaea at its maximum extent. A mass extinction at the Triassic-Jurassic boundary cleared the way for dinosaur dominance.",
        climate: "Hot and dry interior",
        life: "Early dinosaurs rising",
        configuration: "Pangaea supercontinent",
        events: ["End-Triassic extinction", "Dinosaur radiation"]
    },
    250: {
        name: "Permian-Triassic",
        description: "The Great Dying - Earth's largest mass extinction. Massive volcanic eruptions in Siberia killed 95% of marine species and 70% of land vertebrates.",
        climate: "Extreme warming",
        life: "Greatest mass extinction",
        configuration: "Pangaea assembled",
        events: ["The Great Dying", "Siberian Traps volcanism"]
    },
    300: {
        name: "Late Carboniferous",
        description: "Vast coal swamps covered the tropical regions. Giant insects flew through forests of tree ferns. Ice sheets covered the southern supercontinent Gondwana.",
        climate: "Ice age in south",
        life: "Coal forests, giant insects",
        configuration: "Pangaea forming",
        events: ["Coal formation", "Largest insects ever"]
    },
    360: {
        name: "Late Devonian",
        description: "The Age of Fishes saw the first forests spread across land. Early tetrapods evolved from lobe-finned fish, taking the first steps onto land.",
        climate: "Warm, but cooling",
        life: "First forests and tetrapods",
        configuration: "Continents clustering",
        events: ["First tetrapods", "Late Devonian extinction"]
    },
    420: {
        name: "Late Silurian",
        description: "Life conquered the land as the first vascular plants evolved. The first millipedes and other arthropods followed plants onto land.",
        climate: "Warm, stable",
        life: "First land plants",
        configuration: "Small continents",
        events: ["Land plant evolution", "Arthropods on land"]
    },
    480: {
        name: "Early Ordovician",
        description: "The Great Ordovician Biodiversification Event saw marine life explode in diversity. Coral reefs appeared and the first primitive land plants evolved.",
        climate: "Very warm",
        life: "Marine diversification",
        configuration: "Continents dispersed",
        events: ["GOBE biodiversification", "First land plants"]
    },
    540: {
        name: "Cambrian Explosion",
        description: "The sudden appearance of complex animal life. In just 20 million years, most major animal body plans evolved, including the first eyes and shells.",
        climate: "Warm, no polar ice",
        life: "Explosion of animal phyla",
        configuration: "Continents at low latitudes",
        events: ["Cambrian Explosion", "First eyes evolve"]
    },
    600: {
        name: "Ediacaran",
        description: "The first complex multicellular life appeared after billions of years of only microbes. Strange, quilted organisms unlike anything alive today covered the seafloor.",
        climate: "Variable",
        life: "First complex life",
        configuration: "Continents unknown",
        events: ["Ediacaran fauna", "Multicellular evolution"]
    },
    750: {
        name: "Cryogenian",
        description: "Snowball Earth - the planet was frozen from poles to equator. Ice sheets reached sea level even at the equator, nearly ending life on Earth.",
        climate: "Global glaciation",
        life: "Survival in refugia",
        configuration: "Rodinia breaking up",
        events: ["Snowball Earth", "Rodinia breakup"]
    }
};

// Major extinction events for timeline markers
const MAJOR_EVENTS = [
    { time: 66, name: "K-T Mass Extinction", type: "extinction" },
    { time: 200, name: "Triassic-Jurassic Extinction", type: "extinction" },
    { time: 250, name: "The Great Dying", type: "extinction" },
    { time: 375, name: "Late Devonian Extinction", type: "extinction" },
    { time: 445, name: "Ordovician-Silurian Extinction", type: "extinction" },
    { time: 540, name: "Cambrian Explosion", type: "evolution" },
    { time: 750, name: "Snowball Earth", type: "climate" }
];

// Function to get period data for a given MYA
function getPeriodData(mya) {
    // Find the closest period
    const times = Object.keys(PERIOD_DATA).map(Number).sort((a, b) => a - b);
    
    for (let i = times.length - 1; i >= 0; i--) {
        if (mya >= times[i]) {
            return PERIOD_DATA[times[i]];
        }
    }
    
    return PERIOD_DATA[0]; // Default to present
}

// Export for use in main script
window.PERIOD_DATA = PERIOD_DATA;
window.MAJOR_EVENTS = MAJOR_EVENTS;
window.getPeriodData = getPeriodData;