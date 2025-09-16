import React, { useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Download, Calendar, FileText } from "lucide-react";
import { pdfExportService } from "../../lib/pdf-export";
import {
  userService,
  bloodSugarService,
  mealService,
  physicalActivityService,
  medicationService,
  healthMetricService,
} from "../../lib/api";
import { authService } from "../../lib/auth";

interface PDFExportProps {
  userId: string;
}

export function PDFExport({ userId }: PDFExportProps) {
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExport = async () => {
    setIsGenerating(true);

    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);

      // Fetch all data for the specified date range using API services
      const [
        user,
        bloodSugarResponse,
        mealsResponse,
        activitiesResponse,
        medicationsResponse,
        healthMetricsResponse,
      ] = await Promise.all([
        userService.getUserById(userId),
        bloodSugarService.getReadings(
          { startDate: startDateObj, endDate: endDateObj },
          { page: 1, limit: 1000 },
          token
        ),
        mealService.getMeals(
          { startDate: startDateObj, endDate: endDateObj },
          { page: 1, limit: 1000 },
          token
        ),
        physicalActivityService.getActivities(
          { startDate: startDateObj, endDate: endDateObj },
          { page: 1, limit: 1000 },
          token
        ),
        medicationService.getMedications({}, { page: 1, limit: 1000 }, token),
        healthMetricService.getMetrics(
          { startDate: startDateObj, endDate: endDateObj },
          { page: 1, limit: 1000 },
          token
        ),
      ]);

      // Check for errors in responses
      if (!bloodSugarResponse.success)
        throw new Error(
          bloodSugarResponse.error || "Failed to fetch blood sugar data"
        );
      if (!mealsResponse.success)
        throw new Error(mealsResponse.error || "Failed to fetch meals data");
      if (!activitiesResponse.success)
        throw new Error(
          activitiesResponse.error || "Failed to fetch activities data"
        );
      if (!medicationsResponse.success)
        throw new Error(
          medicationsResponse.error || "Failed to fetch medications data"
        );
      if (!healthMetricsResponse.success)
        throw new Error(
          healthMetricsResponse.error || "Failed to fetch health metrics data"
        );

      // Convert Date objects to strings for PDF generation
      const convertDatesToStrings = (items: any[]) => {
        return items.map((item) => ({
          ...item,
          timestamp:
            item.timestamp instanceof Date
              ? item.timestamp.toISOString()
              : item.timestamp,
          createdAt:
            item.createdAt instanceof Date
              ? item.createdAt.toISOString()
              : item.createdAt,
          updatedAt:
            item.updatedAt instanceof Date
              ? item.updatedAt.toISOString()
              : item.updatedAt,
          startDate:
            item.startDate instanceof Date
              ? item.startDate.toISOString()
              : item.startDate,
          endDate:
            item.endDate instanceof Date
              ? item.endDate.toISOString()
              : item.endDate,
          takenAt:
            item.takenAt instanceof Date
              ? item.takenAt.toISOString()
              : item.takenAt,
        }));
      };

      // Prepare data for PDF generation
      const reportData = {
        user,
        bloodSugarReadings: convertDatesToStrings(
          bloodSugarResponse.data || []
        ),
        meals: convertDatesToStrings(mealsResponse.data || []),
        activities: convertDatesToStrings(activitiesResponse.data || []),
        medications: convertDatesToStrings(medicationsResponse.data || []),
        healthMetrics: convertDatesToStrings(healthMetricsResponse.data || []),
        startDate,
        endDate,
      };

      // Generate PDF
      const pdfBlob = await pdfExportService.generateHealthReport(reportData);

      // Download the PDF
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `health-report-${startDate}-to-${endDate}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF report. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Export Health Report</h3>
      </div>

      <p className="text-white-600 mb-4">
        Generate a comprehensive PDF report of your health data for your doctor
        or endocrinologist.
      </p>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={endDate}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">
            Report will include:
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Blood sugar readings and trends</li>
            <li>• Meal diary with nutritional information</li>
            <li>• Physical activity log</li>
            <li>• Current medications and dosages</li>
            <li>• Health metrics (weight, blood pressure, etc.)</li>
            <li>• Summary statistics and insights</li>
          </ul>
        </div>

        <Button
          onClick={handleExport}
          disabled={isGenerating || !startDate || !endDate}
          className="w-full"
        >
          <Download className="h-4 w-4 mr-2" />
          {isGenerating ? "Generating PDF..." : "Generate Health Report"}
        </Button>
      </div>
    </Card>
  );
}
