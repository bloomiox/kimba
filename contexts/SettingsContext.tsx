import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import '../styles/accentColors.css';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';
import type { Lookbook, Appointment, Service, Hairstylist, Client, SmsSettings, Currency, ServiceGroup, CustomHairstyle, Product, Sale, Coupon, Segment, Campaign, SocialMediaConnections, AppointmentStatus, HairstylistType, HairstylistSkill, HairstylistAvailability, HairstylistCommission, HairstylistPerformance, StickyNote, DashboardConfiguration, SocialMediaConnection } from '../types';
import { loadTranslations, t as translateFunction, Language } from '../i18n/translator';

type Theme = 'light' | 'dark';
type Layout = 'standard' | 'compact';
type AccentColor = 'purple' | 'blue' | 'green' | 'pink' | 'orange' | 'red' | 'teal' | 'indigo' | 'yellow' | 'amber' | 'lime' | 'cyan' | 'sky' | 'violet' | 'fuchsia' | 'rose' | 'custom';
type Typography = 'sans' | 'serif';

const ACCENT_COLOR_MAP: Record<AccentColor, string> = {
    purple: '#8b5cf6',
    blue: '#3b82f6',
    green: '#22c55e',
    pink: '#ec4899',
    orange: '#f97316',
    red: '#ef4444',
    teal: '#14b8a6',
    indigo: '#6366f1',
    yellow: '#eab308',
    amber: '#f59e0b',
    lime: '#84cc16',
    cyan: '#06b6d4',
    sky: '#0ea5e9',
    violet: '#8b5cf6',
    fuchsia: '#d946ef',
    rose: '#f43f5e',
    custom: '#8b5cf6', // Default fallback for custom color
};

interface UserProfile {
    salonName: string;
    settings: UserSettings;
    imageCount: number;
    lookbooks: Lookbook[];
    appointments: Appointment[];
    clients: Client[];
}

interface UserSettings {
    theme: Theme;
    layout: Layout;
    accentColor: AccentColor;
    customAccentColor?: string | null;
    typography: Typography;
    salonLogo: string | null;
    welcomeMessage: string;
    sms: SmsSettings;
    isDemoDataEnabled: boolean;
    language: Language;
    currency: Currency;
    studioInitialGenerations: number;
    vatRate: number;
    customHairstyles: CustomHairstyle[];
    paymentTypes: string[];
    quickSaleItemIds: string[];
    coupons: Coupon[];
    segments: Segment[];
    campaigns: Campaign[];
    socialMedia: SocialMediaConnections;
    services: Service[];
    serviceGroups: ServiceGroup[];
    hairstylists: Hairstylist[];
    products: Product[];
    sales: Sale[];
    imageCount: number;
    menuCustomization?: any;
    stickyNotes: StickyNote[];
    dashboardConfiguration?: DashboardConfiguration;
    hasCompletedOnboarding: boolean;
}

// FIX: This interface was severely lacking definitions, causing widespread errors.
// It has been updated to include all state properties and methods used throughout the app.
interface SettingsContextType extends UserSettings {
  session: Session | null;
  setSession: (session: Session | null) => void;
  user: User | null;
  loading: boolean;
  
  salonName: string;
  setSalonName: (name: string) => void;
  
  imageCount: number;
  incrementImageCount: () => void;
  
  lookbooks: Lookbook[];
  saveLookbook: (lookbook: Omit<Lookbook, 'id' | 'createdAt'>) => void;
  getCurrentUserLookbooks: () => Lookbook[];
  
  appointments: Appointment[];
  addAppointment: (appointment: Omit<Appointment, 'id' | 'status'>) => Promise<void>;
  updateAppointmentDetails: (appointmentId: string, updates: Partial<Omit<Appointment, 'id'>>) => void;
  updateAppointmentStatus: (appointmentId: string, status: AppointmentStatus) => void;

  clients: Client[];
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Promise<Client>;
  updateClient: (client: Client) => void;
  deleteClient: (clientId: string) => void;
  getClientById: (clientId: string) => Client | undefined;
  findOrCreateClient: (name: string, email: string, phone: string) => Promise<Client>;

  setTheme: (theme: Theme) => void;
  setLayout: (layout: Layout) => void;
  setAccentColor: (color: AccentColor) => void;
  setCustomAccentColor: (hexColor: string) => void;
  customAccentColor: string | null;
  setTypography: (font: Typography) => void;
  setSalonLogo: (logo: string | null) => void;
  setWelcomeMessage: (message: string) => void;
  setSmsSettings: (sms: SmsSettings) => void;
  setDemoDataEnabled: (enabled: boolean) => void;
  setLanguage: (lang: Language) => void;
  setCurrency: (currency: Currency) => void;
  setStudioInitialGenerations: (count: number) => void;
  setVatRate: (rate: number) => void;

  addService: (service: Omit<Service, 'id'>) => Promise<any>;
  updateService: (service: Service) => void;
  deleteService: (serviceId: string) => void;
  addServiceGroup: (group: Omit<ServiceGroup, 'id'>) => Promise<any>;
  updateServiceGroup: (group: ServiceGroup) => Promise<any>;
  deleteServiceGroup: (groupId: string) => Promise<any>;
  
  addHairstylist: (hairstylist: Omit<Hairstylist, 'id'>) => Promise<any>;
  updateHairstylist: (hairstylist: Hairstylist) => void;
  deleteHairstylist: (hairstylistId: string) => void;
  updateHairstylistServices: (hairstylistId: string, serviceIds: string[]) => void;
  updateHairstylistAvailability: (hairstylistId: string, availability: HairstylistAvailability[]) => void;
  updateHairstylistCommissions: (hairstylistId: string, commissions: HairstylistCommission[]) => void;
  addHairstylistSkill: (hairstylistId: string, skill: Omit<HairstylistSkill, 'id'>) => void;
  updateHairstylistSkill: (hairstylistId: string, skill: HairstylistSkill) => void;
  deleteHairstylistSkill: (hairstylistId: string, skillId: string) => void;
  getHairstylistPerformance: (hairstylistId: string, month?: string) => HairstylistPerformance | null;

  addCustomHairstyle: (style: Omit<CustomHairstyle, 'id'>) => void;
  updateCustomHairstyle: (style: CustomHairstyle) => void;
  deleteCustomHairstyle: (styleId: string) => void;

  addSale: (sale: Omit<Sale, 'id' | 'createdAt'>) => Promise<any>;
  
  addProduct: (product: Omit<Product, 'id'>) => Promise<any>;
  updateProduct: (product: Product) => Promise<any>;
  deleteProduct: (productId: string) => Promise<any>;
  
  addCoupon: (coupon: Omit<Coupon, 'id'>) => void;
  updateCoupon: (coupon: Coupon) => void;
  deleteCoupon: (couponId: string) => void;

  addSegment: (segment: Omit<Segment, 'id'>) => void;
  updateSegment: (segment: Segment) => void;
  deleteSegment: (segmentId: string) => void;
  getSegmentClients: (segment: Segment) => Client[];

  sendCampaign: (campaign: Omit<Campaign, 'id' | 'sentAt' | 'status' | 'recipientCount'>) => void;
  
  connectSocialMedia: (platform: keyof SocialMediaConnections, connection: SocialMediaConnection) => void;
  disconnectSocialMedia: (platform: keyof SocialMediaConnections) => void;

  // For legacy component compatibility
  users: any;
  setCurrentUser: (user: string | null) => void;
  addUser: (salonName: string) => void;

  t: (key: string, replacements?: Record<string, string | number>) => string;

  // Menu customization
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  
  // Sticky notes
  addStickyNote: (note: Omit<StickyNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateStickyNote: (note: StickyNote) => void;
  deleteStickyNote: (noteId: string) => void;

  // Onboarding
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const DEFAULT_SETTINGS: UserSettings = {
    theme: 'light',
    layout: 'standard',
    accentColor: 'blue',
    customAccentColor: null,
    typography: 'sans',
    salonLogo: null,
    welcomeMessage: 'Start by providing a clear, front-facing photo of yourself.',
    sms: { enabled: false, provider: 'none', twilioSid: '', twilioAuthToken: '', twilioFromNumber: '' },
    isDemoDataEnabled: false,
    language: 'de',
    currency: 'USD',
    studioInitialGenerations: 4,
    customHairstyles: [],
    vatRate: 7.7,
    paymentTypes: [],
    quickSaleItemIds: [],
    coupons: [],
    segments: [],
    campaigns: [],
    socialMedia: { instagram: null, facebook: null, tiktok: null },
    services: [
        {
            id: 'service_1',
            name: 'Haircut & Style',
            description: 'Professional haircut with styling',
            duration: 60,
            price: 45.00,
            parentId: null
        },
        {
            id: 'service_2',
            name: 'Hair Color',
            description: 'Full hair coloring service',
            duration: 120,
            price: 85.00,
            parentId: null
        }
    ],
    serviceGroups: [],
    hairstylists: [
        {
            id: 'stylist_1',
            name: 'Sarah Johnson',
            type: 'expert',
            email: 'sarah@salon.com',
            phone: '555-0123',
            photoUrl: null,
            hireDate: '2023-01-15',
            serviceIds: ['service_1', 'service_2'],
            skills: [],
            availability: [],
            timeOff: [],
            commissions: [],
            performance: [],
            isActive: true
        }
    ],
    products: [],
    sales: [
        {
            id: 'sale_1',
            clientId: 'client_1',
            hairstylistId: 'stylist_1',
            items: [
                {
                    id: 'service_1',
                    name: 'Haircut & Style',
                    price: 45.00,
                    type: 'service'
                }
            ],
            subtotal: 45.00,
            discount: null,
            vatRate: 7.7,
            vatAmount: 3.47,
            tip: 5.00,
            total: 53.47,
            paymentMethod: 'card',
            createdAt: new Date().toISOString(),
            isDemo: true
        },
        {
            id: 'sale_2',
            clientId: 'client_2',
            hairstylistId: 'stylist_1',
            items: [
                {
                    id: 'service_2',
                    name: 'Hair Color',
                    price: 85.00,
                    type: 'service'
                }
            ],
            subtotal: 85.00,
            discount: null,
            vatRate: 7.7,
            vatAmount: 6.55,
            tip: 10.00,
            total: 101.55,
            paymentMethod: 'cash',
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
            isDemo: true
        }
    ],
    imageCount: 0,
    menuCustomization: undefined,
    stickyNotes: [
        {
            id: 'note_1',
            content: 'Remember to order more hair products for next week',
            color: 'yellow',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'note_2',
            content: 'Client Emma prefers organic products only',
            color: 'blue',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ],
    hasCompletedOnboarding: false,
};


export const SettingsProvider: React.FC<{ children: ReactNode, publicSalonId?: string }> = ({ children, publicSalonId }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [translationsLoaded, setTranslationsLoaded] = useState(false);

  const fetchProfileData = useCallback(async (userOrId: User | string) => {
    setLoading(true);
    const userId = typeof userOrId === 'string' ? userOrId : userOrId.id;

    try {
        let { data: profileData, error } = await supabase
            .from('user_profiles')
            .select('salon_name, settings')
            .eq('id', userId)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 means 0 rows found, which is not a fatal error
            throw error;
        }
        
        // If no profile exists (e.g., new signup, DB delay), create a default one.
        if (!profileData) {
            console.warn("User profile not found for user_id:", userId, "Creating a default profile.");
            const { data: newProfile, error: insertError } = await supabase
                .from('user_profiles')
                .insert({ id: userId, salon_name: 'My Salon' })
                .select('salon_name, settings')
                .single();
            if (insertError) throw insertError;
            profileData = newProfile;
        }
        
        const [
            {data: clients}, 
            {data: appointments},
            {data: lookbooks},
            {data: services},
            {data: serviceGroups},
            {data: hairstylists},
            {data: products},
            {data: sales}
        ] = await Promise.all([
            supabase.from('clients').select('*').eq('user_id', userId),
            supabase.from('appointments').select('*').eq('user_id', userId),
            supabase.from('lookbooks').select('*').eq('user_id', userId),
            supabase.from('services').select('*').eq('user_id', userId),
            supabase.from('service_groups').select('*').eq('user_id', userId),
            supabase.from('hairstylists').select(`
              *,
              hairstylist_availability(*)
            `).eq('user_id', userId),
            supabase.from('products').select('*').eq('user_id', userId),
            supabase.from('sales').select(`
              *,
              sale_items(*)
            `).eq('user_id', userId),
        ]);
        
        const dbSettings = profileData.settings || {};
        console.log('Database settings:', dbSettings);
        console.log('DEFAULT_SETTINGS:', DEFAULT_SETTINGS);
        
        const finalSettings: UserSettings = {
            theme: dbSettings.theme ?? DEFAULT_SETTINGS.theme,
            layout: dbSettings.layout ?? DEFAULT_SETTINGS.layout,
            accentColor: dbSettings.accentColor ?? DEFAULT_SETTINGS.accentColor,
            typography: dbSettings.typography ?? DEFAULT_SETTINGS.typography,
            salonLogo: dbSettings.salonLogo ?? DEFAULT_SETTINGS.salonLogo,
            welcomeMessage: dbSettings.welcomeMessage ?? DEFAULT_SETTINGS.welcomeMessage,
            sms: { ...DEFAULT_SETTINGS.sms, ...(dbSettings.sms || {}) },
            isDemoDataEnabled: dbSettings.isDemoDataEnabled ?? DEFAULT_SETTINGS.isDemoDataEnabled,
            language: dbSettings.language ?? DEFAULT_SETTINGS.language,
            currency: dbSettings.currency ?? DEFAULT_SETTINGS.currency,
            studioInitialGenerations: dbSettings.studioInitialGenerations ?? DEFAULT_SETTINGS.studioInitialGenerations,
            vatRate: dbSettings.vatRate ?? DEFAULT_SETTINGS.vatRate,
            customHairstyles: dbSettings.customHairstyles ?? DEFAULT_SETTINGS.customHairstyles,
            paymentTypes: dbSettings.paymentTypes ?? DEFAULT_SETTINGS.paymentTypes,
            quickSaleItemIds: dbSettings.quickSaleItemIds ?? DEFAULT_SETTINGS.quickSaleItemIds,
            coupons: dbSettings.coupons ?? DEFAULT_SETTINGS.coupons,
            segments: dbSettings.segments ?? DEFAULT_SETTINGS.segments,
            campaigns: dbSettings.campaigns ?? DEFAULT_SETTINGS.campaigns,
            socialMedia: { ...DEFAULT_SETTINGS.socialMedia, ...(dbSettings.socialMedia || {}) },
            services: (services || []).map((s: any) => ({
              id: s.id,
              name: s.name,
              description: s.description,
              duration: s.duration,
              price: s.price,
              parentId: s.parent_id, // Convert snake_case to camelCase
              serviceGroupId: s.service_group_id, // Convert snake_case to camelCase
            })) || (dbSettings.services ?? DEFAULT_SETTINGS.services),
            serviceGroups: (serviceGroups || []).map((sg: any) => ({
              id: sg.id,
              name: sg.name,
              description: sg.description,
              color: sg.color,
              parentId: sg.parent_id,
              displayOrder: sg.display_order,
              createdAt: sg.created_at,
            })) || (dbSettings.serviceGroups ?? DEFAULT_SETTINGS.serviceGroups),
            hairstylists: (hairstylists || []).map((h: any) => ({
              id: h.id,
              name: h.name,
              type: h.type,
              email: h.email,
              phone: h.phone,
              photoUrl: h.photo_url,
              hireDate: h.hire_date,
              serviceIds: [],
              skills: [],
              availability: (h.hairstylist_availability || []).map((a: any) => ({
                dayOfWeek: a.day_of_week,
                startTime: a.start_time,
                endTime: a.end_time,
                isAvailable: a.is_available,
                breaks: []
              })),
              timeOff: [],
              commissions: [],
              performance: [],
              isActive: h.is_active,
            })) || (dbSettings.hairstylists ?? DEFAULT_SETTINGS.hairstylists),
            products: (products || []).map((p: any) => ({
              id: p.id,
              name: p.name,
              description: p.description,
              price: p.price,
              costPrice: p.cost_price,
              inStock: p.in_stock,
              minStock: p.min_stock,
              category: p.category,
              brand: p.brand,
              sku: p.sku,
              barcode: p.barcode,
              supplier: p.supplier,
              imageUrl: p.image_url,
              createdAt: p.created_at,
              updatedAt: p.updated_at,
              isActive: p.is_active,
              isDemo: false,
            })) || (dbSettings.products ?? DEFAULT_SETTINGS.products),
            sales: (sales || []).map((s: any) => ({
              id: s.id,
              clientId: s.client_id,
              hairstylistId: s.hairstylist_id,
              items: (s.sale_items || []).map((item: any) => ({
                id: item.item_id,
                name: item.item_name,
                price: item.price,
                type: item.item_type
              })),
              subtotal: s.subtotal,
              discount: s.discount_amount > 0 ? {
                amount: s.discount_amount,
                reason: s.discount_reason
              } : null,
              vatRate: s.vat_rate,
              vatAmount: s.vat_amount,
              tip: s.tip,
              total: s.total,
              paymentMethod: s.payment_method,
              createdAt: s.created_at,
              isDemo: false,
            })) || (dbSettings.sales ?? DEFAULT_SETTINGS.sales),
            menuCustomization: dbSettings.menuCustomization ?? DEFAULT_SETTINGS.menuCustomization,
            stickyNotes: dbSettings.stickyNotes ?? DEFAULT_SETTINGS.stickyNotes,
            imageCount: dbSettings.imageCount ?? DEFAULT_SETTINGS.imageCount,
            hasCompletedOnboarding: dbSettings.hasCompletedOnboarding ?? DEFAULT_SETTINGS.hasCompletedOnboarding,
        };
        
        // Convert database field names from snake_case to camelCase
        const convertedAppointments = (appointments || []).map((app: any) => ({
            id: app.id,
            clientId: app.client_id,
            date: app.date,
            time: app.time,
            serviceId: app.service_id,
            hairstylistId: app.hairstylist_id,
            notes: app.notes,
            status: app.status,
            isDemo: app.is_demo,
            durationOverride: app.duration_override,
        }));

        // Convert clients data to use consistent id field
        const convertedClients = (clients || []).map((client: any) => ({
            ...client,
            id: client.client_id || client.id, // Use client_id as id for consistency
        }));

        setProfile({
            salonName: profileData.salon_name,
            settings: finalSettings,
            imageCount: finalSettings.imageCount || 0,
            clients: convertedClients,
            appointments: convertedAppointments,
            lookbooks: lookbooks || [],
        });

    } catch (error) {
        console.error('Error fetching profile:', error);
        // Set a default profile on error to prevent crashing
        setProfile({
             salonName: 'My Salon',
             settings: DEFAULT_SETTINGS,
             imageCount: 0,
             clients: [
                 {
                     id: 'client_1',
                     name: 'Emma Wilson',
                     email: 'emma@example.com',
                     phone: '555-0101',
                     photoUrl: null,
                     address: '123 Main St',
                     notes: 'Prefers morning appointments',
                     createdAt: new Date().toISOString(),
                     isDemo: true
                 },
                 {
                     id: 'client_2',
                     name: 'Michael Brown',
                     email: 'michael@example.com',
                     phone: '555-0102',
                     photoUrl: null,
                     address: '456 Oak Ave',
                     notes: 'Regular customer',
                     createdAt: new Date().toISOString(),
                     isDemo: true
                 }
             ],
             appointments: [
                 {
                     id: 'apt_1',
                     clientId: 'client_1',
                     date: new Date().toISOString().split('T')[0], // Today
                     time: '10:00',
                     serviceId: 'service_1',
                     hairstylistId: 'stylist_1',
                     notes: 'First appointment',
                     status: 'confirmed',
                     isDemo: true
                 },
                 {
                     id: 'apt_2',
                     clientId: 'client_2',
                     date: new Date().toISOString().split('T')[0], // Today
                     time: '14:30',
                     serviceId: 'service_2',
                     hairstylistId: 'stylist_1',
                     notes: 'Color touch-up',
                     status: 'unconfirmed',
                     isDemo: true
                 },
                 {
                     id: 'apt_3',
                     clientId: 'client_1',
                     date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
                     time: '09:00',
                     serviceId: 'service_1',
                     hairstylistId: 'stylist_1',
                     notes: 'Follow-up appointment',
                     status: 'confirmed',
                     isDemo: true
                 }
             ],
             lookbooks: [],
        });
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (publicSalonId) {
        fetchProfileData(publicSalonId);
    } else {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session?.user) {
                setUser(session.user);
                fetchProfileData(session.user);
            } else {
                setLoading(false);
                // Load default language for login screen
                loadTranslations(DEFAULT_SETTINGS.language).then(() => {
                    setTranslationsLoaded(true);
                }).catch((error) => {
                    console.error('Failed to load default translations:', error);
                    // Even if translations fail to load, set to true to prevent blocking
                    setTranslationsLoaded(true);
                });
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            fetchProfileData(session.user);
          } else {
            setProfile({});
          }
        });

        return () => subscription.unsubscribe();
    }
  }, [fetchProfileData, publicSalonId]);
  
  useEffect(() => {
    if (!user || publicSalonId) return;
    
    const clientSubscription = supabase.channel('public:clients')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients', filter: `user_id=eq.${user.id}` }, async (payload) => {
        if (payload.eventType === 'INSERT') {
          const client = { ...payload.new, id: payload.new.client_id || payload.new.id };
          setProfile(p => ({ ...p, clients: [...(p.clients || []), client] }));
        } else if (payload.eventType === 'UPDATE') {
          const client = { ...payload.new, id: payload.new.client_id || payload.new.id };
          setProfile(p => ({ ...p, clients: (p.clients || []).map(c => c.id === client.id ? client : c) }));
        } else if (payload.eventType === 'DELETE') {
          const clientId = payload.old.client_id || payload.old.id;
          setProfile(p => ({ ...p, clients: (p.clients || []).filter(c => c.id !== clientId) }));
        }
      })
      .subscribe();
    const appointmentSubscription = supabase.channel('public:appointments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments', filter: `user_id=eq.${user.id}` }, async (payload) => {
        if (payload.eventType === 'INSERT') {
          const appointment = {
            id: payload.new.id,
            clientId: payload.new.client_id,
            date: payload.new.date,
            time: payload.new.time,
            serviceId: payload.new.service_id,
            hairstylistId: payload.new.hairstylist_id,
            notes: payload.new.notes,
            status: payload.new.status,
            isDemo: payload.new.is_demo,
            durationOverride: payload.new.duration_override,
          };
          setProfile(p => ({ ...p, appointments: [...(p.appointments || []), appointment] }));
        } else if (payload.eventType === 'UPDATE') {
          const appointment = {
            id: payload.new.id,
            clientId: payload.new.client_id,
            date: payload.new.date,
            time: payload.new.time,
            serviceId: payload.new.service_id,
            hairstylistId: payload.new.hairstylist_id,
            notes: payload.new.notes,
            status: payload.new.status,
            isDemo: payload.new.is_demo,
            durationOverride: payload.new.duration_override,
          };
          setProfile(p => ({ ...p, appointments: (p.appointments || []).map(a => a.id === appointment.id ? appointment : a) }));
        } else if (payload.eventType === 'DELETE') {
          setProfile(p => ({ ...p, appointments: (p.appointments || []).filter(a => a.id !== payload.old.id) }));
        }
      })
      .subscribe();
    const lookbookSubscription = supabase.channel('public:lookbooks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lookbooks', filter: `user_id=eq.${user.id}` }, async (payload) => {
        if (payload.eventType === 'INSERT') {
          setProfile(p => ({ ...p, lookbooks: [...(p.lookbooks || []), payload.new] }));
        } else if (payload.eventType === 'UPDATE') {
          setProfile(p => ({ ...p, lookbooks: (p.lookbooks || []).map(l => l.id === payload.new.id ? payload.new : l) }));
        } else if (payload.eventType === 'DELETE') {
          setProfile(p => ({ ...p, lookbooks: (p.lookbooks || []).filter(l => l.id !== payload.old.id) }));
        }
      })
      .subscribe();
    
    // Add subscriptions for the new tables
    const servicesSubscription = supabase.channel('public:services')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'services', filter: `user_id=eq.${user.id}` }, async (payload) => {
        if (payload.eventType === 'INSERT') {
          setProfile(p => ({ ...p, settings: { ...p.settings, services: [...(p.settings?.services || []), payload.new] } }));
        } else if (payload.eventType === 'UPDATE') {
          setProfile(p => ({ ...p, settings: { ...p.settings, services: (p.settings?.services || []).map(s => s.id === payload.new.id ? payload.new : s) } }));
        } else if (payload.eventType === 'DELETE') {
          setProfile(p => ({ ...p, settings: { ...p.settings, services: (p.settings?.services || []).filter(s => s.id !== payload.old.id) } }));
        }
      })
      .subscribe();

    const hairstylistsSubscription = supabase.channel('public:hairstylists')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hairstylists', filter: `user_id=eq.${user.id}` }, async (payload) => {
        if (payload.eventType === 'INSERT') {
          const hairstylist = {
            id: payload.new.id,
            name: payload.new.name,
            type: payload.new.type,
            email: payload.new.email,
            phone: payload.new.phone,
            photoUrl: payload.new.photo_url,
            hireDate: payload.new.hire_date,
            serviceIds: [],
            skills: [],
            availability: [],
            commissions: [],
            performance: [],
            isActive: payload.new.is_active,
          };
          setProfile(p => ({ ...p, settings: { ...p.settings, hairstylists: [...(p.settings?.hairstylists || []), hairstylist] } }));
        }
      })
      .subscribe();

    const productsSubscription = supabase.channel('public:products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products', filter: `user_id=eq.${user.id}` }, async (payload) => {
        if (payload.eventType === 'INSERT') {
          const product = {
            id: payload.new.id,
            name: payload.new.name,
            description: payload.new.description,
            price: payload.new.price,
            costPrice: payload.new.cost_price,
            inStock: payload.new.in_stock,
            minStock: payload.new.min_stock,
            category: payload.new.category,
            brand: payload.new.brand,
            sku: payload.new.sku,
            barcode: payload.new.barcode,
            supplier: payload.new.supplier,
            imageUrl: payload.new.image_url,
            createdAt: payload.new.created_at,
            updatedAt: payload.new.updated_at,
            isActive: payload.new.is_active,
            isDemo: false,
          };
          setProfile(p => ({ ...p, settings: { ...p.settings, products: [...(p.settings?.products || []), product] } }));
        }
      })
      .subscribe();

    const serviceGroupsSubscription = supabase.channel('public:service_groups')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_groups', filter: `user_id=eq.${user.id}` }, async (payload) => {
        if (payload.eventType === 'INSERT') {
          const serviceGroup = {
            id: payload.new.id,
            name: payload.new.name,
            description: payload.new.description,
            color: payload.new.color,
            parentId: payload.new.parent_id,
            displayOrder: payload.new.display_order,
            createdAt: payload.new.created_at,
          };
          setProfile(p => ({ ...p, settings: { ...p.settings, serviceGroups: [...(p.settings?.serviceGroups || []), serviceGroup] } }));
        } else if (payload.eventType === 'UPDATE') {
          const serviceGroup = {
            id: payload.new.id,
            name: payload.new.name,
            description: payload.new.description,
            color: payload.new.color,
            parentId: payload.new.parent_id,
            displayOrder: payload.new.display_order,
            createdAt: payload.new.created_at,
          };
          setProfile(p => ({ ...p, settings: { ...p.settings, serviceGroups: (p.settings?.serviceGroups || []).map(sg => sg.id === serviceGroup.id ? serviceGroup : sg) } }));
        } else if (payload.eventType === 'DELETE') {
          setProfile(p => ({ ...p, settings: { ...p.settings, serviceGroups: (p.settings?.serviceGroups || []).filter(sg => sg.id !== payload.old.id) } }));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(clientSubscription);
      supabase.removeChannel(appointmentSubscription);
      supabase.removeChannel(lookbookSubscription);
      supabase.removeChannel(servicesSubscription);
      supabase.removeChannel(serviceGroupsSubscription);
      supabase.removeChannel(hairstylistsSubscription);
      supabase.removeChannel(productsSubscription);
    }
  }, [user, fetchProfileData, publicSalonId]);

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
      if (!user) {
          console.error("updateSettings: User not authenticated");
          // For unauthenticated users (e.g., on landing page), update local state only
          const currentSettings = profile.settings || DEFAULT_SETTINGS;
          const updatedSettings = { ...currentSettings, ...newSettings };
          console.log("Updating settings locally (no user):", newSettings);
          setProfile(p => ({ ...p, settings: updatedSettings }));
          return;
      }
      
      console.log("updateSettings called with:", newSettings);
      const currentSettings = profile.settings || DEFAULT_SETTINGS;
      const updatedSettings = { ...currentSettings, ...newSettings };
      
      console.log("Current settings:", currentSettings);
      console.log("Updated settings:", updatedSettings);
      
      setProfile(p => ({ ...p, settings: updatedSettings }));

      const { error } = await supabase
        .from('user_profiles')
        .update({ settings: updatedSettings })
        .eq('id', user.id);
      
      if (error) {
          console.error("Failed to update settings:", error);
          // Revert optimistic update on error if needed
          setProfile(p => ({ ...p, settings: currentSettings }));
      } else {
          console.log("Settings updated successfully");
          console.log("New settings in database:", updatedSettings);
      }
  };
  
  // Function to generate color shades from a base color
  const generateColorShades = (hexColor: string) => {
    // Convert hex to RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    // Generate shades (lighter and darker variants)
    const shades = {
      50: adjustColor(r, g, b, 0.9),  // Lightest
      100: adjustColor(r, g, b, 0.8),
      200: adjustColor(r, g, b, 0.6),
      300: adjustColor(r, g, b, 0.4),
      400: adjustColor(r, g, b, 0.2),
      500: hexColor,                   // Base color
      600: darkenColor(r, g, b, 0.1),
      700: darkenColor(r, g, b, 0.2),
      800: darkenColor(r, g, b, 0.3),
      900: darkenColor(r, g, b, 0.4),
      950: darkenColor(r, g, b, 0.5),  // Darkest
    };
    
    // Also create RGB versions for shadows and other utilities
    const shadesWithRgb = {};
    Object.entries(shades).forEach(([shade, hexValue]) => {
      const rgb = hexToRgb(hexValue);
      shadesWithRgb[shade] = hexValue;
      shadesWithRgb[`${shade}-rgb`] = `${rgb.r} ${rgb.g} ${rgb.b}`;
    });
    
    return shadesWithRgb;
  };
  
  // Helper function to convert hex to RGB
  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  };
  
  // Helper function to lighten a color
  const adjustColor = (r: number, g: number, b: number, factor: number) => {
    // Mix with white based on factor
    const newR = Math.round(r + (255 - r) * factor);
    const newG = Math.round(g + (255 - g) * factor);
    const newB = Math.round(b + (255 - b) * factor);
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  };
  
  // Helper function to darken a color
  const darkenColor = (r: number, g: number, b: number, factor: number) => {
    // Reduce RGB values based on factor
    const newR = Math.round(r * (1 - factor));
    const newG = Math.round(g * (1 - factor));
    const newB = Math.round(b * (1 - factor));
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  };

  useEffect(() => {
    console.log('Theme and accent color useEffect triggered');
    console.log('Current profile settings:', profile.settings);
    console.log('DEFAULT_SETTINGS:', DEFAULT_SETTINGS);
    
    const settings = profile.settings || DEFAULT_SETTINGS;
    console.log('Using settings:', settings);
    
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(settings.theme);
    console.log('Applied theme class:', settings.theme);
    
    // Apply accent color - use custom color if selected, otherwise use preset
    const accentColorValue = settings.accentColor === 'custom' && settings.customAccentColor
      ? settings.customAccentColor
      : ACCENT_COLOR_MAP[settings.accentColor];
    
    // Set the base accent color
    document.documentElement.style.setProperty('--accent-color', accentColorValue);
    console.log('Setting accent color to:', accentColorValue, 'from', settings.accentColor);
    
    // Generate and set all color shades
    if (accentColorValue) {
      const shades = generateColorShades(accentColorValue);
      Object.entries(shades).forEach(([shade, value]) => {
        if (shade.includes('-rgb')) {
          // Set RGB values for shadow utilities
          document.documentElement.style.setProperty(`--accent-color-${shade}-custom`, value as string);
        } else {
          // Set both the old format and the Tailwind expected format
          document.documentElement.style.setProperty(`--accent-color-${shade}`, value as string);
          document.documentElement.style.setProperty(`--accent-${shade}`, value as string); // This is what Tailwind expects
        }
        console.log(`Setting --accent-${shade} to ${value}`);
      });
    }
    
    document.documentElement.classList.remove('font-sans', 'font-serif');
    document.documentElement.classList.add(`font-${settings.typography}`);

    if (settings.language) {
        setTranslationsLoaded(false);
        loadTranslations(settings.language).then(() => {
          setTranslationsLoaded(true);
        });
    }
  }, [profile.settings]);

  // --- Start of Method Implementations ---

  const addClient = async (clientData: Omit<Client, 'id' | 'createdAt'>): Promise<Client> => {
      if (!user) throw new Error("User not authenticated");
      const { data, error } = await supabase
        .from('clients')
        .insert({ ...clientData, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      
      // Convert client_id to id for consistency with the application
      const client = {
        ...data,
        id: data.client_id || data.id, // Use client_id if available, fallback to id
      };
      
      // Update local state immediately without full refresh
      setProfile(p => ({
        ...p,
        clients: [...(p.clients || []), client]
      }));
      
      return client as Client;
  };
  
  const addAppointment = async (appointmentData: Omit<Appointment, 'id' | 'status'>) => {
    if (!user) throw new Error("User not authenticated");
    const { data, error } = await supabase.from('appointments').insert({
      client_id: appointmentData.clientId,
      date: appointmentData.date,
      time: appointmentData.time,
      service_id: appointmentData.serviceId,
      hairstylist_id: appointmentData.hairstylistId,
      notes: appointmentData.notes,
      duration_override: appointmentData.durationOverride,
      user_id: user.id,
      status: 'unconfirmed'
    }).select().single();
    if (error) throw error;
    
    // Convert database format to application format
    const appointment = {
      id: data.id,
      clientId: data.client_id,
      date: data.date,
      time: data.time,
      serviceId: data.service_id,
      hairstylistId: data.hairstylist_id,
      notes: data.notes,
      status: data.status,
      isDemo: data.is_demo,
      durationOverride: data.duration_override,
    };
    
    // Update local state immediately without full refresh
    setProfile(p => ({
      ...p,
      appointments: [...(p.appointments || []), appointment]
    }));
  };
  
  // Example of a function that modifies the settings object
  const addService = async (service: Omit<Service, 'id'>) => {
      if (!user) throw new Error("User not authenticated");
      const { data, error } = await supabase
        .from('services')
        .insert({
          user_id: user.id,
          name: service.name,
          description: service.description,
          duration: service.duration,
          price: service.price,
          parent_id: service.parentId || null, // Ensure null if not provided
          service_group_id: service.serviceGroupId || null, // Ensure null if not provided
        })
        .select()
        .single();
      if (error) throw error;
      
      // Convert back to application format
      const serviceData = {
        id: data.id,
        name: data.name,
        description: data.description,
        duration: data.duration,
        price: data.price,
        parentId: data.parent_id, // Convert snake_case back to camelCase
        serviceGroupId: data.service_group_id, // Convert snake_case back to camelCase
      };
      
      // Update local state immediately
      setProfile(p => ({
        ...p,
        settings: {
          ...p.settings,
          services: [...(p.settings?.services || []), serviceData]
        }
      }));
      
      return serviceData;
  }

  // A huge list of implementations to satisfy the new SettingsContextType
  const settings = profile.settings || DEFAULT_SETTINGS;
  const contextValue: SettingsContextType = {
    session,
    setSession,
    user,
    loading: loading || !translationsLoaded,
    salonName: profile.salonName || '',
    imageCount: profile.imageCount || 0,
    theme: settings.theme,
    layout: settings.layout,
    accentColor: settings.accentColor,
    typography: settings.typography,
    salonLogo: settings.salonLogo,
    welcomeMessage: settings.welcomeMessage,
    sms: settings.sms || DEFAULT_SETTINGS.sms,
    isDemoDataEnabled: settings.isDemoDataEnabled,
    language: settings.language,
    currency: settings.currency,
    studioInitialGenerations: settings.studioInitialGenerations,
    customHairstyles: settings.customHairstyles || [],
    vatRate: settings.vatRate,
    paymentTypes: settings.paymentTypes || [],
    quickSaleItemIds: settings.quickSaleItemIds || [],
    coupons: settings.coupons || [],
    segments: settings.segments || [],
    campaigns: settings.campaigns || [],
    socialMedia: settings.socialMedia || DEFAULT_SETTINGS.socialMedia,
    services: settings.services || [],
    serviceGroups: settings.serviceGroups || [],
    hairstylists: settings.hairstylists || [],
    products: settings.products || [],
    sales: settings.sales || [],
    menuCustomization: settings.menuCustomization,
    stickyNotes: settings.stickyNotes || [],
    hasCompletedOnboarding: settings.hasCompletedOnboarding || false,

    clients: profile.clients || [],
    appointments: profile.appointments || [],
    lookbooks: profile.lookbooks || [],
    
    setTheme: (theme: Theme) => updateSettings({ theme }),
    setLayout: (layout: Layout) => updateSettings({ layout }),
    setAccentColor: (color: AccentColor) => updateSettings({ accentColor: color }),
    setCustomAccentColor: (hexColor: string) => updateSettings({ accentColor: 'custom', customAccentColor: hexColor }),
    customAccentColor: profile.settings?.customAccentColor || null,
    setTypography: (font: Typography) => updateSettings({ typography: font }),
    setSalonLogo: (logo: string | null) => updateSettings({ salonLogo: logo }),
    setWelcomeMessage: (message: string) => updateSettings({ welcomeMessage: message }),
    setLanguage: (lang: Language) => updateSettings({ language: lang }),
    setCurrency: (curr: Currency) => updateSettings({ currency: curr }),
    setSmsSettings: (sms: SmsSettings) => updateSettings({ sms }),
    setDemoDataEnabled: (enabled: boolean) => updateSettings({ isDemoDataEnabled: enabled }),
    setStudioInitialGenerations: (count: number) => updateSettings({ studioInitialGenerations: count }),
    setVatRate: (rate: number) => updateSettings({ vatRate: rate }),
    
    setSalonName: async (name: string) => {
        if (!user) return;
        setProfile(p => ({ ...p, salonName: name }));
        await supabase.from('user_profiles').update({ salon_name: name }).eq('id', user.id);
    },
    incrementImageCount: async () => {
        if (!user) return;
        const newCount = (profile.imageCount || 0) + 1;
        setProfile(p => ({ ...p, imageCount: newCount }));
        updateSettings({ imageCount: newCount });
    },
    saveLookbook: async (lookbook) => {
        if (!user) return;
        await supabase.from('lookbooks').insert({ ...lookbook, user_id: user.id });
    },
    getCurrentUserLookbooks: () => profile.lookbooks || [],
    addAppointment,
    updateAppointmentDetails: async (appointmentId, updates) => {
        if (!user) return;
        // Convert camelCase field names to snake_case for database
        const dbUpdates: any = {};
        if (updates.clientId !== undefined) dbUpdates.client_id = updates.clientId;
        if (updates.date !== undefined) dbUpdates.date = updates.date;
        if (updates.time !== undefined) dbUpdates.time = updates.time;
        if (updates.serviceId !== undefined) dbUpdates.service_id = updates.serviceId;
        if (updates.hairstylistId !== undefined) dbUpdates.hairstylist_id = updates.hairstylistId;
        if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
        if (updates.status !== undefined) dbUpdates.status = updates.status;
        if (updates.isDemo !== undefined) dbUpdates.is_demo = updates.isDemo;
        if (updates.durationOverride !== undefined) dbUpdates.duration_override = updates.durationOverride;
        
        await supabase.from('appointments').update(dbUpdates).eq('id', appointmentId);
        // Update local state immediately without full refresh
        setProfile(p => ({
          ...p,
          appointments: (p.appointments || []).map(a => 
            a.id === appointmentId ? { ...a, ...updates } : a
          )
        }));
    },
    updateAppointmentStatus: async (appointmentId, status) => {
        if (!user) return;
        await supabase.from('appointments').update({ status }).eq('id', appointmentId);
        // Update local state immediately without full refresh
        setProfile(p => ({
          ...p,
          appointments: (p.appointments || []).map(a => 
            a.id === appointmentId ? { ...a, status } : a
          )
        }));
    },
    addClient,
    updateClient: async (client) => {
        if (!user) return;
        await supabase.from('clients').update(client).eq('id', client.id);
        // Update local state immediately without full refresh
        setProfile(p => ({
          ...p,
          clients: (p.clients || []).map(c => c.id === client.id ? client : c)
        }));
    },
    deleteClient: async (clientId: string) => {
        if (!user) return;
        await supabase.from('clients').delete().eq('id', clientId);
        // Update local state immediately without full refresh
        setProfile(p => ({
          ...p,
          clients: (p.clients || []).filter(c => c.id !== clientId)
        }));
    },
    getClientById: (clientId: string) => (profile.clients || []).find(c => c.id === clientId),
    findOrCreateClient: async (name, email, phone) => {
        const existing = (profile.clients || []).find(c => c.email && c.email === email);
        if (existing) return existing;
        return addClient({ name, email, phone });
    },
    
    addService,
    updateService: (service) => {
        const newServices = (settings.services || []).map(s => s.id === service.id ? service : s);
        updateSettings({ services: newServices });
    },
    deleteService: (serviceId) => {
        const newServices = (settings.services || []).filter(s => s.id !== serviceId);
        updateSettings({ services: newServices });
    },
    addServiceGroup: async (group) => {
        if (!user) throw new Error("User not authenticated");
        const { data, error } = await supabase
          .from('service_groups')
          .insert({
            user_id: user.id,
            name: group.name,
            description: group.description,
            color: group.color,
            parent_id: group.parentId,
            display_order: group.displayOrder || 0,
          })
          .select()
          .single();
        
        if (error) throw error;
        
        // Convert back to application format
        const serviceGroup = {
          id: data.id,
          name: data.name,
          description: data.description,
          color: data.color,
          parentId: data.parent_id,
          displayOrder: data.display_order,
          createdAt: data.created_at,
        };
        
        // Update local state
        setProfile(p => ({
          ...p,
          settings: {
            ...p.settings,
            serviceGroups: [...(p.settings?.serviceGroups || []), serviceGroup]
          }
        }));
        
        return serviceGroup;
    },
    updateServiceGroup: async (group) => {
        if (!user) throw new Error("User not authenticated");
        const { error } = await supabase
          .from('service_groups')
          .update({
            name: group.name,
            description: group.description,
            color: group.color,
            parent_id: group.parentId,
            display_order: group.displayOrder,
          })
          .eq('id', group.id);
        
        if (error) throw error;
        
        // Update local state
        setProfile(p => ({
          ...p,
          settings: {
            ...p.settings,
            serviceGroups: (p.settings?.serviceGroups || []).map(g => g.id === group.id ? group : g)
          }
        }));
    },
    deleteServiceGroup: async (groupId) => {
        if (!user) throw new Error("User not authenticated");
        const { error } = await supabase
          .from('service_groups')
          .delete()
          .eq('id', groupId);
        
        if (error) throw error;
        
        // Update local state
        setProfile(p => ({
          ...p,
          settings: {
            ...p.settings,
            serviceGroups: (p.settings?.serviceGroups || []).filter(g => g.id !== groupId)
          }
        }));
    },
    addHairstylist: async (hairstylist) => {
        if (!user) throw new Error("User not authenticated");
        
        const defaultAvailability: HairstylistAvailability[] = [
            { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isAvailable: true, breaks: [] }, // Monday
            { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isAvailable: true, breaks: [] }, // Tuesday
            { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isAvailable: true, breaks: [] }, // Wednesday
            { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isAvailable: true, breaks: [] }, // Thursday
            { dayOfWeek: 5, startTime: '09:00', endTime: '17:00', isAvailable: true, breaks: [] }, // Friday
            { dayOfWeek: 6, startTime: '10:00', endTime: '16:00', isAvailable: false, breaks: [] }, // Saturday
            { dayOfWeek: 0, startTime: '10:00', endTime: '16:00', isAvailable: false, breaks: [] }, // Sunday
        ];
        
        // Insert hairstylist into database
        const { data: hairstylistData, error } = await supabase
          .from('hairstylists')
          .insert({
            user_id: user.id,
            name: hairstylist.name,
            type: hairstylist.type,
            email: hairstylist.email,
            phone: hairstylist.phone,
            photo_url: hairstylist.photoUrl,
            hire_date: hairstylist.hireDate,
            is_active: hairstylist.isActive !== undefined ? hairstylist.isActive : true,
          })
          .select()
          .single();
        
        if (error) throw error;
        
        // Insert availability records
        const availabilityToInsert = (hairstylist.availability || defaultAvailability).map(avail => ({
          hairstylist_id: hairstylistData.id,
          day_of_week: avail.dayOfWeek,
          start_time: avail.startTime,
          end_time: avail.endTime,
          is_available: avail.isAvailable
        }));
        
        await supabase.from('hairstylist_availability').insert(availabilityToInsert);
        
        // Convert back to application format
        const newStylist: Hairstylist = {
          id: hairstylistData.id,
          name: hairstylistData.name,
          type: hairstylistData.type,
          email: hairstylistData.email,
          phone: hairstylistData.phone,
          photoUrl: hairstylistData.photo_url,
          hireDate: hairstylistData.hire_date,
          serviceIds: hairstylist.serviceIds || [],
          skills: hairstylist.skills || [],
          availability: hairstylist.availability || defaultAvailability,
          timeOff: hairstylist.timeOff || [],
          commissions: hairstylist.commissions || [],
          performance: hairstylist.performance || [],
          isActive: hairstylistData.is_active,
        };
        
        // Update local state
        setProfile(p => ({
          ...p,
          settings: {
            ...p.settings,
            hairstylists: [...(p.settings?.hairstylists || []), newStylist]
          }
        }));
        
        return newStylist;
    },
    updateHairstylist: (hairstylist) => {
        const newStylists = (settings.hairstylists || []).map(h => h.id === hairstylist.id ? hairstylist : h);
        updateSettings({ hairstylists: newStylists });
    },
    deleteHairstylist: (hairstylistId) => {
        const newStylists = (settings.hairstylists || []).filter(h => h.id !== hairstylistId);
        updateSettings({ hairstylists: newStylists });
    },
    updateHairstylistServices: (hairstylistId, serviceIds) => {
        const newStylists = (settings.hairstylists || []).map(h => 
            h.id === hairstylistId ? { ...h, serviceIds } : h
        );
        updateSettings({ hairstylists: newStylists });
    },
    updateHairstylistAvailability: (hairstylistId, availability) => {
        const newStylists = (settings.hairstylists || []).map(h => 
            h.id === hairstylistId ? { ...h, availability } : h
        );
        updateSettings({ hairstylists: newStylists });
    },
    updateHairstylistCommissions: (hairstylistId, commissions) => {
        const newStylists = (settings.hairstylists || []).map(h => 
            h.id === hairstylistId ? { ...h, commissions } : h
        );
        updateSettings({ hairstylists: newStylists });
    },
    addHairstylistSkill: (hairstylistId, skill) => {
        const newSkill = { ...skill, id: `skill_${Date.now()}` };
        const newStylists = (settings.hairstylists || []).map(h => 
            h.id === hairstylistId ? { ...h, skills: [...(h.skills || []), newSkill] } : h
        );
        updateSettings({ hairstylists: newStylists });
    },
    updateHairstylistSkill: (hairstylistId, skill) => {
        const newStylists = (settings.hairstylists || []).map(h => 
            h.id === hairstylistId ? { 
                ...h, 
                skills: (h.skills || []).map(s => s.id === skill.id ? skill : s) 
            } : h
        );
        updateSettings({ hairstylists: newStylists });
    },
    deleteHairstylistSkill: (hairstylistId, skillId) => {
        const newStylists = (settings.hairstylists || []).map(h => 
            h.id === hairstylistId ? { 
                ...h, 
                skills: (h.skills || []).filter(s => s.id !== skillId) 
            } : h
        );
        updateSettings({ hairstylists: newStylists });
    },
    getHairstylistPerformance: (hairstylistId, month) => {
        const hairstylist = (settings.hairstylists || []).find(h => h.id === hairstylistId);
        if (!hairstylist) return null;
        
        if (month) {
            return hairstylist.performance?.find(p => p.month === month) || null;
        }
        
        // Return current month performance or most recent
        const currentMonth = new Date().toISOString().slice(0, 7);
        return hairstylist.performance?.find(p => p.month === currentMonth) || 
               hairstylist.performance?.[hairstylist.performance.length - 1] || null;
    },
    addCustomHairstyle: (style) => {
        const newStyle = { ...style, id: `custom_${Date.now()}`};
        updateSettings({ customHairstyles: [...(settings.customHairstyles || []), newStyle] });
    },
    updateCustomHairstyle: (style) => {
        const newStyles = (settings.customHairstyles || []).map(s => s.id === style.id ? style : s);
        updateSettings({ customHairstyles: newStyles });
    },
    deleteCustomHairstyle: (styleId) => {
        const newStyles = (settings.customHairstyles || []).filter(s => s.id !== styleId);
        updateSettings({ customHairstyles: newStyles });
    },
    addSale: async (sale) => {
        if (!user) throw new Error("User not authenticated");
        
        // Insert sale into database
        const { data: saleData, error } = await supabase
          .from('sales')
          .insert({
            user_id: user.id,
            client_id: sale.clientId,
            hairstylist_id: sale.hairstylistId,
            subtotal: sale.subtotal,
            discount_amount: sale.discount?.amount || 0,
            discount_reason: sale.discount?.reason || null,
            vat_rate: sale.vatRate,
            vat_amount: sale.vatAmount,
            tip: sale.tip,
            total: sale.total,
            payment_method: sale.paymentMethod,
          })
          .select()
          .single();
        
        if (error) throw error;
        
        // Insert sale items
        const saleItemsToInsert = sale.items.map(item => ({
          sale_id: saleData.id,
          item_type: item.type,
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          quantity: 1
        }));
        
        await supabase.from('sale_items').insert(saleItemsToInsert);
        
        // Convert back to application format
        const newSale = {
          id: saleData.id,
          clientId: saleData.client_id,
          hairstylistId: saleData.hairstylist_id,
          items: sale.items,
          subtotal: saleData.subtotal,
          discount: sale.discount,
          vatRate: saleData.vat_rate,
          vatAmount: saleData.vat_amount,
          tip: saleData.tip,
          total: saleData.total,
          paymentMethod: saleData.payment_method,
          createdAt: saleData.created_at,
          isDemo: false,
        };
        
        // Update local state
        setProfile(p => ({
          ...p,
          settings: {
            ...p.settings,
            sales: [...(p.settings?.sales || []), newSale]
          }
        }));
        
        return newSale;
    },
    addProduct: async (product) => {
        if (!user) throw new Error("User not authenticated");
        const { data, error } = await supabase
          .from('products')
          .insert({
            user_id: user.id,
            name: product.name,
            description: product.description,
            price: product.price,
            cost_price: product.costPrice,
            in_stock: product.inStock || 0,
            min_stock: product.minStock || 0,
            category: product.category,
            brand: product.brand,
            sku: product.sku,
            barcode: product.barcode,
            supplier: product.supplier,
            image_url: product.imageUrl,
            is_active: product.isActive !== undefined ? product.isActive : true,
          })
          .select()
          .single();
        
        if (error) throw error;
        
        // Convert back to application format
        const newProduct = {
          id: data.id,
          name: data.name,
          description: data.description,
          price: data.price,
          costPrice: data.cost_price,
          inStock: data.in_stock,
          minStock: data.min_stock,
          category: data.category,
          brand: data.brand,
          sku: data.sku,
          barcode: data.barcode,
          supplier: data.supplier,
          imageUrl: data.image_url,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          isActive: data.is_active,
          isDemo: false,
        };
        
        // Update local state
        setProfile(p => ({
          ...p,
          settings: {
            ...p.settings,
            products: [...(p.settings?.products || []), newProduct]
          }
        }));
        
        return newProduct;
    },
    updateProduct: async (product) => {
        if (!user) throw new Error("User not authenticated");
        const { data, error } = await supabase
          .from('products')
          .update({
            name: product.name,
            description: product.description,
            price: product.price,
            cost_price: product.costPrice,
            in_stock: product.inStock || 0,
            min_stock: product.minStock || 0,
            category: product.category,
            brand: product.brand,
            sku: product.sku,
            barcode: product.barcode,
            supplier: product.supplier,
            image_url: product.imageUrl,
            is_active: product.isActive !== undefined ? product.isActive : true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', product.id)
          .eq('user_id', user.id)
          .select()
          .single();
        
        if (error) throw error;
        
        // Convert back to application format
        const updatedProduct = {
          id: data.id,
          name: data.name,
          description: data.description,
          price: data.price,
          costPrice: data.cost_price,
          inStock: data.in_stock,
          minStock: data.min_stock,
          category: data.category,
          brand: data.brand,
          sku: data.sku,
          barcode: data.barcode,
          supplier: data.supplier,
          imageUrl: data.image_url,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          isActive: data.is_active,
          isDemo: false,
        };
        
        // Update local state
        setProfile(p => ({
          ...p,
          settings: {
            ...p.settings,
            products: (p.settings?.products || []).map(prod => prod.id === updatedProduct.id ? updatedProduct : prod)
          }
        }));
        
        return updatedProduct;
    },
    deleteProduct: async (productId) => {
        if (!user) throw new Error("User not authenticated");
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', productId)
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        // Update local state
        setProfile(p => ({
          ...p,
          settings: {
            ...p.settings,
            products: (p.settings?.products || []).filter(prod => prod.id !== productId)
          }
        }));
    },
    addCoupon: (coupon) => {
        const newCoupon = { ...coupon, id: `coupon_${Date.now()}`};
        updateSettings({ coupons: [...(settings.coupons || []), newCoupon]});
    },
    updateCoupon: (coupon) => {
        const newCoupons = (settings.coupons || []).map(c => c.id === coupon.id ? coupon : c);
        updateSettings({ coupons: newCoupons });
    },
    deleteCoupon: (couponId) => {
        updateSettings({ coupons: (settings.coupons || []).filter(c => c.id !== couponId) });
    },
    addSegment: (segment) => {
        const newSegment = { ...segment, id: `segment_${Date.now()}` };
        updateSettings({ segments: [...(settings.segments || []), newSegment] });
    },
    updateSegment: (segment) => {
        updateSettings({ segments: (settings.segments || []).map(s => s.id === segment.id ? segment : s) });
    },
    deleteSegment: (segmentId) => {
        updateSettings({ segments: (settings.segments || []).filter(s => s.id !== segmentId) });
    },
    getSegmentClients: () => [], // Dummy implementation
    sendCampaign: (campaign) => {
        const newCampaign = { ...campaign, id: `camp_${Date.now()}`, sentAt: new Date().toISOString(), status: 'sent', recipientCount: 0 } as Campaign;
        updateSettings({ campaigns: [...(settings.campaigns || []), newCampaign] });
    },
    connectSocialMedia: (platform, handle) => updateSettings({ socialMedia: {...settings.socialMedia, [platform]: handle } }),
    disconnectSocialMedia: (platform) => updateSettings({ socialMedia: {...settings.socialMedia, [platform]: null } }),
    
    // Sticky notes
    addStickyNote: (noteData) => {
        const newNote = {
            ...noteData,
            id: `note_${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        updateSettings({ stickyNotes: [...(settings.stickyNotes || []), newNote] });
    },
    updateStickyNote: (note) => {
        const updatedNote = { ...note, updatedAt: new Date().toISOString() };
        const newNotes = (settings.stickyNotes || []).map(n => n.id === note.id ? updatedNote : n);
        updateSettings({ stickyNotes: newNotes });
    },
    deleteStickyNote: (noteId) => {
        const newNotes = (settings.stickyNotes || []).filter(n => n.id !== noteId);
        updateSettings({ stickyNotes: newNotes });
    },

    // Onboarding
    completeOnboarding: () => updateSettings({ hasCompletedOnboarding: true }),
    
    // Dummy implementations for legacy components
    users: {},
    setCurrentUser: () => {},
    addUser: () => {},
    
    t: translateFunction,
    updateSettings,
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
