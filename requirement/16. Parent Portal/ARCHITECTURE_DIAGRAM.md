# Parent Portal Architecture Diagram

## System Architecture Overview

```mermaid
graph TB
    subgraph "Client Layer"
        Web[Web Application]
        Mobile[Mobile App]
        API[API Gateway]
    end

    subgraph "API Layer"
        PP[Parent Portal API]
        Auth[Authentication API]
        Academic[Academic API]
        Student[Student API]
    end

    subgraph "Service Layer"
        PPService[Parent Portal Service]
        AuthService[Auth Service]
        AcademicService[Academic Service]
        StudentService[Student Service]
        CommunicationService[Communication Service]
        FeeService[Fee Service]
        TransportService[Transportation Service]
    end

    subgraph "Data Layer"
        Postgres[(PostgreSQL)]
        Redis[(Redis Cache)]
    end

    Web --> API
    Mobile --> API
    API --> PP
    API --> Auth
    API --> Academic
    API --> Student

    PP --> PPService
    PP --> AuthService
    PP --> AcademicService
    PP --> StudentService
    PP --> CommunicationService
    PP --> FeeService
    PP --> TransportService

    PPService --> Postgres
    AcademicService --> Postgres
    StudentService --> Postgres
    CommunicationService --> Postgres
    FeeService --> Postgres
    TransportService --> Postgres

    PPService --> Redis
    AcademicService --> Redis
    StudentService --> Redis
```

## Module Structure

```mermaid
graph TD
    PPModule[Parent Portal Module]
    PPModule --> Controllers
    PPModule --> Services
    PPModule --> Entities
    PPModule --> DTOs
    PPModule --> Guards

    Controllers --> DashboardCtrl[Dashboard Controller]
    Controllers --> AcademicCtrl[Academic Controller]
    Controllers --> CommCtrl[Communication Controller]
    Controllers --> ApptCtrl[Appointment Controller]
    Controllers --> FeeCtrl[Fee Controller]
    Controllers --> TransportCtrl[Transportation Controller]
    Controllers --> ResourceCtrl[Resource Controller]

    Services --> DashboardSvc[Dashboard Service]
    Services --> AcademicSvc[Academic Service]
    Services --> CommSvc[Communication Service]
    Services --> ApptSvc[Appointment Service]
    Services --> FeeSvc[Fee Service]
    Services --> TransportSvc[Transportation Service]
    Services --> ResourceSvc[Resource Service]

    Entities --> ParentEntity[Parent Entity]
    Entities --> CommEntity[Communication Entity]
    Entities --> ApptEntity[Appointment Entity]
    Entities --> FeeEntity[Fee Entity]
    Entities --> PaymentEntity[Payment Entity]
    Entities --> TransportEntity[Transportation Entity]
    Entities --> ResourceEntity[Resource Entity]
    Entities --> AccessLogEntity[Access Log Entity]

    Guards --> ParentGuard[Parent Access Guard]
    Guards --> ChildGuard[Child Access Guard]
```

## Database Schema Relationships

```mermaid
erDiagram
    PARENT ||--o{ COMMUNICATION : sends
    PARENT ||--o{ APPOINTMENT : schedules
    PARENT ||--o{ PAYMENT : makes
    PARENT ||--o{ PORTAL_ACCESS_LOG : generates

    STUDENT ||--o{ COMMUNICATION : receives
    STUDENT ||--o{ APPOINTMENT : attends
    STUDENT ||--o{ FEE : incurs
    STUDENT ||--o{ PAYMENT : has
    STUDENT ||--o{ TRANSPORTATION : uses

    FEE ||--o{ PAYMENT : receives

    TEACHER ||--o{ APPOINTMENT : conducts
    TEACHER ||--o{ COMMUNICATION : sends

    SCHOOL ||--o{ PARENT : contains
    SCHOOL ||--o{ STUDENT : contains
    SCHOOL ||--o{ TEACHER : employs
    SCHOOL ||--o{ FEE : defines
    SCHOOL ||--o{ RESOURCE : provides

    RESOURCE ||--o{ RESOURCE_ACCESS : tracks

    PARENT {
        uuid id PK
        uuid userId FK
        string relationship
        jsonb children
        jsonb contactInformation
        jsonb profile
        uuid schoolId FK
        timestamp createdAt
        timestamp updatedAt
    }

    STUDENT {
        uuid id PK
        string admissionNumber UK
        string firstName
        string lastName
        string currentGrade
        string currentSection
        uuid schoolId FK
        jsonb parents
        jsonb medicalInfo
        jsonb transportation
        timestamp createdAt
        timestamp updatedAt
    }

    COMMUNICATION {
        uuid id PK
        uuid parentId FK
        uuid studentId FK
        string type
        string title
        text message
        string priority
        boolean isRead
        timestamp createdAt
        uuid schoolId FK
    }

    APPOINTMENT {
        uuid id PK
        uuid parentId FK
        uuid studentId FK
        uuid teacherId FK
        string subject
        text purpose
        date requestedDate
        string status
        timestamp createdAt
        uuid schoolId FK
    }

    FEE {
        uuid id PK
        uuid studentId FK
        string feeType
        decimal amount
        date dueDate
        string status
        timestamp createdAt
        uuid schoolId FK
    }

    PAYMENT {
        uuid id PK
        uuid studentId FK
        uuid feeId FK
        uuid parentId FK
        decimal amount
        string paymentMethod
        string transactionId UK
        string status
        timestamp paymentDate
        uuid schoolId FK
    }

    TRANSPORTATION {
        uuid id PK
        uuid studentId FK
        uuid routeId
        uuid stopId
        string pickupTime
        string dropTime
        date pickupDate
        string status
        timestamp createdAt
        uuid schoolId FK
    }

    RESOURCE {
        uuid id PK
        string title
        string type
        string category
        string fileUrl
        boolean isPublic
        text tags
        timestamp createdAt
        uuid schoolId FK
    }
```

## API Endpoint Architecture

```mermaid
graph LR
    subgraph "Dashboard Endpoints"
        GET_DASH[/dashboard/:parentId]
        GET_CHILD_DASH[/dashboard/:parentId/child/:studentId]
        GET_NOTIF[/dashboard/:parentId/notifications]
    end

    subgraph "Academic Endpoints"
        GET_GRADES[/academic/:parentId/grades]
        GET_ATTENDANCE[/academic/:parentId/attendance]
        GET_ASSIGNMENTS[/academic/:parentId/assignments]
        GET_TIMETABLE[/academic/:parentId/timetable]
    end

    subgraph "Communication Endpoints"
        GET_COMM[/communication/:parentId]
        POST_COMM[/communication]
        PUT_COMM_READ[/communication/:id/read]
        POST_COMM_RESP[/communication/:id/response]
    end

    subgraph "Appointment Endpoints"
        GET_APPT[/appointment/:parentId]
        POST_APPT[/appointment]
        PUT_APPT[/appointment/:id]
        DELETE_APPT[/appointment/:id]
    end

    subgraph "Financial Endpoints"
        GET_FEES[/fee/:parentId]
        POST_PAYMENT[/payment]
        GET_PAYMENTS[/payment/:parentId]
        GET_RECEIPT[/payment/:id/receipt]
    end

    subgraph "Transportation Endpoints"
        GET_TRANSPORT[/transportation/:parentId]
        POST_TRACK[/transportation/:id/track]
        GET_ROUTES[/transportation/routes]
    end

    subgraph "Resource Endpoints"
        GET_RESOURCES[/resource/:parentId]
        GET_SEARCH[/resource/:parentId/search]
        GET_DOWNLOAD[/resource/:id/download]
    end
```

## Security Architecture

```mermaid
graph TD
    A[Parent Login] --> B{JWT Authentication}
    B --> C{Validate Credentials}
    C --> D[Generate JWT Token]
    D --> E[Return Token]

    F[API Request] --> G{Validate JWT}
    G --> H{Check Token Expiry}
    H --> I{Extract User Info}
    I --> J{Check Parent Access}
    J --> K{Validate Permissions}
    K --> L{Log Access}
    L --> M[Process Request]

    N[Database Access] --> O{Row Level Security}
    O --> P{Field Level Encryption}
    P --> Q{Audit Logging}
    Q --> R[Return Data]

    S[File Access] --> T{Validate Permissions}
    T --> U{Generate Signed URL}
    U --> V[Return Secure URL]
```

## Integration Points

```mermaid
graph TD
    PP[Parent Portal] --> SM[Student Module]
    PP --> AM[Academic Module]
    PP --> AuthM[Authentication Module]
    PP --> UM[User Module]
    PP --> CM[Communication Module]
    PP --> FM[Fee Module]
    PP --> TM[Transportation Module]
    PP --> RM[Reports Module]

    SM --> PP
    AM --> PP
    AuthM --> PP
    UM --> PP
    CM --> PP
    FM --> PP
    TM --> PP
    RM --> PP

    PP --> PG[Payment Gateway]
    PP --> NS[Notification Service]
    PP --> SS[SMS Service]
    PP --> ES[Email Service]
    PP --> CDN[CDN Service]

    PG --> PP
    NS --> PP
    SS --> PP
    ES --> PP
    CDN --> PP
```

## Data Flow Architecture

```mermaid
sequenceDiagram
    participant P as Parent
    participant API as API Gateway
    participant Auth as Auth Service
    participant PP as Parent Portal Service
    participant DB as Database
    participant Cache as Redis Cache

    P->>API: Login Request
    API->>Auth: Validate Credentials
    Auth->>DB: Check User
    DB-->>Auth: User Data
    Auth-->>API: JWT Token
    API-->>P: Token Response

    P->>API: Dashboard Request
    API->>PP: Get Dashboard Data
    PP->>Cache: Check Cache
    Cache-->>PP: Cache Miss
    PP->>DB: Query Data
    DB-->>PP: Dashboard Data
    PP->>Cache: Store in Cache
    PP-->>API: Dashboard Response
    API-->>P: Dashboard Data

    P->>API: Academic Data Request
    API->>PP: Get Academic Data
    PP->>DB: Query Academic Records
    DB-->>PP: Academic Data
    PP-->>API: Academic Response
    API-->>P: Academic Data
```

This comprehensive architecture provides a scalable, secure, and maintainable foundation for the Parent Portal module, ensuring all requirements are met while following best practices for enterprise-level applications.