import type { Client, Appointment, Service, Hairstylist, AppointmentStatus } from '../types';

// Data for generation
const FIRST_NAMES = ['Olivia', 'Liam', 'Emma', 'Noah', 'Amelia', 'Oliver', 'Ava', 'Elijah', 'Sophia', 'Mateo', 'Isabella', 'Lucas', 'Mia', 'Levi', 'Charlotte', 'Asher', 'Luna', 'James', 'Aurora', 'Leo', 'Zoe', 'Caleb', 'Hannah', 'Grayson', 'Nora', 'Julian', 'Scarlett', 'Carter', 'Mila', 'Wyatt'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Lewis', 'Robinson', 'Walker'];
const DOMAINS = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'];
const ADDRESSES = [
    '123 Maple Street, Springfield, IL 62704',
    '456 Oak Avenue, Anytown, USA 12345',
    '789 Pine Lane, Shelbyville, FL 33101',
    '101 Elm Court, Capital City, TX 78701',
    '212 Birch Road, Metropolis, NY 10001',
    '333 Cedar Blvd, Gotham, NJ 07002',
    '444 Spruce Drive, Star City, CA 90210',
    '555 Willow Way, Central City, MO 63101',
    '666 Aspen Circle, Smallville, KS 66601',
    '777 Redwood Parkway, Coast City, WA 98101',
];

// Helper functions
const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
const formatDate = (date: Date): string => date.toISOString().split('T')[0];

export const generateDemoClients = (count: number): Client[] => {
    const clients: Client[] = [];
    const usedNames = new Set<string>();

    while (clients.length < count) {
        const firstName = getRandom(FIRST_NAMES);
        const lastName = getRandom(LAST_NAMES);
        const name = `${firstName} ${lastName}`;

        if (usedNames.has(name)) continue;
        usedNames.add(name);

        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${getRandomInt(1, 99)}@${getRandom(DOMAINS)}`;
        const phone = `(${getRandomInt(200, 999)}) 555-${String(getRandomInt(1000, 9999)).padStart(4, '0')}`;
        
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - getRandomInt(1, 365));

        clients.push({
            id: `demo_client_${Date.now()}_${clients.length}`,
            name,
            email,
            phone,
            photoUrl: `https://i.pravatar.cc/150?u=${email}`,
            address: getRandom(ADDRESSES),
            notes: Math.random() > 0.7 ? 'Prefers morning appointments and is allergic to lavender scents.' : 'Likes to chat during appointments. Favorite topics: movies and travel.',
            createdAt: pastDate.toISOString(),
            isDemo: true,
            consentToShare: Math.random() > 0.5,
        });
    }
    return clients;
};

export const generateDemoAppointments = (count: number, clients: Client[], services: Service[], hairstylists: Hairstylist[]): Appointment[] => {
    if (clients.length === 0 || services.length === 0 || hairstylists.length === 0) return [];
    
    const appointments: Appointment[] = [];
    const statuses: AppointmentStatus[] = ['confirmed', 'confirmed', 'confirmed', 'confirmed', 'confirmed', 'unconfirmed', 'late'];

    for (let i = 0; i < count; i++) {
        const client = getRandom(clients);
        const service = getRandom(services);
        const hairstylist = getRandom(hairstylists);

        const date = new Date();
        date.setDate(date.getDate() - getRandomInt(0, 60)); // Appointments within the last 60 days
        
        const hour = getRandomInt(9, 17); // 9 AM to 5 PM
        const minute = getRandom([0, 15, 30, 45]);
        const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

        appointments.push({
            id: `demo_appt_${Date.now()}_${i}`,
            clientId: client.id,
            date: formatDate(date),
            time,
            serviceId: service.id,
            hairstylistId: hairstylist.id,
            status: getRandom(statuses),
            isDemo: true,
        });
    }
    return appointments;
};