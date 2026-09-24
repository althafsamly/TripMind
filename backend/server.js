const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const tripRoutes = require("./routes/tripRoutes");
const hotelRoutes = require("./routes/hotelRoutes");
const activityRoutes = require("./routes/activityRoutes");
const imageRoutes = require("./routes/imageRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const foodRoutes = require("./routes/foodRoutes");
const safetyRoutes = require("./routes/safetyRoutes");

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
app.use("/api/safety", safetyRoutes);

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