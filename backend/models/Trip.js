const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    destination: {
      type: String,
      required: true,
      trim: true,
    },
    budget: {
      type: Number,
      required: true,
    },
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      required: true,
    },
    days: {
      type: Number,
      required: true,
    },
    travelers: {
      type: Number,
      default: 1,
    },
    tripType: {
      type: String,
      default: "Solo",
    },
    interests: {
      type: [String],
      default: [],
    },
    emoji: {
      type: String,
      default: "🌴",
    },
    destinationImage: {
      type: String,
      default: "",
    },
    itinerary: {
      type: Array,
      default: [],
    },
    selectedHotel: {
      type: Object,
      default: null,
    },
    selectedActivities: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Trip", tripSchema);
