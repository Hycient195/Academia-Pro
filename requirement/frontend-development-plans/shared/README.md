# Shared Components Development Plan

## Overview
The Shared Components module provides reusable UI components, utilities, and configurations that are used across all dashboard types in the Academia Pro frontend application.

## Purpose
- **Code Reusability**: Eliminate code duplication across dashboards
- **Consistency**: Ensure uniform design and behavior across all interfaces
- **Maintainability**: Centralized component updates and bug fixes
- **Scalability**: Easy extension and customization for different use cases

## Component Categories

### 1. Layout Components
**Purpose**: Provide consistent page structure and navigation across all dashboards

#### Components:
- **AppLayout**: Main application wrapper with header, sidebar, and content area
- **HeaderBar**: Top navigation with user menu, notifications, and search
- **SidebarNavigation**: Role-based navigation menu with icons and labels
- **BreadcrumbNavigation**: Page hierarchy and navigation context
- **Footer**: Application footer with links and information

### 2. Data Display Components
**Purpose**: Standardized data presentation for tables, cards, and visualizations

#### Components:
- **DataTable**: Enhanced table with sorting, filtering, and pagination
- **MetricCard**: KPI display cards with icons and trend indicators
- **InfoCard**: Information display cards with various layouts
- **ProgressCard**: Progress tracking and visualization cards
- **ChartCard**: Chart containers with loading states and error handling

### 3. Form Components
**Purpose**: Consistent form handling and validation across all dashboards

#### Components:
- **FormField**: Standardized form input fields with validation
- **FormSection**: Form section containers with titles and descriptions
- **FormActions**: Form action buttons (Save, Cancel, Delete)
- **FileUpload**: File upload component with drag-and-drop support
- **DatePicker**: Enhanced date picker with presets and validation

### 4. Feedback Components
**Purpose**: User feedback and status communication

#### Components:
- **LoadingSpinner**: Loading indicators with different sizes
- **EmptyState**: Empty state displays with actions
- **ErrorBoundary**: Error handling and fallback UI
- **ToastNotification**: Toast messages for user feedback
- **ModalDialog**: Modal dialogs for confirmations and forms

### 5. Navigation Components
**Purpose**: Consistent navigation patterns across dashboards

#### Components:
- **TabNavigation**: Tab-based navigation within pages
- **Pagination**: Data pagination with page size controls
- **SearchBar**: Global search with filters and suggestions
- **FilterPanel**: Advanced filtering interface
- **ActionMenu**: Context menus and dropdown actions

### 6. Educational Components
**Purpose**: Education-specific components used across dashboards

#### Components:
- **GradeDisplay**: Grade visualization with color coding
- **AttendanceChart**: Attendance tracking visualization
- **ProgressChart**: Academic progress visualization
- **AssignmentCard**: Assignment display with status indicators
- **TimetableGrid**: Class schedule display
- **AchievementBadge**: Achievement and certification display

## Technical Implementation

### Component Architecture
```typescript
// Base component structure
src/components/shared/
├── layouts/
│   ├── AppLayout/
│   │   ├── AppLayout.tsx
│   │   ├── AppLayout.test.tsx
│   │   └── index.ts
│   ├── HeaderBar/
│   ├── SidebarNavigation/
│   └── BreadcrumbNavigation/
├── data-display/
│   ├── DataTable/
│   ├── MetricCard/
│   ├── InfoCard/
│   └── ProgressCard/
├── forms/
│   ├── FormField/
│   ├── FormSection/
│   ├── FormActions/
│   └── FileUpload/
├── feedback/
│   ├── LoadingSpinner/
│   ├── EmptyState/
│   ├── ErrorBoundary/
│   └── ToastNotification/
├── navigation/
│   ├── TabNavigation/
│   ├── Pagination/
│   ├── SearchBar/
│   └── FilterPanel/
└── educational/
    ├── GradeDisplay/
    ├── AttendanceChart/
    ├── ProgressChart/
    ├── AssignmentCard/
    ├── TimetableGrid/
    └── AchievementBadge/
```

### Component Base Classes
```typescript
// Base component with common functionality
export interface BaseComponentProps {
  className?: string;
  style?: React.CSSProperties;
  'data-testid'?: string;
}

export interface DataComponentProps<T = any> extends BaseComponentProps {
  data: T;
  loading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

export interface FormComponentProps extends BaseComponentProps {
  disabled?: boolean;
  required?: boolean;
  error?: string;
  helperText?: string;
}
```

### Theme Integration
```typescript
// Theme-aware component styling
import { useTheme } from '../../hooks/useTheme';
import { colors } from '../../theme/colors';

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  trend,
  color = 'primary',
  ...props
}) => {
  const theme = useTheme();

  return (
    <Card
      className={cn(
        'metric-card',
        `metric-card--${color}`,
        theme.mode === 'dark' && 'metric-card--dark'
      )}
      style={{
        borderColor: colors[color][300],
        backgroundColor: theme.mode === 'dark' ? colors.neutral[800] : colors.neutral[50]
      }}
      {...props}
    >
      {/* Component content */}
    </Card>
  );
};
```

## Shared Utilities and Hooks

### Custom Hooks
```typescript
// src/hooks/
├── useAuth.ts              // Authentication state management
├── useTheme.ts             // Theme switching and preferences
├── useLocalStorage.ts      // Local storage with serialization
├── useDebounce.ts          // Debounced values for search
├── usePagination.ts        // Pagination logic
├── useTableFilters.ts      // Table filtering and sorting
├── useFormValidation.ts    // Form validation utilities
├── useApiError.ts          // API error handling
└── usePermissions.ts       // Permission checking
```

### Utility Functions
```typescript
// src/utils/
├── formatters/
│   ├── date.ts             // Date formatting utilities
│   ├── number.ts           // Number formatting utilities
│   ├── grade.ts            // Grade formatting utilities
│   └── currency.ts         // Currency formatting utilities
├── validators/
│   ├── email.ts            // Email validation
│   ├── password.ts         // Password validation
│   ├── grade.ts            // Grade validation
│   └── file.ts             // File validation
├── constants/
│   ├── routes.ts           // Application routes
│   ├── permissions.ts      // Permission constants
│   ├── grades.ts           // Grade level constants
│   └── subjects.ts         // Subject constants
└── helpers/
    ├── array.ts            // Array manipulation utilities
    ├── object.ts           // Object manipulation utilities
    ├── string.ts           // String manipulation utilities
    └── async.ts            // Async operation utilities
```

## Design System Integration

### Color System
```typescript
// src/theme/colors.ts
export const themeColors = {
  primary: colors.primary,
  secondary: colors.secondary,
  success: colors.success,
  warning: colors.warning,
  error: colors.error,
  info: colors.info,
  neutral: colors.neutral,

  // Role-based colors
  roles: {
    superAdmin: colors.education.superAdmin,
    schoolAdmin: colors.education.schoolAdmin,
    teacher: colors.education.teacher,
    student: colors.education.student,
    parent: colors.education.parent,
  },

  // Status colors
  status: colors.status,

  // Chart colors
  chart: colors.chart,
};
```

### Typography System
```typescript
// src/theme/typography.ts
export const typography = {
  fontFamily: {
    primary: 'Inter, system-ui, sans-serif',
    secondary: 'Inter, system-ui, sans-serif',
  },

  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
  },

  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};
```

### Spacing System
```typescript
// src/theme/spacing.ts
export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
};
```

## Component Development Guidelines

### 1. Component Structure
```typescript
// Standard component structure
interface ComponentNameProps extends BaseComponentProps {
  // Component-specific props
}

export const ComponentName: React.FC<ComponentNameProps> = ({
  className,
  style,
  'data-testid': testId,
  ...props
}) => {
  return (
    <div
      className={cn('component-name', className)}
      style={style}
      data-testid={testId || 'component-name'}
    >
      {/* Component content */}
    </div>
  );
};

ComponentName.displayName = 'ComponentName';
```

### 2. Error Handling
```typescript
// Error boundary for components
export class ComponentErrorBoundary extends React.Component<
  ComponentErrorBoundaryProps,
  ComponentErrorBoundaryState
> {
  constructor(props: ComponentErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ComponentErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service
    console.error('Component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          onRetry={() => this.setState({ hasError: false, error: null })}
        />
      );
    }

    return this.props.children;
  }
}
```

### 3. Accessibility
```typescript
// Accessible component with ARIA support
export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  children,
  onClick,
  disabled,
  loading,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...props
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-disabled={disabled || loading}
      {...props}
    >
      {loading ? <LoadingSpinner size="sm" /> : children}
    </button>
  );
};
```

### 4. Testing
```typescript
// Component test structure
import { render, screen, fireEvent } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName />);
    expect(screen.getByTestId('component-name')).toBeInTheDocument();
  });

  it('handles user interactions', () => {
    const handleClick = jest.fn();
    render(<ComponentName onClick={handleClick} />);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('supports accessibility', () => {
    render(<ComponentName aria-label="Test button" />);
    expect(screen.getByLabelText('Test button')).toBeInTheDocument();
  });
});
```

## Development Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Set up component library structure
- [ ] Create base component classes and interfaces
- [ ] Implement theme system integration
- [ ] Build utility functions and hooks
- [ ] Set up testing infrastructure

### Phase 2: Core Components (Week 3-4)
- [ ] Develop layout components (AppLayout, HeaderBar, Sidebar)
- [ ] Create data display components (DataTable, MetricCard)
- [ ] Build form components (FormField, FormActions)
- [ ] Implement feedback components (LoadingSpinner, EmptyState)

### Phase 3: Navigation Components (Week 5-6)
- [ ] Build navigation components (TabNavigation, Pagination)
- [ ] Create search and filter components
- [ ] Implement breadcrumb navigation
- [ ] Add action menus and dropdowns

### Phase 4: Educational Components (Week 7-8)
- [ ] Develop grade display components
- [ ] Create attendance and progress charts
- [ ] Build assignment and timetable components
- [ ] Implement achievement and badge components

### Phase 5: Advanced Features (Week 9-10)
- [ ] Add error boundaries and error handling
- [ ] Implement accessibility features
- [ ] Create responsive design utilities
- [ ] Build component documentation

### Phase 6: Integration & Testing (Week 11-12)
- [ ] Integrate components across all dashboards
- [ ] Comprehensive testing and bug fixes
- [ ] Performance optimization
- [ ] Documentation and examples

## Key Component Implementations

### MetricCard Component
```tsx
// src/components/shared/data-display/MetricCard/MetricCard.tsx
import React from 'react';
import { Card, Statistic, Skeleton } from 'antd';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { colors } from '../../../theme/colors';

export interface MetricCardProps extends BaseComponentProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label?: string;
    direction: 'up' | 'down' | 'neutral';
  };
  color?: keyof typeof colors;
  loading?: boolean;
  size?: 'small' | 'default' | 'large';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  trend,
  color = 'primary',
  loading = false,
  size = 'default',
  className,
  ...props
}) => {
  if (loading) {
    return (
      <Card className={cn('metric-card', className)} {...props}>
        <Skeleton active />
      </Card>
    );
  }

  const trendIcon = trend?.direction === 'up' ? TrendingUp :
                   trend?.direction === 'down' ? TrendingDown : Minus;

  const trendColor = trend?.direction === 'up' ? colors.success[500] :
                    trend?.direction === 'down' ? colors.error[500] :
                    colors.neutral[500];

  return (
    <Card
      className={cn(
        'metric-card',
        `metric-card--${size}`,
        `metric-card--${color}`,
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Statistic
            title={title}
            value={value}
            valueStyle={{
              color: colors[color][600],
              fontSize: size === 'large' ? '2rem' : size === 'small' ? '1.25rem' : '1.5rem'
            }}
          />
          {trend && (
            <div className="flex items-center mt-2 text-sm">
              <trendIcon
                size={16}
                style={{ color: trendColor }}
                className="mr-1"
              />
              <span style={{ color: trendColor }}>
                {trend.value > 0 ? '+' : ''}{trend.value}
                {trend.label && ` ${trend.label}`}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div
            className="metric-card__icon"
            style={{ color: colors[color][500] }}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

MetricCard.displayName = 'MetricCard';
```

### DataTable Component
```tsx
// src/components/shared/data-display/DataTable/DataTable.tsx
import React, { useState, useMemo } from 'react';
import { Table, Input, Select, Button, Space, Dropdown } from 'antd';
import { SearchOutlined, FilterOutlined, DownloadOutlined } from '@ant-design/icons';
import { useDebounce } from '../../../hooks/useDebounce';
import { cn } from '../../../lib/utils';

export interface DataTableProps<T = any> extends BaseComponentProps {
  data: T[];
  columns: any[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  searchable?: boolean;
  filterable?: boolean;
  exportable?: boolean;
  onSearch?: (query: string) => void;
  onFilter?: (filters: Record<string, any>) => void;
  onExport?: (format: 'csv' | 'excel' | 'pdf') => void;
  emptyText?: string;
  rowKey?: string | ((record: T) => string);
}

export const DataTable = <T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  pagination,
  searchable = false,
  filterable = false,
  exportable = false,
  onSearch,
  onFilter,
  onExport,
  emptyText = 'No data available',
  rowKey = 'id',
  className,
  ...props
}: DataTableProps<T>) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Apply search and filters
  const filteredData = useMemo(() => {
    let filtered = data;

    if (debouncedSearchQuery && onSearch) {
      onSearch(debouncedSearchQuery);
    }

    if (Object.keys(filters).length > 0 && onFilter) {
      onFilter(filters);
    }

    return filtered;
  }, [data, debouncedSearchQuery, filters, onSearch, onFilter]);

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    onExport?.(format);
  };

  const exportMenu = {
    items: [
      { key: 'csv', label: 'Export as CSV', onClick: () => handleExport('csv') },
      { key: 'excel', label: 'Export as Excel', onClick: () => handleExport('excel') },
      { key: 'pdf', label: 'Export as PDF', onClick: () => handleExport('pdf') },
    ],
  };

  return (
    <div className={cn('data-table-container', className)} {...props}>
      {/* Table Controls */}
      {(searchable || filterable || exportable) && (
        <div className="flex justify-between items-center mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-4">
            {searchable && (
              <Input
                placeholder="Search..."
                prefix={<SearchOutlined />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: 250 }}
              />
            )}
            {filterable && (
              <Button icon={<FilterOutlined />}>
                Filters
              </Button>
            )}
          </div>
          {exportable && (
            <Dropdown menu={exportMenu} trigger={['click']}>
              <Button icon={<DownloadOutlined />}>
                Export
              </Button>
            </Dropdown>
          )}
        </div>
      )}

      {/* Data Table */}
      <Table
        columns={columns}
        dataSource={filteredData}
        loading={loading}
        pagination={pagination ? {
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
        } : false}
        rowKey={rowKey}
        locale={{
          emptyText,
        }}
        size="middle"
        scroll={{ x: 800 }}
      />
    </div>
  );
};

DataTable.displayName = 'DataTable';
```

## Testing Strategy

### Unit Tests
```typescript
// src/components/shared/data-display/MetricCard/__tests__/MetricCard.test.tsx
import { render, screen } from '@testing-library/react';
import { MetricCard } from '../MetricCard';

describe('MetricCard', () => {
  it('renders title and value correctly', () => {
    render(<MetricCard title="Test Metric" value="42" />);
    expect(screen.getByText('Test Metric')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('displays trend indicator when provided', () => {
    render(
      <MetricCard
        title="Test Metric"
        value="42"
        trend={{ value: 5, direction: 'up', label: '%' }}
      />
    );
    expect(screen.getByText('+5 %')).toBeInTheDocument();
  });

  it('shows loading skeleton when loading', () => {
    render(<MetricCard title="Test Metric" value="42" loading />);
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });
});
```

### Integration Tests
- Component integration across dashboards
- Theme switching functionality
- Responsive design testing
- Accessibility compliance testing

## Performance Optimization

### Code Splitting
- Lazy load heavy components
- Split vendor chunks
- Dynamic imports for optional features

### Bundle Optimization
- Tree shaking unused exports
- Component memoization
- Efficient re-rendering with React.memo

### Runtime Performance
- Virtual scrolling for large datasets
- Debounced search inputs
- Optimized API calls
- Efficient state updates

## Accessibility Compliance

### WCAG 2.1 AA Standards
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management
- Semantic HTML usage
- ARIA attributes implementation

## Deployment Considerations

### Build Optimization
- Component library extraction
- CSS optimization with Tailwind
- Font and icon optimization
- Image optimization

### CDN Integration
- Static asset delivery
- Component library caching
- Global CDN distribution

This shared components development plan provides a solid foundation for building consistent, reusable, and maintainable UI components across all Academia Pro dashboards.