import "./config/db.js";
import User from "./models/User.js";
import Policy from "./models/Policy.js";
import Claim from "./models/Claim.js";
import RiskProfile from "./models/RiskProfile.js";
import WeatherEvent from "./models/WeatherEvent.js";
import bcrypt from "bcryptjs";

const seed = async () => {
  try {
    await User.deleteMany({});
    await Policy.deleteMany({});
    await Claim.deleteMany({});
    await RiskProfile.deleteMany({});
    await WeatherEvent.deleteMany({});

    const zones = await RiskProfile.insertMany([
      {
        zone: "MUM-ANDHERI",
        city: "Mumbai",
        historical_rainfall: 160,
        pollution_index: 180,
        flood_risk: 0.7,
        risk_score: 82,
      },
      {
        zone: "BLR-KORMANGALA",
        city: "Bangalore",
        historical_rainfall: 110,
        pollution_index: 130,
        flood_risk: 0.4,
        risk_score: 65,
      },
      {
        zone: "DEL-SAKET",
        city: "Delhi",
        historical_rainfall: 70,
        pollution_index: 320,
        flood_risk: 0.3,
        risk_score: 75,
      },
      {
        zone: "CHN-TNAGAR",
        city: "Chennai",
        historical_rainfall: 140,
        pollution_index: 110,
        flood_risk: 0.6,
        risk_score: 70,
      },
      {
        zone: "HYD-HITEC",
        city: "Hyderabad",
        historical_rainfall: 90,
        pollution_index: 160,
        flood_risk: 0.35,
        risk_score: 55,
      },
    ]);

    const passwordHash = await bcrypt.hash("password123", 10);

    const users = await User.insertMany([
      {
        name: "Raj Kumar",
        email: "raj@earnshield.demo",
        passwordHash,
        platform: "Swiggy",
        city: "Mumbai",
        zone: zones[0].zone,
        avg_daily_income: 800,
        risk_score: zones[0].risk_score,
        role: "worker",
      },
      {
        name: "Priya Sharma",
        email: "priya@earnshield.demo",
        passwordHash,
        platform: "Zomato",
        city: "Bangalore",
        zone: zones[1].zone,
        avg_daily_income: 700,
        risk_score: zones[1].risk_score,
        role: "worker",
      },
      {
        name: "Karan Singh",
        email: "karan@earnshield.demo",
        passwordHash,
        platform: "Amazon",
        city: "Delhi",
        zone: zones[2].zone,
        avg_daily_income: 900,
        risk_score: zones[2].risk_score,
        role: "worker",
      },
      {
        name: "Anita Devi",
        email: "anita@earnshield.demo",
        passwordHash,
        platform: "Dunzo",
        city: "Chennai",
        zone: zones[3].zone,
        avg_daily_income: 600,
        risk_score: zones[3].risk_score,
        role: "worker",
      },
      {
        name: "Admin",
        email: "admin@earnshield.demo",
        passwordHash,
        platform: "Swiggy",
        city: "Mumbai",
        zone: zones[0].zone,
        avg_daily_income: 0,
        risk_score: 10,
        role: "admin",
      },
    ]);

    const now = new Date();
    const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const policies = await Policy.insertMany([
      {
        user_id: users[0]._id,
        plan_type: "Standard",
        weekly_premium: 35,
        coverage_amount: 400,
        start_date: now,
        end_date: weekLater,
        status: "active",
      },
      {
        user_id: users[1]._id,
        plan_type: "Basic",
        weekly_premium: 20,
        coverage_amount: 200,
        start_date: now,
        end_date: weekLater,
        status: "active",
      },
      {
        user_id: users[2]._id,
        plan_type: "Premium",
        weekly_premium: 50,
        coverage_amount: 700,
        start_date: now,
        end_date: weekLater,
        status: "active",
      },
      {
        user_id: users[3]._id,
        plan_type: "Standard",
        weekly_premium: 35,
        coverage_amount: 400,
        start_date: now,
        end_date: weekLater,
        status: "active",
      },
    ]);

    console.log("✅ Seeded zones:", zones.length);
    console.log("✅ Seeded users:", users.length);
    console.log("✅ Seeded policies:", policies.length);
    console.log("\n📌 Demo Credentials:");
    console.log("   Worker: raj@earnshield.demo / password123");
    console.log("   Admin:  admin@earnshield.demo / password123");
  } catch (err) {
    console.error("Seed error", err);
  } finally {
    process.exit(0);
  }
};

seed();
