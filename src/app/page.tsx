"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CalendarIcon,
  Users,
  DollarSign,
  Clock,
  TrendingUp,
  UserPlus,
  X,
  History,
  ArrowLeft,
  Database,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Dialog as EditDialog,
  DialogContent as EditDialogContent,
  DialogHeader as EditDialogHeader,
  DialogTitle as EditDialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";

interface MealEntry {
  id: string;
  date: string;
  type: "CHICKEN" | "VEG" | null;
  cost: number;
  teamMemberId: string;
}

interface TeamMember {
  id: string;
  employeeId: string;
  name: string;
  meals: MealEntry[];
  createdAt: string;
  updatedAt: string;
}

const MEAL_PRICES = {
  CHICKEN: 220,
  VEG: 120,
};

export default function MealTracker() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [selectedMemberHistory, setSelectedMemberHistory] =
    useState<TeamMember | null>(null);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberId, setNewMemberId] = useState("");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMember, setEditMember] = useState<TeamMember | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmployeeId, setEditEmployeeId] = useState("");
  const [editError, setEditError] = useState("");
  const [deleteMember, setDeleteMember] = useState<TeamMember | null>(null);
  const [deleteMemberHistory, setDeleteMemberHistory] = useState<MealEntry[]>(
    []
  );

  const selectedDateString = format(selectedDate, "yyyy-MM-dd");

  // Load data from database on component mount
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await fetch("/api/team-members");
        if (response.ok) {
          const data = await response.json();
          setTeamMembers(data);
        }
      } catch (error) {
        console.error("Error fetching team members:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  const updateMeal = async (
    memberId: string,
    mealType: "CHICKEN" | "VEG" | null
  ) => {
    try {
      const cost = mealType ? MEAL_PRICES[mealType] : 0;

      const response = await fetch("/api/meals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamMemberId: memberId,
          date: selectedDateString,
          type: mealType,
          cost,
        }),
      });

      if (response.ok) {
        // Refresh team members data
        const teamResponse = await fetch("/api/team-members");
        if (teamResponse.ok) {
          const data = await teamResponse.json();
          setTeamMembers(data);
        }
      }
    } catch (error) {
      console.error("Error updating meal:", error);
    }
  };

  const addNewMember = async () => {
    if (!newMemberName.trim() || !newMemberId.trim()) {
      return;
    }

    try {
      const response = await fetch("/api/team-members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employeeId: newMemberId.trim(),
          name: newMemberName.trim(),
        }),
      });

      if (response.ok) {
        // Refresh team members data
        const teamResponse = await fetch("/api/team-members");
        if (teamResponse.ok) {
          const data = await teamResponse.json();
          setTeamMembers(data);
        }
        setNewMemberName("");
        setNewMemberId("");
        setIsAddMemberOpen(false);
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to add team member");
      }
    } catch (error) {
      console.error("Error adding team member:", error);
      alert("Failed to add team member");
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const response = await fetch(`/api/team-members/${memberId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Refresh team members data
        const teamResponse = await fetch("/api/team-members");
        if (teamResponse.ok) {
          const data = await teamResponse.json();
          setTeamMembers(data);
        }
      }
    } catch (error) {
      console.error("Error removing team member:", error);
    }
  };

  const confirmDeleteMember = (member: TeamMember) => {
    setDeleteMember(member);

    // Calculate date 2 months ago
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    const twoMonthsAgoString = format(twoMonthsAgo, "yyyy-MM-dd");

    // Filter meals from the past 2 months
    const recentMeals = member.meals
      .filter((meal) => meal.date >= twoMonthsAgoString)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setDeleteMemberHistory(recentMeals);
  };

  const startEditMember = (member: TeamMember) => {
    setEditMember(member);
    setEditName(member.name);
    setEditEmployeeId(member.employeeId);
    setEditError("");
  };

  const saveEditMember = async () => {
    if (!editMember) return;
    if (!editName.trim() || !editEmployeeId.trim()) {
      setEditError("Name and Employee ID are required.");
      return;
    }
    try {
      const response = await fetch(`/api/team-members/${editMember.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          employeeId: editEmployeeId.trim(),
        }),
      });
      if (response.ok) {
        const teamResponse = await fetch("/api/team-members");
        if (teamResponse.ok) {
          const data = await teamResponse.json();
          setTeamMembers(data);
        }
        setEditMember(null);
      } else {
        const errorData = await response.json();
        setEditError(errorData.error || "Failed to update member");
      }
    } catch (error) {
      setEditError("Failed to update member");
    }
  };

  const getMemberMealForDate = (member: TeamMember, date: string) => {
    return (
      member.meals.find((meal) => meal.date === date) || {
        date,
        type: null,
        cost: 0,
      }
    );
  };

  const calculateDailyTotals = () => {
    let totalCost = 0;
    let chickenCount = 0;
    let vegCount = 0;

    teamMembers.forEach((member) => {
      const meal = getMemberMealForDate(member, selectedDateString);
      totalCost += meal.cost;
      if (meal.type === "CHICKEN") chickenCount++;
      if (meal.type === "VEG") vegCount++;
    });

    return { totalCost, chickenCount, vegCount };
  };

  const calculateWeeklyTotals = () => {
    let weeklyTotal = 0;
    const weekStart = new Date(selectedDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(weekStart);
      currentDate.setDate(weekStart.getDate() + i);
      const dateString = format(currentDate, "yyyy-MM-dd");

      teamMembers.forEach((member) => {
        const meal = getMemberMealForDate(member, dateString);
        weeklyTotal += meal.cost;
      });
    }

    return weeklyTotal;
  };

  const calculateMemberStats = (member: TeamMember) => {
    const totalSpent = member.meals.reduce((sum, meal) => sum + meal.cost, 0);
    const chickenMeals = member.meals.filter(
      (meal) => meal.type === "CHICKEN"
    ).length;
    const vegMeals = member.meals.filter((meal) => meal.type === "VEG").length;
    const totalMeals = chickenMeals + vegMeals;
    const averageDaily =
      totalMeals > 0 ? Math.round(totalSpent / totalMeals) : 0;

    return { totalSpent, chickenMeals, vegMeals, totalMeals, averageDaily };
  };

  const { totalCost, chickenCount, vegCount } = calculateDailyTotals();
  const weeklyTotal = calculateWeeklyTotals();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading meal tracker...</p>
        </div>
      </div>
    );
  }

  // If viewing member history, show the history view
  if (selectedMemberHistory) {
    const memberStats = calculateMemberStats(selectedMemberHistory);
    const sortedMeals = [...selectedMemberHistory.meals].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        {/* Header */}
        <header className="bg-blue-900 text-white shadow-lg">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => setSelectedMemberHistory(null)}
                className="text-white hover:bg-blue-800"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Meal History</h1>
                <p className="text-blue-200 mt-1">
                  {selectedMemberHistory.name} (ID: {selectedMemberHistory.id})
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Member Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <Card className="bg-white shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Spent
                </CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ₨{memberStats.totalSpent.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Meals
                </CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {memberStats.totalMeals}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Chicken Meals
                </CardTitle>
                <Badge
                  variant="secondary"
                  className="bg-orange-100 text-orange-800"
                >
                  🍗
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {memberStats.chickenMeals}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Veg Meals
                </CardTitle>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  🥗
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {memberStats.vegMeals}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Avg per Meal
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  ₨{memberStats.averageDaily}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Meal History Table */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Complete Meal History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sortedMeals.length > 0 ? (
                <div className="space-y-2">
                  {sortedMeals.map((meal, index) => (
                    <div
                      key={`${meal.date}-${index}`}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        meal.type === null
                          ? "bg-gray-50 border-gray-200"
                          : "bg-white border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-sm font-medium text-gray-600 w-24">
                          {format(new Date(meal.date), "MMM dd")}
                        </div>
                        <div className="text-xs text-gray-500 w-20">
                          {format(new Date(meal.date), "EEEE")}
                        </div>
                        <div className="flex items-center gap-2">
                          {meal.type === "CHICKEN" && (
                            <>
                              <span className="text-lg">🍗</span>
                              <span className="text-sm font-medium text-orange-700">
                                Chicken
                              </span>
                            </>
                          )}
                          {meal.type === "VEG" && (
                            <>
                              <span className="text-lg">🥗</span>
                              <span className="text-sm font-medium text-green-700">
                                Vegetarian
                              </span>
                            </>
                          )}
                          {meal.type === null && (
                            <>
                              <span className="text-lg text-gray-400">-</span>
                              <span className="text-sm text-gray-500">
                                No meal
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-lg font-bold ${
                            meal.cost > 0 ? "text-green-600" : "text-gray-400"
                          }`}
                        >
                          {meal.cost > 0 ? `₨${meal.cost}` : "₨0"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No meal history found for this member.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Edit Member Dialog */}
      <EditDialog
        open={!!editMember}
        onOpenChange={(open) => {
          if (!open) setEditMember(null);
        }}
      >
        <EditDialogContent className="sm:max-w-md">
          <EditDialogHeader>
            <EditDialogTitle>Edit Team Member</EditDialogTitle>
          </EditDialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-member-name">Full Name</Label>
              <Input
                id="edit-member-name"
                value={editName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditName(e.target.value)
                }
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-member-id">Employee ID</Label>
              <Input
                id="edit-member-id"
                value={editEmployeeId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditEmployeeId(e.target.value)
                }
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Enter a unique employee ID
              </p>
            </div>
            {editError && (
              <div className="text-red-600 text-sm">{editError}</div>
            )}
            <div className="flex gap-2 pt-4">
              <Button
                onClick={saveEditMember}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Save
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditMember(null)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </EditDialogContent>
      </EditDialog>

      {/* Delete Confirmation Dialog */}
      <EditDialog
        open={!!deleteMember}
        onOpenChange={(open) => {
          if (!open) setDeleteMember(null);
        }}
      >
        <EditDialogContent className="sm:max-w-md">
          <EditDialogHeader>
            <EditDialogTitle className="flex items-center gap-2 text-red-600">
              <svg
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 24 24"
                className="text-red-600"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                />
              </svg>
              Confirm Deletion
            </EditDialogTitle>
          </EditDialogHeader>
          <div className="space-y-4 pt-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium mb-2">
                Are you sure you want to delete this team member?
              </p>
              <p className="text-red-700 text-sm">
                This action will permanently remove{" "}
                <span className="font-semibold">{deleteMember?.name}</span> (ID:{" "}
                {deleteMember?.employeeId}) and all their meal records.
              </p>
              <p className="text-red-600 text-xs mt-2">
                This action cannot be undone.
              </p>
            </div>

            {/* Past 2 Months History */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                <History className="h-4 w-4" />
                Past 2 Months Meal History
              </h4>
              {deleteMemberHistory.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {deleteMemberHistory.map((meal, index) => (
                    <div
                      key={`${meal.date}-${index}`}
                      className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-gray-600 w-16">
                          {format(new Date(meal.date), "MMM dd")}
                        </span>
                        <div className="flex items-center gap-1">
                          {meal.type === "CHICKEN" && (
                            <>
                              <span className="text-sm">🍗</span>
                              <span className="text-orange-700">Chicken</span>
                            </>
                          )}
                          {meal.type === "VEG" && (
                            <>
                              <span className="text-sm">🥗</span>
                              <span className="text-green-700">Veg</span>
                            </>
                          )}
                          {meal.type === null && (
                            <span className="text-gray-400">No meal</span>
                          )}
                        </div>
                      </div>
                      <span className="font-medium text-gray-700">
                        {meal.cost > 0 ? `₨${meal.cost}` : "₨0"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p className="text-sm">
                    No meal records in the past 2 months
                  </p>
                </div>
              )}

              {/* Summary Stats */}
              {deleteMemberHistory.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-medium text-gray-700">
                        {deleteMemberHistory.length}
                      </div>
                      <div className="text-gray-500">Total Meals</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-orange-600">
                        {
                          deleteMemberHistory.filter(
                            (m) => m.type === "CHICKEN"
                          ).length
                        }
                      </div>
                      <div className="text-gray-500">Chicken</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-green-600">
                        {
                          deleteMemberHistory.filter((m) => m.type === "VEG")
                            .length
                        }
                      </div>
                      <div className="text-gray-500">Veg</div>
                    </div>
                  </div>
                  <div className="mt-2 text-center">
                    <div className="font-medium text-blue-600">
                      ₨
                      {deleteMemberHistory
                        .reduce((sum, meal) => sum + meal.cost, 0)
                        .toLocaleString()}
                    </div>
                    <div className="text-gray-500 text-xs">Total Spent</div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => {
                  if (deleteMember) {
                    removeMember(deleteMember.id);
                    setDeleteMember(null);
                  }
                }}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Delete Member
              </Button>
              <Button
                variant="outline"
                onClick={() => setDeleteMember(null)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </EditDialogContent>
      </EditDialog>
      {/* Header */}
      <header className="bg-blue-900 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex items-center">
              <img
                src="/ninja-infosys-logo.png"
                alt="Ninja Infosys Logo"
                className="h-12 w-auto mr-4"
              />
              <div className="text-left">
                <h2 className="text-lg font-semibold text-blue-100">
                  Ninja Infosys
                </h2>
                <p className="text-xs text-blue-200">Technology Solutions</p>
              </div>
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold">Office Meal Tracker</h1>
              <p className="text-blue-200 mt-2">Daily Meal Management System</p>
            </div>
            <div className="flex-1 flex justify-end">
              <Button
                variant="outline"
                onClick={() => window.open("/database", "_blank")}
                className="text-white border-white hover:bg-white hover:text-blue-900"
              >
                <Database className="h-4 w-4 mr-2" />
                View Database
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-64 justify-start text-left font-normal bg-transparent"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date: Date | undefined) =>
                    date && setSelectedDate(date)
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <Clock className="mr-1 h-3 w-3" />
              {format(selectedDate, "EEEE")}
            </Badge>
          </div>

          <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <UserPlus className="h-4 w-4 mr-2" />
                Add New Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Add New Team Member
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="member-name">Full Name</Label>
                  <Input
                    id="member-name"
                    placeholder="Enter member's full name"
                    value={newMemberName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNewMemberName(e.target.value)
                    }
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="member-id">Employee ID</Label>
                  <Input
                    id="member-id"
                    placeholder="e.g., EMP004, DEV001, etc."
                    value={newMemberId}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNewMemberId(e.target.value)
                    }
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">
                    Enter a unique employee ID
                  </p>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={addNewMember}
                    disabled={!newMemberName.trim() || !newMemberId.trim()}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Add Member
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setNewMemberName("");
                      setNewMemberId("");
                      setIsAddMemberOpen(false);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Panel */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Today's Total
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ₨{totalCost.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {format(selectedDate, "MMM dd")}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Weekly Total
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                ₨{weeklyTotal.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">This week</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Chicken Today
              </CardTitle>
              <Badge
                variant="secondary"
                className="bg-orange-100 text-orange-800"
              >
                🍗
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {chickenCount}
              </div>
              <p className="text-xs text-gray-500 mt-1">meals ordered</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Veg Today
              </CardTitle>
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                🥗
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {vegCount}
              </div>
              <p className="text-xs text-gray-500 mt-1">meals ordered</p>
            </CardContent>
          </Card>
        </div>

        {/* Team Member Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {teamMembers.map((member) => {
            const todaysMeal = getMemberMealForDate(member, selectedDateString);
            const recentMeals = member.meals
              .filter((meal) => meal.date !== selectedDateString)
              .sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime()
              )
              .slice(0, 3);

            return (
              <Card
                key={member.id}
                className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedMemberHistory(member)}
              >
                <CardHeader className="bg-blue-800 text-white rounded-t-lg">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {member.name}
                      </span>
                      <span className="text-xs text-blue-200 font-normal">
                        ID: {member.employeeId}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Edit Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          startEditMember(member);
                        }}
                        className="h-6 w-6 p-0 hover:bg-yellow-400 hover:text-white"
                        title="Edit"
                      >
                        <svg
                          width="16"
                          height="16"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15.232 5.232a3 3 0 1 1 4.243 4.243L7.5 21H3v-4.5l12.232-12.268Z"
                          />
                        </svg>
                      </Button>
                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          confirmDeleteMember(member);
                        }}
                        className="h-6 w-6 p-0 hover:bg-red-500 hover:text-white"
                        title="Remove"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-6">
                  {/* Click hint */}
                  <div className="mb-4 p-2 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-600 text-center flex items-center justify-center gap-1">
                      <History className="h-3 w-3" />
                      Click card to view full meal history
                    </p>
                  </div>

                  {/* Today's Meal Selection */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-700 mb-3">
                      Today's Meal
                    </h4>
                    <div className="flex gap-3">
                      <Button
                        variant={
                          todaysMeal.type === "CHICKEN" ? "default" : "outline"
                        }
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          updateMeal(
                            member.id,
                            todaysMeal.type === "CHICKEN" ? null : "CHICKEN"
                          );
                        }}
                        className={`flex-1 h-16 flex-col gap-1 ${
                          todaysMeal.type === "CHICKEN"
                            ? "bg-orange-500 hover:bg-orange-600 text-white"
                            : "border-orange-200 hover:bg-orange-50 text-orange-700"
                        }`}
                      >
                        <span className="text-lg">🍗</span>
                        <span className="text-xs">Chicken</span>
                        <span className="text-xs font-bold">₨220</span>
                      </Button>

                      <Button
                        variant={
                          todaysMeal.type === "VEG" ? "default" : "outline"
                        }
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          updateMeal(
                            member.id,
                            todaysMeal.type === "VEG" ? null : "VEG"
                          );
                        }}
                        className={`flex-1 h-16 flex-col gap-1 ${
                          todaysMeal.type === "VEG"
                            ? "bg-green-500 hover:bg-green-600 text-white"
                            : "border-green-200 hover:bg-green-50 text-green-700"
                        }`}
                      >
                        <span className="text-lg">🥗</span>
                        <span className="text-xs">Vegetarian</span>
                        <span className="text-xs font-bold">₨120</span>
                      </Button>
                    </div>

                    {todaysMeal.type === null && (
                      <p className="text-center text-gray-500 text-sm mt-3">
                        No meal selected for today
                      </p>
                    )}
                  </div>

                  {/* Recent Meals History */}
                  {recentMeals.length > 0 && (
                    <div className="border-t pt-4">
                      <h5 className="text-sm font-medium text-gray-600 mb-2">
                        Recent Meals
                      </h5>
                      <div className="space-y-1">
                        {recentMeals.map((meal) => (
                          <div
                            key={meal.date}
                            className="flex justify-between items-center text-xs"
                          >
                            <span className="text-gray-500">
                              {format(new Date(meal.date), "MMM dd")}
                            </span>
                            <div className="flex items-center gap-1">
                              {meal.type === "CHICKEN" && <span>🍗</span>}
                              {meal.type === "VEG" && <span>🥗</span>}
                              {meal.type === null && (
                                <span className="text-gray-400">-</span>
                              )}
                              <span className="font-medium">
                                {meal.cost > 0 ? `₨${meal.cost}` : "-"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Total team members:{" "}
            <span className="font-semibold">{teamMembers.length}</span> • Meals
            ordered today:{" "}
            <span className="font-semibold">{chickenCount + vegCount}</span> •
            Daily average:{" "}
            <span className="font-semibold">
              ₨
              {teamMembers.length > 0
                ? Math.round(totalCost / teamMembers.length)
                : 0}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
