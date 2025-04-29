const axios = require("axios");

async function verifyKhaltiPayment(pidx) {
  try {
    let headersList = {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
    };

    let bodyContent = JSON.stringify({
      pidx,
    });

    let reqOptions = {
      url: `${process.env.KHALTI_GATEWAY_URL}/api/v2/epayment/lookup/`,
      method: "POST",
      headers: headersList,
      data: bodyContent,
    };

    let response = await axios.request(reqOptions);
    
    // Log the response for debugging
    console.log("Khalti verification response:", response.data);
    
    // Check payment status
    if (response.data.status !== "Completed") {
      throw new Error(`Payment status: ${response.data.status}`);
    }
    
    return response.data;
  } catch (error) {
    console.error("Error verifying Khalti payment:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to verify payment");
  }
}

async function initializeKhaltiPayment({
  return_url,
  website_url,
  amount,
  purchase_order_id,
  purchase_order_name,
  customer_info
}) {
  try {
    // Validate required fields
    if (!amount || !purchase_order_id || !return_url) {
      throw new Error("Missing required fields for Khalti payment");
    }

    let headersList = {
      Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
      "Content-Type": "application/json",
    };

    // Ensure amount is a number and in paisa
    const paymentDetails = {
      return_url,
      website_url: website_url || process.env.FRONTEND_URI || "http://localhost:5000",
      amount: Number(amount),
      purchase_order_id,
      purchase_order_name: purchase_order_name || "Vehicle Booking",
      customer_info: customer_info || {}
    };

    console.log("Initializing Khalti payment with details:", paymentDetails);

    let reqOptions = {
      url: `${process.env.KHALTI_GATEWAY_URL}/api/v2/epayment/initiate/`,
      method: "POST",
      headers: headersList,
      data: paymentDetails,
    };

    let response = await axios.request(reqOptions);
    console.log("Khalti payment initialization response:", response.data);
    
    if (!response.data.pidx || !response.data.payment_url) {
      throw new Error("Invalid response from Khalti");
    }
    
    return response.data;
  } catch (error) {
    console.error("Error initializing Khalti payment:", error.response?.data || error.message);
    
    // Special handling for service unavailability
    if (error.response?.status === 503 || (error.message && error.message.includes("503"))) {
      throw new Error("Khalti payment service is temporarily unavailable. Please try again later or use a different payment method.");
    }
    
    throw new Error(error.response?.data?.message || "Failed to initialize payment. Please try another payment method.");
  }
}

module.exports = { verifyKhaltiPayment, initializeKhaltiPayment };