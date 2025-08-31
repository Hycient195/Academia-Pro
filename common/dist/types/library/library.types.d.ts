export declare enum TBookStatus {
    AVAILABLE = "available",
    CHECKED_OUT = "checked_out",
    RESERVED = "reserved",
    LOST = "lost",
    DAMAGED = "damaged",
    UNDER_MAINTENANCE = "under_maintenance",
    DISCARDED = "discarded",
    REFERENCE_ONLY = "reference_only"
}
export declare enum TBookCondition {
    EXCELLENT = "excellent",
    GOOD = "good",
    FAIR = "fair",
    POOR = "poor",
    DAMAGED = "damaged"
}
export declare enum TBookCategory {
    FICTION = "fiction",
    NON_FICTION = "non_fiction",
    ACADEMIC = "academic",
    REFERENCE = "reference",
    BIOGRAPHY = "biography",
    HISTORY = "history",
    SCIENCE = "science",
    MATHEMATICS = "mathematics",
    LITERATURE = "literature",
    LANGUAGE = "language",
    ART = "art",
    MUSIC = "music",
    SPORTS = "sports",
    HEALTH = "health",
    COOKING = "cooking",
    TRAVEL = "travel",
    RELIGION = "religion",
    PHILOSOPHY = "philosophy",
    PSYCHOLOGY = "psychology",
    SOCIOLOGY = "sociology",
    ECONOMICS = "economics",
    POLITICAL_SCIENCE = "political_science",
    LAW = "law",
    MEDICINE = "medicine",
    ENGINEERING = "engineering",
    COMPUTER_SCIENCE = "computer_science",
    EDUCATION = "education",
    CHILDREN = "children",
    TEEN = "teen",
    MAGAZINES = "magazines",
    NEWSPAPERS = "newspapers",
    OTHER = "other"
}
export declare enum TBookFormat {
    HARDCOVER = "hardcover",
    PAPERBACK = "paperback",
    EBOOK = "ebook",
    AUDIOBOOK = "audiobook",
    MAGAZINE = "magazine",
    NEWSPAPER = "newspaper",
    JOURNAL = "journal",
    THESIS = "thesis",
    DISSERTATION = "dissertation",
    REPORT = "report",
    MANUSCRIPT = "manuscript",
    MAP = "map",
    ATLAS = "atlas",
    CD = "cd",
    DVD = "dvd",
    OTHER = "other"
}
export declare enum TLanguage {
    ENGLISH = "english",
    SPANISH = "spanish",
    FRENCH = "french",
    GERMAN = "german",
    ITALIAN = "italian",
    PORTUGUESE = "portuguese",
    RUSSIAN = "russian",
    CHINESE = "chinese",
    JAPANESE = "japanese",
    KOREAN = "korean",
    ARABIC = "arabic",
    HINDI = "hindi",
    BENGALI = "bengali",
    URDU = "urdu",
    TURKISH = "turkish",
    PERSIAN = "persian",
    SWAHILI = "swahili",
    HAUSA = "hausa",
    YORUBA = "yoruba",
    IGBO = "igbo",
    OTHER = "other"
}
export declare enum TAcquisitionMethod {
    PURCHASE = "purchase",
    DONATION = "donation",
    EXCHANGE = "exchange",
    GIFT = "gift",
    INHERITANCE = "inheritance",
    LEGAL_DEPOSIT = "legal_deposit",
    OTHER = "other"
}
export declare enum TCheckoutStatus {
    ACTIVE = "active",
    RETURNED = "returned",
    OVERDUE = "overdue",
    LOST = "lost",
    DAMAGED = "damaged"
}
export declare enum TReservationStatus {
    ACTIVE = "active",
    CANCELLED = "cancelled",
    EXPIRED = "expired",
    FULFILLED = "fulfilled"
}
export interface IBook {
    id: string;
    schoolId: string;
    title: string;
    subtitle?: string;
    author: string;
    coAuthors: string[];
    editor?: string;
    translator?: string;
    illustrator?: string;
    isbn?: string;
    isbn13?: string;
    accessionNumber: string;
    callNumber?: string;
    barcode?: string;
    rfidTag?: string;
    publisher?: string;
    publicationPlace?: string;
    publicationYear?: number;
    edition?: string;
    volume?: string;
    series?: string;
    seriesNumber?: string;
    pages?: number;
    heightCm?: number;
    widthCm?: number;
    thicknessCm?: number;
    weightGrams?: number;
    category: TBookCategory;
    subcategory?: string;
    keywords: string[];
    subjects: string[];
    language: TLanguage;
    format: TBookFormat;
    description?: string;
    tableOfContents?: string;
    summary?: string;
    notes?: string;
    acquisitionMethod: TAcquisitionMethod;
    acquisitionDate: Date;
    acquisitionCost?: number;
    acquisitionCurrency: string;
    supplierName?: string;
    supplierInvoiceNumber?: string;
    donorName?: string;
    status: TBookStatus;
    condition: TBookCondition;
    conditionNotes?: string;
    lastConditionCheck?: Date;
    nextConditionCheck?: Date;
    locationShelf?: string;
    locationRow?: string;
    locationSection?: string;
    locationFloor?: string;
    locationBuilding?: string;
    isCirculating: boolean;
    isReferenceOnly: boolean;
    loanPeriodDays: number;
    maxRenewals: number;
    overdueFinePerDay: number;
    replacementCost?: number;
    hasDigitalVersion: boolean;
    digitalFormat?: string;
    digitalUrl?: string;
    digitalFileSizeMb?: number;
    totalCheckouts: number;
    currentCheckouts: number;
    totalReservations: number;
    currentReservations: number;
    totalViews: number;
    lastCheckedOut?: Date;
    lastReturned?: Date;
    lastViewed?: Date;
    coverImageUrl?: string;
    additionalImages: Array<{
        url: string;
        caption?: string;
        isPrimary: boolean;
    }>;
    averageRating: number;
    totalRatings: number;
    totalReviews: number;
    tags: string[];
    metadata?: {
        deweyDecimal?: string;
        lccClassification?: string;
        genre?: string[];
        targetAudience?: string;
        readingLevel?: string;
        curriculumAlignment?: string[];
        awards?: Array<{
            name: string;
            year: number;
            organization: string;
        }>;
        relatedBooks?: string[];
        seriesInfo?: {
            seriesName: string;
            position: number;
            totalBooks: number;
        };
    };
    internalNotes?: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy?: string;
}
export interface IAdditionalImage {
    url: string;
    caption?: string;
    isPrimary?: boolean;
}
export interface IAward {
    name: string;
    year: number;
    organization: string;
}
export interface ISeriesInfo {
    seriesName: string;
    position: number;
    totalBooks: number;
}
export interface IBookMetadata {
    deweyDecimal?: string;
    lccClassification?: string;
    genre?: string[];
    targetAudience?: string;
    readingLevel?: string;
    curriculumAlignment?: string[];
    awards?: IAward[];
    relatedBooks?: string[];
    seriesInfo?: ISeriesInfo;
}
export interface ICreateBookRequest {
    schoolId: string;
    title: string;
    subtitle?: string;
    author: string;
    coAuthors?: string[];
    editor?: string;
    translator?: string;
    illustrator?: string;
    isbn?: string;
    isbn13?: string;
    accessionNumber?: string;
    callNumber?: string;
    barcode?: string;
    rfidTag?: string;
    publisher?: string;
    publicationPlace?: string;
    publicationYear?: number;
    edition?: string;
    volume?: string;
    series?: string;
    seriesNumber?: string;
    pages?: number;
    heightCm?: number;
    widthCm?: number;
    thicknessCm?: number;
    weightGrams?: number;
    category?: TBookCategory;
    subcategory?: string;
    keywords?: string[];
    subjects?: string[];
    language?: TLanguage;
    format?: TBookFormat;
    description?: string;
    tableOfContents?: string;
    summary?: string;
    notes?: string;
    acquisitionMethod?: TAcquisitionMethod;
    acquisitionDate: string;
    acquisitionCost?: number;
    acquisitionCurrency?: string;
    supplierName?: string;
    supplierInvoiceNumber?: string;
    donorName?: string;
    condition?: TBookCondition;
    conditionNotes?: string;
    locationShelf?: string;
    locationRow?: string;
    locationSection?: string;
    locationFloor?: string;
    locationBuilding?: string;
    isCirculating?: boolean;
    isReferenceOnly?: boolean;
    loanPeriodDays?: number;
    maxRenewals?: number;
    overdueFinePerDay?: number;
    replacementCost?: number;
    hasDigitalVersion?: boolean;
    digitalFormat?: string;
    digitalUrl?: string;
    digitalFileSizeMb?: number;
    coverImageUrl?: string;
    additionalImages?: IAdditionalImage[];
    tags?: string[];
    metadata?: IBookMetadata;
    internalNotes?: string;
}
export interface IUpdateBookRequest {
    title?: string;
    subtitle?: string;
    author?: string;
    coAuthors?: string[];
    editor?: string;
    translator?: string;
    illustrator?: string;
    isbn?: string;
    isbn13?: string;
    accessionNumber?: string;
    callNumber?: string;
    barcode?: string;
    rfidTag?: string;
    publisher?: string;
    publicationPlace?: string;
    publicationYear?: number;
    edition?: string;
    volume?: string;
    series?: string;
    seriesNumber?: string;
    pages?: number;
    heightCm?: number;
    widthCm?: number;
    thicknessCm?: number;
    weightGrams?: number;
    category?: TBookCategory;
    subcategory?: string;
    keywords?: string[];
    subjects?: string[];
    language?: TLanguage;
    format?: TBookFormat;
    description?: string;
    tableOfContents?: string;
    summary?: string;
    notes?: string;
    acquisitionMethod?: TAcquisitionMethod;
    acquisitionDate?: string;
    acquisitionCost?: number;
    acquisitionCurrency?: string;
    supplierName?: string;
    supplierInvoiceNumber?: string;
    donorName?: string;
    status?: TBookStatus;
    condition?: TBookCondition;
    conditionNotes?: string;
    locationShelf?: string;
    locationRow?: string;
    locationSection?: string;
    locationFloor?: string;
    locationBuilding?: string;
    isCirculating?: boolean;
    isReferenceOnly?: boolean;
    loanPeriodDays?: number;
    maxRenewals?: number;
    overdueFinePerDay?: number;
    replacementCost?: number;
    hasDigitalVersion?: boolean;
    digitalFormat?: string;
    digitalUrl?: string;
    digitalFileSizeMb?: number;
    coverImageUrl?: string;
    additionalImages?: IAdditionalImage[];
    tags?: string[];
    metadata?: IBookMetadata;
    internalNotes?: string;
}
export interface IBookResponse extends Omit<IBook, 'createdBy' | 'updatedBy'> {
    fullTitle: string;
    isAvailable: boolean;
    isCheckedOut: boolean;
    isReserved: boolean;
    isLostOrDamaged: boolean;
    isReferenceMaterial: boolean;
    location: string;
    authorsList: string;
    publicationInfo: string;
    ageInYears: number;
    isNew: boolean;
    isOld: boolean;
    popularityScore: number;
    checkoutStats: {
        totalCheckouts: number;
        currentCheckouts: number;
        availableCopies: number;
    };
    reservationStats: {
        totalReservations: number;
        currentReservations: number;
        nextAvailableDate?: Date;
    };
}
export interface IBookListResponse {
    books: IBookResponse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    summary: {
        totalBooks: number;
        availableBooks: number;
        checkedOutBooks: number;
        reservedBooks: number;
        lostOrDamagedBooks: number;
        averageAge: number;
        mostPopularCategory: TBookCategory;
    };
}
export interface IBookFilters {
    schoolId: string;
    title?: string;
    author?: string;
    isbn?: string;
    category?: TBookCategory;
    subcategory?: string;
    language?: TLanguage;
    format?: TBookFormat;
    status?: TBookStatus;
    condition?: TBookCondition;
    publisher?: string;
    publicationYearFrom?: number;
    publicationYearTo?: number;
    acquisitionDateFrom?: string;
    acquisitionDateTo?: string;
    locationBuilding?: string;
    locationFloor?: string;
    locationSection?: string;
    isCirculating?: boolean;
    isReferenceOnly?: boolean;
    hasDigitalVersion?: boolean;
    tags?: string[];
    keywords?: string[];
    subjects?: string[];
    minRating?: number;
    maxRating?: number;
    search?: string;
}
export interface ILibraryStatistics {
    totalBooks: number;
    totalTitles: number;
    availableBooks: number;
    checkedOutBooks: number;
    reservedBooks: number;
    lostOrDamagedBooks: number;
    overdueBooks: number;
    totalValue: number;
    averageBookAge: number;
    mostPopularCategory: TBookCategory;
    booksByCategory: Record<TBookCategory, number>;
    booksByStatus: Record<TBookStatus, number>;
    booksByCondition: Record<TBookCondition, number>;
    booksByLanguage: Record<TLanguage, number>;
    booksByFormat: Record<TBookFormat, number>;
    circulationStats: {
        totalCheckouts: number;
        totalReturns: number;
        totalReservations: number;
        averageLoanPeriod: number;
        overdueRate: number;
        renewalRate: number;
    };
    financialStats: {
        totalAcquisitionCost: number;
        totalReplacementCost: number;
        totalOverdueFines: number;
        averageCostPerBook: number;
    };
    userEngagement: {
        totalUsers: number;
        activeUsers: number;
        averageBooksPerUser: number;
        mostActiveUsers: Array<{
            userId: string;
            userName: string;
            booksCheckedOut: number;
        }>;
    };
}
export interface IBookCheckout {
    id: string;
    bookId: string;
    userId: string;
    checkoutDate: Date;
    dueDate: Date;
    returnDate?: Date;
    renewalCount: number;
    maxRenewals: number;
    overdueDays: number;
    overdueFine: number;
    status: TCheckoutStatus;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface IBookReservation {
    id: string;
    bookId: string;
    userId: string;
    reservationDate: Date;
    expiryDate: Date;
    queuePosition: number;
    status: TReservationStatus;
    fulfilledDate?: Date;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface ICheckoutRequest {
    bookId: string;
    userId: string;
    loanPeriodDays?: number;
    notes?: string;
}
export interface IReturnRequest {
    checkoutId: string;
    condition?: TBookCondition;
    conditionNotes?: string;
}
export interface IRenewalRequest {
    checkoutId: string;
    additionalDays?: number;
}
export interface IReservationRequest {
    bookId: string;
    userId: string;
    expiryDays?: number;
}
export interface IDigitalBook {
    id: string;
    bookId: string;
    fileUrl: string;
    fileFormat: string;
    fileSize: number;
    downloadCount: number;
    lastDownloaded?: Date;
    accessRestrictions?: {
        maxDownloads?: number;
        expiryDate?: Date;
        allowedUserTypes?: string[];
    };
    createdAt: Date;
    updatedAt: Date;
}
export interface IDigitalAccessRequest {
    bookId: string;
    userId: string;
    accessType: 'download' | 'stream' | 'borrow';
    deviceInfo?: {
        type: string;
        os: string;
        browser?: string;
    };
}
export interface IBookReview {
    id: string;
    bookId: string;
    userId: string;
    userName: string;
    rating: number;
    title?: string;
    content: string;
    isVerified: boolean;
    helpfulVotes: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface IBookRating {
    bookId: string;
    userId: string;
    rating: number;
    createdAt: Date;
}
export interface ILibrarySettings {
    schoolId: string;
    generalSettings: {
        libraryName: string;
        openingHours: {
            monday: {
                open: string;
                close: string;
            };
            tuesday: {
                open: string;
                close: string;
            };
            wednesday: {
                open: string;
                close: string;
            };
            thursday: {
                open: string;
                close: string;
            };
            friday: {
                open: string;
                close: string;
            };
            saturday?: {
                open: string;
                close: string;
            };
            sunday?: {
                open: string;
                close: string;
            };
        };
        holidays: Array<{
            date: string;
            description: string;
        }>;
        contactInfo: {
            phone: string;
            email: string;
            address: string;
        };
    };
    circulationPolicies: {
        defaultLoanPeriod: number;
        maxRenewals: number;
        maxBooksPerUser: number;
        maxReservationsPerUser: number;
        overdueFinePerDay: number;
        gracePeriodDays: number;
        reservationExpiryDays: number;
        holdExpiryDays: number;
    };
    userPolicies: {
        registrationRequired: boolean;
        ageRestrictions: {
            minAge: number;
            maxAge?: number;
        };
        membershipFees: {
            annual: number;
            currency: string;
        };
        suspensionRules: {
            maxOverdueDays: number;
            suspensionPeriod: number;
        };
    };
    digitalLibrary: {
        enabled: boolean;
        maxDownloadsPerUser: number;
        downloadExpiryDays: number;
        allowedFormats: string[];
        streamingEnabled: boolean;
    };
    notifications: {
        overdueReminders: boolean;
        dueDateReminders: boolean;
        reservationAvailable: boolean;
        newBookAlerts: boolean;
    };
}
export interface ILibraryDashboard {
    summary: {
        totalBooks: number;
        totalUsers: number;
        activeLoans: number;
        overdueLoans: number;
        pendingReservations: number;
    };
    recentActivity: Array<{
        type: 'checkout' | 'return' | 'reservation' | 'renewal';
        bookTitle: string;
        userName: string;
        date: Date;
    }>;
    popularBooks: Array<{
        bookId: string;
        title: string;
        author: string;
        checkoutCount: number;
        rating: number;
    }>;
    overdueBooks: Array<{
        bookId: string;
        title: string;
        userName: string;
        dueDate: Date;
        overdueDays: number;
    }>;
    systemAlerts: Array<{
        type: 'warning' | 'error' | 'info';
        message: string;
        date: Date;
    }>;
}
export interface IBulkBookImportRequest {
    books: ICreateBookRequest[];
    importOptions: {
        skipDuplicates: boolean;
        updateExisting: boolean;
        validateISBN: boolean;
        generateAccessionNumbers: boolean;
    };
}
export interface IBulkBookUpdateRequest {
    bookIds: string[];
    updates: Partial<IUpdateBookRequest>;
}
export interface IBulkCheckoutRequest {
    checkouts: ICheckoutRequest[];
}
export interface IBulkReturnRequest {
    checkoutIds: string[];
    returnCondition?: TBookCondition;
    returnNotes?: string;
}
//# sourceMappingURL=library.types.d.ts.map