import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { client } from "@/lib/client";
import { useRouter } from "next/router";
import { useStateContext } from "@/context/StateContext";

const DashboardLayout = ({ children }) => {
  const [partner, setPartner] = useState(null); // Set initial state to null
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true); // Track loading state

  const router = useRouter();

  useEffect(() => {
    // Ensure this runs only on client-side
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const token = localStorage.getItem("auth_token");

      if (!token) {
        router.push("/login");
      } else {
        // Validate token logic here
        validateToken(token);
      }
    }
  }, [isClient, router]);

  const validateToken = async (token) => {
    try {
      const response = await fetch("/api/validatetoken", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Token is valid", data);
        // Handle valid token and data
      } else {
        console.log("Invalid token");
        router.push("/login");
      }
    } catch (error) {
      console.error("Error validating token:", error);
      router.push("/login");
    }
  };

  useEffect(() => {
    if (isClient) {
      const partnerId = sessionStorage.getItem("partner_id");
      console.log("Retrieved partner_id from sessionStorage:", partnerId); // Debugging log
      if (partnerId) {
        const fetchPartner = async () => {
          try {
            console.log("Fetching partner with partnerId:", partnerId); // Debugging log
            const partnerData = await client.fetch(
              `*[_type == "partner" && _id == $partnerId][0]`,
              { partnerId }
            );
            console.log("Fetched partner data:", partnerData); // Debugging log
            setPartner(partnerData);
            setLoading(false); // Set loading to false after data is fetched
          } catch (error) {
            console.error("Error fetching partner data:", error);
            setLoading(false); // Set loading to false even if there's an error
          }
        };

        fetchPartner();
      } else {
        console.log("No partner_id found in sessionStorage.");
        setLoading(false); // Set loading to false if no partnerId in sessionStorage
      }
    }
  }, [isClient]);

  // handleSidebar = () => {
  //   setSidebarOpen(true);
  // }

  const { sidebarOpen, setSidebarOpen } = useStateContext();

  return (
    <div className="flex">
      {/* Sidebar */}
      {/* {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-transparent bg-opacity-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )} */}
      <Sidebar />

      {/* Main Content */}
      <main className="ml-0 md:ml-[30%] lg:ml-[20%] w-full md:w-7/10 lg:w-4/5 min-h-screen bg-white">
        <Navbar />
        <div className="w-full p-5">
          {React.cloneElement(children, { partner })}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
