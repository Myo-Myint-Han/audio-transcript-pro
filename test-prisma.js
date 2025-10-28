// Since we're in the root, we need to adjust the import path
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

async function testPrisma() {
  console.log("🧪 Starting Prisma test...");
  console.log("📁 Current directory:", __dirname);

  try {
    // Test 1: Basic database connection
    console.log("\n1. Testing database connection...");
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log("✅ Database connection working:", result);

    // Test 2: Count users
    console.log("\n2. Testing User model access...");
    const userCount = await prisma.user.count();
    console.log("✅ User model accessible. Total users:", userCount);

    // Test 3: Try to find or create a test user
    console.log("\n3. Testing user creation...");
    const testEmail = `test-${Date.now()}@example.com`;

    const existingUser = await prisma.user.findUnique({
      where: { email: testEmail },
    });

    if (existingUser) {
      console.log("ℹ️ Test user already exists:", existingUser.id);
    } else {
      // Create a test user with hashed password
      const bcrypt = require("bcryptjs");
      const hashedPassword = await bcrypt.hash("testpassword123", 12);

      const testUser = await prisma.user.create({
        data: {
          name: "Test User",
          email: testEmail,
          password: hashedPassword,
        },
      });
      console.log("✅ Test user created:", testUser.id);

      // Clean up: delete the test user
      await prisma.user.delete({
        where: { id: testUser.id },
      });
      console.log("🧹 Test user cleaned up");
    }

    // Test 4: Test transcript model
    console.log("\n4. Testing Transcript model...");
    const transcriptCount = await prisma.transcript.count();
    console.log(
      "✅ Transcript model accessible. Total transcripts:",
      transcriptCount
    );

    console.log("\n🎉 ALL PRISMA TESTS PASSED!");
    console.log("✅ Database connection working");
    console.log("✅ Models accessible");
    console.log("✅ Ready for deployment to Vercel");
  } catch (error) {
    console.error("\n❌ PRISMA TEST FAILED:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);

    if (
      error.message.includes("Query Engine") ||
      error.message.includes("prisma")
    ) {
      console.error("🔧 This appears to be a Prisma engine issue!");
    }

    if (error.message.includes("P1001")) {
      console.error("🔧 Database connection issue - check your DATABASE_URL");
    }

    console.error("Stack trace:", error.stack);
  } finally {
    await prisma.$disconnect();
    console.log("\n🔌 Prisma connection closed");
  }
}

// Run the test
testPrisma();
