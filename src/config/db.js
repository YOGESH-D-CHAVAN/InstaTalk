import mongoose from "mongoose";
import dns from "dns";

// Use Google DNS as a fallback/primary for resolving MongoDB SRV records
// to bypass potential local DNS resolution issues (ECONNREFUSED).
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ DB Connection Error:", error.message);
    if (error.message.includes("ECONNREFUSED")) {
      console.error("💡 Troubleshooting Tip: Check your network/DNS or ensure your IP is whitelisted in MongoDB Atlas.");
    } else if (error.message.includes("bad auth")) {
      console.error("💡 Troubleshooting Tip: Check your MONGO_URI username and password.");
    }
    process.exit(1);
  }
};

export default connectDB;
