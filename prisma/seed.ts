import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting database seed...');

  // Clean existing data
  await prisma.user.deleteMany();

  // Create demo employee
  const employeePassword = await bcrypt.hash('admin123', 10);
  const employee = await prisma.user.create({
    data: {
      email: 'admin@agencia.com',
      password: employeePassword,
      firstName: 'Admin',
      lastName: 'User',
      role: Role.employee,
    },
  });
  console.log(`Created employee: ${employee.email}`);

  // Create demo customers
  const customerPassword = await bcrypt.hash('customer123', 10);
  const customers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'juan.perez@email.com',
        password: customerPassword,
        firstName: 'Juan',
        lastName: 'Perez',
        role: Role.customer,
      },
    }),
    prisma.user.create({
      data: {
        email: 'maria.garcia@email.com',
        password: customerPassword,
        firstName: 'Maria',
        lastName: 'Garcia',
        role: Role.customer,
      },
    }),
    prisma.user.create({
      data: {
        email: 'carlos.lopez@email.com',
        password: customerPassword,
        firstName: 'Carlos',
        lastName: 'Lopez',
        role: Role.customer,
      },
    }),
  ]);
  console.log(`Created ${customers.length} customers`);

  console.log('Database seed completed!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
