"use client";

import DatabaseViewer from "@/components/DatabaseViewer";
import DatabaseBrowser from "@/components/DatabaseBrowser";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Database, Table } from "lucide-react";

export default function DatabasePage() {
  const [viewMode, setViewMode] = useState<"viewer" | "browser">("viewer");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-blue-900 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex-1"></div>
            <div className="text-center">
              <h1 className="text-3xl font-bold">Database Viewer</h1>
              <p className="text-blue-200 mt-2">
                View all stored meal tracking data
              </p>
            </div>
            <div className="flex-1 flex justify-end">
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "viewer" ? "default" : "outline"}
                  onClick={() => setViewMode("viewer")}
                  className="text-white border-white hover:bg-white hover:text-blue-900"
                >
                  <Database className="h-4 w-4 mr-2" />
                  Data Viewer
                </Button>
                <Button
                  variant={viewMode === "browser" ? "default" : "outline"}
                  onClick={() => setViewMode("browser")}
                  className="text-white border-white hover:bg-white hover:text-blue-900"
                >
                  <Table className="h-4 w-4 mr-2" />
                  Raw Data
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {viewMode === "viewer" ? <DatabaseViewer /> : <DatabaseBrowser />}
      </div>
    </div>
  );
}
