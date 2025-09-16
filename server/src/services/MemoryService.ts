// MemoryService: extract important facts from free-form user messages and persist
import { MealService } from "@/services/MealService";
import { HealthMetricService } from "@/services/HealthMetricService";
import { BloodSugarService } from "@/services/BloodSugarService";
import { MedicationService } from "@/services/MedicationService";
import { PhysicalActivityService } from "@/services/PhysicalActivityService";
import { MetricType, ReadingType } from "@/types";
import { UserService } from "@/services/UserService";
import {
  ConversationalMemoryRepository,
  CreateConversationalMemoryRequest,
} from "@/repositories/ConversationalMemoryRepository";
import { MemoryType } from "@prisma/client";

type ExtractionResult = {
  createdMeals: number;
  createdMetrics: number;
  createdBloodSugars: number;
  createdActivities?: number;
  createdMedicationDoses?: number;
  createdConversationalMemories?: number;
};

export class MemoryService {
  private mealService: MealService;
  private healthMetricService: HealthMetricService;
  private bloodSugarService: BloodSugarService;
  private medicationService: MedicationService;
  private activityService: PhysicalActivityService;
  private userService: UserService;
  private conversationalMemoryRepository: ConversationalMemoryRepository;

  constructor() {
    this.mealService = new MealService();
    this.healthMetricService = new HealthMetricService();
    this.bloodSugarService = new BloodSugarService();
    this.medicationService = new MedicationService();
    this.activityService = new PhysicalActivityService();
    this.userService = new UserService();
    this.conversationalMemoryRepository = new ConversationalMemoryRepository();
  }

  public async extractAndPersistFromUserUtterance(
    userId: string,
    content: string
  ): Promise<ExtractionResult> {
    console.log(
      `🧠 [MEMORY] Extracting from message: "${content}" for user ${userId}`
    );

    const lower = content.toLowerCase();
    let createdMeals = 0;
    let createdMetrics = 0;
    let createdBloodSugars = 0;
    let createdActivities = 0;
    let createdMedicationDoses = 0;
    let createdConversationalMemories = 0;

    // 0) Age -> Date of Birth (approximate)
    const ageRx1 = /(i\s*am|i['’]m)\s*(\d{1,2})\s*(years\s*old|yo|yrs)?/i;
    const ageRx2 = /\bage\s*(?:is|:)?\s*(\d{1,2})\b/i;
    const ageMatch1 = content.match(ageRx1);
    const ageMatch2 = content.match(ageRx2);
    if (ageMatch1 || ageMatch2) {
      const age = ageMatch1 ? parseInt(ageMatch1[2]) : parseInt(ageMatch2![1]);
      if (Number.isFinite(age) && age > 0 && age < 120) {
        const now = new Date();
        const dob = new Date(
          now.getFullYear() - age,
          now.getMonth(),
          Math.min(now.getDate(), 28)
        );
        try {
          await this.userService.update(userId, {
            dateOfBirth: dob.toISOString().split("T")[0],
          } as any);
        } catch {}
      }
    }

    // 1) Blood pressure patterns
    // Examples handled:
    //  - "my blood pressure is 130/80"
    //  - "bp 130 over 80"
    //  - "blood pressure now is 140 90"
    const bpPatterns: RegExp[] = [
      /(blood\s*pressure|\bbp\b)[^0-9]*(\d{2,3})\s*\/?\s*(\d{2,3})/i,
      /(\d{2,3})\s*(over|\/)\s*(\d{2,3})\s*(blood\s*pressure|\bbp\b)?/i,
    ];
    for (const rx of bpPatterns) {
      const match = content.match(rx);
      if (match) {
        const systolic = parseFloat(match[2] || match[1]);
        const diastolic = parseFloat(match[3]);
        if (
          Number.isFinite(systolic) &&
          Number.isFinite(diastolic) &&
          systolic > 50 &&
          systolic < 260 &&
          diastolic > 30 &&
          diastolic < 200
        ) {
          const timestamp = new Date();
          const [sRes, dRes] = await Promise.all([
            this.healthMetricService.createMetric(userId, {
              metricType: "BLOOD_PRESSURE_SYSTOLIC" as MetricType,
              value: systolic,
              unit: "mmHg",
              notes: "captured from chat",
              timestamp,
            }),
            this.healthMetricService.createMetric(userId, {
              metricType: "BLOOD_PRESSURE_DIASTOLIC" as MetricType,
              value: diastolic,
              unit: "mmHg",
              notes: "captured from chat",
              timestamp,
            }),
          ]);
          if (sRes.success) createdMetrics++;
          if (dRes.success) createdMetrics++;
          break; // avoid duplicating if multiple patterns match
        }
      }
    }

    // 2) Blood sugar patterns
    // Handle phrases like:
    //  - "my blood sugar is 150"
    //  - "glucose 6.5 mmol/L" (convert to mg/dL ~ 18x)
    const bsPatterns: Array<{ rx: RegExp; unit?: "mg/dL" | "mmol/L" }> = [
      {
        rx: /(blood\s*sugar|glucose)[^0-9]*(\d{2,3})(\s*mg\/dL)?/i,
        unit: "mg/dL",
      },
      {
        rx: /(blood\s*sugar|glucose)[^0-9]*(\d{1,2}\.\d|\d{1,2})(\s*mmol\/?l)/i,
        unit: "mmol/L",
      },
    ];
    for (const { rx, unit } of bsPatterns) {
      const match = content.match(rx);
      if (match) {
        const rawVal = parseFloat(match[2]);
        if (Number.isFinite(rawVal)) {
          const isMmol = unit === "mmol/L" || /mmol\/?l/i.test(match[3] || "");
          const valueMgDl = isMmol ? Math.round(rawVal * 18) : rawVal;
          const timestamp = new Date();
          const res = await this.bloodSugarService.createReading(userId, {
            value: valueMgDl,
            unit: "mg/dL",
            readingType: "RANDOM" as ReadingType,
            notes: "captured from chat",
            timestamp,
          });
          if (res.success) createdBloodSugars++;
          break;
        }
      }
    }

    // 3) Meal extraction: capture verbs like "ate", "had" and optional meal type & macros
    const mealRx =
      /(i\s+)?(just\s+)?(ate|had|eaten)(\s+for\s+(breakfast|lunch|dinner|snack))?\s+([^.,;!?]+)([.,;!?]|$)/i;
    const mealMatch = lower.match(mealRx);
    if (mealMatch) {
      const mealType = (mealMatch[5] || "").toLowerCase() || undefined;
      const rawName = (mealMatch[6] || "meal").trim();
      const name = rawName
        .replace(/\bfor\s+(breakfast|lunch|dinner|snack)\b/i, "")
        .trim();
      const macros = {
        carbohydrates: this.extractNumber(
          content,
          /(carb|carbohydrates)\s*[:=]?\s*(\d{1,3})\s*g/i
        ),
        calories: this.extractNumber(
          content,
          /(calories|kcal)\s*[:=]?\s*(\d{2,4})/i
        ),
        protein: this.extractNumber(
          content,
          /(protein)\s*[:=]?\s*(\d{1,3})\s*g/i
        ),
        fat: this.extractNumber(content, /(fat)\s*[:=]?\s*(\d{1,3})\s*g/i),
        fiber: this.extractNumber(
          content,
          /(fiber|fibre)\s*[:=]?\s*(\d{1,3})\s*g/i
        ),
        sugar: this.extractNumber(content, /(sugar)\s*[:=]?\s*(\d{1,3})\s*g/i),
      } as any;
      const timestamp = new Date();
      const mealRes = await this.mealService.createMeal(userId, {
        name: name.substring(0, 80),
        description: mealType ? `${rawName} (for ${mealType})` : rawName,
        ...(macros.carbohydrates != null && {
          carbohydrates: macros.carbohydrates,
        }),
        ...(macros.calories != null && { calories: macros.calories }),
        ...(macros.protein != null && { protein: macros.protein }),
        ...(macros.fat != null && { fat: macros.fat }),
        ...(macros.fiber != null && { fiber: macros.fiber }),
        ...(macros.sugar != null && { sugar: macros.sugar }),
        timestamp,
      });
      if (mealRes.success) createdMeals++;
    }

    // 4) Weight extraction
    // Examples:
    //  - "my weight is 82 kg", "I weigh 180 pounds"
    //  - "weight: 75kg"
    const weightRx =
      /(weight|weigh)[^0-9]*(\d{2,3})(\s*(kg|kilograms|lbs|pounds))?/i;
    const weightMatch = content.match(weightRx);
    if (weightMatch) {
      const valueNum = parseFloat(weightMatch[2]);
      const unitRaw = (weightMatch[4] || "kg").toLowerCase();
      if (Number.isFinite(valueNum) && valueNum > 20 && valueNum < 400) {
        const isLbs = unitRaw.includes("lb") || unitRaw.includes("pound");
        const valueKg = isLbs
          ? Math.round(valueNum * 0.453592 * 10) / 10
          : valueNum;
        const timestamp = new Date();
        const weightRes = await this.healthMetricService.createMetric(userId, {
          metricType: "WEIGHT" as MetricType,
          value: valueKg,
          unit: "kg",
          notes: "captured from chat",
          timestamp,
        });
        if (weightRes.success) createdMetrics++;
      }
    }

    // 5) Medication dose: capture phrases like "took metformin 500 mg" or "I took insulin 10 units"
    const medRx =
      /(took|have taken|i\s*took)\s+([a-zA-Z0-9\- ]+?)\s*(\d+\s*(mg|units|mcg|ml))?/i;
    const medMatch = content.match(medRx);
    if (medMatch) {
      const medName = medMatch[2].trim();
      const dosePart = (medMatch[3] || "").trim();
      // Search medication; if not found, create it before recording dose
      try {
        const meds = await this.medicationService.searchMedications(
          userId,
          medName
        );
        let chosen: any =
          meds.success && meds.data && meds.data.length > 0
            ? meds.data[0]
            : null;
        const parsed = /([0-9]+)\s*(mg|units|mcg|ml)/i.exec(dosePart);
        const dosage = parsed ? parsed[1] : "1";
        const unit = parsed ? parsed[2] : "dose";
        if (!chosen) {
          const medType = /insulin/i.test(medName)
            ? "insulin"
            : /metformin|glipizide|glyburide|sitagliptin|empagliflozin|canagliflozin|dapagliflozin/i.test(
                medName
              )
            ? "oral"
            : "other";
          const createRes = await this.medicationService.createMedication(
            userId,
            {
              name: medName,
              type: medType,
              dosage: dosage,
              unit: unit === "dose" ? "units" : unit,
              frequency: "as needed",
              instructions: "added from chat",
            }
          );
          if (createRes.success) {
            chosen = createRes.data;
          }
        }
        if (chosen) {
          const doseRes = await this.medicationService.recordDose(
            chosen.id,
            userId,
            dosage,
            unit === "dose" ? "units" : unit,
            "captured from chat"
          );
          if (doseRes.success) createdMedicationDoses++;
        }
      } catch {}
    }

    // 6) Physical activity: capture phrases like "went for a run", "I ran 30 minutes", "walked 5 km"
    const activityPhrases = [
      /(went\s+for\s+a\s+run|i\s+ran|i\s+went\s+running)/i,
      /(i\s+walked|went\s+for\s+a\s+walk)/i,
      /(i\s+cycled|went\s+cycling|rode\s+a\s+bike)/i,
      /(i\s+swam|went\s+swimming)/i,
      /(i\s+did\s+yoga|i\s+did\s+exercise|workout|gym)/i,
      /(push[- ]?ups?|squats?|deadlifts?|bench\s*press|pull[- ]?ups?)/i,
    ];
    const matchedActivity = activityPhrases.find((rx) => rx.test(lower));
    if (matchedActivity) {
      // Try to parse duration
      const durMatchMin = content.match(/(\d{1,3})\s*(minutes|min|mins)/i);
      const durMatchHr = content.match(/(\d{1,2})\s*(hours|hrs|hr|h)\b/i);
      const setsReps = content.match(
        /(\d{1,2})\s*sets?\s*of\s*(\d{1,3})\s*reps?/i
      );
      const distanceMatch = content.match(
        /(\d+(?:\.\d+)?)\s*(km|kilometers|miles|mi)/i
      );
      const activityType = matchedActivity.source.includes("walk")
        ? "walking"
        : matchedActivity.source.includes("cycle") ||
          matchedActivity.source.includes("bike")
        ? "cycling"
        : matchedActivity.source.includes("swim")
        ? "swimming"
        : matchedActivity.source.includes("yoga")
        ? "yoga"
        : matchedActivity.source.includes("run")
        ? "running"
        : setsReps
        ? "strength"
        : "exercise";
      let duration = 30;
      if (durMatchHr) duration = parseInt(durMatchHr[1]) * 60;
      else if (durMatchMin) duration = parseInt(durMatchMin[1]);
      else if (setsReps) {
        const sets = parseInt(setsReps[1]);
        const reps = parseInt(setsReps[2]);
        duration = Math.min(90, Math.max(15, Math.round(sets * reps * 0.5)));
      }
      const intensity = /\b(light|easy|low)\b/i.test(content)
        ? "low"
        : /\b(moderate|medium|steady)\b/i.test(content)
        ? "moderate"
        : /\b(intense|hard|vigorous|high)\b/i.test(content)
        ? "high"
        : "moderate";
      const notes = distanceMatch
        ? `distance ${distanceMatch[1]} ${distanceMatch[2]}`
        : setsReps
        ? `${setsReps[1]} sets x ${setsReps[2]} reps`
        : "captured from chat";
      const actRes = await this.activityService.createActivity(userId, {
        activityType,
        duration,
        intensity,
        notes,
        timestamp: new Date(),
      });
      if (actRes.success) createdActivities++;
    }

    // 7) Extract conversational memories for cross-chat persistence
    console.log(`🧠 [MEMORY] Starting conversational memory extraction...`);
    try {
      const memoriesToStore: CreateConversationalMemoryRequest[] = [];

      // Food preferences and reactions
      const preferencePatterns = [
        /i (love|like|enjoy|prefer)\s+([^.,;!?\n]+)/gi,
        /i (hate|dislike|avoid)\s+([^.,;!?\n]+)/gi,
        /(.*)\s+(makes me feel|gives me)\s+(.*)/gi,
      ];

      preferencePatterns.forEach((pattern, index) => {
        const matches = [...content.matchAll(pattern)];
        matches.forEach((match) => {
          let memoryContent = "";
          let factType: MemoryType = "PERSONAL_PREFERENCE";

          if (index === 0) {
            memoryContent = `Likes ${match[2].trim()}`;
            factType = "MEAL_PREFERENCE";
          } else if (index === 1) {
            memoryContent = `Dislikes ${match[2].trim()}`;
            factType = "MEAL_PREFERENCE";
          } else if (index === 2) {
            memoryContent = `${match[1].trim()} ${match[2].trim()} ${match[3].trim()}`;
            factType = "FOOD_REACTION";
          }

          if (memoryContent.length > 10 && memoryContent.length < 200) {
            memoriesToStore.push({
              userId,
              factType,
              content: memoryContent,
              context: `From message: "${content.substring(0, 100)}..."`,
            });
          }
        });
      });

      // Health goals and concerns
      const healthGoalPatterns = [
        /i want to (lose weight|gain weight|maintain|improve|reduce|increase)\s+([^.,;!?\n]*)/gi,
        /my goal is to\s+([^.,;!?\n]+)/gi,
        /i'm trying to\s+([^.,;!?\n]+)/gi,
      ];

      healthGoalPatterns.forEach((pattern) => {
        const matches = [...content.matchAll(pattern)];
        matches.forEach((match) => {
          const goal = match[1]
            ? `${match[1]} ${match[2] || ""}`.trim()
            : match[1]?.trim() || "";
          if (goal.length > 5 && goal.length < 150) {
            memoriesToStore.push({
              userId,
              factType: "HEALTH_GOAL",
              content: `Goal: ${goal}`,
              context: `From message: "${content.substring(0, 100)}..."`,
            });
          }
        });
      });

      // Routines and patterns
      const routinePatterns = [
        /i (usually|normally|typically|always|often)\s+([^.,;!?\n]+)/gi,
        /every (day|morning|evening|night|week)\s+i\s+([^.,;!?\n]+)/gi,
      ];

      routinePatterns.forEach((pattern) => {
        const matches = [...content.matchAll(pattern)];
        matches.forEach((match) => {
          const routine = match[2]?.trim() || match[1]?.trim() || "";
          if (routine.length > 10 && routine.length < 150) {
            memoriesToStore.push({
              userId,
              factType: "ROUTINE_ACTIVITY",
              content: `Routine: ${routine}`,
              context: `From message: "${content.substring(0, 100)}..."`,
            });
          }
        });
      });

      // Symptoms and patterns
      const symptomPatterns = [
        /when i (eat|have)\s+([^,]+),?\s+i (feel|get|experience)\s+([^.,;!?\n]+)/gi,
        /after\s+([^,]+),?\s+i (usually|often|sometimes|always)\s+(feel|get|experience)\s+([^.,;!?\n]+)/gi,
      ];

      symptomPatterns.forEach((pattern) => {
        const matches = [...content.matchAll(pattern)];
        matches.forEach((match) => {
          const trigger = match[2]?.trim() || match[1]?.trim() || "";
          const symptom = match[4]?.trim() || match[3]?.trim() || "";
          if (trigger.length > 3 && symptom.length > 3) {
            memoriesToStore.push({
              userId,
              factType: "SYMPTOM_PATTERN",
              content: `When ${trigger}, experiences ${symptom}`,
              context: `From message: "${content.substring(0, 100)}..."`,
            });
          }
        });
      });

      // Store all extracted memories
      console.log(
        `🧠 [MEMORY] Found ${memoriesToStore.length} memories to store:`,
        memoriesToStore.map((m) => m.content)
      );

      for (const memory of memoriesToStore) {
        try {
          console.log(`🧠 [MEMORY] Storing: ${memory.content}`);
          await this.conversationalMemoryRepository.create(memory);
          createdConversationalMemories++;
          console.log(`✅ [MEMORY] Successfully stored memory`);
        } catch (error) {
          console.warn(
            "❌ [MEMORY] Failed to store conversational memory:",
            error
          );
        }
      }
    } catch (error) {
      console.warn("Error extracting conversational memories:", error);
    }

    return {
      createdMeals,
      createdMetrics,
      createdBloodSugars,
      createdActivities,
      createdMedicationDoses,
      createdConversationalMemories,
    };
  }

  public summarizeFromUtterance(content: string): string {
    const lower = content.toLowerCase();
    const parts: string[] = [];

    // Age
    const ageRx1 = /(i\s*am|i['’]m)\s*(\d{1,2})\s*(years\s*old|yo|yrs)?/i;
    const ageRx2 = /\bage\s*(?:is|:)?\s*(\d{1,2})\b/i;
    const mAge1 = content.match(ageRx1);
    const mAge2 = content.match(ageRx2);
    const ageVal = mAge1
      ? parseInt(mAge1[2])
      : mAge2
      ? parseInt(mAge2[1])
      : NaN;
    if (Number.isFinite(ageVal)) parts.push(`Age: ${ageVal}`);

    // Weight
    const mWeight = content.match(
      /(weight|weigh)[^0-9]*(\d{2,3})\s*(kg|kilograms|lbs|pounds)?/i
    );
    if (mWeight) parts.push(`Weight: ${mWeight[2]} ${mWeight[3] || "kg"}`);

    // Blood pressure
    const mBp =
      content.match(/(\d{2,3})\s*(?:over|\/)\s*(\d{2,3})/i) ||
      content.match(/bp[^0-9]*(\d{2,3})\s*\/?\s*(\d{2,3})/i);
    if (mBp) parts.push(`Blood Pressure: ${mBp[1]}/${mBp[2]} mmHg`);

    // Blood sugar / glucose
    const mBsMg = content.match(
      /(blood\s*sugar|glucose)[^0-9]*(\d{2,3})\s*mg\/?dL/i
    );
    const mBsMmol = content.match(
      /(blood\s*sugar|glucose)[^0-9]*(\d{1,2}(?:\.\d)?)\s*mmol\/?l/i
    );
    if (mBsMg) parts.push(`Blood Sugar: ${mBsMg[2]} mg/dL`);
    else if (mBsMmol) parts.push(`Blood Sugar: ${mBsMmol[2]} mmol/L`);

    // Meal
    const mealRx =
      /(ate|had|eaten)(\s+for\s+(breakfast|lunch|dinner|snack))?\s+([^.,;!?]+)([.,;!?]|$)/i;
    const mMeal = content.match(mealRx);
    if (mMeal) {
      const mealType = mMeal[3] ? ` for ${mMeal[3]}` : "";
      parts.push(`Meal: ${mMeal[4].trim()}${mealType}`);
    }

    // Medication dose
    const mMed = content.match(
      /(took|have taken|i\s*took)\s+([a-zA-Z0-9\- ]+?)\s*(\d+\s*(mg|units|mcg|ml))?/i
    );
    if (mMed)
      parts.push(
        `Medication Dose: ${mMed[2].trim()}${
          mMed[3] ? " " + mMed[3].trim() : ""
        }`
      );

    // Activity
    const isRun = /(went\s+for\s+a\s+run|\bran\b|running)/i.test(lower);
    const isWalk = /(walked|went\s+for\s+a\s+walk)/i.test(lower);
    const isCycle = /(cycled|cycling|rode\s+a\s+bike)/i.test(lower);
    const isSwim = /(swam|swimming)/i.test(lower);
    const isYoga = /(did\s+yoga|yoga)/i.test(lower);
    const setsReps = content.match(
      /(\d{1,2})\s*sets?\s*of\s*(\d{1,3})\s*reps?/i
    );
    const mins = content.match(/(\d{1,3})\s*(minutes|min|mins)/i);
    const hrs = content.match(/(\d{1,2})\s*(hours|hrs|hr|h)\b/i);
    if (isRun || isWalk || isCycle || isSwim || isYoga || setsReps) {
      const type = isRun
        ? "running"
        : isWalk
        ? "walking"
        : isCycle
        ? "cycling"
        : isSwim
        ? "swimming"
        : isYoga
        ? "yoga"
        : "strength";
      const duration = hrs
        ? `${hrs[1]}h`
        : mins
        ? `${mins[1]}min`
        : setsReps
        ? `${setsReps[1]}x${setsReps[2]} reps`
        : "";
      parts.push(`Activity: ${type}${duration ? ` ${duration}` : ""}`);
    }

    return parts.length ? parts.join("; ") : "";
  }

  private extractNumber(text: string, rx: RegExp): number | null {
    const m = text.match(rx);
    if (!m) return null;
    const n = parseFloat(m[2] || m[1]);
    return Number.isFinite(n) ? n : null;
  }

  public async getConversationalMemories(
    userId: string,
    limit: number = 20
  ): Promise<string[]> {
    try {
      const memories = await this.conversationalMemoryRepository.findByUserId(
        userId,
        limit
      );

      return memories.map((memory) => memory.content);
    } catch (error) {
      console.warn("Failed to retrieve conversational memories:", error);
      return [];
    }
  }

  public async getRelevantMemories(
    userId: string,
    query?: string,
    limit: number = 15
  ): Promise<string[]> {
    try {
      const memories =
        await this.conversationalMemoryRepository.findRelevantMemories(
          userId,
          query,
          limit
        );

      return memories.map((memory) => memory.content);
    } catch (error) {
      console.warn("Failed to retrieve relevant memories:", error);
      return [];
    }
  }
}
