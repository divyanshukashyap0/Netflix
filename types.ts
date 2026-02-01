export interface Content {
  id: string; // Firestore Doc ID
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  youtubeId: string;
  type: 'movie' | 'tv';
  genres: string[];
  release_date: string;
  vote_average: number;
  featured?: boolean;
  createdAt: string;
  cast?: string[];
  tags?: string[];
}

export interface Section {
  id: string;
  title: string;
  order: number;
  type: 'trending' | 'genre' | 'curated' | 'originals';
  genreFilter?: string; // If type is genre
  contentIds?: string[]; // If type is curated
  enabled: boolean;
  scope?: 'home' | 'tv' | 'movie' | 'new'; // Route where section appears
}

export interface SiteSettings {
  siteName: string;
  heroContentId?: string; // ID of the content to show in Hero
  maintenanceMode: boolean;
  contactEmail?: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  razorpayPlanId: string;
  features: string[];
  active: boolean;
  quality: 'Good' | 'Better' | 'Best';
  resolution: '720p' | '1080p' | '4K+HDR';
}

export interface Subscription {
  id: string;
  uid: string;
  planId: string;
  razorpaySubscriptionId: string;
  status: 'active' | 'created' | 'authenticated' | 'expired' | 'halted' | 'cancelled';
  currentPeriodStart: number;
  currentPeriodEnd: number;
}

// Keeping existing types for compatibility during migration, extending where necessary
export interface Movie extends Content { }

export interface User {
  uid: string;
  email: string;
  razorpayCustomerId?: string;
  plan: string; // Name of the plan for UI display
  subscriptionStatus?: 'active' | 'inactive' | 'canceled';
  role?: 'user' | 'admin';
}

export interface Profile {
  id: string;
  name: string;
  avatarUrl: string;
  isKids: boolean;
  myList: string[]; // Changed to string array for Firestore IDs
}

export enum AppRoute {
  LANDING = '/',
  BROWSE = '/browse',
  LOGIN = '/login',
  SIGNUP = '/signup',
  PROFILES = '/profiles',
  SEARCH = '/search',
  ACCOUNT = '/account',
  PLANS = '/plans',
  ADMIN = '/admin',
  TV_SHOWS = '/tv-shows',
  MOVIES = '/movies',
  NEW_POPULAR = '/new-popular',
  MY_LIST = '/my-list',
  // Footer Pages
  FAQ = '/faq',
  HELP = '/help',
  MEDIA = '/media',
  INVESTORS = '/investors',
  JOBS = '/jobs',
  WAYS_TO_WATCH = '/ways-to-watch',
  TERMS = '/terms',
  PRIVACY = '/privacy',
  COOKIES = '/cookies',
  CORPORATE = '/corporate',
  CONTACT = '/contact',
  SPEED_TEST = '/speed-test',
  LEGAL = '/legal',
  ORIGINALS = '/originals'
}

export interface TMDBResponse {
  results: Movie[];
}
