// Academia Pro - Parent Entity
// Database entity for parent portal management

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn, Index } from 'typeorm';
import {
  TParentRelationship,
  TNotificationPreference,
  TCommunicationType,
  TPortalAccessLevel,
  TAppointmentStatus
} from '@academia-pro/types/parent/parent.types';

@Entity('parents')
@Index(['schoolId', 'userId'], { unique: true })
@Index(['schoolId', 'isPrimaryContact'])
@Index(['schoolId', 'relationship'])
export class Parent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: TParentRelationship
  })
  relationship: TParentRelationship;

  @Column({ default: false })
  isPrimaryContact: boolean;

  @Column({ default: false })
  emergencyContact: boolean;

  @Column({
    type: 'enum',
    enum: TPortalAccessLevel,
    default: TPortalAccessLevel.FULL_ACCESS
  })
  portalAccessLevel: TPortalAccessLevel;

  @Column({ type: 'jsonb' })
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
    inApp: boolean;
    grades: boolean;
    attendance: boolean;
    assignments: boolean;
    events: boolean;
    emergencies: boolean;
    general: boolean;
  };

  @Column({ type: 'jsonb', default: [] })
  children: Array<{
    id: string;
    studentId: string;
    studentName: string;
    grade: string;
    class: string;
    relationship: TParentRelationship;
    isPrimaryGuardian: boolean;
    emergencyContact: boolean;
    accessPermissions: {
      viewGrades: boolean;
      viewAttendance: boolean;
      viewAssignments: boolean;
      viewTimetable: boolean;
      viewFees: boolean;
      viewReports: boolean;
      receiveNotifications: boolean;
      contactTeachers: boolean;
      scheduleMeetings: boolean;
    };
    addedAt: Date;
  }>;

  @Column({ type: 'jsonb' })
  contactInformation: {
    primaryEmail: string;
    secondaryEmail?: string;
    primaryPhone: string;
    secondaryPhone?: string;
    address: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    workContact?: {
      company?: string;
      position?: string;
      workPhone?: string;
      workEmail?: string;
    };
  };

  @Column({ type: 'jsonb' })
  profile: {
    firstName: string;
    lastName: string;
    middleName?: string;
    dateOfBirth?: Date;
    occupation?: string;
    educationLevel?: string;
    languages: string[];
    profilePicture?: string;
    bio?: string;
    interests: string[];
    emergencyContacts: Array<{
      name: string;
      relationship: string;
      phone: string;
      email?: string;
      priority: number;
    }>;
  };

  @Column()
  schoolId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  lastLoginAt?: Date;

  @Column({ default: true })
  isActive: boolean;

  // Business logic methods
  updateNotificationPreferences(preferences: Partial<typeof this.notificationPreferences>): void {
    this.notificationPreferences = { ...this.notificationPreferences, ...preferences };
  }

  addChild(child: typeof this.children[0]): void {
    // Check if child already exists
    const existingChild = this.children.find(c => c.studentId === child.studentId);
    if (existingChild) {
      throw new Error('Child already associated with this parent');
    }

    this.children.push({
      ...child,
      id: child.id || this.generateId(),
      addedAt: child.addedAt || new Date(),
    });
  }

  removeChild(studentId: string): void {
    const childIndex = this.children.findIndex(c => c.studentId === studentId);
    if (childIndex === -1) {
      throw new Error('Child not found');
    }

    this.children.splice(childIndex, 1);
  }

  updateChildPermissions(studentId: string, permissions: Partial<typeof this.children[0]['accessPermissions']>): void {
    const child = this.children.find(c => c.studentId === studentId);
    if (!child) {
      throw new Error('Child not found');
    }

    child.accessPermissions = { ...child.accessPermissions, ...permissions };
  }

  updateContactInformation(contact: Partial<typeof this.contactInformation>): void {
    this.contactInformation = { ...this.contactInformation, ...contact };
  }

  updateProfile(profile: Partial<typeof this.profile>): void {
    this.profile = { ...this.profile, ...profile };
  }

  addEmergencyContact(contact: typeof this.profile.emergencyContacts[0]): void {
    this.profile.emergencyContacts.push({
      ...contact,
      priority: contact.priority || this.profile.emergencyContacts.length + 1,
    });

    // Sort by priority
    this.profile.emergencyContacts.sort((a, b) => a.priority - b.priority);
  }

  removeEmergencyContact(name: string): void {
    const contactIndex = this.profile.emergencyContacts.findIndex(c => c.name === name);
    if (contactIndex === -1) {
      throw new Error('Emergency contact not found');
    }

    this.profile.emergencyContacts.splice(contactIndex, 1);

    // Reorder priorities
    this.profile.emergencyContacts.forEach((contact, index) => {
      contact.priority = index + 1;
    });
  }

  recordLogin(): void {
    this.lastLoginAt = new Date();
  }

  deactivate(): void {
    this.isActive = false;
  }

  activate(): void {
    this.isActive = true;
  }

  private generateId(): string {
    return `parent_child_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Computed properties
  get fullName(): string {
    if (this.profile.middleName) {
      return `${this.profile.firstName} ${this.profile.middleName} ${this.profile.lastName}`;
    }
    return `${this.profile.firstName} ${this.profile.lastName}`;
  }

  get primaryEmail(): string {
    return this.contactInformation.primaryEmail;
  }

  get primaryPhone(): string {
    return this.contactInformation.primaryPhone;
  }

  get childrenCount(): number {
    return this.children.length;
  }

  get primaryChildren(): typeof this.children {
    return this.children.filter(child => child.isPrimaryGuardian);
  }

  get primaryChildrenCount(): number {
    return this.primaryChildren.length;
  }

  get emergencyChildren(): typeof this.children {
    return this.children.filter(child => child.emergencyContact);
  }

  get grades(): string[] {
    return [...new Set(this.children.map(child => child.grade))];
  }

  get classes(): string[] {
    return [...new Set(this.children.map(child => child.class))];
  }

  get hasFullAccess(): boolean {
    return this.portalAccessLevel === TPortalAccessLevel.FULL_ACCESS;
  }

  get hasLimitedAccess(): boolean {
    return this.portalAccessLevel === TPortalAccessLevel.LIMITED_ACCESS;
  }

  get hasViewOnlyAccess(): boolean {
    return this.portalAccessLevel === TPortalAccessLevel.VIEW_ONLY;
  }

  get hasEmergencyOnlyAccess(): boolean {
    return this.portalAccessLevel === TPortalAccessLevel.EMERGENCY_ONLY;
  }

  get canViewGrades(): boolean {
    return this.hasFullAccess || this.hasLimitedAccess;
  }

  get canViewAttendance(): boolean {
    return this.hasFullAccess || this.hasLimitedAccess || this.hasViewOnlyAccess;
  }

  get canContactTeachers(): boolean {
    return this.hasFullAccess || this.hasLimitedAccess;
  }

  get canScheduleMeetings(): boolean {
    return this.hasFullAccess || this.hasLimitedAccess;
  }

  get notificationMethods(): TNotificationPreference[] {
    const methods: TNotificationPreference[] = [];
    if (this.notificationPreferences.email) methods.push(TNotificationPreference.EMAIL);
    if (this.notificationPreferences.sms) methods.push(TNotificationPreference.SMS);
    if (this.notificationPreferences.push) methods.push(TNotificationPreference.PUSH);
    if (this.notificationPreferences.inApp) methods.push(TNotificationPreference.IN_APP);
    return methods;
  }

  get preferredNotificationMethod(): TNotificationPreference {
    if (this.notificationPreferences.push) return TNotificationPreference.PUSH;
    if (this.notificationPreferences.email) return TNotificationPreference.EMAIL;
    if (this.notificationPreferences.sms) return TNotificationPreference.SMS;
    if (this.notificationPreferences.inApp) return TNotificationPreference.IN_APP;
    return TNotificationPreference.NONE;
  }

  get address(): string {
    const addr = this.contactInformation.address;
    return `${addr.street}, ${addr.city}, ${addr.state} ${addr.postalCode}, ${addr.country}`;
  }

  get age(): number | undefined {
    if (!this.profile.dateOfBirth) return undefined;
    const today = new Date();
    const birthDate = new Date(this.profile.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  get daysSinceLastLogin(): number {
    if (!this.lastLoginAt) return Infinity;
    const now = new Date();
    const lastLogin = new Date(this.lastLoginAt);
    return Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
  }

  get isRecentlyActive(): boolean {
    return this.daysSinceLastLogin <= 30;
  }

  get isInactive(): boolean {
    return this.daysSinceLastLogin > 90;
  }

  get emergencyContactsCount(): number {
    return this.profile.emergencyContacts.length;
  }

  get primaryEmergencyContact(): typeof this.profile.emergencyContacts[0] | undefined {
    return this.profile.emergencyContacts.find(contact => contact.priority === 1);
  }

  get languages(): string[] {
    return this.profile.languages;
  }

  get hasWorkContact(): boolean {
    return !!this.contactInformation.workContact;
  }

  get workEmail(): string | undefined {
    return this.contactInformation.workContact?.workEmail;
  }

  get workPhone(): string | undefined {
    return this.contactInformation.workContact?.workPhone;
  }

  // Validation methods
  validateAccessPermissions(): boolean {
    // Ensure at least one child has access permissions
    return this.children.some(child =>
      Object.values(child.accessPermissions).some(permission => permission)
    );
  }

  validateContactInformation(): boolean {
    // Ensure primary contact information is complete
    return !!(
      this.contactInformation.primaryEmail &&
      this.contactInformation.primaryPhone &&
      this.contactInformation.address.street &&
      this.contactInformation.address.city &&
      this.contactInformation.address.state &&
      this.contactInformation.address.postalCode &&
      this.contactInformation.address.country
    );
  }

  validateEmergencyContacts(): boolean {
    // Ensure at least one emergency contact exists
    return this.profile.emergencyContacts.length > 0;
  }

  // Utility methods
  getChildByStudentId(studentId: string): typeof this.children[0] | undefined {
    return this.children.find(child => child.studentId === studentId);
  }

  hasAccessToStudent(studentId: string): boolean {
    return this.children.some(child => child.studentId === studentId);
  }

  canAccessStudentFeature(studentId: string, feature: keyof typeof this.children[0]['accessPermissions']): boolean {
    const child = this.getChildByStudentId(studentId);
    if (!child) return false;

    // Check portal access level first
    switch (this.portalAccessLevel) {
      case TPortalAccessLevel.EMERGENCY_ONLY:
        return feature === 'receiveNotifications';
      case TPortalAccessLevel.VIEW_ONLY:
        return ['viewGrades', 'viewAttendance', 'viewAssignments', 'viewTimetable', 'viewFees', 'viewReports', 'receiveNotifications'].includes(feature);
      case TPortalAccessLevel.LIMITED_ACCESS:
        return child.accessPermissions[feature] || false;
      case TPortalAccessLevel.FULL_ACCESS:
        return true;
      default:
        return false;
    }
  }

  getAccessibleChildren(): typeof this.children {
    return this.children.filter(child =>
      Object.values(child.accessPermissions).some(permission => permission)
    );
  }

  getChildrenByGrade(grade: string): typeof this.children {
    return this.children.filter(child => child.grade === grade);
  }

  getChildrenByClass(className: string): typeof this.children {
    return this.children.filter(child => child.class === className);
  }
}