import request from "supertest";
import app from "../app";
import mongoose from "mongoose";
import { User } from "../models/User";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { hashPassword } from "../utils/hash";

dotenv.config();

jest.setTimeout(30000);

describe("User Routes API", () => {
  const testUser = {
    name: "Test User",
    email: `testuser-${Date.now()}@example.com`, // Unique email với timestamp
    password: "123456",
  };

  let userId: string;
  let authToken: string;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI!, {});
    }
  });

  beforeEach(async () => {
    // Clean up và tạo user mới cho mỗi test
    await User.deleteMany({ email: testUser.email });

    // Tạo user với password đã hash
    const hashedPassword = await hashPassword(testUser.password);
    const user = new User({
      ...testUser,
      password: hashedPassword,
    });
    await user.save();
    userId = (user._id as any).toString();

    // Tạo JWT token
    authToken = jwt.sign(
      { id: userId, email: testUser.email },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );
  });

  afterAll(async () => {
    await User.deleteMany({ email: testUser.email });
    await mongoose.connection.close();
  });

  describe("GET /api/user/me", () => {
    it("should get user profile successfully with valid token", async () => {
      const res = await request(app)
        .get("/api/user/me")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("user");
      expect(res.body.user).toHaveProperty("email", testUser.email);
      expect(res.body.user).toHaveProperty("id", userId);
      // Note: getProfile trả về req.user từ JWT, không có name field
    });

    it("should return 401 without token", async () => {
      const res = await request(app).get("/api/user/me");

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("error");
    });

    it("should return 500 with invalid token", async () => {
      const res = await request(app)
        .get("/api/user/me")
        .set("Authorization", "Bearer invalid-token");

      expect(res.statusCode).toBe(500);
    });
  });

  describe("PUT /api/user/me", () => {
    it("should update user profile successfully", async () => {
      const updateData = {
        name: "Updated Name",
        email: `updated-${Date.now()}@example.com`, // Sử dụng timestamp để tránh conflict
      };

      const res = await request(app)
        .put("/api/user/me")
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("user");
      expect(res.body.user).toHaveProperty("name", updateData.name);
      expect(res.body.user).toHaveProperty("email", updateData.email);
    });

    it("should update only name", async () => {
      const updateData = {
        name: "Only Name Updated",
      };

      const res = await request(app)
        .put("/api/user/me")
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("user");
      expect(res.body.user).toHaveProperty("name", updateData.name);
      expect(res.body.user).toHaveProperty("email", testUser.email); // email không thay đổi
    });

    it("should update only email", async () => {
      const updateData = {
        email: `onlyemail-${Date.now()}@example.com`, // Sử dụng timestamp để tránh conflict
      };

      const res = await request(app)
        .put("/api/user/me")
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("user");
      expect(res.body.user).toHaveProperty("email", updateData.email);
      expect(res.body.user).toHaveProperty("name", testUser.name); // name không thay đổi
    });

    it("should return 401 without token", async () => {
      const updateData = {
        name: "Updated Name",
        email: "updated@example.com",
      };

      const res = await request(app).put("/api/user/me").send(updateData);

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("error");
    });

    it("should return 500 with invalid token", async () => {
      const updateData = {
        name: "Updated Name",
        email: "updated@example.com",
      };

      const res = await request(app)
        .put("/api/user/me")
        .set("Authorization", "Bearer invalid-token")
        .send(updateData);

      expect(res.statusCode).toBe(500);
    });
  });

  describe("DELETE /api/user/me", () => {
    it("should delete user account successfully", async () => {
      const res = await request(app)
        .delete("/api/user/me")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message", "User Deleted!");

      // Verify user is actually deleted
      const deletedUser = await User.findById(userId);
      expect(deletedUser).toBeNull();
    });

    it("should return 401 without token", async () => {
      const res = await request(app).delete("/api/user/me");

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("error");
    });

    it("should return 500 with invalid token", async () => {
      const res = await request(app)
        .delete("/api/user/me")
        .set("Authorization", "Bearer invalid-token");

      expect(res.statusCode).toBe(500);
    });
  });

  describe("Edge cases and Error handling", () => {
    it("should handle updating with empty body", async () => {
      const res = await request(app)
        .put("/api/user/me")
        .set("Authorization", `Bearer ${authToken}`)
        .send({});

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("user");
      // User should remain unchanged
      expect(res.body.user).toHaveProperty("name", testUser.name);
      expect(res.body.user).toHaveProperty("email", testUser.email);
    });

    it("should handle updating with null values (should fail with validation)", async () => {
      const updateData = {
        name: null,
        email: null,
      };

      const res = await request(app)
        .put("/api/user/me")
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData);


      expect(res.statusCode).toBe(500);
    });
  });
});
