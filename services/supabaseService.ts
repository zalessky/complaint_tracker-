
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Ticket, TicketStatus, ChatMessage, Attachment } from '../types';
import { MOCK_TICKETS } from '../constants';

let supabase: SupabaseClient | null = null;

export const initSupabase = (url: string, key: string) => {
  supabase = createClient(url, key);
};

export const isSupabaseConfigured = () => !!supabase;

export const uploadFile = async (file: File): Promise<string> => {
    if (!supabase) throw new Error("Supabase not configured");
    
    const filename = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
        .from('replies')
        .upload(filename, file);

    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
        .from('replies')
        .getPublicUrl(filename);
        
    return publicUrl;
};

// Map DB row to Frontend Ticket
const mapRowToTicket = (row: any): Ticket => {
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
    attachments: (row.photos || []).map((url: string, idx: number) => ({
        id: `ph-${idx}`,
        type: 'image',
        url: url, 
        name: `Фото ${idx+1}`
    })),
    history: []
  };
};

export const fetchTickets = async (): Promise<Ticket[]> => {
  if (!supabase) throw new Error("Supabase not configured");

  // Only fetch not deleted
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
        attachments: (msg.attachments || []).map((url: string, idx: number) => ({
             id: `att-${idx}`,
             type: 'image',
             url: url,
             name: 'Вложение'
        }))
    }));
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

export const sendOperatorMessage = async (ticketId: string, text: string, attachments: string[] = []) => {
    if (!supabase) throw new Error("Supabase not configured");
    
    // 1. Add message
    await supabase.from('ticket_messages').insert({
        ticket_id: ticketId,
        sender: 'operator',
        message_text: text,
        attachments: attachments
    });

    await supabase.from('complaints').update({ status: 'in_work' }).eq('id', ticketId);
};

export const clearDatabase = async () => {
    if (!supabase) throw new Error("Supabase not configured");
    
    // 1. Clear all complaints (requires RLS disabled)
    const { error } = await supabase.from('complaints').delete().neq('id', '00000000-0000-0000-0000-000000000000'); 
    
    if (error) {
        console.error("Delete failed", error);
        throw new Error(error.message);
    }
};

export const seedDatabase = async () => {
    if (!supabase) throw new Error("Supabase not configured");
    
    // Insert fresh without deleting first (use clearDatabase for that)
    const rows = MOCK_TICKETS.map(t => ({
        user_id: parseInt(t.telegramUserId) || 12345,
        username: t.telegramUsername,
        contact_phone: t.contactPhone,
        category: t.category,
        sub_category: t.subCategory,
        location: t.location,
        description: t.originalMessage,
        extra_data: t.extraData,
        photos: t.attachments.map(a => a.url),
        status: t.status,
        priority: t.priority,
        is_deleted: false,
        created_at: t.createdAt
    }));

    const { error } = await supabase.from('complaints').insert(rows);
    if (error) throw error;
};

export const subscribeToTickets = (callback: (payload: any) => void) => {
    if (!supabase) return;
    return supabase
        .channel('tickets_channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, callback)
        .subscribe();
};
