// User service implementation
import { BaseService } from "./BaseService";
import { UserRepository } from "@/repositories/UserRepository";
import { User as IUser, ServiceResponse, ValidationError } from "@/types";

export class UserService extends BaseService<IUser> {
  protected modelName = "User";
  private userRepository: UserRepository;

  constructor() {
    super();
    this.userRepository = new UserRepository();
  }

  public async create(data: Partial<IUser>): Promise<ServiceResponse<IUser>> {
    try {
      // Validate required fields
      const requiredFields = ["email", "name"];
      const validationErrors = this.validateRequiredFields(
        data,
        requiredFields
      );

      if (validationErrors.length > 0) {
        return this.createErrorResponse("Validation failed", validationErrors);
      }

      // Validate email format
      if (data.email && !this.validateEmail(data.email)) {
        return this.createErrorResponse("Invalid email format", [
          {
            field: "email",
            message: "Invalid email format",
            value: data.email,
          },
        ]);
      }

      // Check if user already exists
      const emailExists = await this.userRepository.checkEmailExists(
        data.email!
      );

      if (emailExists) {
        return this.createErrorResponse("User with this email already exists", [
          {
            field: "email",
            message: "Email already exists",
            value: data.email,
          },
        ]);
      }

      // Create new user
      const user = await this.userRepository.create(data);

      return this.createSuccessResponse(
        user as IUser,
        "User created successfully"
      );
    } catch (error) {
      return this.createErrorResponse(`Failed to create user: ${error}`);
    }
  }

  public async findById(id: string): Promise<ServiceResponse<IUser>> {
    try {
      const user = await this.userRepository.findById(id);

      if (!user) {
        return this.createErrorResponse("User not found");
      }

      return this.createSuccessResponse(user as IUser);
    } catch (error) {
      return this.createErrorResponse(`Failed to find user: ${error}`);
    }
  }

  public async findAll(
    filters?: Record<string, any>
  ): Promise<ServiceResponse<IUser[]>> {
    try {
      const users = await this.userRepository.findAll(filters);
      return this.createSuccessResponse(users as IUser[]);
    } catch (error) {
      return this.createErrorResponse(`Failed to find users: ${error}`);
    }
  }

  public async update(
    id: string,
    data: Partial<IUser>
  ): Promise<ServiceResponse<IUser>> {
    try {
      // Check if user exists
      const existingUser = await this.userRepository.findById(id);

      if (!existingUser) {
        return this.createErrorResponse("User not found");
      }

      // Check email uniqueness if email is being updated
      if (data.email && data.email !== existingUser.email) {
        if (!this.validateEmail(data.email)) {
          return this.createErrorResponse("Invalid email format", [
            {
              field: "email",
              message: "Invalid email format",
              value: data.email,
            },
          ]);
        }

        const emailExists = await this.userRepository.checkEmailExists(
          data.email,
          id
        );

        if (emailExists) {
          return this.createErrorResponse(
            "User with this email already exists",
            [
              {
                field: "email",
                message: "Email already exists",
                value: data.email,
              },
            ]
          );
        }
      }

      // Update user
      const user = await this.userRepository.update(id, data);

      return this.createSuccessResponse(
        user as IUser,
        "User updated successfully"
      );
    } catch (error) {
      return this.createErrorResponse(`Failed to update user: ${error}`);
    }
  }

  public async delete(id: string): Promise<ServiceResponse<boolean>> {
    try {
      // Check if user exists
      const user = await this.userRepository.findById(id);

      if (!user) {
        return this.createErrorResponse("User not found");
      }

      // Delete user (conversations and messages will be deleted due to cascade)
      await this.userRepository.delete(id);

      return this.createSuccessResponse(true, "User deleted successfully");
    } catch (error) {
      return this.createErrorResponse(`Failed to delete user: ${error}`);
    }
  }

  public async findByEmail(email: string): Promise<ServiceResponse<IUser>> {
    try {
      const user = await this.userRepository.findByEmail(email);

      if (!user) {
        return this.createErrorResponse("User not found");
      }

      return this.createSuccessResponse(user as IUser);
    } catch (error) {
      return this.createErrorResponse(`Failed to find user by email: ${error}`);
    }
  }

  public async validatePassword(
    email: string,
    password: string
  ): Promise<ServiceResponse<IUser>> {
    try {
      const user = await this.userRepository.validatePassword(email, password);

      if (!user) {
        return this.createErrorResponse("Invalid email or password");
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      return this.createSuccessResponse(userWithoutPassword as IUser);
    } catch (error) {
      return this.createErrorResponse(`Failed to validate password: ${error}`);
    }
  }
}
