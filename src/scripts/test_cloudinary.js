import "dotenv/config";
import cloudinary from "../config/cloudinary.js";

async function testConnection() {
  try {
    console.log("Checking Cloudinary Config...");
    console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
    console.log("API Key:", process.env.CLOUDINARY_API_KEY ? "Present" : "Missing");

    const result = await cloudinary.api.ping();
    console.log("Cloudinary Connection Successful:", result);
  } catch (error) {
    console.error("Cloudinary Connection Failed:", error);
  }
}

testConnection();
