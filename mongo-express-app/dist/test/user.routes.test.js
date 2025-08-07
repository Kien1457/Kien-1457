"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = require("../models/User");
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const hash_1 = require("../utils/hash");
dotenv_1.default.config();
jest.setTimeout(30000);
describe("User Routes API", () => {
    const testUser = {
        name: "Test User",
        email: `testuser-${Date.now()}@example.com`,
        password: "123456",
    };
    let userId;
    let authToken;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        if (mongoose_1.default.connection.readyState === 0) {
            yield mongoose_1.default.connect(process.env.MONGO_URI, {});
        }
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield User_1.User.deleteMany({ email: testUser.email });
        const hashedPassword = yield (0, hash_1.hashPassword)(testUser.password);
        const user = new User_1.User(Object.assign(Object.assign({}, testUser), { password: hashedPassword }));
        yield user.save();
        userId = user._id.toString();
        authToken = jsonwebtoken_1.default.sign({ id: userId, email: testUser.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield User_1.User.deleteMany({ email: testUser.email });
        yield mongoose_1.default.connection.close();
    }));
    describe("GET /api/user/me", () => {
        it("should get user profile successfully with valid token", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default)
                .get("/api/user/me")
                .set("Authorization", `Bearer ${authToken}`);
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("user");
            expect(res.body.user).toHaveProperty("email", testUser.email);
            expect(res.body.user).toHaveProperty("id", userId);
        }));
        it("should return 401 without token", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default).get("/api/user/me");
            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty("error");
        }));
        it("should return 500 with invalid token", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default)
                .get("/api/user/me")
                .set("Authorization", "Bearer invalid-token");
            expect(res.statusCode).toBe(500);
        }));
    });
    describe("PUT /api/user/me", () => {
        it("should update user profile successfully", () => __awaiter(void 0, void 0, void 0, function* () {
            const updateData = {
                name: "Updated Name",
                email: `updated-${Date.now()}@example.com`,
            };
            const res = yield (0, supertest_1.default)(app_1.default)
                .put("/api/user/me")
                .set("Authorization", `Bearer ${authToken}`)
                .send(updateData);
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("user");
            expect(res.body.user).toHaveProperty("name", updateData.name);
            expect(res.body.user).toHaveProperty("email", updateData.email);
        }));
        it("should update only name", () => __awaiter(void 0, void 0, void 0, function* () {
            const updateData = {
                name: "Only Name Updated",
            };
            const res = yield (0, supertest_1.default)(app_1.default)
                .put("/api/user/me")
                .set("Authorization", `Bearer ${authToken}`)
                .send(updateData);
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("user");
            expect(res.body.user).toHaveProperty("name", updateData.name);
            expect(res.body.user).toHaveProperty("email", testUser.email);
        }));
        it("should update only email", () => __awaiter(void 0, void 0, void 0, function* () {
            const updateData = {
                email: `onlyemail-${Date.now()}@example.com`,
            };
            const res = yield (0, supertest_1.default)(app_1.default)
                .put("/api/user/me")
                .set("Authorization", `Bearer ${authToken}`)
                .send(updateData);
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("user");
            expect(res.body.user).toHaveProperty("email", updateData.email);
            expect(res.body.user).toHaveProperty("name", testUser.name);
        }));
        it("should return 401 without token", () => __awaiter(void 0, void 0, void 0, function* () {
            const updateData = {
                name: "Updated Name",
                email: "updated@example.com",
            };
            const res = yield (0, supertest_1.default)(app_1.default).put("/api/user/me").send(updateData);
            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty("error");
        }));
        it("should return 500 with invalid token", () => __awaiter(void 0, void 0, void 0, function* () {
            const updateData = {
                name: "Updated Name",
                email: "updated@example.com",
            };
            const res = yield (0, supertest_1.default)(app_1.default)
                .put("/api/user/me")
                .set("Authorization", "Bearer invalid-token")
                .send(updateData);
            expect(res.statusCode).toBe(500);
        }));
    });
    describe("DELETE /api/user/me", () => {
        it("should delete user account successfully", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default)
                .delete("/api/user/me")
                .set("Authorization", `Bearer ${authToken}`);
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("message", "User Deleted!");
            const deletedUser = yield User_1.User.findById(userId);
            expect(deletedUser).toBeNull();
        }));
        it("should return 401 without token", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default).delete("/api/user/me");
            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty("error");
        }));
        it("should return 500 with invalid token", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default)
                .delete("/api/user/me")
                .set("Authorization", "Bearer invalid-token");
            expect(res.statusCode).toBe(500);
        }));
    });
    describe("Edge cases and Error handling", () => {
        it("should handle updating with empty body", () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(app_1.default)
                .put("/api/user/me")
                .set("Authorization", `Bearer ${authToken}`)
                .send({});
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("user");
            expect(res.body.user).toHaveProperty("name", testUser.name);
            expect(res.body.user).toHaveProperty("email", testUser.email);
        }));
        it("should handle updating with null values (should fail with validation)", () => __awaiter(void 0, void 0, void 0, function* () {
            const updateData = {
                name: null,
                email: null,
            };
            const res = yield (0, supertest_1.default)(app_1.default)
                .put("/api/user/me")
                .set("Authorization", `Bearer ${authToken}`)
                .send(updateData);
            expect(res.statusCode).toBe(500);
        }));
    });
});
