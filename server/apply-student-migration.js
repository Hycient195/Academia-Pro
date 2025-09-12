const { Client } = require('pg');

// Database connection configuration
const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'admin',
  database: 'academia_pro'
});

async function applyStudentMigration() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL');

    // Apply the student migration changes
    const queries = [
      // Add new columns to students table
      `ALTER TABLE students ADD COLUMN IF NOT EXISTS stage VARCHAR(10);`,
      `ALTER TABLE students ADD COLUMN IF NOT EXISTS grade_code VARCHAR(10);`,
      `ALTER TABLE students ADD COLUMN IF NOT EXISTS stream_section VARCHAR(20);`,
      `ALTER TABLE students ADD COLUMN IF NOT EXISTS is_boarding BOOLEAN DEFAULT false;`,
      `ALTER TABLE students ADD COLUMN IF NOT EXISTS promotion_history JSONB DEFAULT '[]'::jsonb;`,
      `ALTER TABLE students ADD COLUMN IF NOT EXISTS transfer_history JSONB DEFAULT '[]'::jsonb;`,
      `ALTER TABLE students ADD COLUMN IF NOT EXISTS graduation_year INTEGER;`,

      // Create indexes for better performance
      `CREATE INDEX IF NOT EXISTS idx_students_school_stage_grade_status ON students (school_id, stage, grade_code, status);`,

      // Migrate legacy data (this is a simple mapping - adjust as needed)
      `UPDATE students
       SET
         stage = CASE
           WHEN current_grade LIKE '%Nursery%' OR current_grade LIKE '%KG%' THEN 'EY'
           WHEN current_grade LIKE '%Primary%' THEN 'PRY'
           WHEN current_grade LIKE '%JSS%' THEN 'JSS'
           WHEN current_grade LIKE '%SSS%' THEN 'SSS'
           ELSE 'PRY'
         END,
         grade_code = CASE
           WHEN current_grade = 'Primary 1' THEN 'PRY1'
           WHEN current_grade = 'Primary 2' THEN 'PRY2'
           WHEN current_grade = 'Primary 3' THEN 'PRY3'
           WHEN current_grade = 'Primary 4' THEN 'PRY4'
           WHEN current_grade = 'Primary 5' THEN 'PRY5'
           WHEN current_grade = 'Primary 6' THEN 'PRY6'
           WHEN current_grade = 'JSS 1' THEN 'JSS1'
           WHEN current_grade = 'JSS 2' THEN 'JSS2'
           WHEN current_grade = 'JSS 3' THEN 'JSS3'
           WHEN current_grade = 'SSS 1' THEN 'SSS1'
           WHEN current_grade = 'SSS 2' THEN 'SSS2'
           WHEN current_grade = 'SSS 3' THEN 'SSS3'
           ELSE 'PRY1'
         END,
         stream_section = COALESCE(stream_section, current_section)
       WHERE stage IS NULL OR grade_code IS NULL;`,

      // Set default values for new columns
      `UPDATE students SET is_boarding = false WHERE is_boarding IS NULL;`,
      `UPDATE students SET promotion_history = '[]'::jsonb WHERE promotion_history IS NULL;`,
      `UPDATE students SET transfer_history = '[]'::jsonb WHERE transfer_history IS NULL;`,
    ];

    for (const query of queries) {
      try {
        await client.query(query);
        console.log(`Applied: ${query.split('\n')[0]}...`);
      } catch (error) {
        console.error(`Error applying query: ${query.split('\n')[0]}...`, error.message);
        // Continue with other queries even if one fails
      }
    }

    console.log('Student migration applied successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.end();
    console.log('Disconnected from PostgreSQL');
  }
}

applyStudentMigration();