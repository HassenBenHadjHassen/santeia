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
  llmService,
  alertService,
} from "../../lib/api";
import { authService } from "../../lib/auth";
import { useTranslation } from "react-i18next";

interface PDFExportProps {
  userId: string;
}

export function PDFExport({ userId }: PDFExportProps) {
  const { t } = useTranslation();
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
        alertsResponse,
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
        alertService.getAlerts({}, { page: 1, limit: 100 }, token),
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
      if (!alertsResponse.success)
        throw new Error(alertsResponse.error || "Failed to fetch alerts data");

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

      // Generate AI summary
      let aiSummary = "";
      try {
        const summaryPrompt = `${t("pdfExport.aiPrompt.title")}

            ${t("pdfExport.aiPrompt.instructions")}
            1. Data completeness and tracking patterns
            2. Notable trends or patterns in the data
            3. Areas requiring attention based on the data
            4. Positive indicators from the tracking
            5. General observations about health management

            Requirements:
            - ${t("pdfExport.aiPrompt.requirements.noGreetings")}
            - ${t("pdfExport.aiPrompt.requirements.noMarkdown")}
            - ${t("pdfExport.aiPrompt.requirements.noMedicalAdvice")}
            - ${t("pdfExport.aiPrompt.requirements.plainText")}
            - ${t("pdfExport.aiPrompt.requirements.directFactual")}
            - ${t("pdfExport.aiPrompt.requirements.maxParagraphs")}`;

        const summaryResponse = await llmService.generateText(
          {
            prompt: summaryPrompt,
            userId: userId,
            maxTokens: 1000,
            temperature: 0.7,
          },
          token
        );

        if (summaryResponse.text) {
          aiSummary = summaryResponse.text;
        }
      } catch (error) {
        console.warn("Failed to generate AI summary:", error);
        aiSummary = t("pdfExport.aiSummaryError");
      }

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
        alerts: convertDatesToStrings(alertsResponse.data || []),
        aiSummary,
        startDate,
        endDate,
      };

      // Generate PDF
      const pdfBlob = await pdfExportService.generateHealthReport(reportData, {
        aiSummaryTitle: t("pdfExport.features.aiSummary"),
        bloodSugarTitle: t("pdfExport.features.bloodSugarReadings"),
        mealsTitle: t("pdfExport.features.mealDiary"),
        activitiesTitle: t("pdfExport.features.physicalActivity"),
        medicationsTitle: t("pdfExport.features.medications"),
        healthMetricsTitle: t("pdfExport.features.healthMetrics"),
        alertsTitle: t("pdfExport.features.healthAlerts"),
        summaryTitle: t("pdfExport.sections.summary"),
        trendsTitle: t("pdfExport.sections.bloodSugarTrends"),
      });

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
      alert(t("pdfExport.errorMessage"));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">{t("pdfExport.title")}</h3>
      </div>

      <p className="text-white-600 mb-4">{t("pdfExport.description")}</p>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              {t("pdfExport.startDate")}
            </label>
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
            <label className="block text-sm font-medium mb-1">
              {t("pdfExport.endDate")}
            </label>
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

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            {t("pdfExport.reportWillInclude")}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• {t("pdfExport.features.bloodSugarReadings")}</li>
              <li>• {t("pdfExport.features.mealDiary")}</li>
              <li>• {t("pdfExport.features.physicalActivity")}</li>
              <li>• {t("pdfExport.features.medications")}</li>
              <li>• {t("pdfExport.features.healthMetrics")}</li>
            </ul>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• {t("pdfExport.features.aiSummary")}</li>
              <li>• {t("pdfExport.features.aiConversations")}</li>
              <li>• {t("pdfExport.features.healthAlerts")}</li>
              <li>• {t("pdfExport.features.recommendations")}</li>
              <li>• {t("pdfExport.features.trendAnalysis")}</li>
            </ul>
          </div>
        </div>

        <Button
          onClick={handleExport}
          disabled={isGenerating || !startDate || !endDate}
          className="w-full"
        >
          <Download className="h-4 w-4 mr-2" />
          {isGenerating
            ? t("pdfExport.generatingButton")
            : t("pdfExport.generateButton")}
        </Button>
      </div>
    </Card>
  );
}
