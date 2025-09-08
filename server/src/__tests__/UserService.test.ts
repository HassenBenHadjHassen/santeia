// UserService tests
import { UserService } from "@/services/UserService";
import { User as IUser } from "@/types";

describe("UserService", () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
  });

  describe("create", () => {
    it("should create a user successfully", async () => {
      const userData: Partial<IUser> = {
        email: "test@example.com",
        name: "Test User",
        role: "user",
      };

      const result = await userService.create(userData);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.email).toBe(userData.email);
      expect(result.data?.name).toBe(userData.name);
    });

    it("should fail validation for missing required fields", async () => {
      const userData: Partial<IUser> = {
        name: "Test User",
        // Missing email
      };

      const result = await userService.create(userData);

      expect(result.success).toBe(false);
      expect(result.validationErrors).toBeDefined();
      expect(
        result.validationErrors?.some((err) => err.field === "email")
      ).toBe(true);
    });

    it("should fail validation for invalid email", async () => {
      const userData: Partial<IUser> = {
        email: "invalid-email",
        name: "Test User",
      };

      const result = await userService.create(userData);

      expect(result.success).toBe(false);
      expect(result.validationErrors).toBeDefined();
      expect(
        result.validationErrors?.some((err) => err.field === "email")
      ).toBe(true);
    });
  });

  describe("findById", () => {
    it("should find user by id", async () => {
      // First create a user
      const userData: Partial<IUser> = {
        email: "test@example.com",
        name: "Test User",
      };

      const createResult = await userService.create(userData);
      expect(createResult.success).toBe(true);

      const userId = createResult.data?.id;
      expect(userId).toBeDefined();

      // Then find the user
      const result = await userService.findById(userId!);

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe(userId);
    });

    it("should return error for non-existent user", async () => {
      const result = await userService.findById("non-existent-id");

      expect(result.success).toBe(false);
      expect(result.error).toBe("User not found");
    });
  });

  describe("findAll", () => {
    it("should return all users", async () => {
      // Create some test users
      await userService.create({
        email: "user1@example.com",
        name: "User 1",
      });

      await userService.create({
        email: "user2@example.com",
        name: "User 2",
      });

      const result = await userService.findAll();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.length).toBeGreaterThanOrEqual(2);
    });

    it("should filter users by role", async () => {
      // Create users with different roles
      await userService.create({
        email: "admin@example.com",
        name: "Admin User",
        role: "admin",
      });

      await userService.create({
        email: "user@example.com",
        name: "Regular User",
        role: "user",
      });

      const result = await userService.findAll({ role: "admin" });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.every((user) => user.role === "admin")).toBe(true);
    });
  });
});
