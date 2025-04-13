import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { client } from "@/lib/client";

import toast from "react-hot-toast";
import { Button } from "./ui/button";

const ApprovePage = ({ requestDetails }) => {
  const router = useRouter();

  const [toggleDialog, setToggleDialog] = useState(false);
  const [action, setAction] = useState("");
  const [theaterLocation, setTheaterLocation] = useState();

  const onSubmitApprove = async () => {
    try {
      // Query Sanity for a partner that matches the theaterAddress
      const query = `*[_type == "partner" && theaterAddress == $theaterLocation][0]`;
      const params = { theaterLocation };

      const partner = await client.fetch(query, params);

      if (!partner) {
        return res
          .status(404)
          .json({ success: false, message: "Partner not found" });
      }

      // If a matching partner is found, process it here (e.g., approve the partner or update the record)
      console.log("✅ Found Partner:", partner);

      // Optionally, update the partner or create a new record based on the approval
      // Example: update the partner's status
      await client
        .patch(partner._id) // Assuming you want to update the partner document
        .set({
          status: "approved",
        })
        .commit();

      const response = await fetch("/api/status-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: partner.email,
          theaterName: partner.theaterName,
          status: "approved", // Indicating approval
        }),
      });

      if (response.ok) {
        toast.success("Partner was approved!", {
          style: {
            borderRadius: "1000px",
            background: "#F4F6F5",
            color: "#000",
          },
        });
      } else {
        throw new Error("Failed to send status email");
      }

      router.push('/');
    } catch (error) {
      toast.error("Error approving partner", {
        style: {
          borderRadius: "1000px",
          background: "#B03C3F",
          color: "#fff",
        },
      });
    }
  };

  const onSubmitDeny = async () => {
    try {
      // Query Sanity for a partner that matches the theaterAddress
      const query = `*[_type == "partner" && theaterAddress == $theaterLocation][0]`;
      const params = { theaterLocation };

      const partner = await client.fetch(query, params);

      if (!partner) {
        return res
          .status(404)
          .json({ success: false, message: "Partner not found" });
      }

      // If a matching partner is found, process it here (e.g., approve the partner or update the record)
      console.log("✅ Found Partner:", partner);

      // Optionally, update the partner or create a new record based on the approval
      // Example: update the partner's status
      await client
        .patch(partner._id) // Assuming you want to update the partner document
        .set({
          status: "denied",
        })
        .commit();

      const response = await fetch("/api/status-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: requestDetails.email,
          theaterName: requestDetails.theaterName,
          status: "denied", // Indicating approval
        }),
      });

      if (response.ok) {
        toast.success("Partner was denied!", {
          style: {
            borderRadius: "1000px",
            background: "#F4F6F5",
            color: "#000",
          },
        });
      } else {
        throw new Error("Failed to send status email");
      }

      router.push('/');
    } catch (error) {
      toast.error("Error denying partner", {
        style: {
          borderRadius: "1000px",
          background: "#B03C3F",
          color: "#fff",
        },
      });
    }
  };

  const handleButtonClick = (action) => {
    setAction(action);
    setToggleDialog(true);
    setTheaterLocation(requestDetails.theaterAddress);
  };

  const handleDialogClose = () => {
    setToggleDialog(false);
  };

  console.log(requestDetails);

  return (
    <div className="w-full h-screen flex items-center bg-[#fcfcfc] justify-center">
      {requestDetails ? (
        <div className="w-fit h-fit p-5 border-2 bg-[#F4F6F5] border-gray-200 space-y-2 rounded-xl">
          <h1 className="text-xl text-center pb-2 ppns-semibold">
            Request Overview
          </h1>
          <div>
            <span className="text-gray-600 ppns-regular pr-2">
              Theater Name —
            </span>
            <span className="ppns-medium">{requestDetails.theaterName}</span>
          </div>
          <hr className="border border-gray-200" />
          <div>
            <span className="text-gray-600 ppns-regular pr-2">
              Theater Address —
            </span>
            <span className="ppns-medium">{requestDetails.theaterAddress}</span>
          </div>
          <hr className="border border-gray-200" />
          <div>
            <span className="text-gray-600 ppns-regular pr-2">
              Theater Official Email —
            </span>
            <span className="ppns-medium">{requestDetails.email}</span>
          </div>
          <hr className="border border-gray-200" />
          <div>
            <span className="text-gray-600 ppns-regular pr-2">
              Theater Contact Number —
            </span>
            <span className="ppns-medium">{requestDetails.contactTheater}</span>
          </div>
          <hr className="border border-gray-200" />
          <div>
            <span className="text-gray-600 ppns-regular pr-2">
              Theater Admin Name —
            </span>
            <span className="ppns-medium">{requestDetails.adminName}</span>
          </div>
          <hr className="border border-gray-200" />
          <div>
            <span className="text-gray-600 ppns-regular pr-2">
              Theater Admin Contact —
            </span>
            <span className="ppns-medium">{requestDetails.adminContact}</span>
          </div>
          <hr className="border border-gray-200" />
          <div>
            <span className="text-gray-600 ppns-regular pr-5">
              Registration Document
            </span>
            <Link href={requestDetails.registrationDocUrl} target="_blank">
              <Button className="h-fit py-2 px-3 cursor-pointer text-sm bg-gray-300 hover:bg-gray-400 transition duration-200 text-black">
                Click to View
              </Button>
            </Link>
          </div>
          <hr className="border border-gray-200" />
          <hr className="border border-gray-200" />
          <div className="w-full h-fit pt-10 flex flex-col sm:flex-row justify-center space-x-30">
            <Button
              className="w-[100px] h-fit py-2 px-3 cursor-pointer text-sm border border-gray-400 bg-gray-200 hover:bg-gray-300 transition duration-200 text-black"
              onClick={() => handleButtonClick("Deny")}
            >
              Deny
            </Button>
            <Button
              className="w-[100px] h-fit py-2 px-3 cursor-pointer text-sm border border-gray-400 bg-gray-200 hover:bg-gray-300 transition duration-200 text-black"
              onClick={() => handleButtonClick("Approve")}
            >
              Approve
            </Button>
          </div>
        </div>
      ) : (
        <div className="w-fit h-fit p-5 border-2 bg-[#F4F6F5] border-gray-200 space-y-2 rounded-xl">
          <h1 className="text-xl text-center pb-2 ppns-semibold">
            Data Not Found
          </h1>
        </div>
      )}

      {toggleDialog && (
        <div className="fixed inset-0 bg-gray-950/50 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-10 rounded-lg space-y-3">
            <h2 className="text-xl text-center ppns-semibold">
              {action} Request
            </h2>
            <p className="text-center">
              Are you sure you want to {action} this request?
            </p>
            <div className="flex justify-center space-x-5">
              <Button
                className="w-[100px] h-fit py-2 px-3 cursor-pointer text-sm border border-gray-400 bg-gray-200 hover:bg-gray-300 transition duration-200 text-black"
                onClick={handleDialogClose}
              >
                Cancel
              </Button>
              <Button
                className="w-[100px] h-fit py-2 px-3 cursor-pointer text-sm bg-[#A4BBEF] hover:bg-blue-500 transition duration-200 text-black"
                onClick={() => {
                  if (action === "Approve") {
                    onSubmitApprove();
                  } else if (action === "Deny") {
                    onSubmitDeny();
                  }
                  handleDialogClose();
                }}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovePage;
