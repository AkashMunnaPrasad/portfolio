export interface ProjectImage {
  id: string;
  project_id: string;
  image_url: string;
  alt_text: string;
  sort_order: number;
  created_at: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  content: string;
  tags: string[];
  image_url: string | null;
  live_url: string;
  repo_url: string;
  featured: boolean;
  published: boolean;
  images: ProjectImage[];
  created_at: string;
  updated_at: string;
}

export interface ProjectCardData {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  tags: string[];
  image_url: string | null;
  live_url: string;
  repo_url: string;
  featured: boolean;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  percent: number;
  level: string;
  icon: string | null;
  sort_order: number;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image: string | null;
  tags: string[];
  published: boolean;
  views: number;
  created_at: string;
  updated_at: string;
}

export interface Experience {
  id: string;
  title: string;
  organization: string;
  location: string;
  start_date: string;
  end_date: string | null;
  current: boolean;
  description: string;
  tags: string[];
  sort_order: number;
  created_at: string;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  location: string;
  start_date: string;
  end_date: string | null;
  current: boolean;
  description: string;
  sort_order: number;
  created_at: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  replied: boolean;
  created_at: string;
}

export interface Subscriber {
  id: string;
  email: string;
  active: boolean;
  created_at: string;
}

export interface Visitor {
  id: string;
  page: string;
  referrer: string;
  device: string;
  city: string;
  region: string;
  country: string;
  ip: string;
  user_agent: string;
  created_at: string;
}

export interface SiteSettings {
  resume_url: string;
  github_url: string;
  linkedin_url: string;
  site_name: string;
  site_description: string;
}

export interface Analytics {
  total: number;
  today: number;
  week: number;
  month: number;
  topPages: { page: string; count: number }[];
  devices: { Mobile: number; Desktop: number };
  topReferrers: { source: string; count: number }[];
  dailyVisits: { date: string; count: number }[];
}

export interface DashboardSummary {
  contacts: number;
  subscribers: number;
  projects: number;
  blogPosts: number;
  experiences: number;
  education: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}
