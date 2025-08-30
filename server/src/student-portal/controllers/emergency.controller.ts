// Academia Pro - Student Portal Emergency Controller
// Handles student emergency reporting, safety features, and emergency contacts

import { Controller, Get, Post, Param, Body, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { StudentPortalGuard } from '../guards/student-portal.guard';

@ApiTags('Student Portal - Emergency')
@Controller('student-portal/emergency')
@UseGuards(StudentPortalGuard)
export class StudentPortalEmergencyController {
  private readonly logger = new Logger(StudentPortalEmergencyController.name);

  constructor() {
    // Services will be injected here
  }

  @Post(':studentId/report')
  @ApiOperation({
    summary: 'Report emergency',
    description: 'Report an emergency situation requiring immediate attention',
  })
  @ApiParam({ name: 'studentId', description: 'Student identifier' })
  @ApiBody({
    description: 'Emergency report data',
    schema: {
      type: 'object',
      required: ['emergencyType', 'description', 'location'],
      properties: {
        emergencyType: {
          type: 'string',
          enum: ['medical', 'safety', 'harassment', 'bullying', 'accident', 'fire', 'security', 'mental_health', 'other'],
          description: 'Type of emergency',
        },
        description: { type: 'string', description: 'Detailed description of the emergency' },
        location: { type: 'string', description: 'Current location of the incident' },
        severity: {
          type: 'string',
          enum: ['low', 'medium', 'high', 'critical'],
          description: 'Emergency severity level',
        },
        witnesses: {
          type: 'array',
          items: { type: 'string' },
          description: 'Names of witnesses',
        },
        injuredParties: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              condition: { type: 'string' },
              contact: { type: 'string' },
            },
          },
          description: 'Information about injured parties',
        },
        attachments: {
          type: 'array',
          items: { type: 'string' },
          description: 'Photo/video evidence file URLs',
        },
        immediateActions: { type: 'string', description: 'Actions already taken' },
        contactNumber: { type: 'string', description: 'Contact phone number' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Emergency report submitted successfully',
  })
  async reportEmergency(
    @Param('studentId') studentId: string,
    @Body() emergencyData: any,
  ) {
    this.logger.log(`Emergency report from student ${studentId}: ${emergencyData.emergencyType}`);

    return {
      emergencyId: 'EMERG_' + Date.now(),
      studentId,
      emergencyType: emergencyData.emergencyType,
      severity: emergencyData.severity,
      status: 'reported',
      reportedAt: new Date(),
      priority: this.getEmergencyPriority(emergencyData.severity),
      assignedTo: {
        department: this.getAssignedDepartment(emergencyData.emergencyType),
        primaryContact: this.getPrimaryContact(emergencyData.emergencyType),
        estimatedResponseTime: this.getResponseTime(emergencyData.severity),
      },
      trackingNumber: 'TRK' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      notificationsSent: [
        'emergency_response_team',
        'school_administration',
        'parent_guardian',
        'local_authorities',
      ],
      message: 'Emergency report submitted successfully. Help is on the way.',
    };
  }

  @Get(':studentId/status/:emergencyId')
  @ApiOperation({
    summary: 'Get emergency status',
    description: 'Get status and updates for a reported emergency',
  })
  @ApiParam({ name: 'studentId', description: 'Student identifier' })
  @ApiParam({ name: 'emergencyId', description: 'Emergency report identifier' })
  @ApiResponse({
    status: 200,
    description: 'Emergency status retrieved successfully',
  })
  async getEmergencyStatus(
    @Param('studentId') studentId: string,
    @Param('emergencyId') emergencyId: string,
  ) {
    this.logger.log(`Getting emergency status for ${emergencyId} by student ${studentId}`);

    return {
      emergencyId,
      studentId,
      status: 'in_progress',
      lastUpdated: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      timeline: [
        {
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          status: 'reported',
          description: 'Emergency report received',
          updatedBy: 'System',
        },
        {
          timestamp: new Date(Date.now() - 25 * 60 * 1000),
          status: 'acknowledged',
          description: 'Report acknowledged by emergency response team',
          updatedBy: 'Emergency Coordinator',
        },
        {
          timestamp: new Date(Date.now() - 20 * 60 * 1000),
          status: 'responding',
          description: 'Emergency response team dispatched',
          updatedBy: 'Emergency Coordinator',
        },
        {
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          status: 'in_progress',
          description: 'Response team arrived at location',
          updatedBy: 'Field Officer',
        },
      ],
      assignedPersonnel: [
        {
          name: 'Dr. Sarah Johnson',
          role: 'Medical Officer',
          contact: '+1234567890',
          status: 'on_site',
        },
        {
          name: 'Officer Mike Wilson',
          role: 'Security Officer',
          contact: '+1234567891',
          status: 'responding',
        },
      ],
      nextSteps: [
        'Medical assessment in progress',
        'Parent notification sent',
        'Incident report being prepared',
      ],
      estimatedResolution: '2024-01-15T16:30:00Z',
    };
  }

  @Get(':studentId/contacts')
  @ApiOperation({
    summary: 'Get emergency contacts',
    description: 'Get comprehensive list of emergency contacts and procedures',
  })
  @ApiParam({ name: 'studentId', description: 'Student identifier' })
  @ApiResponse({
    status: 200,
    description: 'Emergency contacts retrieved successfully',
  })
  async getEmergencyContacts(@Param('studentId') studentId: string) {
    this.logger.log(`Getting emergency contacts for student: ${studentId}`);

    return {
      studentId,
      primaryContacts: [
        {
          id: 'contact-1',
          name: 'School Emergency Control Center',
          type: 'emergency_coordinator',
          phone: '+1234567890',
          email: 'emergency@school.edu',
          availability: '24/7',
          description: 'Main emergency coordination office',
          priority: 'critical',
        },
        {
          id: 'contact-2',
          name: 'School Nurse/Medical Officer',
          type: 'medical',
          phone: '+1234567891',
          email: 'nurse@school.edu',
          availability: 'School Hours + Emergency',
          description: 'Medical emergencies and first aid',
          priority: 'high',
        },
        {
          id: 'contact-3',
          name: 'School Security Office',
          type: 'security',
          phone: '+1234567892',
          email: 'security@school.edu',
          availability: '24/7',
          description: 'Security incidents and safety concerns',
          priority: 'high',
        },
      ],
      externalContacts: [
        {
          id: 'contact-4',
          name: 'Local Police Station',
          type: 'police',
          phone: '911',
          address: '123 Police Plaza, Downtown',
          description: 'Law enforcement for criminal incidents',
          priority: 'critical',
        },
        {
          id: 'contact-5',
          name: 'Fire Department',
          type: 'fire',
          phone: '911',
          address: '456 Fire Station, Downtown',
          description: 'Fire emergencies and rescue operations',
          priority: 'critical',
        },
        {
          id: 'contact-6',
          name: 'Ambulance Service',
          type: 'medical',
          phone: '911',
          description: 'Medical emergencies requiring ambulance',
          priority: 'critical',
        },
        {
          id: 'contact-7',
          name: 'Poison Control Center',
          type: 'medical',
          phone: '+18002221222',
          description: 'Poisoning and chemical exposure emergencies',
          priority: 'high',
        },
      ],
      parentContacts: [
        {
          id: 'contact-8',
          name: 'Primary Parent/Guardian',
          relationship: 'Mother',
          phone: '+1234567893',
          email: 'parent@example.com',
          priority: 'critical',
        },
        {
          id: 'contact-9',
          name: 'Secondary Parent/Guardian',
          relationship: 'Father',
          phone: '+1234567894',
          email: 'parent2@example.com',
          priority: 'critical',
        },
      ],
      emergencyProcedures: {
        medical: {
          immediate: [
            'Ensure student safety',
            'Call medical emergency number',
            'Provide basic first aid if trained',
            'Contact parents immediately',
          ],
          followUp: [
            'Complete incident report',
            'Medical documentation',
            'Follow-up care coordination',
          ],
        },
        safety: {
          immediate: [
            'Move to safe location',
            'Alert nearby staff',
            'Call security office',
            'Account for all students',
          ],
          followUp: [
            'Security assessment',
            'Parent notification',
            'Incident investigation',
          ],
        },
        harassment: {
          immediate: [
            'Ensure immediate safety',
            'Document incident details',
            'Contact counselor immediately',
            'Preserve evidence if possible',
          ],
          followUp: [
            'Formal investigation',
            'Support services coordination',
            'Prevention measures',
          ],
        },
      },
      emergencyNumbers: {
        schoolEmergency: '+1234567890',
        medicalEmergency: '911',
        police: '911',
        fire: '911',
        poisonControl: '+18002221222',
        suicidePrevention: '+19882554667',
      },
      safetyFeatures: {
        panicButton: {
          available: true,
          description: 'One-touch emergency alert button',
          locations: ['Classrooms', 'Corridors', 'Sports facilities'],
        },
        emergencyAlerts: {
          available: true,
          description: 'Automated emergency notification system',
          coverage: 'All students, staff, and parents',
        },
        safeZones: [
          {
            name: 'Main Assembly Hall',
            location: 'Building A, Ground Floor',
            capacity: 500,
            emergencySupplies: ['First aid kits', 'Flashlights', 'Water'],
          },
          {
            name: 'Library Safe Room',
            location: 'Library Building, Basement',
            capacity: 100,
            emergencySupplies: ['Emergency phones', 'Medical supplies'],
          },
        ],
      },
    };
  }

  @Get(':studentId/safety-resources')
  @ApiOperation({
    summary: 'Get safety resources',
    description: 'Get safety information, procedures, and resources',
  })
  @ApiParam({ name: 'studentId', description: 'Student identifier' })
  @ApiResponse({
    status: 200,
    description: 'Safety resources retrieved successfully',
  })
  async getSafetyResources(@Param('studentId') studentId: string) {
    this.logger.log(`Getting safety resources for student: ${studentId}`);

    return {
      studentId,
      safetyGuides: [
        {
          id: 'guide-1',
          title: 'Campus Safety Guidelines',
          category: 'general_safety',
          description: 'Comprehensive guide to staying safe on campus',
          downloadUrl: '/resources/safety/campus-safety-guide.pdf',
          lastUpdated: '2024-01-01',
          readStatus: 'unread',
        },
        {
          id: 'guide-2',
          title: 'Emergency Evacuation Procedures',
          category: 'emergency_procedures',
          description: 'Step-by-step guide for emergency evacuation',
          downloadUrl: '/resources/safety/evacuation-procedures.pdf',
          lastUpdated: '2024-01-01',
          readStatus: 'read',
        },
        {
          id: 'guide-3',
          title: 'Cybersecurity Best Practices',
          category: 'digital_safety',
          description: 'Protecting yourself online and from cyber threats',
          downloadUrl: '/resources/safety/cybersecurity-guide.pdf',
          lastUpdated: '2024-01-01',
          readStatus: 'unread',
        },
      ],
      emergencyPreparedness: {
        drills: [
          {
            type: 'Fire Drill',
            frequency: 'Monthly',
            lastDrill: '2024-01-10',
            nextDrill: '2024-02-10',
            participation: 'Required for all students',
          },
          {
            type: 'Earthquake Drill',
            frequency: 'Quarterly',
            lastDrill: '2023-12-15',
            nextDrill: '2024-03-15',
            participation: 'Required for all students',
          },
          {
            type: 'Lockdown Drill',
            frequency: 'Semi-annual',
            lastDrill: '2023-11-20',
            nextDrill: '2024-05-20',
            participation: 'Required for all students',
          },
        ],
        emergencyKits: {
          classroom: ['First aid kit', 'Flashlight', 'Whistle', 'Emergency contact list'],
          laboratory: ['Fire extinguisher', 'Safety goggles', 'Emergency shower', 'Eyewash station'],
          sports: ['First aid kit', 'Splints', 'Ice packs', 'Emergency blanket'],
        },
      },
      safetyTips: [
        {
          category: 'Personal Safety',
          tips: [
            'Always walk in well-lit areas',
            'Never walk alone at night',
            'Keep emergency contacts updated',
            'Trust your instincts about unsafe situations',
          ],
        },
        {
          category: 'Digital Safety',
          tips: [
            'Use strong passwords',
            'Be cautious with personal information online',
            'Report cyberbullying immediately',
            'Use school-approved apps and websites',
          ],
        },
        {
          category: 'Health & Wellness',
          tips: [
            'Know the location of first aid stations',
            'Report injuries immediately',
            'Stay hydrated and eat regularly',
            'Seek help for mental health concerns',
          ],
        },
      ],
      reportingOptions: [
        {
          type: 'anonymous',
          description: 'Report incidents anonymously',
          available: true,
          contact: 'anonymous@school.edu',
        },
        {
          type: 'confidential',
          description: 'Report with confidentiality protection',
          available: true,
          contact: 'counselor@school.edu',
        },
        {
          type: 'formal',
          description: 'Formal incident report',
          available: true,
          contact: 'security@school.edu',
        },
      ],
    };
  }

  @Post(':studentId/safety-check')
  @ApiOperation({
    summary: 'Submit safety check',
    description: 'Submit a safety check-in during emergency situations',
  })
  @ApiParam({ name: 'studentId', description: 'Student identifier' })
  @ApiBody({
    description: 'Safety check data',
    schema: {
      type: 'object',
      required: ['status', 'location'],
      properties: {
        status: {
          type: 'string',
          enum: ['safe', 'need_assistance', 'injured', 'unknown'],
          description: 'Current safety status',
        },
        location: { type: 'string', description: 'Current location' },
        condition: { type: 'string', description: 'Physical condition description' },
        needs: {
          type: 'array',
          items: { type: 'string' },
          description: 'Assistance needed',
        },
        contactInfo: { type: 'string', description: 'Alternative contact information' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Safety check submitted successfully',
  })
  async submitSafetyCheck(
    @Param('studentId') studentId: string,
    @Body() safetyData: any,
  ) {
    this.logger.log(`Safety check submitted by student ${studentId}: ${safetyData.status}`);

    return {
      checkId: 'CHECK_' + Date.now(),
      studentId,
      status: safetyData.status,
      location: safetyData.location,
      submittedAt: new Date(),
      acknowledged: true,
      acknowledgedAt: new Date(),
      followUpRequired: safetyData.status !== 'safe',
      message: safetyData.status === 'safe'
        ? 'Safety check confirmed. Thank you for updating your status.'
        : 'Assistance request noted. Help is being arranged.',
    };
  }

  @Get(':studentId/history')
  @ApiOperation({
    summary: 'Get emergency history',
    description: 'Get history of emergency reports and safety incidents',
  })
  @ApiParam({ name: 'studentId', description: 'Student identifier' })
  @ApiResponse({
    status: 200,
    description: 'Emergency history retrieved successfully',
  })
  async getEmergencyHistory(@Param('studentId') studentId: string) {
    this.logger.log(`Getting emergency history for student: ${studentId}`);

    return {
      studentId,
      totalIncidents: 3,
      incidents: [
        {
          id: 'incident-1',
          type: 'medical',
          description: 'Minor injury during sports activity',
          date: '2024-01-08',
          status: 'resolved',
          severity: 'low',
          location: 'Basketball Court',
          response: 'First aid provided, parent notified',
          followUp: 'Rest recommended for 2 days',
        },
        {
          id: 'incident-2',
          type: 'safety',
          description: 'Lost item reported',
          date: '2023-12-15',
          status: 'resolved',
          severity: 'low',
          location: 'Library',
          response: 'Item located and returned',
          followUp: 'Reminder about item security',
        },
        {
          id: 'incident-3',
          type: 'harassment',
          description: 'Bullying incident reported',
          date: '2023-11-20',
          status: 'resolved',
          severity: 'medium',
          location: 'Classroom',
          response: 'Investigation conducted, counseling provided',
          followUp: 'Ongoing monitoring and support',
        },
      ],
      statistics: {
        totalIncidents: 3,
        byType: {
          medical: 1,
          safety: 1,
          harassment: 1,
        },
        bySeverity: {
          low: 2,
          medium: 1,
          high: 0,
          critical: 0,
        },
        resolutionRate: 100,
        averageResponseTime: '25 minutes',
      },
      safetyScore: {
        current: 95,
        trend: 'improving',
        factors: [
          'Regular safety check compliance',
          'Low incident rate',
          'Quick response times',
        ],
      },
    };
  }

  private getEmergencyPriority(severity: string): string {
    switch (severity) {
      case 'critical':
        return 'immediate';
      case 'high':
        return 'urgent';
      case 'medium':
        return 'high';
      case 'low':
        return 'normal';
      default:
        return 'normal';
    }
  }

  private getAssignedDepartment(emergencyType: string): string {
    switch (emergencyType) {
      case 'medical':
      case 'mental_health':
        return 'Medical Services';
      case 'safety':
      case 'accident':
      case 'fire':
        return 'Safety & Security';
      case 'harassment':
      case 'bullying':
        return 'Counseling Services';
      case 'security':
        return 'Security Department';
      default:
        return 'Emergency Response Team';
    }
  }

  private getPrimaryContact(emergencyType: string): string {
    switch (emergencyType) {
      case 'medical':
      case 'mental_health':
        return 'School Nurse';
      case 'safety':
      case 'accident':
      case 'fire':
        return 'Safety Officer';
      case 'harassment':
      case 'bullying':
        return 'School Counselor';
      case 'security':
        return 'Security Chief';
      default:
        return 'Emergency Coordinator';
    }
  }

  private getResponseTime(severity: string): string {
    switch (severity) {
      case 'critical':
        return '2-5 minutes';
      case 'high':
        return '5-15 minutes';
      case 'medium':
        return '15-30 minutes';
      case 'low':
        return '30-60 minutes';
      default:
        return '15-30 minutes';
    }
  }
}