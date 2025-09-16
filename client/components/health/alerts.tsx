import React, { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { AlertTriangle, CheckCircle, X, Bell, BellOff } from "lucide-react";
import { alertService } from "../../lib/api";
import { authService } from "../../lib/auth";

interface Alert {
  id: string;
  type: "warning" | "info" | "success" | "error";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  isDismissed: boolean;
  priority: "low" | "medium" | "high";
  category: "blood_sugar" | "medication" | "exercise" | "diet" | "general";
}

interface AlertsProps {
  onAlertDismissed: (alertId: string) => void;
  onAlertRead: (alertId: string) => void;
}

export function Alerts({ onAlertDismissed, onAlertRead }: AlertsProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread" | "high">("all");

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const token = authService.getToken();
      if (!token) {
        console.error("No authentication token found");
        return;
      }

      const response = await alertService.getAlerts({}, {}, token);

      if (response.success) {
        setAlerts(response.data || []);
      } else {
        console.error("Error loading alerts:", response.error);
      }
    } catch (error) {
      console.error("Error loading alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async (alertId: string) => {
    try {
      const token = authService.getToken();
      if (!token) return;

      const response = await alertService.deleteAlert(alertId, token);

      if (response.success) {
        setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
        onAlertDismissed(alertId);
      } else {
        console.error("Error dismissing alert:", response.error);
      }
    } catch (error) {
      console.error("Error dismissing alert:", error);
    }
  };

  const handleMarkAsRead = async (alertId: string) => {
    try {
      const token = authService.getToken();
      if (!token) return;

      const response = await alertService.markAsRead(alertId, token);

      if (response.success) {
        setAlerts((prev) =>
          prev.map((alert) =>
            alert.id === alertId ? { ...alert, isRead: true } : alert
          )
        );
        onAlertRead(alertId);
      } else {
        console.error("Error marking alert as read:", response.error);
      }
    } catch (error) {
      console.error("Error marking alert as read:", error);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "error":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-blue-500" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case "warning":
        return "border-yellow-200 bg-yellow-50";
      case "error":
        return "border-red-200 bg-red-50";
      case "success":
        return "border-green-200 bg-green-50";
      default:
        return "border-blue-200 bg-blue-50";
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

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === "unread") return !alert.isRead && !alert.isDismissed;
    if (filter === "high")
      return alert.priority === "high" && !alert.isDismissed;
    return !alert.isDismissed;
  });

  const unreadCount = alerts.filter(
    (alert) => !alert.isRead && !alert.isDismissed
  ).length;
  const highPriorityCount = alerts.filter(
    (alert) => alert.priority === "high" && !alert.isDismissed
  ).length;

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center py-4">Loading alerts...</div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Health Alerts & Recommendations
        </h3>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount} unread</Badge>
          )}
          {highPriorityCount > 0 && (
            <Badge variant="outline" className="text-red-600">
              {highPriorityCount} high priority
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
          variant={filter === "unread" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("unread")}
        >
          Unread ({unreadCount})
        </Button>
        <Button
          variant={filter === "high" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("high")}
        >
          High Priority ({highPriorityCount})
        </Button>
      </div>

      {filteredAlerts.length === 0 ? (
        <Card className="p-6 text-center text-gray-500">
          {filter === "all"
            ? "No alerts"
            : filter === "unread"
            ? "No unread alerts"
            : "No high priority alerts"}
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <Card
              key={alert.id}
              className={`p-4 border-l-4 ${getAlertColor(alert.type)} ${
                !alert.isRead ? "ring-2 ring-blue-200" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{alert.title}</h4>
                      <Badge className={getPriorityColor(alert.priority)}>
                        {alert.priority}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {alert.category.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-gray-700 mb-2">{alert.message}</p>
                    <div className="text-sm text-gray-500">
                      {new Date(alert.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  {!alert.isRead && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkAsRead(alert.id)}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDismiss(alert.id)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
