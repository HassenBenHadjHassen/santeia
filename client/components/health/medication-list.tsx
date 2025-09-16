import React, { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Clock, AlertCircle, Edit, Trash2, CheckCircle } from "lucide-react";
import { medicationService } from "../../lib/api";
import { authService } from "../../lib/auth";

interface Medication {
  id: string;
  name: string;
  type: string;
  dosage: string;
  unit: string;
  frequency: string;
  timesPerDay: number;
  specificTimes: string[];
  startDate: string;
  endDate?: string;
  instructions?: string;
  sideEffects?: string;
  notes?: string;
  reminderSettings?: {
    enabled: boolean;
    beforeMeal: boolean;
    afterMeal: boolean;
  };
}

interface MedicationListProps {
  onMedicationAdded: (medication: Medication) => void;
}

export function MedicationList({ onMedicationAdded }: MedicationListProps) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMedication, setSelectedMedication] =
    useState<Medication | null>(null);

  useEffect(() => {
    loadMedications();
  }, []);

  const loadMedications = async () => {
    setLoading(true);
    try {
      const token = authService.getToken();
      if (!token) {
        console.error("No authentication token found");
        return;
      }

      const response = await medicationService.getMedications({}, {}, token);

      if (response.success) {
        setMedications(response.data || []);
      } else {
        console.error("Error loading medications:", response.error);
      }
    } catch (error) {
      console.error("Error loading medications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (medicationId: string) => {
    if (!confirm("Are you sure you want to delete this medication?")) return;

    try {
      const token = authService.getToken();
      if (!token) return;

      const response = await medicationService.deleteMedication(
        medicationId,
        token
      );

      if (response.success) {
        setMedications((prev) => prev.filter((m) => m.id !== medicationId));
      } else {
        console.error("Error deleting medication:", response.error);
      }
    } catch (error) {
      console.error("Error deleting medication:", error);
    }
  };

  const getMedicationStatus = (medication: Medication) => {
    const today = new Date();
    const startDate = new Date(medication.startDate);
    const endDate = medication.endDate ? new Date(medication.endDate) : null;

    if (today < startDate) return "upcoming";
    if (endDate && today > endDate) return "completed";
    return "active";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getNextDoseTime = (medication: Medication) => {
    if (medication.frequency !== "daily" || !medication.specificTimes.length)
      return null;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    for (const time of medication.specificTimes) {
      const [hours, minutes] = time.split(":").map(Number);
      const doseTime = hours * 60 + minutes;

      if (doseTime > currentTime) {
        return formatTime(time);
      }
    }

    // If no more doses today, return first dose tomorrow
    return `Tomorrow at ${formatTime(medication.specificTimes[0])}`;
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center py-4">Loading medications...</div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {medications.length === 0 ? (
        <Card className="p-6 text-center text-gray-500">
          No medications added yet
        </Card>
      ) : (
        medications.map((medication) => {
          const status = getMedicationStatus(medication);
          const nextDose = getNextDoseTime(medication);

          return (
            <Card key={medication.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{medication.name}</h3>
                    <Badge className={getStatusColor(status)}>{status}</Badge>
                  </div>

                  <div className="text-sm text-gray-600 mb-2">
                    {medication.dosage} {medication.unit} •{" "}
                    {medication.frequency}
                    {medication.type && ` • ${medication.type}`}
                  </div>

                  {medication.specificTimes.length > 0 && (
                    <div className="text-sm text-gray-600 mb-2">
                      <Clock className="h-4 w-4 inline mr-1" />
                      Times:{" "}
                      {medication.specificTimes.map(formatTime).join(", ")}
                    </div>
                  )}

                  {nextDose && status === "active" && (
                    <div className="text-sm text-blue-600 mb-2">
                      <AlertCircle className="h-4 w-4 inline mr-1" />
                      Next dose: {nextDose}
                    </div>
                  )}

                  {medication.instructions && (
                    <div className="text-sm text-gray-600 mb-2">
                      <strong>Instructions:</strong> {medication.instructions}
                    </div>
                  )}

                  {medication.sideEffects && (
                    <div className="text-sm text-orange-600 mb-2">
                      <strong>Side Effects:</strong> {medication.sideEffects}
                    </div>
                  )}

                  {medication.notes && (
                    <div className="text-sm text-gray-500">
                      <strong>Notes:</strong> {medication.notes}
                    </div>
                  )}

                  {medication.reminderSettings?.enabled && (
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        Reminders enabled
                        {medication.reminderSettings.beforeMeal &&
                          " • Before meals"}
                        {medication.reminderSettings.afterMeal &&
                          " • After meals"}
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedMedication(medication)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(medication.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })
      )}
    </div>
  );
}
