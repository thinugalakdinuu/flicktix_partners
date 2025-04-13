import React, { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { client } from "@/lib/client";

const scan = () => {
  const [message, setMessage] = useState("");
  const [uniqueBookingId, setBookingId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [nticketStatus, setnTicketStatus] = useState("");
  const [isCameraActive, setIsCameraActive] = useState(false);

  useEffect(() => {
    let scanner = null;
    if (isCameraActive) {
      scanner = new Html5QrcodeScanner("reader", {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      });

      scanner.render(
        (data) => {
          console.log("Scanned Booking ID:", data);
          setBookingId(data);
          setMessage("Booking ID scanned successfully!");
          setIsOpen(true);

          fetchBookingData(data);
        },
        (error) => {
          console.error("QR scanner error:", error);
          setMessage("Error scanning QR code.");
        }
      );

      const qrBox = document.querySelector(".html5-qrcode-scanner .qrbox");
      if (qrBox) {
        qrBox.style.backgroundColor = "#f0f0f0";
      }
    }

    return () => {
      if (scanner) {
        scanner.clear();
      }
    };
  }, [isCameraActive]);

  const fetchBookingData = async (scannedBookingId) => {
    try {
      const booking = await client.fetch(
        `*[_type == "booking" && uniqueBookingId == $uniqueBookingId][0]`,
        { uniqueBookingId: scannedBookingId }
      );
      if (booking) {
        console.log("Booking Data:", booking);
        setBookingData(booking);
        setnTicketStatus(booking.ticketStatus);
      } else {
        console.log("No booking found with this ID.");
        setBookingData(null);
        setnTicketStatus("");
      }
    } catch (error) {
      console.error("Error fetching booking data:", error);
      setBookingData(null);
      setnTicketStatus("");
    }
  };

  // Function to redeem the ticket
  const redeemTicket = async () => {
    if (nticketStatus === "reserved" && bookingData) {
      try {
        const existingBooking = await client.fetch(
          `*[_type == "booking" && uniqueBookingId == $uniqueBookingId][0]`,
          { uniqueBookingId: uniqueBookingId }
        );

        if (existingBooking) {
          await client
            .patch(existingBooking._id)
            .set({ ticketStatus: "redeemed" })
            .commit();
          setnTicketStatus("redeemed");
          setMessage("Ticket has been redeemed!");
        } else {
          setMessage("Booking document not found for redemption.");
        }
      } catch (error) {
        console.error("Error redeeming ticket:", error);
        setMessage("Failed to redeem the ticket.");
      }
    }
  };

  // Handle button click to start the camera
  const startCamera = () => {
    setIsCameraActive(true);
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-semibold">Scan Ticket</h1>
      <p className="text-lg">{message}</p>

      {/* Button to start the scanner */}
      {!isCameraActive && (
        <button
          onClick={startCamera}
          className="px-4 py-2 w-full bg-gray-200 hover:bg-gray-300 transition duration-200 cursor-pointer text-black rounded-md"
        >
          Start Scanner
        </button>
      )}

      {/* QR Scanner Container */}
      <div
        id="reader"
        className="w-full h-96 bg-white border-gray-200 rounded-lg shadow-lg relative"
        style={{
          border: "3px solid #4CAF50",
          backgroundColor: "#212121",
        }}
      ></div>

      {/* ShadCN Modal */}
      <Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
        <DialogTrigger />
        <DialogContent className="w-full max-w-lg p-8 bg-white rounded-lg shadow-lg">
          <DialogTitle className="text-xl ppns-medium">Ticket Details</DialogTitle>
          <DialogDescription>
            <h1 className="text-lg ppns-semibold">Booking ID: {uniqueBookingId}</h1>
            <div className="w-full flex flex-col items-center justify-center">
              <p className="mt-4 text-lg">
                {bookingData ? `` : "Booking not found. Try rescanning the QR code"}
              </p>
              {bookingData && nticketStatus === "redeemed" && (
                <p className="mt-4 text-md text-red-600">
                  This ticket has already been redeemed.
                </p>
              )}
            </div>
            {bookingData && nticketStatus === "reserved" ? (
              <DialogClose asChild onClick={redeemTicket}>
                <button className="mt-4 px-4 py-2 w-full bg-gray-200 border-none outline-none hover:bg-gray-300 transition duration-200 cursor-pointer text-black rounded-md">
                  Redeem Ticket
                </button>
              </DialogClose>
            ) : (
              <DialogClose asChild onClick>
                <button className="mt-4 px-4 py-2 w-full bg-gray-200 border-none outline-none hover:bg-gray-300 transition duration-200 cursor-pointer text-black rounded-md">
                  Close
                </button>
              </DialogClose>
            )}
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  );
};

scan.getLayout = function getLayout(page) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default scan;
