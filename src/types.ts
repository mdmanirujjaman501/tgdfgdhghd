export interface AdminUser {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  role: 'Super Admin' | 'Admin' | 'Editor' | 'Moderator';
  status: 'active' | 'inactive';
  last_login?: string;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  role: 'User' | 'Subscriber' | 'VIP';
  status: 'active' | 'inactive' | 'banned';
  last_login?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  status: 'active' | 'inactive';
  serials_count?: number;
  created_at?: string;
}

export interface Genre {
  id: number;
  name: string;
  slug: string;
  description?: string;
  status: 'active' | 'inactive';
  created_at?: string;
}

export interface Language {
  id: number;
  name: string;
  code: string;
  status: 'active' | 'inactive';
}

export interface Country {
  id: number;
  name: string;
  code: string;
  status: 'active' | 'inactive';
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface Actor {
  id: number;
  name: string;
  slug: string;
  biography?: string;
  avatar?: string;
  birth_date?: string;
  nationality?: string;
  serials_count?: number;
  created_at?: string;
}

export interface SerialCast {
  actor_id: number;
  name: string;
  character_name: string;
  avatar?: string;
  slug?: string;
}

export interface Serial {
  id: number;
  title: string;
  slug: string;
  description?: string;
  short_description?: string;
  poster?: string;
  banner?: string;
  trailer_url?: string;
  release_date?: string;
  language?: string;
  country?: string;
  category_id?: number;
  category_name?: string;
  status: 'published' | 'draft' | 'archived';
  rating: number;
  featured: number;
  views: number;
  downloads: number;
  total_seasons?: number;
  total_episodes?: number;
  created_at?: string;
  updated_at?: string;
  seasons?: Season[];
  cast?: SerialCast[];
}

export interface Season {
  id: number;
  serial_id: number;
  serial_title?: string;
  season_number: number;
  title: string;
  description?: string;
  poster?: string;
  release_date?: string;
  status: 'published' | 'draft';
  total_episodes?: number;
  created_at?: string;
  updated_at?: string;
  episodes?: Episode[];
}

export interface Episode {
  id: number;
  serial_id: number;
  serial_title?: string;
  season_id: number;
  season_number?: number;
  episode_number: number;
  title: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  video_url?: string;
  duration?: string;
  release_date?: string;
  status: 'published' | 'draft';
  featured: number;
  views: number;
  downloads: number;
  media_sources_count?: number;
  created_at?: string;
  updated_at?: string;
  media_sources?: MediaSource[];
}

export interface MediaSource {
  id: number;
  episode_id: number;
  episode_title?: string;
  serial_title?: string;
  type: 'stream' | 'download' | 'mirror';
  quality: string;
  label: string;
  url: string;
  file_size?: string;
  server: string;
  status: 'active' | 'inactive';
  created_at?: string;
}

export interface ApiKey {
  id: number;
  name: string;
  key_value: string;
  rate_limit: number;
  status: 'active' | 'revoked' | 'disabled';
  usage_count: number;
  last_used_at?: string;
  created_at?: string;
}

export interface ActivityLog {
  id: number;
  admin_id?: number;
  admin_name?: string;
  admin_email?: string;
  action: string;
  entity_type: string;
  entity_id?: number;
  description: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface DashboardTotals {
  serials: number;
  episodes: number;
  seasons: number;
  categories: number;
  actors: number;
  views: number;
  downloads: number;
  users: number;
}

export interface DashboardData {
  totals: DashboardTotals;
  recentSerials: Serial[];
  recentEpisodes: Episode[];
  mostViewedSerials: Serial[];
  mostDownloadedSerials: Serial[];
  recentActivity: ActivityLog[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  error?: string;
}
