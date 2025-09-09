// Base model class for all data models
import { BaseEntity } from "@/types";

export abstract class BaseModel implements BaseEntity {
  public id: string;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(data: Partial<BaseEntity> = {}) {
    this.id = data.id || this.generateId();
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Generate a unique ID (you can replace this with your preferred ID generation)
  private generateId(): string {
    return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
  }

  // Abstract methods that must be implemented by subclasses
  public abstract validate(): boolean;
  public abstract toJSON(): Record<string, any>;
  public abstract fromJSON(data: Record<string, any>): this;

  // Common methods
  public updateTimestamp(): void {
    this.updatedAt = new Date();
  }

  public isNew(): boolean {
    return !this.id || this.createdAt.getTime() === this.updatedAt.getTime();
  }

  public getAge(): number {
    return Date.now() - this.createdAt.getTime();
  }
}
