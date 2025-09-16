import { test, expect } from '@playwright/test';

// Helper functions to generate unique test data
function generateUniqueId() {
  return Date.now() + Math.random().toString(36).substr(2, 9);
}

function generateRandomName() {
  const firstNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return { firstName, lastName };
}

function generateUniqueEmail(name: string) {
  const uniqueId = generateUniqueId();
  return `${name.toLowerCase()}.${uniqueId}@testmail.com`;
}

function generateUniquePhone() {
  const prefixes = ['810', '811', '812', '813', '814', '815', '816', '817', '818', '819'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = Math.floor(Math.random() * 90000000) + 10000000; // 8 digits
  return prefix + number.toString();
}

function generateUniqueAddress() {
  const streets = ['Main Street', 'Oak Avenue', 'Pine Road', 'Elm Street', 'Maple Drive', 'Cedar Lane'];
  const cities = ['Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Ibadan', 'Benin City'];
  const street = streets[Math.floor(Math.random() * streets.length)];
  const city = cities[Math.floor(Math.random() * cities.length)];
  const postalCode = Math.floor(Math.random() * 90000) + 10000;
  return { street, city, postalCode: postalCode.toString() };
}

function generateUniqueDoctorInfo() {
  const firstNames = ['Dr. Sarah', 'Dr. Michael', 'Dr. Jennifer', 'Dr. David', 'Dr. Lisa'];
  const lastNames = ['Johnson', 'Williams', 'Brown', 'Davis', 'Miller'];
  const clinics = ['City Hospital', 'General Medical Center', 'Community Health Clinic', 'Regional Hospital', 'Medical Plaza'];
  const name = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
  const clinic = clinics[Math.floor(Math.random() * clinics.length)];
  return { name, clinic };
}

function generateRandomRelationship() {
  const relationships = ['father', 'mother', 'brother', 'sister', 'uncle', 'aunt', 'grandfather', 'grandmother', 'guardian', 'other'];
  return relationships[Math.floor(Math.random() * relationships.length)];
}

function getRelationshipDisplayName(relationship: string): string {
  const displayNames: Record<string, string> = {
    'father': 'Father',
    'mother': 'Mother',
    'brother': 'Brother',
    'sister': 'Sister',
    'uncle': 'Uncle',
    'aunt': 'Aunt',
    'grandfather': 'Grandfather',
    'grandmother': 'Grandmother',
    'guardian': 'Guardian',
    'other': 'Other'
  };
  return displayNames[relationship] || relationship;
}

test.describe('Student Management', () => {
  test('Create Student - Full Flow with Validations', async ({ page }) => {
    // Generate unique test data
    const studentName = generateRandomName();
    const studentEmail = generateUniqueEmail(`${studentName.firstName}.${studentName.lastName}`);
    const studentPhone = generateUniquePhone();
    const address = generateUniqueAddress();
    const fatherName = generateRandomName();
    const fatherEmail = generateUniqueEmail(`${fatherName.firstName}.${fatherName.lastName}`);
    const fatherPhone = generateUniquePhone();
    const motherName = generateRandomName();
    const motherEmail = generateUniqueEmail(`${motherName.firstName}.${motherName.lastName}`);
    const motherPhone = generateUniquePhone();
    const guardianName = generateRandomName();
    const guardianEmail = generateUniqueEmail(`${guardianName.firstName}.${guardianName.lastName}`);
    const guardianPhone = generateUniquePhone();
    const emergencyContactName = generateRandomName();
    const emergencyContactPhone = generateUniquePhone();
    const doctorInfo = generateUniqueDoctorInfo();
    const doctorPhone = generateUniquePhone();
    const guardianRelationship = generateRandomRelationship();

    // Navigate to sign-in page
    await page.goto('http://localhost:3000/auth/sign-in');

    // Fill sign-in form
    await page.getByRole('textbox', { name: 'Email Address' }).fill('john@yopmail.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('Test1234$');
    await page.getByText('Remember me').check();
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Wait for navigation to complete
    await page.waitForURL(/.*school-admin.*/, { timeout: 10000 });

    // Assert successful sign-in
    await expect(page).toHaveURL(/.*school-admin.*/);
    await expect(page.getByRole('link', { name: 'Students' })).toBeVisible();
    await page.getByRole('link', { name: 'Students' }).click();
    await expect(page.getByRole('main').locator('div').filter({ hasText: 'StudentsManage student information, enrollment, and academic recordsBulk' }).first()).toBeVisible();
    await page.getByRole('button', { name: 'Add Student' }).click();
    await page.getByRole('textbox', { name: 'First Name *' }).click();
    await page.getByRole('textbox', { name: 'First Name *' }).fill(studentName.firstName);
    await page.getByRole('textbox', { name: 'First Name *' }).press('Tab');
    await page.getByRole('textbox', { name: 'Last Name *' }).fill(studentName.lastName);
    await page.getByRole('textbox', { name: 'Middle Name' }).click();
    await page.getByRole('textbox', { name: 'Middle Name' }).fill('Middle');
    await page.getByRole('button', { name: 'Date of Birth *' }).click();
    await page.getByRole('button', { name: 'Wednesday, September 3rd,' }).click();
    await page.getByRole('combobox', { name: 'Gender *' }).click();
    await page.getByRole('option', { name: 'Female' }).click();
    await page.getByRole('combobox', { name: 'Blood Group' }).click();
    await page.getByRole('option', { name: 'A+' }).click();
    await page.getByRole('combobox', { name: 'Phone Number' }).click();
    await page.getByRole('option', { name: '🇳🇬 Nigeria +' }).click();
    await page.getByRole('textbox', { name: 'Enter phone number' }).click();
    await page.getByRole('textbox', { name: 'Enter phone number' }).fill(studentPhone);
    await page.getByRole('textbox', { name: 'Email Address' }).click();
    await page.getByRole('textbox', { name: 'Email Address' }).fill(studentEmail);
    await page.getByRole('textbox', { name: 'Street Address' }).click();
    await page.getByRole('textbox', { name: 'Street Address' }).fill(address.street);
    await page.getByRole('textbox', { name: 'City' }).click();
    await page.getByRole('textbox', { name: 'City' }).fill(address.city);
    await page.getByRole('combobox').filter({ hasText: 'Nigeria' }).click();
    await page.getByRole('option', { name: 'Nigeria' }).click();
    await page.getByRole('combobox', { name: 'State' }).click();
    await page.getByRole('option', { name: 'Abia' }).click();
    await page.getByRole('textbox', { name: 'Postal Code' }).click();
    await page.getByRole('textbox', { name: 'Postal Code' }).fill(address.postalCode);
    await page.getByRole('tab', { name: 'Academic' }).click();
    await expect(page.getByLabel('Academic').locator('div').filter({ hasText: 'Academic InformationSet up' }).first()).toBeVisible();
    await page.getByRole('combobox').filter({ hasText: 'Primary (PRY)' }).click();
    await page.getByRole('option', { name: 'Junior Secondary (JSS)' }).click();
    await page.getByRole('combobox').filter({ hasText: 'JSS 1' }).click();
    await page.getByRole('option', { name: 'JSS 2' }).click();
    await page.getByRole('combobox').filter({ hasText: 'Section A' }).click();
    await page.getByRole('option', { name: 'Section B' }).click();
    await page.getByRole('combobox').filter({ hasText: 'Regular' }).click();
    await page.getByRole('option', { name: 'Regular' }).click();
    await page.getByRole('button', { name: 'Admission Date *' }).click();
    await page.getByRole('button', { name: 'Wednesday, September 10th,' }).click();
    await page.getByRole('checkbox', { name: 'Boarding Student' }).click();
    await page.getByRole('tab', { name: 'Guardians' }).click();
    await expect(page.getByText('Guardian InformationAdd parent or guardian contact detailsFatherFather\'s')).toBeVisible();
    await page.getByRole('textbox', { name: 'Father\'s Name' }).click();
    await page.getByRole('textbox', { name: 'Father\'s Name' }).fill(`${fatherName.firstName} ${fatherName.lastName}`);
    await page.getByRole('combobox', { name: 'Father\'s Phone' }).click();
    await page.getByRole('option', { name: '🇳🇬 Nigeria +' }).click();
    await page.locator('label').filter({ hasText: 'Father\'s Phone🇳🇬+' }).getByPlaceholder('Enter phone number').click();
    await page.locator('label').filter({ hasText: 'Father\'s Phone🇳🇬+' }).getByPlaceholder('Enter phone number').fill(fatherPhone);
    await page.getByRole('textbox', { name: 'Father\'s Email' }).click();
    await page.getByRole('textbox', { name: 'Father\'s Email' }).fill(fatherEmail);
    await page.getByRole('textbox', { name: 'Father\'s Occupation' }).click();
    await page.getByRole('textbox', { name: 'Father\'s Occupation' }).fill('Teacher');
    await page.getByRole('textbox', { name: 'Mother\'s Name' }).click();
    await page.getByRole('textbox', { name: 'Mother\'s Name' }).fill(`${motherName.firstName} ${motherName.lastName}`);
    await page.getByRole('combobox', { name: 'Mother\'s Phone' }).click();
    await page.getByRole('option', { name: '🇳🇬 Nigeria +' }).click();
    await page.locator('label').filter({ hasText: 'Mother\'s Phone🇳🇬+' }).getByPlaceholder('Enter phone number').click();
    await page.locator('label').filter({ hasText: 'Mother\'s Phone🇳🇬+' }).getByPlaceholder('Enter phone number').fill(motherPhone);
    await page.getByRole('textbox', { name: 'Mother\'s Email' }).click();
    await page.getByRole('textbox', { name: 'Mother\'s Email' }).fill(motherEmail);
    await page.getByRole('textbox', { name: 'Mother\'s Occupation' }).click();
    await page.getByRole('textbox', { name: 'Mother\'s Occupation' }).fill('Seamstress');
    await page.getByRole('textbox', { name: 'Guardian\'s Name' }).click();
    await page.getByRole('textbox', { name: 'Guardian\'s Name' }).fill(`${guardianName.firstName} ${guardianName.lastName}`);
    await page.getByRole('combobox', { name: 'Guardian\'s Phone' }).click();
    await page.getByRole('option', { name: '🇳🇬 Nigeria +' }).click();
    await page.locator('label').filter({ hasText: 'Guardian\'s Phone🇳🇬+' }).getByPlaceholder('Enter phone number').click();
    await page.locator('label').filter({ hasText: 'Guardian\'s Phone🇳🇬+' }).getByPlaceholder('Enter phone number').fill(guardianPhone);
    await page.getByRole('combobox', { name: 'Relationship' }).click();
    await page.getByRole('option', { name: getRelationshipDisplayName(guardianRelationship) }).click();
    await page.getByRole('textbox', { name: 'Guardian\'s Email' }).click();
    await page.getByRole('textbox', { name: 'Guardian\'s Email' }).fill(guardianEmail);
    await page.getByRole('tab', { name: 'Medical' }).click();
    await expect(page.getByText('Medical InformationAdd medical details and emergency contactsAllergiesList any')).toBeVisible();
    await page.getByRole('textbox', { name: 'Allergies List any allergies' }).click();
    await page.getByRole('textbox', { name: 'Allergies List any allergies' }).fill('None');
    await page.getByRole('textbox', { name: 'Medications List current' }).click();
    await page.getByRole('textbox', { name: 'Medications List current' }).fill('None');
    await page.getByRole('textbox', { name: 'Medical Conditions List any' }).click();
    await page.getByRole('textbox', { name: 'Medical Conditions List any' }).fill('None');
    await page.getByRole('textbox', { name: 'Emergency Contact Name' }).click();
    await page.getByRole('textbox', { name: 'Emergency Contact Name' }).fill(`${emergencyContactName.firstName} ${emergencyContactName.lastName}`);
    await page.getByRole('combobox', { name: 'Emergency Contact Phone' }).click();
    await page.getByRole('option', { name: '🇳🇬 Nigeria +' }).click();
    await page.locator('label').filter({ hasText: 'Emergency Contact Phone🇳🇬+' }).getByPlaceholder('Enter phone number').click();
    await page.locator('label').filter({ hasText: 'Emergency Contact Phone🇳🇬+' }).getByPlaceholder('Enter phone number').fill(emergencyContactPhone);
    await page.getByRole('combobox', { name: 'Relationship' }).click();
    await page.getByRole('option', { name: getRelationshipDisplayName('mother') }).click();
    await page.getByRole('textbox', { name: 'Doctor\'s Name' }).click();
    await page.getByRole('textbox', { name: 'Doctor\'s Name' }).fill(doctorInfo.name);
    await page.getByRole('combobox', { name: 'Doctor\'s Phone' }).click();
    await page.getByRole('option', { name: '🇳🇬 Nigeria +' }).click();
    await page.locator('label').filter({ hasText: 'Doctor\'s Phone🇳🇬+' }).getByPlaceholder('Enter phone number').click();
    await page.locator('label').filter({ hasText: 'Doctor\'s Phone🇳🇬+' }).getByPlaceholder('Enter phone number').fill(doctorPhone);
    await page.getByRole('textbox', { name: 'Clinic/Hospital' }).click();
    await page.getByRole('textbox', { name: 'Clinic/Hospital' }).fill(doctorInfo.clinic);
    // Switch to Review tab
    await page.getByRole('tab', { name: 'Review' }).click();
    await expect(page.getByText('Review & SubmitPlease review all information before submittingPersonal')).toBeVisible();

    // Submit the form
    await page.getByRole('button', { name: 'Create Student' }).click();

    // Assert successful creation - wait for navigation back to students list
    await page.waitForURL(/.*students.*/, { timeout: 10000 });

    // Verify we're on the students page
    await expect(page).toHaveURL(/.*students.*/);

    // Search for the student to verify creation
    await page.getByPlaceholder('Search students...').fill(`${studentName.firstName} ${studentName.lastName}`);
    await expect(page.getByText(`${studentName.firstName} ${studentName.lastName}`)).toBeVisible();
  });
});