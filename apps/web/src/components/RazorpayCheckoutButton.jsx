"use client";

import { useState } from "react";
import { loadRazorpayScript } from "@/utils/loadRazorpay";
import { ShieldCheck, Loader2 } from "lucide-react";

export default function RazorpayCheckoutButton({
  amount = 499, // default 499 (499 INR = Rs. 4.99 or 49900 paise depending on denomination)
  currency = "INR",
  receipt = "",
  notes = {},
  userEmail = "",
  userName = "",
  onSuccess = () => {},
  onError = () => {},
  buttonText = "Pay Now",
  className = "",
  disabled = false,
}) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handlePayment = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      // 1. Load Razorpay checkout script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error("Razorpay SDK failed to load. Please check your internet connection.");
      }

      // 2. Call backend to create order
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          currency,
          receipt: receipt || `rcpt_${Date.now()}`,
          notes: {
            ...notes,
            email: userEmail,
            product: "Skin Story Pre-Launch Access",
          },
        }),
      });

      const orderData = await res.json();
      if (!res.ok || !orderData.order_id) {
        throw new Error(orderData.error || "Failed to initiate payment order");
      }

      const keyId = orderData.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

      // 3. Configure Razorpay Standard Checkout options
      const options = {
        key: keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Skin Story",
        description: "Pre-Launch Early Access Pass + Digital Scratch Card",
        image: "https://getskinstory.com/bimi-logo.svg",
        order_id: orderData.order_id,
        prefill: {
          name: userName || "Skin Story Member",
          email: userEmail || "",
        },
        notes: {
          product: "Skin Story Early Access",
        },
        theme: {
          color: "#937abd",
        },
        handler: async function (response) {
          try {
            setLoading(true);
            // 4. Verify payment signature on backend
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              onSuccess({
                ...verifyData,
                order_id: response.razorpay_order_id,
                payment_id: response.razorpay_payment_id,
              });
            } else {
              const err = verifyData.error || "Payment signature verification failed";
              setErrorMsg(err);
              onError(err);
            }
          } catch (err) {
            console.error("Verification error:", err);
            const errString = err.message || "Failed to verify payment with server";
            setErrorMsg(errString);
            onError(errString);
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            console.log("Razorpay checkout modal closed by user");
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);

      razorpayInstance.on("payment.failed", function (response) {
        console.error("Payment failed:", response.error);
        const description = response.error?.description || "Payment failed. Please try another method.";
        setErrorMsg(description);
        onError(description);
        setLoading(false);
      });

      razorpayInstance.open();
    } catch (err) {
      console.error("Payment initialization error:", err);
      setErrorMsg(err.message || "Something went wrong while initiating checkout");
      onError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <button
        type="button"
        onClick={handlePayment}
        disabled={disabled || loading}
        className={
          className ||
          "w-full py-3.5 px-6 rounded-full font-semibold text-white bg-[#937abd] hover:bg-[#856db0] active:scale-[0.98] transition-all shadow-[0_4px_14px_rgba(147,122,189,0.35)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        }
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <ShieldCheck className="w-5 h-5" />
            <span>{buttonText}</span>
          </>
        )}
      </button>

      {errorMsg && (
        <p className="mt-2 text-xs sm:text-sm text-red-500 text-center font-medium">
          {errorMsg}
        </p>
      )}
    </div>
  );
}
