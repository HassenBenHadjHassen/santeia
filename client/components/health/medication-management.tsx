import React, { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { MedicationEntry } from "./medication-entry";
import { MedicationList } from "./medication-list";
import { Plus, Pill, Clock, AlertTriangle } from "lucide-react";

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

export function MedicationManagement() {
  const [activeTab, setActiveTab] = useState("list");

  const handleMedicationAdded = (medication: Medication) => {
    // This will be handled by the MedicationList component
    // We could add a callback here if needed
    setActiveTab("list");
  };

  const getUpcomingDoses = () => {
    // This would typically come from an API call
    // For now, we'll return a mock list
    return [
      {
        id: "1",
        medicationName: "Metformin",
        dosage: "500mg",
        time: "08:00",
        status: "upcoming",
      },
      {
        id: "2",
        medicationName: "Insulin",
        dosage: "10 units",
        time: "12:00",
        status: "upcoming",
      },
    ];
  };

  const upcomingDoses = getUpcomingDoses();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Medication Management</h2>
        <Button onClick={() => setActiveTab("add")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Medication
        </Button>
      </div>

      {/* Quick Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Pill className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Active Medications</h3>
          </div>
          <div className="text-2xl font-bold text-primary">3</div>
          <div className="text-sm text-muted-foreground">Currently taking</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
            <h3 className="font-semibold">Next Dose</h3>
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            2h 15m
          </div>
          <div className="text-sm text-muted-foreground">Metformin 500mg</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <h3 className="font-semibold">Missed Doses</h3>
          </div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            0
          </div>
          <div className="text-sm text-muted-foreground">This week</div>
        </Card>
      </div>

      {/* Upcoming Doses */}
      {upcomingDoses.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Upcoming Doses</h3>
          <div className="space-y-2">
            {upcomingDoses.map((dose) => (
              <div
                key={dose.id}
                className="flex justify-between items-center p-2 rounded-lg bg-accent"
              >
                <div>
                  <div className="font-medium text-foreground">
                    {dose.medicationName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {dose.dosage}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-foreground">{dose.time}</div>
                  <div className="text-sm text-muted-foreground">Today</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Medication List</TabsTrigger>
          <TabsTrigger value="add">Add Medication</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <MedicationList onMedicationAdded={handleMedicationAdded} />
        </TabsContent>

        <TabsContent value="add">
          <MedicationEntry onMedicationAdded={handleMedicationAdded} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
