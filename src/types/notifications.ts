
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'news' | 'event' | 'system' | 'mention';
  reference_id?: string;
  read: boolean;
  created_at: string;
}
