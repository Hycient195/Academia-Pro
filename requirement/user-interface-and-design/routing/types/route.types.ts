// Academia Pro - Route Type Definitions
// TypeScript interfaces for routing configuration

export interface RouteMeta {
  /** Whether authentication is required */
  requiresAuth?: boolean;
  /** Allowed user roles for this route */
  roles?: string[];
  /** Route title for navigation and SEO */
  title?: string;
  /** Route description for SEO */
  description?: string;
  /** Icon name for navigation */
  icon?: string;
  /** Menu order for navigation sorting */
  menuOrder?: number;
  /** Module identifier */
  module?: string;
  /** Feature flag requirement */
  feature?: string;
  /** Whether to hide from navigation */
  hideNavigation?: boolean;
  /** Breadcrumb label */
  breadcrumb?: string;
  /** SEO keywords */
  keywords?: string[];
  /** Cache strategy */
  cache?: 'none' | 'memory' | 'persistent';
  /** Loading strategy */
  loading?: 'eager' | 'lazy';
}

export interface RouteConfig {
  /** Route path */
  path: string;
  /** Component name to render */
  component: string;
  /** Route title */
  title: string;
  /** Layout to use */
  layout?: 'main' | 'auth' | 'blank';
  /** Whether route is public (no auth required) */
  public?: boolean;
  /** Route metadata */
  meta?: RouteMeta;
  /** Child routes */
  children?: RouteConfig[];
  /** Route guards */
  guards?: string[];
  /** Redirect configuration */
  redirect?: string;
  /** Route parameters */
  params?: Record<string, any>;
}

export interface NavigationItem {
  /** Navigation path */
  path: string;
  /** Display title */
  title: string;
  /** Icon name */
  icon?: string;
  /** Child navigation items */
  children?: NavigationItem[];
  /** Whether item is active */
  active?: boolean;
  /** Badge count */
  badge?: number;
  /** External link flag */
  external?: boolean;
}

export interface BreadcrumbItem {
  /** Breadcrumb path */
  path: string;
  /** Display title */
  title: string;
  /** Icon name */
  icon?: string;
  /** Whether it's the current page */
  current?: boolean;
}

export interface RouteState {
  /** Current route path */
  currentPath: string;
  /** Previous route path */
  previousPath?: string;
  /** Route parameters */
  params: Record<string, any>;
  /** Query parameters */
  query: Record<string, any>;
  /** Route meta information */
  meta?: RouteMeta;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error?: string;
}

export interface RouteGuard {
  /** Guard name */
  name: string;
  /** Guard function */
  guard: (route: RouteConfig, context: any) => string | null;
  /** Guard priority */
  priority?: number;
}

export interface RouteHistory {
  /** Navigation history */
  history: string[];
  /** Current history index */
  currentIndex: number;
  /** Maximum history size */
  maxSize: number;
}

// Route Context Types
export interface RouteContext {
  /** Current user information */
  user?: {
    id: string;
    role: string;
    schoolId?: string;
    permissions: string[];
  };
  /** Application features */
  features: string[];
  /** Device information */
  device: {
    type: 'mobile' | 'tablet' | 'desktop';
    orientation: 'portrait' | 'landscape';
  };
  /** Network status */
  network: {
    online: boolean;
    type: 'wifi' | 'cellular' | 'ethernet' | 'unknown';
  };
}

// Route Validation Types
export interface RouteValidation {
  /** Path validation */
  path: (path: string) => boolean;
  /** Component validation */
  component: (component: string) => boolean;
  /** Meta validation */
  meta: (meta: RouteMeta) => boolean;
  /** Role validation */
  roles: (roles: string[], userRoles: string[]) => boolean;
}

// Route Performance Types
export interface RoutePerformance {
  /** Route load time */
  loadTime: number;
  /** Component render time */
  renderTime: number;
  /** Data fetch time */
  fetchTime: number;
  /** Cache hit rate */
  cacheHitRate: number;
}

// Route Analytics Types
export interface RouteAnalytics {
  /** Page views */
  pageViews: number;
  /** Unique visitors */
  uniqueVisitors: number;
  /** Bounce rate */
  bounceRate: number;
  /** Average session duration */
  avgSessionDuration: number;
  /** Popular routes */
  popularRoutes: Array<{
    path: string;
    views: number;
    avgTime: number;
  }>;
}

// Route Security Types
export interface RouteSecurity {
  /** Authentication required */
  requiresAuth: boolean;
  /** Allowed roles */
  allowedRoles: string[];
  /** Required permissions */
  requiredPermissions: string[];
  /** Security level */
  securityLevel: 'public' | 'internal' | 'restricted' | 'confidential';
  /** Data classification */
  dataClassification: 'public' | 'internal' | 'confidential' | 'restricted';
}

// Route Configuration Types
export interface RouteConfiguration {
  /** Base path for the application */
  basePath: string;
  /** Default layout */
  defaultLayout: string;
  /** Default meta configuration */
  defaultMeta: Partial<RouteMeta>;
  /** Route guards */
  guards: RouteGuard[];
  /** Route validations */
  validations: RouteValidation;
  /** Performance settings */
  performance: {
    /** Enable route preloading */
    preloading: boolean;
    /** Cache strategy */
    caching: 'none' | 'memory' | 'persistent';
    /** Lazy loading */
    lazyLoading: boolean;
  };
  /** Security settings */
  security: {
    /** Enable CSRF protection */
    csrf: boolean;
    /** Enable XSS protection */
    xss: boolean;
    /** Content Security Policy */
    csp: boolean;
  };
}

// Export utility types
export type RoutePath = string;
export type RouteComponent = string;
export type RouteLayout = 'main' | 'auth' | 'blank';
export type IUserPermissionRole = 'super-admin' | 'school-admin' | 'staff' | 'student' | 'parent';
export type SecurityLevel = 'public' | 'internal' | 'restricted' | 'confidential';
export type CacheStrategy = 'none' | 'memory' | 'persistent';
export type LoadingStrategy = 'eager' | 'lazy';