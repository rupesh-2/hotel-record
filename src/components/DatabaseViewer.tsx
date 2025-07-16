"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Database, Users, Calendar, DollarSign, RefreshCw } from "lucide-react";
import { format } from "date-fns";

interface MealEntry {
  id: string;
  date: string;
  type: "CHICKEN" | "VEG" | null;
  cost: number;
  teamMemberId: string;
  teamMember: {
    id: string;
    employeeId: string;
    name: string;
  };
}

interface TeamMember {
  id: string;
  employeeId: string;
  name: string;
  meals: MealEntry[];
  createdAt: string;
  updatedAt: string;
}

export default function DatabaseViewer() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/team-members");
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const data = await response.json();
      setTeamMembers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  const calculateOverallStats = () => {
    let totalMembers = teamMembers.length;
    let totalMeals = 0;
    let totalSpent = 0;
    let totalChicken = 0;
    let totalVeg = 0;

    teamMembers.forEach((member) => {
      const stats = calculateMemberStats(member);
      totalMeals += stats.totalMeals;
      totalSpent += stats.totalSpent;
      totalChicken += stats.chickenMeals;
      totalVeg += stats.vegMeals;
    });

    return { totalMembers, totalMeals, totalSpent, totalChicken, totalVeg };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Loading database...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">
          <Database className="h-12 w-12 mx-auto mb-2" />
          <p>Error loading database: {error}</p>
        </div>
        <Button onClick={fetchData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  const overallStats = calculateOverallStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Database Viewer</h2>
        </div>
        <Button onClick={fetchData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {overallStats.totalMembers}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Meals</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {overallStats.totalMeals}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ₨{overallStats.totalSpent.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chicken Meals</CardTitle>
            <Badge
              variant="secondary"
              className="bg-orange-100 text-orange-800"
            >
              🍗
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {overallStats.totalChicken}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Veg Meals</CardTitle>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              🥗
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {overallStats.totalVeg}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members Data */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Team Members Data</h3>

        {teamMembers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No team members found in database</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {teamMembers.map((member) => {
              const stats = calculateMemberStats(member);
              const sortedMeals = [...member.meals].sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime()
              );

              return (
                <Card key={member.id} className="overflow-hidden">
                  <CardHeader className="bg-blue-50 border-b">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-blue-600" />
                        <div>
                          <div className="font-semibold">{member.name}</div>
                          <div className="text-sm text-gray-600">
                            ID: {member.employeeId}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          Created:{" "}
                          {format(new Date(member.createdAt), "MMM dd, yyyy")}
                        </div>
                      </div>
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="p-6">
                    {/* Member Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          ₨{stats.totalSpent.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-600">Total Spent</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {stats.totalMeals}
                        </div>
                        <div className="text-xs text-gray-600">Total Meals</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {stats.chickenMeals}
                        </div>
                        <div className="text-xs text-gray-600">Chicken</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {stats.vegMeals}
                        </div>
                        <div className="text-xs text-gray-600">Vegetarian</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          ₨{stats.averageDaily}
                        </div>
                        <div className="text-xs text-gray-600">
                          Avg per Meal
                        </div>
                      </div>
                    </div>

                    {/* Recent Meals */}
                    {sortedMeals.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3">Recent Meals</h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {sortedMeals.slice(0, 10).map((meal) => (
                            <div
                              key={meal.id}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-gray-600 w-20">
                                  {format(new Date(meal.date), "MMM dd")}
                                </span>
                                <div className="flex items-center gap-2">
                                  {meal.type === "CHICKEN" && (
                                    <>
                                      <span className="text-lg">🍗</span>
                                      <span className="text-sm text-orange-700">
                                        Chicken
                                      </span>
                                    </>
                                  )}
                                  {meal.type === "VEG" && (
                                    <>
                                      <span className="text-lg">🥗</span>
                                      <span className="text-sm text-green-700">
                                        Vegetarian
                                      </span>
                                    </>
                                  )}
                                  {meal.type === null && (
                                    <>
                                      <span className="text-lg text-gray-400">
                                        -
                                      </span>
                                      <span className="text-sm text-gray-500">
                                        No meal
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="text-sm font-bold text-green-600">
                                ₨{meal.cost}
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
        )}
      </div>
    </div>
  );
}
