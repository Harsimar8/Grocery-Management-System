// import express from "express";
// import Stripe from "stripe";
// import dotenv from "dotenv";
// dotenv.config();

// const router = express.Router();
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// // Create Payment Intent Route - UPI + Cards
// router.post("/create-payment-intent", async (req, res) => {
//   try {
//     const { amount } = req.body;

//     if (amount < 50) {
//   return res.status(400).json({ error: "Minimum payment amount is ₹50" });
// }


//     const paymentIntent = await stripe.paymentIntents.create({
//       amount, // amount should be in paise (₹100 = 10000)
//       currency: "inr",
//       automatic_payment_methods: { enabled: true },

//     });

//     return res.json({
//       clientSecret: paymentIntent.client_secret,
//     });
//   } catch (error) {
//     console.error("🔥 Stripe Error:", error.message);
//   return res.status(500).json({ error: error.message });

//   }
// });

// export default router;

import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
router.post("/create-payment-intent", async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount < 5000) {
      return res.status(400).json({ error: "Minimum payment amount is ₹50" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "inr",
      automatic_payment_methods: { enabled: true },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("🔥 Stripe Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});



export default router;
