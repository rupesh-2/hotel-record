import { NextRequest, NextResponse } from "next/server";
import { deleteTeamMember, getTeamMemberById, prisma } from "@/lib/db";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if team member exists
    const existingMember = await getTeamMemberById(id);
    if (!existingMember) {
      return NextResponse.json(
        { error: "Team member not found" },
        { status: 404 }
      );
    }

    await deleteTeamMember(id);
    return NextResponse.json({ message: "Team member deleted successfully" });
  } catch (error) {
    console.error("Error deleting team member:", error);
    return NextResponse.json(
      { error: "Failed to delete team member" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { name, employeeId } = await request.json();
    if (!name || !employeeId) {
      return NextResponse.json(
        { error: "Name and employeeId are required" },
        { status: 400 }
      );
    }
    // Check for duplicate employeeId
    const existing = await prisma.teamMember.findFirst({
      where: { employeeId, NOT: { id } },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Employee ID already exists" },
        { status: 409 }
      );
    }
    const updated = await prisma.teamMember.update({
      where: { id },
      data: { name, employeeId },
      include: { meals: true },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating team member:", error);
    return NextResponse.json(
      { error: "Failed to update team member" },
      { status: 500 }
    );
  }
}
