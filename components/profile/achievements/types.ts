export type Achievement = {
  id: string | null; // UUID (nullable)
  name: string;
  imageUrl: string;
  description: string;
  courseId: string;
  userId: string | null; // UUID (nullable)
  completed: boolean;
  requiredCount: number | null;
  completedCount: number | null;
  trackingStartTime: string | null; // ISO-8601 Timestamp as string
  trackingEndTime: string | null; // same
};
