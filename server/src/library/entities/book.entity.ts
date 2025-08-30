// Academia Pro - Book Entity
// Database entity for managing library books and resources

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index, Unique } from 'typeorm';

export enum BookStatus {
  AVAILABLE = 'available',
  CHECKED_OUT = 'checked_out',
  RESERVED = 'reserved',
  LOST = 'lost',
  DAMAGED = 'damaged',
  UNDER_MAINTENANCE = 'under_maintenance',
  DISCARDED = 'discarded',
  REFERENCE_ONLY = 'reference_only',
}

export enum BookCondition {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  DAMAGED = 'damaged',
}

export enum BookCategory {
  FICTION = 'fiction',
  NON_FICTION = 'non_fiction',
  ACADEMIC = 'academic',
  REFERENCE = 'reference',
  BIOGRAPHY = 'biography',
  HISTORY = 'history',
  SCIENCE = 'science',
  MATHEMATICS = 'mathematics',
  LITERATURE = 'literature',
  LANGUAGE = 'language',
  ART = 'art',
  MUSIC = 'music',
  SPORTS = 'sports',
  HEALTH = 'health',
  COOKING = 'cooking',
  TRAVEL = 'travel',
  RELIGION = 'religion',
  PHILOSOPHY = 'philosophy',
  PSYCHOLOGY = 'psychology',
  SOCIOLOGY = 'sociology',
  ECONOMICS = 'economics',
  POLITICAL_SCIENCE = 'political_science',
  LAW = 'law',
  MEDICINE = 'medicine',
  ENGINEERING = 'engineering',
  COMPUTER_SCIENCE = 'computer_science',
  EDUCATION = 'education',
  CHILDREN = 'children',
  TEEN = 'teen',
  MAGAZINES = 'magazines',
  NEWSPAPERS = 'newspapers',
  OTHER = 'other',
}

export enum BookFormat {
  HARDCOVER = 'hardcover',
  PAPERBACK = 'paperback',
  EBOOK = 'ebook',
  AUDIOBOOK = 'audiobook',
  MAGAZINE = 'magazine',
  NEWSPAPER = 'newspaper',
  JOURNAL = 'journal',
  THESIS = 'thesis',
  DISSERTATION = 'dissertation',
  REPORT = 'report',
  MANUSCRIPT = 'manuscript',
  MAP = 'map',
  ATLAS = 'atlas',
  CD = 'cd',
  DVD = 'dvd',
  OTHER = 'other',
}

export enum Language {
  ENGLISH = 'english',
  SPANISH = 'spanish',
  FRENCH = 'french',
  GERMAN = 'german',
  ITALIAN = 'italian',
  PORTUGUESE = 'portuguese',
  RUSSIAN = 'russian',
  CHINESE = 'chinese',
  JAPANESE = 'japanese',
  KOREAN = 'korean',
  ARABIC = 'arabic',
  HINDI = 'hindi',
  BENGALI = 'bengali',
  URDU = 'urdu',
  TURKISH = 'turkish',
  PERSIAN = 'persian',
  SWAHILI = 'swahili',
  HAUSA = 'hausa',
  YORUBA = 'yoruba',
  IGBO = 'igbo',
  OTHER = 'other',
}

export enum AcquisitionMethod {
  PURCHASE = 'purchase',
  DONATION = 'donation',
  EXCHANGE = 'exchange',
  GIFT = 'gift',
  INHERITANCE = 'inheritance',
  LEGAL_DEPOSIT = 'legal_deposit',
  OTHER = 'other',
}

@Entity('books')
@Unique(['schoolId', 'isbn'])
@Unique(['schoolId', 'accessionNumber'])
@Index(['schoolId', 'title'])
@Index(['schoolId', 'author'])
@Index(['schoolId', 'isbn'])
@Index(['schoolId', 'category'])
@Index(['schoolId', 'status'])
@Index(['schoolId', 'publisher'])
@Index(['schoolId', 'publicationYear'])
export class Book {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Basic Information
  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @Column({ name: 'title', type: 'varchar', length: 500 })
  title: string;

  @Column({ name: 'subtitle', type: 'varchar', length: 500, nullable: true })
  subtitle?: string;

  @Column({ name: 'author', type: 'varchar', length: 300 })
  author: string;

  @Column({ name: 'co_authors', type: 'jsonb', default: [] })
  coAuthors: string[];

  @Column({ name: 'editor', type: 'varchar', length: 300, nullable: true })
  editor?: string;

  @Column({ name: 'translator', type: 'varchar', length: 300, nullable: true })
  translator?: string;

  @Column({ name: 'illustrator', type: 'varchar', length: 300, nullable: true })
  illustrator?: string;

  // Identification
  @Column({ name: 'isbn', type: 'varchar', length: 20, nullable: true })
  isbn?: string;

  @Column({ name: 'isbn13', type: 'varchar', length: 20, nullable: true })
  isbn13?: string;

  @Column({ name: 'accession_number', type: 'varchar', length: 50 })
  accessionNumber: string;

  @Column({ name: 'call_number', type: 'varchar', length: 50, nullable: true })
  callNumber?: string;

  @Column({ name: 'barcode', type: 'varchar', length: 50, nullable: true })
  barcode?: string;

  @Column({ name: 'rfid_tag', type: 'varchar', length: 50, nullable: true })
  rfidTag?: string;

  // Publication Information
  @Column({ name: 'publisher', type: 'varchar', length: 300, nullable: true })
  publisher?: string;

  @Column({ name: 'publication_place', type: 'varchar', length: 200, nullable: true })
  publicationPlace?: string;

  @Column({ name: 'publication_year', type: 'int', nullable: true })
  publicationYear?: number;

  @Column({ name: 'edition', type: 'varchar', length: 50, nullable: true })
  edition?: string;

  @Column({ name: 'volume', type: 'varchar', length: 50, nullable: true })
  volume?: string;

  @Column({ name: 'series', type: 'varchar', length: 300, nullable: true })
  series?: string;

  @Column({ name: 'series_number', type: 'varchar', length: 50, nullable: true })
  seriesNumber?: string;

  // Physical Characteristics
  @Column({ name: 'pages', type: 'int', nullable: true })
  pages?: number;

  @Column({ name: 'height_cm', type: 'decimal', precision: 5, scale: 2, nullable: true })
  heightCm?: number;

  @Column({ name: 'width_cm', type: 'decimal', precision: 5, scale: 2, nullable: true })
  widthCm?: number;

  @Column({ name: 'thickness_cm', type: 'decimal', precision: 5, scale: 2, nullable: true })
  thicknessCm?: number;

  @Column({ name: 'weight_grams', type: 'int', nullable: true })
  weightGrams?: number;

  // Classification
  @Column({
    name: 'category',
    type: 'enum',
    enum: BookCategory,
    default: BookCategory.OTHER,
  })
  category: BookCategory;

  @Column({ name: 'subcategory', type: 'varchar', length: 100, nullable: true })
  subcategory?: string;

  @Column({ name: 'keywords', type: 'jsonb', default: [] })
  keywords: string[];

  @Column({ name: 'subjects', type: 'jsonb', default: [] })
  subjects: string[];

  @Column({
    name: 'language',
    type: 'enum',
    enum: Language,
    default: Language.ENGLISH,
  })
  language: Language;

  @Column({
    name: 'format',
    type: 'enum',
    enum: BookFormat,
    default: BookFormat.HARDCOVER,
  })
  format: BookFormat;

  // Content Information
  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'table_of_contents', type: 'text', nullable: true })
  tableOfContents?: string;

  @Column({ name: 'summary', type: 'text', nullable: true })
  summary?: string;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes?: string;

  // Acquisition Information
  @Column({
    name: 'acquisition_method',
    type: 'enum',
    enum: AcquisitionMethod,
    default: AcquisitionMethod.PURCHASE,
  })
  acquisitionMethod: AcquisitionMethod;

  @Column({ name: 'acquisition_date', type: 'date' })
  acquisitionDate: Date;

  @Column({ name: 'acquisition_cost', type: 'decimal', precision: 10, scale: 2, nullable: true })
  acquisitionCost?: number;

  @Column({ name: 'acquisition_currency', type: 'varchar', length: 3, default: 'USD' })
  acquisitionCurrency: string;

  @Column({ name: 'supplier_name', type: 'varchar', length: 300, nullable: true })
  supplierName?: string;

  @Column({ name: 'supplier_invoice_number', type: 'varchar', length: 100, nullable: true })
  supplierInvoiceNumber?: string;

  @Column({ name: 'donor_name', type: 'varchar', length: 300, nullable: true })
  donorName?: string;

  // Status and Condition
  @Column({
    type: 'enum',
    enum: BookStatus,
    default: BookStatus.AVAILABLE,
  })
  status: BookStatus;

  @Column({
    name: 'condition',
    type: 'enum',
    enum: BookCondition,
    default: BookCondition.GOOD,
  })
  condition: BookCondition;

  @Column({ name: 'condition_notes', type: 'text', nullable: true })
  conditionNotes?: string;

  @Column({ name: 'last_condition_check', type: 'date', nullable: true })
  lastConditionCheck?: Date;

  @Column({ name: 'next_condition_check', type: 'date', nullable: true })
  nextConditionCheck?: Date;

  // Location Information
  @Column({ name: 'location_shelf', type: 'varchar', length: 50, nullable: true })
  locationShelf?: string;

  @Column({ name: 'location_row', type: 'varchar', length: 50, nullable: true })
  locationRow?: string;

  @Column({ name: 'location_section', type: 'varchar', length: 100, nullable: true })
  locationSection?: string;

  @Column({ name: 'location_floor', type: 'varchar', length: 50, nullable: true })
  locationFloor?: string;

  @Column({ name: 'location_building', type: 'varchar', length: 100, nullable: true })
  locationBuilding?: string;

  // Circulation Information
  @Column({ name: 'is_circulating', type: 'boolean', default: true })
  isCirculating: boolean;

  @Column({ name: 'is_reference_only', type: 'boolean', default: false })
  isReferenceOnly: boolean;

  @Column({ name: 'loan_period_days', type: 'int', default: 14 })
  loanPeriodDays: number;

  @Column({ name: 'max_renewals', type: 'int', default: 2 })
  maxRenewals: number;

  @Column({ name: 'overdue_fine_per_day', type: 'decimal', precision: 5, scale: 2, default: 0.50 })
  overdueFinePerDay: number;

  @Column({ name: 'replacement_cost', type: 'decimal', precision: 10, scale: 2, nullable: true })
  replacementCost?: number;

  // Digital Content
  @Column({ name: 'has_digital_version', type: 'boolean', default: false })
  hasDigitalVersion: boolean;

  @Column({ name: 'digital_format', type: 'varchar', length: 50, nullable: true })
  digitalFormat?: string;

  @Column({ name: 'digital_url', type: 'varchar', length: 500, nullable: true })
  digitalUrl?: string;

  @Column({ name: 'digital_file_size_mb', type: 'decimal', precision: 10, scale: 2, nullable: true })
  digitalFileSizeMb?: number;

  // Usage Statistics
  @Column({ name: 'total_checkouts', type: 'int', default: 0 })
  totalCheckouts: number;

  @Column({ name: 'current_checkouts', type: 'int', default: 0 })
  currentCheckouts: number;

  @Column({ name: 'total_reservations', type: 'int', default: 0 })
  totalReservations: number;

  @Column({ name: 'current_reservations', type: 'int', default: 0 })
  currentReservations: number;

  @Column({ name: 'total_views', type: 'int', default: 0 })
  totalViews: number;

  @Column({ name: 'last_checked_out', type: 'timestamp', nullable: true })
  lastCheckedOut?: Date;

  @Column({ name: 'last_returned', type: 'timestamp', nullable: true })
  lastReturned?: Date;

  @Column({ name: 'last_viewed', type: 'timestamp', nullable: true })
  lastViewed?: Date;

  // Cover and Images
  @Column({ name: 'cover_image_url', type: 'varchar', length: 500, nullable: true })
  coverImageUrl?: string;

  @Column({ name: 'additional_images', type: 'jsonb', default: [] })
  additionalImages: Array<{
    url: string;
    caption?: string;
    isPrimary: boolean;
  }>;

  // Reviews and Ratings
  @Column({ name: 'average_rating', type: 'decimal', precision: 3, scale: 2, default: 0 })
  averageRating: number;

  @Column({ name: 'total_ratings', type: 'int', default: 0 })
  totalRatings: number;

  @Column({ name: 'total_reviews', type: 'int', default: 0 })
  totalReviews: number;

  // Tags and Metadata
  @Column({ name: 'tags', type: 'jsonb', default: [] })
  tags: string[];

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
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

  @Column({ name: 'internal_notes', type: 'text', nullable: true })
  internalNotes?: string;

  // Audit Fields
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy?: string;

  // Virtual properties
  get fullTitle(): string {
    if (this.subtitle) {
      return `${this.title}: ${this.subtitle}`;
    }
    return this.title;
  }

  get isAvailable(): boolean {
    return this.status === BookStatus.AVAILABLE;
  }

  get isCheckedOut(): boolean {
    return this.status === BookStatus.CHECKED_OUT;
  }

  get isReserved(): boolean {
    return this.status === BookStatus.RESERVED;
  }

  get isLostOrDamaged(): boolean {
    return this.status === BookStatus.LOST || this.status === BookStatus.DAMAGED;
  }

  get isReferenceMaterial(): boolean {
    return this.status === BookStatus.REFERENCE_ONLY || !this.isCirculating;
  }

  get location(): string {
    const parts = [
      this.locationBuilding,
      this.locationFloor,
      this.locationSection,
      this.locationRow,
      this.locationShelf,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(' > ') : 'Not specified';
  }

  get authorsList(): string {
    const authors = [this.author, ...this.coAuthors].filter(Boolean);
    return authors.join(', ');
  }

  get publicationInfo(): string {
    const parts = [
      this.publisher,
      this.publicationPlace,
      this.publicationYear?.toString(),
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(', ') : 'Not specified';
  }

  get ageInYears(): number {
    if (!this.publicationYear) return 0;
    return new Date().getFullYear() - this.publicationYear;
  }

  get isNew(): boolean {
    return this.ageInYears <= 1;
  }

  get isOld(): boolean {
    return this.ageInYears >= 50;
  }

  get popularityScore(): number {
    // Calculate popularity based on checkouts, views, and ratings
    const checkoutScore = this.totalCheckouts * 2;
    const viewScore = this.totalViews * 0.5;
    const ratingScore = this.averageRating * this.totalRatings * 3;
    const reservationScore = this.totalReservations * 1.5;

    return checkoutScore + viewScore + ratingScore + reservationScore;
  }

  // Methods
  updateStatus(newStatus: BookStatus): void {
    this.status = newStatus;
    this.updatedAt = new Date();
  }

  updateCondition(newCondition: BookCondition, notes?: string): void {
    this.condition = newCondition;
    this.conditionNotes = notes;
    this.lastConditionCheck = new Date();

    // Schedule next condition check based on condition
    const nextCheckDate = new Date();
    switch (newCondition) {
      case BookCondition.EXCELLENT:
        nextCheckDate.setMonth(nextCheckDate.getMonth() + 12); // 1 year
        break;
      case BookCondition.GOOD:
        nextCheckDate.setMonth(nextCheckDate.getMonth() + 6); // 6 months
        break;
      case BookCondition.FAIR:
        nextCheckDate.setMonth(nextCheckDate.getMonth() + 3); // 3 months
        break;
      case BookCondition.POOR:
      case BookCondition.DAMAGED:
        nextCheckDate.setMonth(nextCheckDate.getMonth() + 1); // 1 month
        break;
    }
    this.nextConditionCheck = nextCheckDate;
  }

  incrementCheckout(): void {
    this.totalCheckouts++;
    this.currentCheckouts++;
    this.lastCheckedOut = new Date();
  }

  decrementCheckout(): void {
    if (this.currentCheckouts > 0) {
      this.currentCheckouts--;
      this.lastReturned = new Date();
    }
  }

  incrementReservation(): void {
    this.totalReservations++;
    this.currentReservations++;
  }

  decrementReservation(): void {
    if (this.currentReservations > 0) {
      this.currentReservations--;
    }
  }

  incrementView(): void {
    this.totalViews++;
    this.lastViewed = new Date();
  }

  addRating(rating: number): void {
    const newTotalRatings = this.totalRatings + 1;
    const newAverageRating = ((this.averageRating * this.totalRatings) + rating) / newTotalRatings;

    this.totalRatings = newTotalRatings;
    this.averageRating = Math.round(newAverageRating * 100) / 100; // Round to 2 decimal places
  }

  addReview(): void {
    this.totalReviews++;
  }

  updateLocation(shelf?: string, row?: string, section?: string, floor?: string, building?: string): void {
    this.locationShelf = shelf;
    this.locationRow = row;
    this.locationSection = section;
    this.locationFloor = floor;
    this.locationBuilding = building;
  }

  markAsLost(): void {
    this.status = BookStatus.LOST;
    this.currentCheckouts = 0;
    this.currentReservations = 0;
  }

  markAsDamaged(): void {
    this.status = BookStatus.DAMAGED;
    this.condition = BookCondition.DAMAGED;
  }

  markAsDiscarded(): void {
    this.status = BookStatus.DISCARDED;
    this.currentCheckouts = 0;
    this.currentReservations = 0;
  }

  // Relations (to be added as needed)
  // @ManyToOne(() => School)
  // @JoinColumn({ name: 'school_id' })
  // school: School;

  // @OneToMany(() => BookCheckout)
  // checkouts: BookCheckout[];

  // @OneToMany(() => BookReservation)
  // reservations: BookReservation[];

  // @OneToMany(() => BookReview)
  // reviews: BookReview[];
}