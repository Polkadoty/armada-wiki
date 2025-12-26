// Database types for Supabase tables

export interface BugReport {
  id: string;
  title: string;
  description: string;
  steps_to_reproduce?: string;
  expected_behavior?: string;
  actual_behavior?: string;
  page_url?: string;
  contact_email?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  card_type: 'ship' | 'squadron' | 'upgrade' | 'objective';
  card_id: string;
  author_name: string;
  author_email?: string;
  content: string;
  parent_id?: string;
  upvotes: number;
  downvotes: number;
  is_pinned: boolean;
  is_moderated: boolean;
  moderation_reason?: string;
  created_at: string;
  updated_at: string;
}

export type NewBugReport = Omit<BugReport, 'id' | 'created_at' | 'updated_at' | 'status'>;
export type NewComment = Omit<Comment, 'id' | 'created_at' | 'updated_at' | 'upvotes' | 'downvotes' | 'is_pinned' | 'is_moderated'>;
