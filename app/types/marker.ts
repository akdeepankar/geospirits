export interface MarkerData {
  id: string;
  coordinates: [number, number]; // [longitude, latitude]
  imageUrl: string;
  name: string;
  description: string;
  headerImageUrl: string;
  siteUrl: string;
  galleryImages?: string[];
}

export const SAMPLE_MARKERS: MarkerData[] = [
  {
    id: 'new-york',
    coordinates: [-74.006, 40.7128], // New York City, USA
    imageUrl: '/locations/new-york.svg',
    name: 'New York City',
    description: 'The city that never sleeps, New York is a global hub of culture, finance, and entertainment. From the iconic Statue of Liberty to the bright lights of Times Square, NYC offers endless experiences.',
    headerImageUrl: '/locations/new-york.svg',
    siteUrl: 'https://www.nycgo.com/'
  },
  {
    id: 'rio',
    coordinates: [-43.1729, -22.9068], // Rio de Janeiro, Brazil
    imageUrl: '/locations/rio.svg',
    name: 'Rio de Janeiro',
    description: 'Famous for its stunning beaches, vibrant carnival celebrations, and the iconic Christ the Redeemer statue, Rio de Janeiro is a city of natural beauty and cultural richness.',
    headerImageUrl: '/locations/rio.svg',
    siteUrl: 'https://visit.rio/'
  },
  {
    id: 'london',
    coordinates: [-0.1276, 51.5074], // London, UK
    imageUrl: '/locations/london.svg',
    name: 'London',
    description: 'A historic city blending ancient landmarks like the Tower of London with modern attractions. Experience world-class museums, royal palaces, and diverse neighborhoods.',
    headerImageUrl: '/locations/london.svg',
    siteUrl: 'https://visitlondon.com/'
  },
  {
    id: 'paris',
    coordinates: [2.3522, 48.8566], // Paris, France
    imageUrl: '/locations/paris.svg',
    name: 'Paris',
    description: 'The City of Light captivates with the Eiffel Tower, Louvre Museum, and charming cafés. Paris is synonymous with art, fashion, and romance.',
    headerImageUrl: '/locations/paris.svg',
    siteUrl: 'https://en.parisinfo.com/'
  },
  {
    id: 'cairo',
    coordinates: [31.2357, 30.0444], // Cairo, Egypt
    imageUrl: '/locations/cairo.svg',
    name: 'Cairo',
    description: 'Home to the ancient Pyramids of Giza and the Sphinx, Cairo is a gateway to Egypt\'s rich pharaonic history and vibrant modern culture.',
    headerImageUrl: '/locations/cairo.svg',
    siteUrl: 'https://www.egypt.travel/en/cities/cairo'
  },
  {
    id: 'cape-town',
    coordinates: [18.4241, -33.9249], // Cape Town, South Africa
    imageUrl: '/locations/cape-town.svg',
    name: 'Cape Town',
    description: 'Nestled between Table Mountain and the ocean, Cape Town offers breathtaking landscapes, world-class wineries, and a rich cultural heritage.',
    headerImageUrl: '/locations/cape-town.svg',
    siteUrl: 'https://www.capetown.travel/'
  },
  {
    id: 'dubai',
    coordinates: [55.2708, 25.2048], // Dubai, UAE
    imageUrl: '/locations/dubai.svg',
    name: 'Dubai',
    description: 'A futuristic city of superlatives, Dubai features the world\'s tallest building, luxury shopping, and innovative architecture in the heart of the desert.',
    headerImageUrl: '/locations/dubai.svg',
    siteUrl: 'https://www.visitdubai.com/'
  },
  {
    id: 'tokyo',
    coordinates: [139.6917, 35.6762], // Tokyo, Japan
    imageUrl: '/locations/tokyo.svg',
    name: 'Tokyo',
    description: 'A mesmerizing blend of ultra-modern technology and traditional culture, Tokyo offers everything from ancient temples to cutting-edge electronics districts.',
    headerImageUrl: '/locations/tokyo.svg',
    siteUrl: 'https://www.gotokyo.org/en/'
  },
  {
    id: 'sydney',
    coordinates: [151.2093, -33.8688], // Sydney, Australia
    imageUrl: '/locations/sydney.svg',
    name: 'Sydney',
    description: 'Famous for its Opera House and Harbour Bridge, Sydney combines stunning beaches, world-class dining, and a laid-back Australian lifestyle.',
    headerImageUrl: '/locations/sydney.svg',
    siteUrl: 'https://www.sydney.com/'
  },
  {
    id: 'machu-picchu',
    coordinates: [-72.5450, -13.1631], // Machu Picchu, Peru
    imageUrl: '/locations/machu-picchu.svg',
    name: 'Machu Picchu',
    description: 'This ancient Incan citadel set high in the Andes Mountains is one of the most iconic archaeological sites in the world, offering breathtaking views and mysterious history.',
    headerImageUrl: '/locations/machu-picchu.svg',
    siteUrl: 'https://www.machupicchu.gob.pe/'
  }
];
