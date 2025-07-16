import { NextRequest, NextResponse } from "next/server";
import { getAllTeamMembers, createTeamMember } from "@/lib/db";

export async function GET() {
  try {
    const teamMembers = await getAllTeamMembers();
    return NextResponse.json(teamMembers);
  } catch (error) {
    console.error("Error fetching team members:", error);
    return NextResponse.json(
      { error: "Failed to fetch team members" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { employeeId, name } = await request.json();

    if (!employeeId || !name) {
      return NextResponse.json(
        { error: "Employee ID and name are required" },
        { status: 400 }
      );
    }

    const teamMember = await createTeamMember(employeeId, name);
    return NextResponse.json(teamMember, { status: 201 });
  } catch (error: any) {
    console.error("Error creating team member:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Employee ID already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create team member" },
      { status: 500 }
    );
  }
}
