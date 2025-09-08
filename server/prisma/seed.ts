// Database seed file
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@santeia.com" },
    update: {},
    create: {
      email: "admin@santeia.com",
      name: "Admin User",
      role: "ADMIN",
      isActive: true,
      password: adminPassword,
    },
  });

  // Create test user
  const userPassword = await bcrypt.hash("user123", 12);
  const user = await prisma.user.upsert({
    where: { email: "user@santeia.com" },
    update: {},
    create: {
      email: "user@santeia.com",
      name: "Test User",
      role: "USER",
      isActive: true,
      password: userPassword,
    },
  });

  // Create sample conversation
  const conversation = await prisma.conversation.create({
    data: {
      title: "Welcome to SanteIA",
      userId: user.id,
    },
  });

  // Create sample messages
  await prisma.message.createMany({
    data: [
      {
        content: "Hello! I'm interested in learning about health and wellness.",
        role: "USER",
        conversationId: conversation.id,
        userId: user.id,
      },
      {
        content: "Hello! I'd be happy to help you learn about health and wellness. What specific topics are you most interested in? I can provide information about nutrition, exercise, mental health, preventive care, or any other health-related questions you might have.",
        role: "ASSISTANT",
        conversationId: conversation.id,
        userId: user.id,
      },
    ],
  });

  console.log("✅ Database seeded successfully!");
  console.log(`👤 Admin user created: ${admin.email}`);
  console.log(`👤 Test user created: ${user.email}`);
  console.log(`💬 Sample conversation created: ${conversation.title}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
