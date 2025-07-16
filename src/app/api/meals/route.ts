import { NextRequest, NextResponse } from "next/server";
import { updateMealEntry, getDailyTotals } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { teamMemberId, date, type, cost } = await request.json();

    if (!teamMemberId || !date) {
      return NextResponse.json(
        { error: "Team member ID and date are required" },
        { status: 400 }
      );
    }

    const mealEntry = await updateMealEntry(teamMemberId, date, type, cost);
    return NextResponse.json(mealEntry);
  } catch (error) {
    console.error("Error updating meal entry:", error);
    return NextResponse.json(
      { error: "Failed to update meal entry" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json(
        { error: "Date parameter is required" },
        { status: 400 }
      );
    }

    const dailyTotals = await getDailyTotals(date);
    return NextResponse.json(dailyTotals);
  } catch (error) {
    console.error("Error fetching daily totals:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily totals" },
      { status: 500 }
    );
  }
}
