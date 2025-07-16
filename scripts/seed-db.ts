import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create team members
  const teamMembers = [
    {
      employeeId: "EMP001",
      name: "Ahmed Khan",
      meals: [
        { date: "2024-01-10", type: "CHICKEN", cost: 220 },
        { date: "2024-01-11", type: "VEG", cost: 120 },
        { date: "2024-01-12", type: "CHICKEN", cost: 220 },
        { date: "2024-01-15", type: "CHICKEN", cost: 220 },
        { date: "2024-01-16", type: "VEG", cost: 120 },
        { date: "2024-01-17", type: null, cost: 0 },
        { date: "2024-01-18", type: "CHICKEN", cost: 220 },
        { date: "2024-01-19", type: "VEG", cost: 120 },
      ],
    },
    {
      employeeId: "EMP002",
      name: "Sarah Ali",
      meals: [
        { date: "2024-01-10", type: "VEG", cost: 120 },
        { date: "2024-01-11", type: "VEG", cost: 120 },
        { date: "2024-01-12", type: "CHICKEN", cost: 220 },
        { date: "2024-01-15", type: "VEG", cost: 120 },
        { date: "2024-01-16", type: "CHICKEN", cost: 220 },
        { date: "2024-01-17", type: "CHICKEN", cost: 220 },
        { date: "2024-01-18", type: "VEG", cost: 120 },
      ],
    },
    {
      employeeId: "EMP003",
      name: "Hassan Ahmed",
      meals: [
        { date: "2024-01-09", type: "CHICKEN", cost: 220 },
        { date: "2024-01-10", type: "CHICKEN", cost: 220 },
        { date: "2024-01-11", type: null, cost: 0 },
        { date: "2024-01-12", type: "VEG", cost: 120 },
        { date: "2024-01-15", type: "CHICKEN", cost: 220 },
        { date: "2024-01-16", type: null, cost: 0 },
        { date: "2024-01-17", type: "VEG", cost: 120 },
        { date: "2024-01-18", type: "CHICKEN", cost: 220 },
        { date: "2024-01-19", type: "CHICKEN", cost: 220 },
      ],
    },
  ];

  for (const memberData of teamMembers) {
    const { meals, ...memberInfo } = memberData;

    const member = await prisma.teamMember.create({
      data: memberInfo,
    });

    console.log(
      `✅ Created team member: ${member.name} (${member.employeeId})`
    );

    // Create meals for this member
    for (const mealData of meals) {
      await prisma.mealEntry.create({
        data: {
          ...mealData,
          teamMemberId: member.id,
        },
      });
    }

    console.log(`✅ Added ${meals.length} meals for ${member.name}`);
  }

  console.log("🎉 Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
