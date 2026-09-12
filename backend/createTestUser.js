import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "./prismaClient.js";

const createTestUser = async () => {
  try {
    const hashedPassword = await bcrypt.hash("Test@12345", 10);

    const user = await prisma.user.upsert({
      where: {
        email: "testuser@example.com",
      },
      update: {},
      create: {
        email: "testuser@example.com",
        password: hashedPassword,
      },
    });

    console.log("Test user created successfully:");
    console.log(user);

  } catch (error) {
    console.error("Error creating test user:", error);
  } finally {
    await prisma.$disconnect();
  }
};

createTestUser();