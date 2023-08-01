import Database from "@pizza/database";
import { SignUpRequest } from "@pizza/dto";
import { User, UserRole } from "@pizza/entities";
import { createUserEntity, generateUUID } from "@pizza/utils";

export class UserService {
  static async createUser(request: SignUpRequest): Promise<string> {
    const database = new Database();
    if (!request || Object.keys(request).length === 0) {
      throw new Error("One or more required fields are missing");
    }
    const entity = createUserEntity(
      generateUUID(),
      request.fullName,
      request.role,
      request.email,
      request.password
    );
    let userExists: boolean = false;
    try {
      await UserService.getUserByEmail(request.email);
      userExists = true;
    } catch (err) {
      userExists = false;
    }
    if (userExists) {
      throw new Error("The user exists with same email");
    }
    await database.db
      .put({
        TableName: database.userTable,
        Item: entity,
        ConditionExpression: "attribute_not_exists(#email)",
        ExpressionAttributeNames: {
          "#email": "email",
        },
      })
      .promise();
    return entity.id;
  }

  static async getUsersByRole(role: UserRole): Promise<User[]> {
    let nextKey: any;
    const users: User[] = [];
    const database = new Database();

    do {
      const { Items = [], LastEvaluatedKey } = await database.db
        .query({
          TableName: database.userTable,
          IndexName: "by-role-createdAt-index",
          KeyConditionExpression: "#role = :role",
          ExpressionAttributeNames: {
            "#role": "role",
          },
          ExpressionAttributeValues: {
            ":role": role,
          },
          ExclusiveStartKey: nextKey,
        })
        .promise();
      users.push(...(Items as User[]));
      nextKey = LastEvaluatedKey;
    } while (nextKey !== undefined);

    return users;
  }

  static async getUserByEmail(email: string): Promise<User> {
    const database = new Database();
    const { Items = [] } = await database.db
      .query({
        TableName: database.userTable,
        IndexName: "by-email-index",
        KeyConditionExpression: "#email = :email",
        ExpressionAttributeNames: {
          "#email": "email",
        },
        ExpressionAttributeValues: {
          ":email": email,
        },
        Limit: 1,
      })
      .promise();
    if (Items.length === 0) {
      throw new Error("User does not exist");
    }
    return Items[0] as User;
  }

  static async getUserById(id: string): Promise<User | undefined> {
    const database = new Database();
    const { Item } = await database.db
      .get({
        TableName: database.userTable,
        Key: { id },
      })
      .promise();

    return Item as User | undefined;
  }
}
