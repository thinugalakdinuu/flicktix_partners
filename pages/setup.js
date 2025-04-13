import SetupPage from "@/components/SetupPage";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const Setup = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVerified, setIsVerified] = useState(true);
  const [data, setData] = useState({
    token: "",
    email: "",
    theaterName: "",
  });

  useEffect(() => {
    if (error) {
      toast.error(`${error}`, {
        style: {
          borderRadius: "1000px",
          background: "#B03C3F",
          color: "#fff",
        },
        duration: 10000,
      });
    }
  }, [error]);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get("token");

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setData({
        token: params.get("token") || "",
        email: params.get("email") || "",
        theaterName: params.get("theaterName") || "",
      });
    }

    if (!token) {
      setError("No token found in the URL.");
      setLoading(false);
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch("/api/verify-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.error || "Token verification failed");
          setLoading(false);
          return;
        }

        // ✅ Call Stripe onboarding API after token verification
        const stripeRes = await fetch("/api/stripe/onboard", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: data.email }),
        });

        if (!stripeRes.ok) {
          const err = await stripeRes.json();
          setError(err.error || "Stripe onboarding failed");
          setLoading(false);
          return;
        }

        const { url } = await stripeRes.json();
        window.location.href = url; // 🔁 Redirect to Stripe onboarding
      } catch (error) {
        setError("An error occurred during setup.");
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-full flex flex-row items-center justify-center gap-3">
        <AiOutlineLoading3Quarters className="animate-spin" />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div>
      {isVerified ? (
        <div>
          <SetupPage data={data} />
        </div>
      ) : (
        <div>Verification failed. You may not have access to this page.</div>
      )}
    </div>
  );
};

export default Setup;
