const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dns = require("dns");
require("dotenv").config();

// Ensure Node resolves MongoDB Atlas SRV records using public DNS if local ISP DNS fails
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const authRoutes = require("./routes/authRoutes");
const tripRoutes = require("./routes/tripRoutes");
const hotelRoutes = require("./routes/hotelRoutes");
const activityRoutes = require("./routes/activityRoutes");
const imageRoutes = require("./routes/imageRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const foodRoutes = require("./routes/foodRoutes");

const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/food", foodRoutes);

app.get("/", (req, res) => {
  res.send("Trip Planner API is running");
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });