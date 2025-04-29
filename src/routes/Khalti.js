import { initializeKhaltiPayment, verifyKhaltiPayment } from "../config/khalti.js";
import Payment from "../model/paymentModel.js";
import BookedItem from "../model/vehiclepaymentmodal.js";
import Signup from "../model/signup.js";
import Vehicle from "../model/Vehicle.js";
import express from "express";
import mongoose from "mongoose";
const router = express.Router();

// Route to initialize Khalti payment
router.post("/initialize-khalti", async (req, res) => {
  try {
    const { 
      vehicleId, 
      totalPrice, 
      website_url, 
      vehicleDetails, 
      firstName, 
      lastName, 
      email, 
      phone, 
      address,
      userId,
      bookingDetails
    } = req.body;

    console.log('Received Khalti initialization request:', { 
      vehicleId, 
      totalPrice, 
      website_url, 
      vehicleDetails,
      firstName,
      lastName,
      email,
      phone,
      address,
      userId,
      bookingDetails
    });

    // Validate input
    if (!vehicleId || !totalPrice || !userId) {
      console.error('Missing required fields:', { vehicleId, totalPrice, userId });
      return res.status(400).json({
        success: false,
        message: "Missing required fields: vehicleId, totalPrice, and userId are required"
      });
    }

    // Convert price to number and validate
    const priceInNPR = Number(totalPrice);
    if (isNaN(priceInNPR) || priceInNPR <= 0) {
      console.error('Invalid price:', { priceInNPR, originalPrice: totalPrice });
      return res.status(400).json({
        success: false,
        message: "Invalid price amount"
      });
    }

    // Convert NPR to paisa for Khalti
    const priceInPaisa = priceInNPR * 100;

    // Create a purchase record with original NPR amount
    const purchasedItemData = await BookedItem.create({
      userId,
      vehicleId,
      paymentMethod: "khalti",
      totalPrice: priceInNPR,
      vehicleDetails: {
        name: vehicleDetails.name,
        category: vehicleDetails.category,
        subcategory: vehicleDetails.subcategory,
        fuelType: vehicleDetails.fuelType,
        seatingCapacity: vehicleDetails.seatingCapacity,
        makeYear: vehicleDetails.makeYear,
        insideValleyPrice: vehicleDetails.insideValleyPrice,
        outsideValleyPrice: vehicleDetails.outsideValleyPrice,
        image: vehicleDetails.image,
        totalPrice: priceInNPR
      },
      userDetails: {
        firstName,
        lastName,
        email,
        phone: phone || "N/A",
        address: address || "N/A"
      },
      bookingDetails: {
        pickupDate: new Date(bookingDetails.pickupDate),
        returnDate: new Date(bookingDetails.returnDate),
        pickupLocation: bookingDetails.pickupLocation,
        isInsideValley: bookingDetails.isInsideValley,
        driverOption: bookingDetails.driverOption || "without-driver",
        totalDays: bookingDetails.totalDays,
        duration: bookingDetails.totalDays
      }
    });

    console.log("Purchase record created:", purchasedItemData);

    try {
      // Initialize payment with Khalti using paisa
      const paymentDetails = {
        amount: priceInPaisa,
        purchase_order_id: purchasedItemData._id.toString(),
        purchase_order_name: vehicleDetails.name || "Vehicle Booking",
        return_url: `${process.env.BACKEND_URI.replace(/\/$/, '')}/khalti/complete-khalti-payment`,
        website_url: website_url || process.env.FRONTEND_URI || "http://localhost:3000",
        customer_info: {
          name: `${firstName} ${lastName}`,
          email: email,
          phone: phone || "N/A"
        }
      };

      console.log("Initializing Khalti payment with details:", paymentDetails);

      const paymentInitiate = await initializeKhaltiPayment(paymentDetails);

      if (!paymentInitiate || !paymentInitiate.payment_url) {
        throw new Error('Failed to get payment URL from Khalti');
      }

      res.json({
        success: true,
        purchasedItemData,
        payment: paymentInitiate,
      });
    } catch (error) {
      console.error('Khalti payment initialization error:', error);
      // Delete the purchase record if payment initialization fails
      await BookedItem.findByIdAndDelete(purchasedItemData._id);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to initialize payment",
        error: error.message
      });
    }
  } catch (error) {
    console.error('Khalti initialization error:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to initialize payment",
      error: error.message
    });
  }
});

// Route to handle payment completion
router.get("/complete-khalti-payment", async (req, res) => {
  const {
    pidx,
    txnId,
    amount,
    mobile,
    purchase_order_id,
    purchase_order_name,
    transaction_id,
    status
  } = req.query;

  try {
    console.log("Received Khalti payment completion callback:", req.query);

    // Verify payment with Khalti
    const paymentInfo = await verifyKhaltiPayment(pidx);

    // Convert amount from paisa to NPR for comparison
    const amountInNPR = Number(amount) / 100;

    // Check if payment is completed and details match
    if (
      paymentInfo?.status !== "Completed" ||
      paymentInfo.transaction_id !== transaction_id ||
      Number(paymentInfo.total_amount) !== Number(amount)
    ) {
      console.error("Payment verification failed:", {
        paymentInfo,
        amountInNPR,
        originalAmount: amount
      });
      return res.redirect(`${process.env.FRONTEND_URI.replace(/\/$/, '')}/payment-status?status=failed&message=${encodeURIComponent("Payment verification failed")}`);
    }

    // Find the purchased item
    const purchasedItemData = await BookedItem.findById(purchase_order_id);
    if (!purchasedItemData) {
      console.error("Purchase record not found:", purchase_order_id);
      return res.redirect(`${process.env.FRONTEND_URI.replace(/\/$/, '')}/payment-status?status=failed&message=${encodeURIComponent("Purchase record not found")}`);
    }

    // Update purchase record status
    await BookedItem.findByIdAndUpdate(
      purchase_order_id,
      { $set: { status: "completed" } }
    );

    // Create payment record with NPR amount
    const paymentData = await Payment.create({
      pidx,
      transactionId: transaction_id,
      productId: purchase_order_id,
      amount: amountInNPR,
      dataFromVerificationReq: {
        ...paymentInfo,
        amountInNPR: Number(paymentInfo.total_amount) / 100
      },
      apiQueryFromUser: {
        ...req.query,
        amountInNPR
      },
      paymentGateway: "khalti",
      status: "success",
    });

    console.log("Payment record created:", paymentData);

    // Redirect to payment status page with success
    res.redirect(`${process.env.FRONTEND_URI.replace(/\/$/, '')}/payment-status?status=success&transaction_id=${transaction_id}`);
  } catch (error) {
    console.error("Error processing Khalti payment completion:", error);
    res.redirect(`${process.env.FRONTEND_URI.replace(/\/$/, '')}/payment-status?status=failed&message=${encodeURIComponent(error.message)}`);
  }
});

// Route to get user-specific bookings
router.get("/user-bookings/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await Signup.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Find all purchased items for this user
    const purchasedItems = await BookedItem.find({
      userId: userId
    }).sort({ purchaseDate: -1 });

    // Get payment details for each purchased item
    const bookings = await Promise.all(
      purchasedItems.map(async (item) => {
        const payment = await Payment.findOne({ productId: item._id });
        const vehicle = await Vehicle.findById(item.vehicleId);
        return {
          ...item.toObject(),
          paymentDetails: payment ? payment.toObject() : null,
          vehicleDetails: {
            ...item.vehicleDetails,
            currentStatus: vehicle?.status || "Unknown"
          },
          userDetails: {
            ...item.userDetails,
            userId: userId
          }
        };
      })
    );

    res.json({
      success: true,
      bookings
    });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user bookings",
      error: error.message
    });
  }
});

export default router;