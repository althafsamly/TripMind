import express from "express";
import Booking from "../models/Booking.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * PUT /api/organiser/requests/:id/validate
 * Validates (approves, rejects, revokes) a join request
 */
router.put("/requests/:id/validate", verifyToken, async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ["pending", "approved", "rejected", "revoked"];

        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ 
                message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` 
            });
        }

        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: "Booking request not found" });
        }

        booking.status = status;
        const updatedBooking = await booking.save();



        return res.status(200).json(updatedBooking);
    } catch (err) {
        console.error("[ORGANISER_ROUTE_ERROR]:", err);
        return res.status(500).json({ error: err.message });
    }
});

export default router;
