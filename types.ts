import React from 'react';
import { Language } from './i18n/translator';

export interface HairstyleVariation {
  id: string;
  name: string;
  promptModifier: string;
  previewUrl: string;
}

export interface Hairstyle {
  id: string;
  name: string;
  previewUrl: string;
  prompt: string;
  variations?: HairstyleVariation[];
}

export interface UserImage {
  base64: string;
  mimeType: string;
}

export interface CustomHairstyle {
  id: string;
  name: string;
  frontView: UserImage;
  backView?: UserImage;
  leftView?: UserImage;
  rightView?: UserImage;
  topView?: UserImage;
}

export interface GeneratedImage {
  src: string;
  prompt: string;
  hairstyleId: string;
  hairstyleName: string;
  referenceStyleId?: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string; // Optional description
  duration: number; // Duration in minutes
  price: number;
  parentId: string | null; // For hierarchical services
  serviceGroupId?: string | null; // Reference to service group
}

export interface ServiceGroup {
    id: string;
    name: string;
    description?: string;
    color?: string;
    parentId: string | null;
    displayOrder?: number;
    createdAt?: string;
}

export type HairstylistType = 'expert' | 'station';

export interface HairstylistSkill {
  id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: 'cutting' | 'coloring' | 'styling' | 'treatment' | 'other';
}

export interface HairstylistBreak {
  id: string;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  name: string; // e.g., "Lunch Break", "Coffee Break"
  isRecurring: boolean; // If this break happens every day
}

export interface HairstylistTimeOff {
  id: string;
  startDate: string; // YYYY-MM-DD format
  endDate: string; // YYYY-MM-DD format
  startTime?: string; // HH:mm format (optional for partial day off)
  endTime?: string; // HH:mm format (optional for partial day off)
  reason: string; // e.g., "Vacation", "Sick Leave", "Personal"
  isFullDay: boolean;
}

export interface HairstylistAvailability {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  isAvailable: boolean;
  breaks: HairstylistBreak[]; // Daily breaks/lunch
}

export interface HairstylistCommission {
  serviceId: string;
  type: 'percentage' | 'fixed';
  value: number; // Percentage (0-100) or fixed amount
}

export interface HairstylistPerformance {
  month: string; // YYYY-MM format
  totalRevenue: number;
  totalAppointments: number;
  averageRating: number;
  totalCommission: number;
  topServices: Array<{
    serviceId: string;
    serviceName: string;
    count: number;
    revenue: number;
  }>;
}

export interface Hairstylist {
  id: string;
  name: string;
  type: HairstylistType;
  photoUrl?: string;
  email?: string;
  phone?: string;
  hireDate?: string; // ISO date string
  serviceIds: string[]; // Services this hairstylist can perform
  skills: HairstylistSkill[];
  availability: HairstylistAvailability[];
  timeOff: HairstylistTimeOff[]; // Vacation, sick days, etc.
  commissions: HairstylistCommission[];
  performance: HairstylistPerformance[];
  isActive: boolean;
}

export type AppointmentStatus = 'unconfirmed' | 'confirmed' | 'late' | 'cancelled';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  photoUrl?: string;
  address?: string;
  notes?: string;
  createdAt: string; // ISO date string
  isDemo?: boolean;
  consentToShare?: boolean;
  socialMediaConsent?: ClientSocialConsent;
}

export interface Appointment {
  id: string;
  clientId: string;
  date: string; // YYYY-MM-DD format
  time: string; // HH:mm format
  serviceId: string;
  hairstylistId: string;
  notes?: string;
  status: AppointmentStatus;
  isDemo?: boolean;
  durationOverride?: number; // Duration in minutes, overrides service duration
  beforePhotoUrl?: string; // URL to before photo
  afterPhotoUrl?: string; // URL to after photo
}

export interface AngleView {
    view: string;
    src: string;
}

export interface Lookbook {
  id: string;
  clientId: string;
  userImage: UserImage;
  // The selected style from Step 2 that was used as a base for refinement
  baseStyle: GeneratedImage;
  // The final, refined image from Step 4
  finalImage: GeneratedImage;
  angleViews: AngleView[];
  createdAt: string; // ISO date string
}

export interface SmsSettings {
  enabled: boolean;
  provider: 'twilio' | 'plivo' | 'none';
  twilioSid: string;
  twilioAuthToken: string;
  twilioFromNumber: string;
}

export type Currency = 'CHF' | 'EUR' | 'USD';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  costPrice?: number; // Purchase/cost price
  inStock: number;
  minStock?: number; // Minimum stock level for alerts
  category?: string;
  brand?: string;
  sku?: string; // Stock Keeping Unit
  barcode?: string;
  supplier?: string;
  imageUrl?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  isActive: boolean;
  isDemo?: boolean;
}

export interface PaymentType {
  id: string;
  name: string;
  type: 'card' | 'cash' | 'other';
  enabled: boolean;
}

// FIX: Add PaymentMethod type for use in POS system.
export type PaymentMethod = 'card' | 'cash' | 'twint';

export interface SaleItem {
  id: string; // serviceId or productId
  name: string;
  price: number;
  type: 'service' | 'product';
}

export interface Sale {
  id: string;
  clientId: string | null; // Can be a walk-in customer
  hairstylistId: string;
  items: SaleItem[];
  subtotal: number;
  discount: {
    amount: number;
    reason: string;
  } | null;
  vatRate: number; // The rate used for this sale, e.g., 7.7
  vatAmount: number;
  tip: number;
  total: number;
  paymentMethod: string; // The name of the payment method used
  createdAt: string; // ISO date string
  isDemo?: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'fixed' | 'percentage';
  discountValue: number;
  isActive: boolean;
}

export interface SegmentFilter {
  field: 'totalSpent' | 'lastVisitAfter' | 'lastVisitBefore' | 'totalAppointments';
  operator: 'gte' | 'lte';
  value: number | string;
}

export interface Segment {
  id: string;
  name: string;
  filters: SegmentFilter[];
}

export interface Campaign {
  id: string;
  name: string;
  message: string;
  couponId?: string;
  segmentId: string;
  sentAt: string; // ISO date string
  status: 'sent';
  recipientCount: number;
}

// Social Media Integration Types
export interface SocialMediaConnection {
  id: string;
  platform: 'instagram' | 'facebook' | 'tiktok';
  accessToken: string;
  refreshToken?: string;
  userId: string;
  username: string;
  expiresAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SocialPlatform {
  platform: 'instagram' | 'facebook' | 'tiktok';
  postId?: string;
  url?: string;
  status: 'pending' | 'published' | 'failed';
}

export interface EngagementMetrics {
  likes: number;
  comments: number;
  shares: number;
  views?: number;
  lastUpdated: Date;
}

export interface SocialPost {
  id: string;
  lookbookId: string;
  clientId: string;
  platforms: SocialPlatform[];
  caption: string;
  hashtags: string[];
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  scheduledAt?: Date;
  publishedAt?: Date;
  externalIds: Record<string, string>;
  engagementMetrics?: EngagementMetrics;
  createdAt: Date;
}

export interface ClientSocialConsent {
  hasConsented: boolean;
  consentDate?: Date;
  allowedPlatforms: string[];
  consentType: 'general' | 'per_post';
}

// OAuth and API Management Types
export interface OAuthCredentials {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface SocialMediaSettings {
  instagram: OAuthCredentials;
  facebook: OAuthCredentials;
  tiktok: OAuthCredentials;
  webhookSecret?: string;
}

export interface PostAnalytics {
  postId: string;
  platform: string;
  impressions: number;
  reach: number;
  engagement: number;
  clicks: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SocialMediaConnections {
    instagram: SocialMediaConnection | null;
    facebook: SocialMediaConnection | null;
    tiktok: SocialMediaConnection | null;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isVisible: boolean;
  order: number;
  parentId?: string; // For grouped items
  isGroup?: boolean; // True if this is a group header
  isExpanded?: boolean; // For group expansion state
}

export interface MenuCustomization {
  items: MenuItem[];
  version: number; // For migration purposes
}

export interface StickyNote {
  id: string;
  content: string;
  color: 'yellow' | 'blue' | 'green' | 'pink' | 'purple';
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

// Dashboard Widget Types
export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  position: WidgetPosition;
  size: WidgetSize;
  config?: WidgetConfig;
  isVisible: boolean;
}

export type WidgetType = 
  | 'today-revenue'
  | 'monthly-revenue'
  | 'today-appointments'
  | 'ai-generations'
  | 'total-clients'
  | 'weekly-revenue'
  | 'average-sale'
  | 'average-price-trend'
  | 'active-hairstylists'
  | 'pending-appointments'
  | 'revenue-chart'
  | 'recent-bookings'
  | 'sticky-notes'
  | 'quick-actions'
  | 'recent-lookbooks';

export interface WidgetPosition {
  x: number;
  y: number;
  order: number;
}

export interface WidgetSize {
  width: number; // Grid columns (1-12)
  height: number; // Grid rows (1-6)
}

export interface WidgetConfig {
  colorClass?: string;
  showSubtitle?: boolean;
  chartType?: 'line' | 'bar' | 'area';
  timeRange?: 'week' | 'month' | 'year';
  maxItems?: number;
  [key: string]: any;
}

export interface WidgetLibraryItem {
  type: WidgetType;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'revenue' | 'appointments' | 'clients' | 'analytics' | 'tools';
  defaultSize: WidgetSize;
  configurable: boolean;
  isPremium?: boolean;
}

export interface DashboardConfiguration {
  widgets: DashboardWidget[];
  gridCols: number;
  gridRows: number;
  version: number;
}

export interface UserSettings {
  theme: 'light' | 'dark';
  layout: 'standard' | 'compact';
  accentColor: 'purple' | 'blue' | 'green' | 'pink';
  typography: 'sans' | 'serif';
  salonLogo: string | null;
  welcomeMessage: string;
  sms: SmsSettings;
  isDemoDataEnabled: boolean;
  language: Language;
  currency: Currency;
  studioInitialGenerations: number;
  customHairstyles: CustomHairstyle[];
  vatRate: number;
  paymentTypes: PaymentType[];
  quickSaleItemIds: string[];
  // Marketing features
  coupons: Coupon[];
  segments: Segment[];
  campaigns: Campaign[];
  socialMedia: SocialMediaConnections;
  // FIX: Added data models that are stored within the settings JSONB
  services: Service[];
  serviceGroups: ServiceGroup[];
  hairstylists: Hairstylist[];
  products: Product[];
  sales: Sale[];
  imageCount: number;
  // Menu customization
  menuCustomization?: MenuCustomization;
  // Sticky notes
  stickyNotes: StickyNote[];
  // Dashboard customization
  dashboardConfiguration?: DashboardConfiguration;
  // Onboarding tracking
  hasCompletedOnboarding?: boolean;
}
