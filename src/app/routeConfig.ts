export const APP_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  
  PORTFOLIO: {
    LIST: '/portfolio',
    CREATE: '/portfolio/new',
    DETAIL: (code: string) => `/portfolio/${code}`,
    EDIT: (code: string) => `/portfolio/${code}/edit`,
  },

  PROJECTS: {
    LIST: '/products',
    CREATE: '/products/new',
    DETAIL: (code: string) => `/products/${code}`,
    EDIT: (code: string) => `/products/${code}/edit`,
  },

  CLIENTS: {
    LIST: '/clients',
    CREATE: '/clients/new',
    DETAIL: (code: string) => `/clients/${code}`,
    EDIT: (code: string) => `/clients/${code}/edit`,
  },

  DATASHEETS: {
    LIST: '/datasheets',
    CREATE: '/datasheets/new',
    DETAIL: (id: string) => `/datasheets/${id}`,
    EDIT: (id: string) => `/datasheets/${id}/edit`,
  },

  USERS: {
    LIST: '/users',
    DETAIL: (id: string) => `/users/${id}`,
    EDIT: (id: string) => `/users/${id}/edit`,
  },

  CATALOG_MANAGEMENT: {
    LIST: '/catalog-management',
  }
};
