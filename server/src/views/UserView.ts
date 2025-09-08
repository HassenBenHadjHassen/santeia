// User view implementation
import { BaseView } from "./BaseView";
import { User as IUser } from "@/types";

export class UserView extends BaseView {
  public formatSingle(user: IUser): Record<string, any> {
    return this.sanitizeOutput({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  public formatList(users: IUser[]): Record<string, any> {
    return {
      users: users.map((user) => this.formatSingle(user)),
      count: users.length,
    };
  }

  // Specific user formatting methods
  public formatUserSummary(user: IUser): Record<string, any> {
    return this.sanitizeOutput({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  }

  public formatUserProfile(user: IUser): Record<string, any> {
    return this.sanitizeOutput({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      memberSince: this.formatTimestamp(user.createdAt),
      lastUpdated: this.formatTimestamp(user.updatedAt),
    });
  }

  public formatUserList(
    users: IUser[],
    page: number,
    limit: number,
    total: number
  ) {
    return this.buildPaginatedResponse(
      users.map((user) => this.formatSingle(user)),
      page,
      limit,
      total,
      "Users retrieved successfully"
    );
  }
}
