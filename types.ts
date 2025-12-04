export type ViewMode = 'dashboard' | 'integration' | 'analytics' | 'staff' | 'map' | 'knowledge' | 'mail';

// Statuses based on Color Coded specs
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

export interface AnalyticsMetric {
    label: string;
    value: string | number;
    subtext?: string;
    trend?: string;
    trendType?: 'positive' | 'negative' | 'neutral';
    icon?: any;
    color?: string;
}

export interface GeminiAnalysisResult {
    summary: string;
    category: string;
    priority: Priority;
    sentiment: 'negative' | 'neutral' | 'positive';
    suggestedResponse: string;
}