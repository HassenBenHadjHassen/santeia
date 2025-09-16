import React, { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { llmService } from "../../lib/api";
import {
  Lightbulb,
  TrendingUp,
  Heart,
  Activity,
  Utensils,
  Pill,
  Target,
  CheckCircle,
  X,
} from "lucide-react";

interface Recommendation {
  id: string;
  type: "blood_sugar" | "medication" | "exercise" | "diet" | "general";
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  category: "improvement" | "maintenance" | "warning" | "celebration";
  isAccepted: boolean;
  isDismissed: boolean;
  timestamp: string;
  relatedData?: any;
}

interface RecommendationsProps {
  onRecommendationAccepted: (recommendationId: string) => void;
  onRecommendationDismissed: (recommendationId: string) => void;
}

export function Recommendations({
  onRecommendationAccepted,
  onRecommendationDismissed,
}: RecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "accepted">("all");

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found");
        return;
      }

      // TODO: Replace with dedicated recommendations service when available
      // For now, using LLM service to generate recommendations
      try {
        const response = await llmService.generateText(
          {
            prompt:
              "Generate 3 personalized health recommendations based on diabetes management best practices. Return as JSON array with id, type, title, description, priority, category fields.",
            userId: "current-user", // TODO: Get actual user ID
            maxTokens: 1000,
            temperature: 0.7,
          },
          token
        );

        // Parse the LLM response and format as recommendations
        const generatedRecommendations = JSON.parse(response.text || "[]");
        setRecommendations(generatedRecommendations);
      } catch (llmError) {
        console.error("Error generating recommendations with LLM:", llmError);
        // Fallback to mock data
        setRecommendations([
          {
            id: "1",
            type: "diet",
            title: "Monitor Carbohydrate Intake",
            description:
              "Track your daily carbohydrate consumption to maintain stable blood sugar levels.",
            priority: "high",
            category: "improvement",
            isAccepted: false,
            isDismissed: false,
            timestamp: new Date().toISOString(),
          },
          {
            id: "2",
            type: "exercise",
            title: "Regular Physical Activity",
            description:
              "Aim for at least 30 minutes of moderate exercise daily to improve insulin sensitivity.",
            priority: "medium",
            category: "maintenance",
            isAccepted: false,
            isDismissed: false,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch (error) {
      console.error("Error loading recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (recommendationId: string) => {
    try {
      // TODO: Replace with dedicated recommendations service when available
      // For now, just update local state
      setRecommendations((prev) =>
        prev.map((rec) =>
          rec.id === recommendationId ? { ...rec, isAccepted: true } : rec
        )
      );
      onRecommendationAccepted(recommendationId);
    } catch (error) {
      console.error("Error accepting recommendation:", error);
    }
  };

  const handleDismiss = async (recommendationId: string) => {
    try {
      // TODO: Replace with dedicated recommendations service when available
      // For now, just update local state
      setRecommendations((prev) =>
        prev.map((rec) =>
          rec.id === recommendationId ? { ...rec, isDismissed: true } : rec
        )
      );
      onRecommendationDismissed(recommendationId);
    } catch (error) {
      console.error("Error dismissing recommendation:", error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "blood_sugar":
        return <TrendingUp className="h-5 w-5 text-blue-500" />;
      case "medication":
        return <Pill className="h-5 w-5 text-purple-500" />;
      case "exercise":
        return <Activity className="h-5 w-5 text-green-500" />;
      case "diet":
        return <Utensils className="h-5 w-5 text-orange-500" />;
      default:
        return <Lightbulb className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "improvement":
        return "border-blue-200 bg-blue-50";
      case "maintenance":
        return "border-green-200 bg-green-50";
      case "warning":
        return "border-yellow-200 bg-yellow-50";
      case "celebration":
        return "border-purple-200 bg-purple-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredRecommendations = recommendations.filter((rec) => {
    if (filter === "pending") return !rec.isAccepted && !rec.isDismissed;
    if (filter === "accepted") return rec.isAccepted;
    return !rec.isDismissed;
  });

  const pendingCount = recommendations.filter(
    (rec) => !rec.isAccepted && !rec.isDismissed
  ).length;
  const acceptedCount = recommendations.filter((rec) => rec.isAccepted).length;

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center py-4">Loading recommendations...</div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">AI Recommendations</h3>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <Badge variant="outline" className="text-blue-600">
              {pendingCount} pending
            </Badge>
          )}
          {acceptedCount > 0 && (
            <Badge variant="outline" className="text-green-600">
              {acceptedCount} accepted
            </Badge>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        <Button
          variant={filter === "pending" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("pending")}
        >
          Pending ({pendingCount})
        </Button>
        <Button
          variant={filter === "accepted" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("accepted")}
        >
          Accepted ({acceptedCount})
        </Button>
      </div>

      {filteredRecommendations.length === 0 ? (
        <Card className="p-6 text-center text-gray-500">
          {filter === "all"
            ? "No recommendations"
            : filter === "pending"
            ? "No pending recommendations"
            : "No accepted recommendations"}
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredRecommendations.map((rec) => (
            <Card
              key={rec.id}
              className={`p-4 border-l-4 ${getCategoryColor(rec.category)} ${
                rec.isAccepted ? "ring-2 ring-green-200" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {getTypeIcon(rec.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{rec.title}</h4>
                      <Badge className={getPriorityColor(rec.priority)}>
                        {rec.priority}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {rec.category}
                      </Badge>
                      {rec.isAccepted && (
                        <Badge variant="outline" className="text-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Accepted
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-700 mb-2">{rec.description}</p>
                    <div className="text-sm text-gray-500">
                      {new Date(rec.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>

                {!rec.isAccepted && !rec.isDismissed && (
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAccept(rec.id)}
                      className="text-green-600 hover:text-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Accept
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDismiss(rec.id)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
