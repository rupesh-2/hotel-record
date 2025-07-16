import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || "file:./dev.db",
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Database helper functions
export async function getAllTeamMembers() {
  return await prisma.teamMember.findMany({
    include: {
      meals: {
        orderBy: {
          date: "desc",
        },
      },
    },
  });
}

export async function getTeamMemberById(id: string) {
  return await prisma.teamMember.findUnique({
    where: { id },
    include: {
      meals: {
        orderBy: {
          date: "desc",
        },
      },
    },
  });
}

export async function createTeamMember(employeeId: string, name: string) {
  return await prisma.teamMember.create({
    data: {
      employeeId,
      name,
    },
    include: {
      meals: true,
    },
  });
}

export async function deleteTeamMember(id: string) {
  return await prisma.teamMember.delete({
    where: { id },
  });
}

export async function updateMealEntry(
  teamMemberId: string,
  date: string,
  type: "CHICKEN" | "VEG" | null,
  cost: number
) {
  return await prisma.mealEntry.upsert({
    where: {
      teamMemberId_date: {
        teamMemberId,
        date,
      },
    },
    update: {
      type,
      cost,
    },
    create: {
      teamMemberId,
      date,
      type,
      cost,
    },
  });
}

export async function getMealEntry(teamMemberId: string, date: string) {
  return await prisma.mealEntry.findUnique({
    where: {
      teamMemberId_date: {
        teamMemberId,
        date,
      },
    },
  });
}

export async function getDailyTotals(date: string) {
  const meals = await prisma.mealEntry.findMany({
    where: { date },
    include: {
      teamMember: true,
    },
  });

  let totalCost = 0;
  let chickenCount = 0;
  let vegCount = 0;

  meals.forEach((meal) => {
    totalCost += meal.cost;
    if (meal.type === "CHICKEN") chickenCount++;
    if (meal.type === "VEG") vegCount++;
  });

  return { totalCost, chickenCount, vegCount, meals };
}

export async function getWeeklyTotals(startDate: string, endDate: string) {
  const meals = await prisma.mealEntry.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  return meals.reduce((total, meal) => total + meal.cost, 0);
}
