export interface ConfigSection {
  id: string;
  name: string;
  description?: string;
  settings: Record<string, any>;
}

export interface ConfigHistoryEntry {
  id: string;
  timestamp: string;
  user: string;
  action: 'create' | 'update' | 'delete';
  section: string;
  changes: Record<string, any>;
}

export interface AppConfig {
  environment: string;
  api: {
    url: string;
    timeout: number;
    retries: number;
  };
  database: {
    host: string;
    port: number;
    user: string;
    password: string;
    name: string;
  };
  email: {
    plunkApiKey: string;
    mailjetApiKey: string;
    mailjetSecretKey: string;
    defaultFromEmail: string;
  };
  analytics: {
    umamiWebsiteId: string;
    umamiUrl: string;
    enabled: boolean;
  };
  features: Record<string, boolean>;
}

export const defaultConfig: AppConfig = {
  environment: 'production',
  api: {
    url: 'https://api.example.com',
    timeout: 30000,
    retries: 3,
  },
  database: {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    name: 'myngo_prod',
  },
  email: {
    plunkApiKey: '',
    mailjetApiKey: '',
    mailjetSecretKey: '',
    defaultFromEmail: 'no-reply@example.com',
  },
  analytics: {
    umamiWebsiteId: '',
    umamiUrl: '',
    enabled: false,
  },
  features: {
    darkMode: true,
    multilingualSupport: true,
    notifications: true,
    analytics: false,
    adminDashboard: true,
    userManagement: true,
    emailService: false,
  },
}; 