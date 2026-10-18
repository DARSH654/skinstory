export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  createdAt: number;
  parentId?: string | null;
  childrenIds?: string[];
  versions?: string[];
  activeVersionIndex?: number;
}
