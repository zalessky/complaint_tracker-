
export type ViewMode = 'dashboard' | 'integration' | 'analytics';

// Statuses based on Color Coded specs: 
// new (Новое), in_work (В работе), clarification_needed (Уточнение), 
// resolved (Решено), measures_taken (Приняты меры), not_confirmed (Не подтвердилось), rejected (Отклонено)
export type TicketStatus = 
  | 'new' 
  | 'in_work' 
  | 'clarification_needed' 
  | 'resolved' 
  | 'measures_taken' 
  | 'not_confirmed' 
  | 'rejected';

export type Priority = 'low' | 'medium' | 'high' | 'critical';

export interface Attachment {
  id: string;
  type: 'image' | 'document';
  url: string;
  name: string;
}

export interface Ticket {
  id: string;
  // User Info
  telegramUserId: string;
  telegramUsername: string;
  contactPhone?: string; 
  
  // Classification
  category: string;    // e.g., "ЖКХ"
  subCategory?: string; // e.g., "Прорыв трубы" (Formerly topic)
  
  // Content
  location?: string; // Address or coordinates
  originalMessage: string; // The text description
  attachments: Attachment[];
  
  // Dynamic fields for specific categories (Transport, etc)
  extraData?: {
    routeNumber?: string;
    vehicleNumber?: string;
    [key: string]: any;
  };

  // Metadata
  createdAt: string; // ISO date string
  status: TicketStatus;
  priority: Priority;
  isDeleted?: boolean;
  
  // Operator interaction
  notes?: string;
  history: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot' | 'operator';
  text: string;
  attachments?: Attachment[];
  timestamp: string;
}

export interface GeminiAnalysisResult {
  summary: string;
  category: string;
  priority: Priority;
  sentiment: 'negative' | 'neutral' | 'positive';
  suggestedResponse: string;
}
