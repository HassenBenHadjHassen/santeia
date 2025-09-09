// User model implementation
import { BaseModel } from "./BaseModel";
import { User as IUser } from "@/types";

export class User extends BaseModel implements IUser {
  public email: string;
  public name: string;
  public role: "ADMIN" | "USER" | "MODERATOR";
  public isActive: boolean;

  constructor(data: Partial<IUser> = {}) {
    super(data);
    this.email = data.email || "";
    this.name = data.name || "";
    this.role = data.role || "USER";
    this.isActive = data.isActive ?? true;
  }

  public validate(): boolean {
    return !!(
      this.email &&
      this.name &&
      this.isValidEmail(this.email) &&
      this.role &&
      typeof this.isActive === "boolean"
    );
  }

  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      role: this.role,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  public fromJSON(data: Record<string, any>): this {
    this.id = data.id || this.id;
    this.email = data.email || this.email;
    this.name = data.name || this.name;
    this.role = data.role || this.role;
    this.isActive = data.isActive ?? this.isActive;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : this.createdAt;
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : this.updatedAt;
    return this;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  public setRole(role: "ADMIN" | "USER" | "MODERATOR"): void {
    this.role = role;
    this.updateTimestamp();
  }

  public activate(): void {
    this.isActive = true;
    this.updateTimestamp();
  }

  public deactivate(): void {
    this.isActive = false;
    this.updateTimestamp();
  }
}
