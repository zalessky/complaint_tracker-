import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Ticket, TicketStatus, ChatMessage, Attachment, Priority } from '../types';
import { MOCK_TICKETS, CATEGORIES, STATUS_CONFIG } from '../constants';

let supabase: SupabaseClient | null = null;
let BOT_URL = localStorage.getItem('BOT_URL') || '';

export const initSupabase = (url: string, key: string) => {
  supabase = createClient(url, key);
};

export const setBotUrl = (url: string) => {
    BOT_URL = url.replace(/\/$/, ""); // remove trailing slash
    localStorage.setItem('BOT_URL', BOT_URL);
};

export const getBotUrl = () => BOT_URL;

export const isSupabaseConfigured = () => !!supabase;

// Map DB row to Frontend Ticket
const mapRowToTicket = (row: any): Ticket => {
  const mapPhoto = (idOrUrl: string, idx: number) => {
      let url = idOrUrl;
      // If it looks like a file_id (no http), use proxy
      if (url && !url.startsWith('http') && BOT_URL) {
          url = `${BOT_URL}/images/${idOrUrl}`;
      } else if (url && !url.startsWith('http') && !BOT_URL) {
          // Placeholder if Bot URL is missing
          url = `https://placehold.co/600x400?text=Setup+Bot+URL`; 
      }
      return {
        id: `ph-${idx}`,
        type: 'image',
        url: url, 
        name: `Фото ${idx+1}`
      };
  };

  return {
    id: row.id,
    telegramUserId: row.user_id?.toString() || 'Unknown',
    telegramUsername: row.username || 'Anonymous',
    contactPhone: row.contact_phone || '', 
    category: row.category || 'Прочее',
    subCategory: row.sub_category || 'Общее',
    location: row.location,
    originalMessage: row.description || '',
    extraData: row.extra_data,
    status: (row.status as TicketStatus) || 'new',
    priority: row.priority || 'medium',
    isDeleted: row.is_deleted || false,
    createdAt: row.created_at,
    attachments: (row.photos || []).map(mapPhoto),
    history: []
  };
};

export const fetchTickets = async (): Promise<Ticket[]> => {
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase
    .from('complaints')
    .select('*')
    .eq('is_deleted', false) 
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data.map(mapRowToTicket);
};

export const fetchTicketHistory = async (ticketId: string): Promise<ChatMessage[]> => {
    if (!supabase) throw new Error("Supabase not configured");

    const { data, error } = await supabase
        .from('ticket_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });
    
    if (error) throw error;

    return data.map((msg: any) => ({
        id: msg.id,
        sender: msg.sender,
        text: msg.message_text,
        timestamp: msg.created_at,
        attachments: (msg.attachments || []).map((idOrUrl: string, idx: number) => {
             let url = idOrUrl;
             if (url && !url.startsWith('http') && BOT_URL) {
                 url = `${BOT_URL}/images/${idOrUrl}`;
             }
             return {
                 id: `att-${idx}`,
                 type: 'image',
                 url: url,
                 name: 'Вложение'
             };
        })
    }));
};

export const sendReplyViaBot = async (ticketId: string, text: string, file?: File) => {
    if (!BOT_URL) throw new Error("Bot URL not configured in Integration settings");
    
    const formData = new FormData();
    formData.append('ticket_id', ticketId);
    formData.append('text', text);
    if (file) {
        formData.append('file', file);
    }
    
    const response = await fetch(`${BOT_URL}/api/reply`, {
        method: 'POST',
        body: formData
    });
    
    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Bot API Error: ${err}`);
    }
};

export const updateTicketStatus = async (id: string, status: string) => {
  if (!supabase) throw new Error("Supabase not configured");
  return await supabase.from('complaints').update({ status }).eq('id', id);
};

export const updateTicketPriority = async (id: string, priority: string) => {
    if (!supabase) throw new Error("Supabase not configured");
    return await supabase.from('complaints').update({ priority }).eq('id', id);
};

export const softDeleteTicket = async (id: string) => {
    if (!supabase) throw new Error("Supabase not configured");
    return await supabase.from('complaints').update({ is_deleted: true }).eq('id', id);
};

export const clearDatabase = async () => {
    if (!supabase) throw new Error("Supabase not configured");
    // Delete messages first to satisfy FK
    await supabase.from('ticket_messages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    // Then complaints
    const { error } = await supabase.from('complaints').delete().neq('id', '00000000-0000-0000-0000-000000000000'); 
    if (error) throw new Error(error.message);
};

// --- MASSIVE SEEDER (50+) ---
const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const uuidv4 = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
});

export const seedDatabase = async () => {
    if (!supabase) throw new Error("Supabase not configured");
    
    await clearDatabase(); // Wipe clean first

    const USERNAMES = ["@ivan_citizen", "@anna_engels", "@driver_164", "@mom_of_3", "@active_resident", "@sergey_k", "@olga_v", "@zkh_hater", "@love_engels", "@angry_bird", "@city_watcher", "@taxi_driver", "@student_sgu"];
    const CAT_KEYS = Object.keys(CATEGORIES).filter(k => k !== 'feedback' && k !== 'gratitude');

    const MOCK_DATA: any[] = [];
    const MESSAGES_DATA: any[] = [];

    // Engels Coordinates Bounding Box (Approx)
    const LAT_MIN = 51.45, LAT_MAX = 51.52;
    const LON_MIN = 46.08, LON_MAX = 46.15;

    // Generate 50 tickets
    for (let i = 0; i < 50; i++) {
        const catKey = getRandomElement(CAT_KEYS) as keyof typeof CATEGORIES;
        const cat = CATEGORIES[catKey];
        const sub = getRandomElement(cat.subs);
        const status = getRandomElement(Object.keys(STATUS_CONFIG));
        const priority = getRandomElement(['low', 'medium', 'high', 'critical']);
        const ticketId = uuidv4();
        
        // Random Coordinate in Engels
        const lat = (Math.random() * (LAT_MAX - LAT_MIN) + LAT_MIN).toFixed(6);
        const lon = (Math.random() * (LON_MAX - LON_MIN) + LON_MIN).toFixed(6);
        const location = `${lat},${lon}`; // Format compatible with Yandex Map logic

        // Picsum Image Seed (Unique per ticket)
        const imgUrl = `https://picsum.photos/seed/${ticketId}/800/600`;

        const complaint = {
            id: ticketId,
            user_id: 100000 + i,
            username: getRandomElement(USERNAMES),
            contact_phone: `+79${Math.floor(100000000 + Math.random() * 900000000)}`,
            category: cat.name,
            sub_category: sub,
            location: location,
            description: `Автоматическая заявка №${i+1}. Обнаружена проблема: ${sub}. Прошу принять меры в кратчайшие сроки.`,
            extra_data: catKey === 'transport' ? { routeNumber: `${Math.floor(Math.random()*100)}`, vehicleNumber: 'А000АА164' } : null,
            photos: [imgUrl],
            status: status,
            priority: priority,
            is_deleted: false,
            created_at: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30).toISOString()
        };
        MOCK_DATA.push(complaint);

        // Generate History
        if (status !== 'new') {
            MESSAGES_DATA.push({
                ticket_id: ticketId,
                sender: 'operator',
                message_text: 'Здравствуйте. Ваша заявка принята в работу.',
                attachments: [],
                is_sent_to_telegram: true,
                created_at: new Date(Date.now() - Math.random() * 1000000).toISOString()
            });

            if (status === 'resolved') {
                 MESSAGES_DATA.push({
                    ticket_id: ticketId,
                    sender: 'operator',
                    message_text: 'Работы выполнены в полном объеме. Спасибо за обращение.',
                    attachments: [`https://picsum.photos/seed/${ticketId}_done/800/600`],
                    is_sent_to_telegram: true,
                    created_at: new Date().toISOString()
                });
            }
        }
    }

    const { error } = await supabase.from('complaints').insert(MOCK_DATA);
    if (error) throw error;

    if (MESSAGES_DATA.length > 0) {
        const { error: msgError } = await supabase.from('ticket_messages').insert(MESSAGES_DATA);
        if (msgError) throw msgError;
    }
};

export const subscribeToTickets = (callback: (payload: any) => void) => {
    if (!supabase) return;
    return supabase
        .channel('tickets_channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, callback)
        .subscribe();
};