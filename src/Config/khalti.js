import axios from "axios";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the root directory
const envPath = path.resolve(__dirname, '../../.env');
console.log('Loading environment variables from:', envPath);
dotenv.config({ path: envPath });

// Log all environment variables (excluding sensitive ones)
console.log('Environment variables loaded:', {
  KHALTI_GATEWAY_URL: process.env.KHALTI_GATEWAY_URL ? 'Set' : 'Not Set',
  KHALTI_SECRET_KEY: process.env.KHALTI_SECRET_KEY ? 'Set' : 'Not Set',
  NODE_ENV: process.env.NODE_ENV,
  FRONTEND_URI: process.env.FRONTEND_URI
});

// Validate required environment variables
const requiredEnvVars = ['KHALTI_SECRET_KEY', 'KHALTI_GATEWAY_URL'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  console.error('Please ensure your .env file exists in the project root directory and contains these variables.');
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

// Ensure the Khalti gateway URL doesn't end with a slash
const KHALTI_GATEWAY_URL = process.env.KHALTI_GATEWAY_URL.replace(/\/$/, '');

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
      url: `${KHALTI_GATEWAY_URL}/api/v2/epayment/lookup/`,
      method: "POST",
      headers: headersList,
      data: bodyContent,
    };

    console.log('Verifying Khalti payment with options:', {
      url: reqOptions.url,
      headers: { ...reqOptions.headers, Authorization: 'Key ***' },
      data: bodyContent
    });

    let response = await axios.request(reqOptions);
    
    console.log("Khalti verification response:", response.data);
    
    if (response.data.status !== "Completed") {
      throw new Error(`Payment status: ${response.data.status}`);
    }
    
    return response.data;
  } catch (error) {
    console.error("Error verifying Khalti payment:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
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
      website_url: website_url || process.env.FRONTEND_URI || "http://localhost:5173",
      amount: Number(amount),
      purchase_order_id,
      purchase_order_name: purchase_order_name || "Vehicle Booking",
      customer_info: customer_info || {}
    };

    console.log("Initializing Khalti payment with details:", {
      ...paymentDetails,
      amount: `${paymentDetails.amount} paisa`
    });

    let reqOptions = {
      url: `${KHALTI_GATEWAY_URL}/api/v2/epayment/initiate/`,
      method: "POST",
      headers: headersList,
      data: paymentDetails,
    };

    console.log('Making Khalti API request with options:', {
      url: reqOptions.url,
      headers: { ...reqOptions.headers, Authorization: 'Key ***' },
      data: paymentDetails
    });

    let response = await axios.request(reqOptions);
    console.log("Khalti payment initialization response:", response.data);
    
    if (!response.data.pidx || !response.data.payment_url) {
      throw new Error("Invalid response from Khalti");
    }
    
    return response.data;
  } catch (error) {
    console.error("Error initializing Khalti payment:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    // Special handling for service unavailability
    if (error.response?.status === 503 || (error.message && error.message.includes("503"))) {
      throw new Error("Khalti payment service is temporarily unavailable. Please try again later or use a different payment method.");
    }
    
    throw new Error(error.response?.data?.message || "Failed to initialize payment. Please try another payment method.");
  }
}

export { verifyKhaltiPayment, initializeKhaltiPayment }; 