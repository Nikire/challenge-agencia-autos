import { PrismaClient, Role, CarCategory } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting database seed...');

  // Clean existing data (order matters due to foreign keys)
  await prisma.discount.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.car.deleteMany();
  await prisma.branch.deleteMany();
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

  // Create branches
  const branches = await Promise.all([
    prisma.branch.create({
      data: {
        name: 'Sucursal Centro',
        address: 'Av. Corrientes 1234',
        city: 'Buenos Aires',
        phone: '+54 11 4567-8900',
      },
    }),
    prisma.branch.create({
      data: {
        name: 'Sucursal Aeropuerto',
        address: 'Aeropuerto Internacional Ezeiza',
        city: 'Ezeiza',
        phone: '+54 11 4567-8901',
      },
    }),
    prisma.branch.create({
      data: {
        name: 'Sucursal Norte',
        address: 'Av. del Libertador 5678',
        city: 'Vicente Lopez',
        phone: '+54 11 4567-8902',
      },
    }),
  ]);
  console.log(`Created ${branches.length} branches`);

  // Create cars
  const cars = await Promise.all([
    prisma.car.create({
      data: {
        brand: 'Toyota',
        model: 'Corolla',
        year: 2024,
        category: CarCategory.sedan,
        dailyPrice: 45.99,
        description: 'Sedan compacto ideal para ciudad y viajes',
      },
    }),
    prisma.car.create({
      data: {
        brand: 'Toyota',
        model: 'Hilux',
        year: 2024,
        category: CarCategory.pickup,
        dailyPrice: 89.99,
        description: 'Pickup resistente para todo terreno',
      },
    }),
    prisma.car.create({
      data: {
        brand: 'Ford',
        model: 'Focus',
        year: 2023,
        category: CarCategory.hatchback,
        dailyPrice: 39.99,
        description: 'Hatchback deportivo y economico',
      },
    }),
    prisma.car.create({
      data: {
        brand: 'Volkswagen',
        model: 'Tiguan',
        year: 2024,
        category: CarCategory.suv,
        dailyPrice: 75.99,
        description: 'SUV familiar con amplio espacio',
      },
    }),
    prisma.car.create({
      data: {
        brand: 'Mercedes-Benz',
        model: 'Clase E',
        year: 2024,
        category: CarCategory.luxury,
        dailyPrice: 150.99,
        description: 'Sedan de lujo con todas las comodidades',
      },
    }),
    prisma.car.create({
      data: {
        brand: 'Renault',
        model: 'Kangoo',
        year: 2023,
        category: CarCategory.van,
        dailyPrice: 55.99,
        description: 'Van espaciosa para familias o carga',
      },
    }),
  ]);
  console.log(`Created ${cars.length} cars`);

  // Create inventory (stock for each car at each branch)
  // Some entries have 0 stock for testing unavailability scenarios
  const inventoryData: { branchId: string; carId: string; quantity: number }[] =
    [];

  for (const branch of branches) {
    for (const car of cars) {
      // ~25% chance of 0 stock, otherwise 1-8 units
      const quantity = Math.random() < 0.25 ? 0 : Math.floor(Math.random() * 8) + 1;
      inventoryData.push({
        branchId: branch.id,
        carId: car.id,
        quantity,
      });
    }
  }

  await prisma.inventory.createMany({
    data: inventoryData,
  });

  const outOfStock = inventoryData.filter((i) => i.quantity === 0).length;
  console.log(`Created ${inventoryData.length} inventory entries (${outOfStock} out of stock)`);

  // Create discounts for customers
  const now = new Date();
  const nextYear = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
  const lastYear = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

  const discounts = await Promise.all([
    // Juan Perez - Active 10% loyal customer discount
    prisma.discount.create({
      data: {
        userId: customers[0].id,
        percentage: 10,
        description: 'Loyal customer discount',
        validFrom: lastYear,
        validUntil: nextYear,
        isActive: true,
      },
    }),
    // Juan Perez - Active 15% seasonal promotion (higher, will be applied)
    prisma.discount.create({
      data: {
        userId: customers[0].id,
        percentage: 15,
        description: 'Summer promotion 2024',
        validFrom: now,
        validUntil: nextYear,
        isActive: true,
      },
    }),
    // Maria Garcia - Active 20% VIP discount
    prisma.discount.create({
      data: {
        userId: customers[1].id,
        percentage: 20,
        description: 'VIP customer discount',
        validFrom: lastYear,
        validUntil: nextYear,
        isActive: true,
      },
    }),
    // Maria Garcia - Expired discount (for testing)
    prisma.discount.create({
      data: {
        userId: customers[1].id,
        percentage: 25,
        description: 'Black Friday 2023',
        validFrom: new Date('2023-11-20'),
        validUntil: new Date('2023-11-30'),
        isActive: true,
      },
    }),
    // Carlos Lopez - Inactive discount (for testing)
    prisma.discount.create({
      data: {
        userId: customers[2].id,
        percentage: 5,
        description: 'First rental discount',
        validFrom: lastYear,
        validUntil: nextYear,
        isActive: false,
      },
    }),
  ]);
  console.log(`Created ${discounts.length} discounts`);

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
