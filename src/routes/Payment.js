import express from "express";
import Payment from "../Models/paymentModel.js";
import BookedItem from "../model/vehiclepaymentmodal.js";
import Signup from "../model/signup.js";
import Vehicle from "../model/Vehicle.js";

const router = express.Router();

// Get user-specific bookings
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

    // Find all purchased items for this user using userId
    const purchasedItems = await BookedItem.find({
      userId: userId
    }).sort({ purchaseDate: -1 });

    // Get payment details for each purchased item
    const bookings = await Promise.all(
      purchasedItems.map(async (item) => {
        const payment = await Payment.findOne({ productId: item._id });
        const vehicle = await Vehicle.findById(item.vehicleId);
        
        // Format user's full name
        const fullName = `${item.userDetails.firstName} ${item.userDetails.lastName}`;
        
        // Capitalize the first letter of status
        const formattedStatus = item.status.charAt(0).toUpperCase() + item.status.slice(1).toLowerCase();
        
        return {
          bookingId: item._id,
          vehicleName: item.vehicleDetails.name,
          bookingDate: item.purchaseDate,
          status: formattedStatus,
          amount: item.totalPrice,
          userDetails: {
            ...item.userDetails,
            userId: userId,
            name: fullName
          },
          bookingDetails: item.bookingDetails,
          vehicleDetails: payment ? {
            status: payment.status,
            paymentDate: payment.paymentDate,
            paymentGateway: item.paymentMethod,
            userDetails: {
              name: fullName,
              email: user.email,
              phone: user.phone,
              address: user.address || "N/A"
            },
            vehicleDetails: {
              ...item.vehicleDetails,
              currentStatus: vehicle?.status || "Unknown"
            }
          } : null
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

// Get all bookings with payment details
router.get("/all-bookings", async (req, res) => {
  try {
    // Find all purchased items
    const bookings = await BookedItem.find()
      .sort({ purchaseDate: -1 });

    if (!bookings) {
      return res.status(404).json({
        success: false,
        message: "No bookings found"
      });
    }

    // Get payment details for each booking
    const bookingsWithPayments = await Promise.all(
      bookings.map(async (booking) => {
        const payment = await Payment.findOne({ productId: booking._id });
        const vehicle = await Vehicle.findById(booking.vehicleId);
        
        // Format user's full name
        const fullName = `${booking.userDetails.firstName} ${booking.userDetails.lastName}`;
        
        // Capitalize the first letter of status
        const formattedStatus = booking.status.charAt(0).toUpperCase() + booking.status.slice(1).toLowerCase();
        
        return {
          bookingId: booking._id,
          vehicleName: booking.vehicleDetails.name,
          bookingDate: booking.purchaseDate,
          status: formattedStatus,
          amount: booking.totalPrice,
          userDetails: booking.userDetails,
          bookingDetails: booking.bookingDetails,
          paymentDetails: {
            status: payment ? payment.status : booking.status,
            paymentDate: payment ? payment.paymentDate : booking.purchaseDate,
            paymentGateway: booking.paymentMethod,
            userDetails: {
              name: fullName,
              email: booking.userDetails.email,
              phone: booking.userDetails.phone,
              address: booking.userDetails.address || "N/A"
            },
            vehicleDetails: {
              ...booking.vehicleDetails,
              currentStatus: vehicle?.status || "Unknown"
            }
          }
        };
      })
    );

    return res.status(200).json({
      success: true,
      bookings: bookingsWithPayments
    });

  } catch (error) {
    console.error("Error fetching bookings:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching bookings",
      error: error.message
    });
  }
});

// Delete a booking
router.delete("/delete-booking/:id", async (req, res) => {
  try {
    const booking = await BookedItem.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Also delete associated payment if exists
    await Payment.findOneAndDelete({ productId: req.params.id });

    return res.status(200).json({
      success: true,
      message: "Booking deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting booking:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting booking",
      error: error.message
    });
  }
});

// Update booking status
router.put("/update-status/:id", async (req, res) => {
  try {
    const { status } = req.body;
    
    // Update BookedItem status
    const booking = await BookedItem.findByIdAndUpdate(
      req.params.id,
      { status: status.toLowerCase() },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Map booking status to payment status
    let paymentStatus;
    switch(status.toLowerCase()) {
      case 'completed':
        paymentStatus = 'success';
        break;
      case 'cancelled':
        paymentStatus = 'failed';
        break;
      case 'pending':
        paymentStatus = 'pending';
        break;
      default:
        paymentStatus = 'pending';
    }

    // Check for existing payment
    const existingPayment = await Payment.findOne({ productId: req.params.id });
    
    if (existingPayment) {
      // If payment exists, just update the status
      existingPayment.status = paymentStatus;
      await existingPayment.save();
    } else if (status.toLowerCase() === 'completed') {
      // Create new payment record for completed status if none exists
      const newPayment = new Payment({
        transactionId: `MANUAL-${Date.now()}`,
        pidx: `MANUAL-${Date.now()}`,
        productId: booking._id,
        amount: booking.totalPrice,
        dataFromVerificationReq: {
          pidx: `MANUAL-${Date.now()}`,
          total_amount: booking.totalPrice * 100,
          status: "Completed",
          transaction_id: `MANUAL-${Date.now()}`,
          fee: 0,
          refunded: false,
          amountInNPR: booking.totalPrice
        },
        apiQueryFromUser: {
          status: "Completed",
          t: "txn",
          idx: `MANUAL-${Date.now()}`,
          token: `MANUAL-${Date.now()}`,
          bank_reference: "None",
          amount: (booking.totalPrice * 100).toString(),
          mobile: booking.userDetails?.phone || "N/A",
          transaction_id: `MANUAL-${Date.now()}`,
          tidx: `MANUAL-${Date.now()}`,
          total_amount: (booking.totalPrice * 100).toString(),
          purchase_order_id: booking._id.toString(),
          purchase_order_name: booking.vehicleDetails?.name || "Vehicle Booking",
          pidx: `MANUAL-${Date.now()}`,
          amountInNPR: booking.totalPrice,
          paymentGateway: booking.paymentMethod || "manual",
          status: "success"
        },
        paymentGateway: booking.paymentMethod || "manual",
        status: "success",
        paymentDate: new Date()
      });

      await newPayment.save();
    }

    return res.status(200).json({
      success: true,
      message: "Status updated successfully",
      booking
    });
  } catch (error) {
    console.error("Error updating status:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating status",
      error: error.message
    });
  }
});

// Create payment record for admin status updates (only for cancelled status)
router.post("/create-payment", async (req, res) => {
  try {
    const { productId, amount, paymentGateway, status, paymentDate } = req.body;

    // Check if payment already exists
    const existingPayment = await Payment.findOne({ productId });
    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: "Payment record already exists"
      });
    }

    // Create new payment record only for failed status
    if (status !== 'failed') {
      return res.status(400).json({
        success: false,
        message: "New payment records can only be created for failed status"
      });
    }

    // Create new payment record
    const payment = new Payment({
      productId,
      amount,
      paymentGateway,
      status,
      paymentDate,
      transactionId: `MANUAL-${Date.now()}`,
      pidx: `MANUAL-${Date.now()}`,
      dataFromVerificationReq: {},
      apiQueryFromUser: {}
    });

    await payment.save();

    return res.status(200).json({
      success: true,
      message: "Payment record created successfully",
      payment
    });
  } catch (error) {
    console.error("Error creating payment record:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating payment record",
      error: error.message
    });
  }
});

// Verify payment status by transaction ID
router.get("/verify/:transactionId", async (req, res) => {
  try {
    const { transactionId } = req.params;
    console.log(`Received verification request for transactionId: ${transactionId}`);

    // Find payment record by transaction ID
    const payment = await Payment.findOne({ transactionId });

    if (!payment) {
      console.log(`Payment record not found for transactionId: ${transactionId}. Attempting to search by pidx.`);
      // If payment record not found by transactionId, try searching by pidx
      const paymentByPidx = await Payment.findOne({ pidx: transactionId });

      if (!paymentByPidx) {
        console.log(`Payment record not found for pidx: ${transactionId}.`);
        // If payment record not found, check if it's a manual transaction
        if (transactionId.startsWith('MANUAL-')) {
          return res.status(200).json({
            success: true,
            payment: {
              status: 'success',
              message: 'Manual payment verified'
            }
          });
        }
        
        return res.status(404).json({
          success: false,
          message: "Payment record not found"
        });
      }
    }

    // Return payment status
    return res.status(200).json({
      success: true,
      payment: {
        status: payment.status,
        amount: payment.amount,
        paymentDate: payment.paymentDate,
        paymentGateway: payment.paymentGateway,
        message: payment.status === 'success' ? 'Payment verified successfully' : 'Payment verification failed'
      }
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return res.status(500).json({
      success: false,
      message: "Error verifying payment status",
      error: error.message
    });
  }
});

export default router; 