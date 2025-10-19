import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create initial admin user as per FR-010
  const adminEmail = 'admin@example.com';
  const adminPassword = '0000';

  // Check if admin user already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log(`Admin user already exists: ${adminEmail}`);
  } else {
    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(adminPassword, saltRounds);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Administrator',
        password_hash,
        role: Role.ADMIN,
        is_active: true,
      },
    });

    console.log(`Created initial admin user: ${admin.email}`);
    console.log(`Admin password: ${adminPassword}`);
    console.log('IMPORTANT: Change the admin password immediately after first login!');
  }

  console.log('Database seed completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error during database seed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

