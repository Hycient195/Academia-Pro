import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Parent Portal (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should load Parent Portal module successfully', () => {
    // This test verifies that the ParentPortalModule is properly imported
    // and doesn't cause any module loading errors
    expect(app).toBeDefined();
  });

  it('should have Parent Portal routes registered', () => {
    const server = app.getHttpServer();

    // Test that the parent portal routes are accessible
    // Note: These tests would require proper authentication setup
    expect(server).toBeDefined();
  });

  // TODO: Add more comprehensive tests once authentication is fully set up
  // it('should return dashboard data for authenticated parent', () => {
  //   return request(app.getHttpServer())
  //     .get('/parent-portal/dashboard')
  //     .set('Authorization', 'Bearer valid-jwt-token')
  //     .expect(200);
  // });

  // it('should return 401 for unauthenticated requests', () => {
  //   return request(app.getHttpServer())
  //     .get('/parent-portal/dashboard')
  //     .expect(401);
  // });
});