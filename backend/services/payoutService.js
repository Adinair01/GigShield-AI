import Razorpay from "razorpay";
import { logger } from "../utils/logger.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_dummy",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "dummy_secret",
});

export const simulatePayout = async ({ user, claim }) => {
  // For hackathon purposes, don't actually hit Razorpay; just log + return payload.
  const payoutRef = `demo_payout_${claim._id}`;

  logger.info("Simulating Razorpay payout", {
    user: user.email,
    amount: claim.payout_amount,
    payoutRef,
  });

  return {
    status: "success",
    provider: "razorpay-test",
    payout_reference: payoutRef,
    amount: claim.payout_amount,
  };
};

