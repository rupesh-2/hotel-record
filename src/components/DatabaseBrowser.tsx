"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, Table, RefreshCw, Download } from "lucide-react";

interface RawData {
  teamMembers: any[];
  mealEntries: any[];
}

export default function DatabaseBrowser() {
  const [rawData, setRawData] = useState<RawData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRawData = async () => {
    try {
      setLoading(true);
      const [teamResponse, mealsResponse] = await Promise.all([
        fetch("/api/team-members"),
        fetch("/api/meals?date=2024-01-10"), // Get some meal data
      ]);

      if (teamResponse.ok) {
        const teamMembers = await teamResponse.json();
        const mealEntries = teamMembers.flatMap((member: any) => member.meals);
        setRawData({ teamMembers, mealEntries });
        setError(null);
      } else {
        throw new Error("Failed to fetch data");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRawData();
  }, []);

  const exportData = () => {
    if (!rawData) return;

    const dataStr = JSON.stringify(rawData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "meal-tracker-data.json";
    link.click();
    URL.revokeObjectURL(url);
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
        <Button onClick={fetchRawData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Table className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Database Browser</h2>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchRawData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportData} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
        </div>
      </div>

      {rawData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Team Members Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Team Members ({rawData.teamMembers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {rawData.teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="p-3 border rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-semibold">{member.name}</div>
                        <div className="text-sm text-gray-600">
                          ID: {member.employeeId}
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {member.meals.length} meals
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500">
                      Created: {new Date(member.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Meal Entries Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Meal Entries ({rawData.mealEntries.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {rawData.mealEntries.slice(0, 20).map((meal) => (
                  <div
                    key={meal.id}
                    className="p-2 border rounded bg-gray-50 text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{meal.date}</span>
                        <Badge
                          variant={
                            meal.type === "CHICKEN"
                              ? "default"
                              : meal.type === "VEG"
                              ? "secondary"
                              : "outline"
                          }
                          className={
                            meal.type === "CHICKEN"
                              ? "bg-orange-100 text-orange-800"
                              : meal.type === "VEG"
                              ? "bg-green-100 text-green-800"
                              : ""
                          }
                        >
                          {meal.type === "CHICKEN" && "🍗"}
                          {meal.type === "VEG" && "🥗"}
                          {meal.type === null && "-"}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">
                          ₨{meal.cost}
                        </div>
                        <div className="text-xs text-gray-500">
                          {meal.teamMember?.name}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {rawData.mealEntries.length > 20 && (
                  <div className="text-center text-sm text-gray-500 py-2">
                    Showing first 20 entries of {rawData.mealEntries.length}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Database Info */}
      <Card>
        <CardHeader>
          <CardTitle>Database Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-semibold">Database Type</div>
              <div className="text-gray-600">SQLite</div>
            </div>
            <div>
              <div className="font-semibold">File Location</div>
              <div className="text-gray-600">./dev.db</div>
            </div>
            <div>
              <div className="font-semibold">Total Records</div>
              <div className="text-gray-600">
                {rawData
                  ? rawData.teamMembers.length + rawData.mealEntries.length
                  : 0}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
