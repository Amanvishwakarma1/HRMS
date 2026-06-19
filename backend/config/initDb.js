import { sequelize } from './db.js';

export const initializeExpenseDatabase = async () => {
  try {
    console.log('🔄 Initializing Expense module database tables...');

    // 1. Create expense_categories table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS expense_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        limit_amount DOUBLE PRECISION DEFAULT 0.0,
        active BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 2. Create expenses table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER,
        category_id INTEGER,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        amount DOUBLE PRECISION NOT NULL,
        expense_date DATE NOT NULL,
        currency VARCHAR(50) DEFAULT 'INR',
        project VARCHAR(255),
        payment_method VARCHAR(255),
        location VARCHAR(255),
        status VARCHAR(50) DEFAULT 'Draft',
        submitted_at TIMESTAMP WITH TIME ZONE,
        approved_at TIMESTAMP WITH TIME ZONE,
        reimbursed_at TIMESTAMP WITH TIME ZONE,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 3. Create expense_receipts table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS expense_receipts (
        id SERIAL PRIMARY KEY,
        expense_id INTEGER,
        filename VARCHAR(255) NOT NULL,
        file_url TEXT NOT NULL,
        file_type VARCHAR(100),
        file_size INTEGER,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 4. Create expense_approvals table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS expense_approvals (
        id SERIAL PRIMARY KEY,
        expense_id INTEGER,
        approver_id INTEGER,
        role VARCHAR(100) NOT NULL,
        status VARCHAR(100) NOT NULL,
        comments TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 5. Create expense_comments table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS expense_comments (
        id SERIAL PRIMARY KEY,
        expense_id INTEGER,
        user_id INTEGER,
        comment TEXT NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 6. Extend tables with new columns if they do not exist
    await sequelize.query(`
      ALTER TABLE reimbursements ADD COLUMN IF NOT EXISTS expense_id INTEGER;
      ALTER TABLE reimbursements ADD COLUMN IF NOT EXISTS approved_amount DOUBLE PRECISION;
      ALTER TABLE reimbursements ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP WITH TIME ZONE;
      ALTER TABLE reimbursements ADD COLUMN IF NOT EXISTS payment_status VARCHAR(100) DEFAULT 'Pending';
      ALTER TABLE reimbursements ADD COLUMN IF NOT EXISTS transaction_reference VARCHAR(255);
      ALTER TABLE expenses ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
      ALTER TABLE expenses ADD COLUMN IF NOT EXISTS request_message TEXT;
      ALTER TABLE employees ADD COLUMN IF NOT EXISTS manager_id INTEGER;
      ALTER TABLE employees ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active';
      ALTER TABLE employees ADD COLUMN IF NOT EXISTS gender VARCHAR(50) DEFAULT 'Male';
      ALTER TABLE employees ADD COLUMN IF NOT EXISTS employment_type VARCHAR(50) DEFAULT 'Permanent';
      ALTER TABLE employees ADD COLUMN IF NOT EXISTS tracking_enabled BOOLEAN DEFAULT true;
      ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
      ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS request_message TEXT;
    `);

    // 7. Create leave_requests, notifications, and regularizations tables
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS leave_requests (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
        type VARCHAR(255) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        reason TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending',
        approved_by INTEGER REFERENCES employees(id) ON DELETE SET NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
        type VARCHAR(100) DEFAULT 'info',
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS regularizations (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
        attendance_id INTEGER REFERENCES attendance(id) ON DELETE SET NULL,
        date DATE NOT NULL,
        reason TEXT NOT NULL,
        requested_check_in VARCHAR(50),
        requested_check_out VARCHAR(50),
        status VARCHAR(50) DEFAULT 'Pending',
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 7b. Create Job Openings, Applicants, Onboarding, and Announcements tables
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS job_openings (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        department VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'Active',
        vacancy_count INTEGER DEFAULT 1,
        description TEXT,
        created_by INTEGER,
        updated_by INTEGER,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "deletedAt" TIMESTAMP WITH TIME ZONE
      );
    `);

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS applicants (
        id SERIAL PRIMARY KEY,
        job_opening_id INTEGER REFERENCES job_openings(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        status VARCHAR(50) DEFAULT 'Applied',
        resume_url TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "deletedAt" TIMESTAMP WITH TIME ZONE
      );
    `);

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS onboarding (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
        status VARCHAR(100) DEFAULT 'Document Pending',
        onboarding_period_days INTEGER DEFAULT 30,
        verified_at TIMESTAMP WITH TIME ZONE,
        training_completed_at TIMESTAMP WITH TIME ZONE,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "deletedAt" TIMESTAMP WITH TIME ZONE
      );
    `);

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        priority VARCHAR(50) DEFAULT 'Low',
        target_audience VARCHAR(100) DEFAULT 'All',
        target_id VARCHAR(255),
        expiry_date TIMESTAMP WITH TIME ZONE,
        created_by INTEGER,
        updated_by INTEGER,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "deletedAt" TIMESTAMP WITH TIME ZONE
      );
    `);


    // Seed default categories if table is empty
    const categoryCount = await sequelize.query(
      'SELECT COUNT(*) FROM expense_categories', 
      { type: sequelize.QueryTypes.SELECT }
    );

    if (categoryCount && parseInt(categoryCount[0].count) === 0) {
      console.log('🌱 Seeding default expense categories...');
      const defaultCategories = [
        ['Travel', 'Company business travel costs'],
        ['Fuel', 'Fuel expense for transport allowance'],
        ['Food', 'Business dinner, meals and refreshments'],
        ['Accommodation', 'Hotel and lodging allowances'],
        ['Internet', 'Monthly home broadband reimbursement'],
        ['Mobile Bill', 'Mobile talktime and internet bills'],
        ['Office Supplies', 'Pens, papers, books and office stationary'],
        ['Medical', 'Out-patient medical checks or claims'],
        ['Client Meeting', 'Meals or travel for client engagement'],
        ['Training', 'Technical skills training or certifications'],
        ['Software Subscription', 'Subscriptions to IDEs or SaaS solutions'],
        ['Transportation', 'Local bus, metro, cab fares'],
        ['Miscellaneous', 'Other general company expenses']
      ];

      for (const [name, desc] of defaultCategories) {
        await sequelize.query(
          'INSERT INTO expense_categories (name, description, active, "createdAt", "updatedAt") VALUES (:name, :desc, true, NOW(), NOW())',
          { replacements: { name, desc } }
        );
      }
    }

    console.log('✅ Expense tables successfully verified in Neon Postgres!');
  } catch (err) {
    console.error('❌ Failed to run initialization DDL queries:', err.message);
  }
};
