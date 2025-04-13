import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";

import { AiOutlineLoading3Quarters } from "react-icons/ai";

const NoSSR = dynamic(() => import('@/components/ApprovePage'), { ssr: false })



const approve = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState(null);
  
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
    const query = new URLSearchParams(window.location.search);
    const token = query.get("token");

    if (!token) {
      setError("No token found");
      setLoading(false);
      return;
    }

    const fullDetails = {
      token,
      email: query.get("email"),
      theaterName: query.get("theaterName"),
      theaterAddress: query.get("theaterAddress"),
      contactTheater: query.get("contactTheater"),
      adminName: query.get("adminName"),
      adminContact: query.get("adminContact"),
      registrationDocUrl: query.get("registrationDocUrl"),
    };

    // Step 1: Verify the token with the API
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

        const responseData = await response.json();

        if (responseData.valid) {
          // Step 2: Set the details and render ApprovePage
          setDetails(fullDetails);
        } else {
          setError("Token is invalid or expired");
        }
      } catch (err) {
        setError("An error occurred while verifying the token");
      } finally {
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

  // Step 3: Render the ApprovePage only if the token is verified
  return <NoSSR requestDetails={details} />;
};

export default approve;

