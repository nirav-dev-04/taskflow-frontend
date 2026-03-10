import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";
import connectDB from "../config/db.js";

const seed = async () => {
  await connectDB();
  await User.deleteMany({});

  const users = [
    {
      name: "Admin User",
      email: "admin@taskflow.com",
      password: "Admin@123",
      role: "admin",
    },
    {
      name: "Manager User",
      email: "manager@taskflow.com",
      password: "Manager@123",
      role: "manager",
    },
    {
      name: "Employee User",
      email: "employee@taskflow.com",
      password: "Employee@123",
      role: "employee",
    },
  ];

  for (const u of users) {
    await User.create(u);
    console.log(`✅ Created: ${u.name} — ${u.email}`);
  }

  console.log("\n🎉 Seeding done!");
  console.log("admin@taskflow.com / Admin@123");
  console.log("manager@taskflow.com / Manager@123");
  console.log("employee@taskflow.com / Employee@123");
  process.exit(0);
};

seed();
