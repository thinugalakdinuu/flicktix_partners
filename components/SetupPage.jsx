import React, { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import toast from "react-hot-toast";
import { client } from "@/lib/client";
import { Label } from "./ui/label";
import { useRouter } from "next/router";

const SetupPage = ({ data }) => {
  const [password, setPassword] = useState("");
  const [isPasswordSet, setIsPasswordSet] = useState(false); // State to toggle between the forms
  const [partnerData, setPartnerData] = useState(null); // State to hold the fetched data
  const [theaterNameChange, setTheaterNameChange] = useState(""); // State for theater name
  const [locationChange, setLocationChange] = useState(""); // State for theater location
  const [adultPrice, setAdultPrice] = useState(""); // State for adult ticket price
  const [childPrice, setChildPrice] = useState(""); // State for child ticket price
  const [email, setEmail] = useState("");
  const [partnerIdentity, setPartnerIdentity] = useState("");

  const router = useRouter();
  
  useEffect(() => {
    if (router.isReady) {
      const tokenFromURL = router.query.email;
      console.log("PARAMS:", tokenFromURL);
      setEmail(tokenFromURL); // async, won't immediately update email
    }
  }, [router.isReady, router.query.email]);
  
  useEffect(() => {
    console.log("set email", email); // This will log after the email is updated
  }, [email]);
  
  const theaterName = data.theaterName;

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleNameChange = (event) => {
    setTheaterNameChange(event.target.value);
  };

  const handleLocationChange = (event) => {
    setLocationChange(event.target.value);
  };

  const handleAdultPriceChange = (event) => {
    setAdultPrice(event.target.value);
  };

  const handleChildPriceChange = (event) => {
    setChildPrice(event.target.value);
  };

  // Function to hash password using SHA-256
  const hashPassword = async (password) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);

    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
    return hashHex;
  };

  const handlePassword = async () => {
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters", {
        style: {
          borderRadius: "1000px",
          background: "#F4F6F5",
          color: "#000",
        },
      });
    } else {
      const hashedPassword = await hashPassword(password);
      console.log("Hashed Password:", hashedPassword);
      updatePartnerPassword(hashedPassword);

      // Switch to the Create Theater form after password is set
      setIsPasswordSet(true);
    }
  };

  // Fetch partner data based on email and theaterName
  useEffect(() => {
    const fetchPartnerData = async () => {
      const query = `*[_type == "partner" && email == $email && theaterName == $theaterName]`;
      const params = { email, theaterName };

      try {
        const result = await client.fetch(query, params);
        console.log("Partner Data:", result); // Log the matching data
        if (result.length > 0) {
          setPartnerData(result); // Set the partner data to state
          setTheaterNameChange(result[0].theaterName || ""); // Update state with fetched data
          setLocationChange(result[0].theaterAddress || ""); // Update state with fetched data
        }
      } catch (error) {
        console.error("Error fetching partner data:", error);
      }
    };

    fetchPartnerData();
  }, [email, theaterName]); // Fetch partner data whenever email or theaterName changes

  const updatePartnerPassword = async (hashedPassword) => {
    if (partnerData && partnerData.length > 0) {
      const partnerId = partnerData[0]._id; // Get the first matching partner document's ID
      setPartnerIdentity(partnerId)

      try {
        await client
          .patch(partnerId) // Patch the document with the matching ID
          .set({ password: hashedPassword }) // Set the new hashed password field
          .commit(); // Commit the update to Sanity

        console.log("Password updated in Sanity");
        toast.success("Password updated in Sanity!", {
          style: {
            borderRadius: "1000px",
            background: "#F4F6F5",
            color: "#000",
          },
        });
      } catch (error) {
        console.error("Error updating password in Sanity:", error);
      }
    } else {
      console.log("No partner data found to update");
    }
  };

  const handleBack = () => {
    setIsPasswordSet(false); // Go back to the password form
  };

  const handleCreateTheater = async () => {
    const data = {
      email: email,
      theaterName: theaterNameChange,
      location: locationChange,
      pricing: {
        adultPrice: parseFloat(adultPrice),
        childPrice: parseFloat(childPrice),
      },
      partnerId: partnerIdentity,
      // Add any additional necessary fields like Stripe account ID
    };

    // Send data to the backend
    try {
      const response = await fetch("/api/create-theater", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success("Theater created successfully!", {
          style: {
            borderRadius: "1000px",
            background: "#F4F6F5",
            color: "#000",
          },
        });
        
        const partnersList = await client.fetch(`*[_type == "partner"]`);



        await authenticateAndRedirect(email, password, partnersList);
      } else {
        toast.error("Error creating theater", {
          style: {
            borderRadius: "1000px",
            background: "#F4F6F5",
            color: "#000",
          },
        });
      }
    } catch (error) {
      console.error("Error creating theater:", error);
      toast.error("Error creating theater", {
        style: {
          borderRadius: "1000px",
          background: "#F4F6F5",
          color: "#000",
        },
      });
    }
  };

  const authenticateAndRedirect = async (email, plainPassword, partnerList) => {
    try {
      // Hash the password
      const encoder = new TextEncoder();
      const passwordBytes = encoder.encode(plainPassword);
      const hashBuffer = await crypto.subtle.digest("SHA-256", passwordBytes);
      const hashedPassword = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
  
      // Find the newly created partner
      const matchingPartner = partnerList.find(p => p.email === email);
  
      if (!matchingPartner) {
        console.log("No partner found");
        return;
      }
  
      if (matchingPartner.status !== "approved") {
        console.log("Partner not approved");
        return;
      }
  
      if (hashedPassword !== matchingPartner.password) {
        console.log("Password mismatch");
        return;
      }
  
      // Get JWT from backend
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
  
      const data = await response.json();
  
      if (response.ok && data.token) {
        localStorage.setItem("auth_token", data.token);
        sessionStorage.setItem("partner_id", matchingPartner._id);
        console.log("Authenticated and token stored, redirecting...");
        router.push("/dashboard");

        const partner = await client.fetch(
          `*[_type == "partner" && _id == $id][0]{
            owner {
              _ref
            }
          }`,
          { id: matchingPartner._id }
        );
        
        const ownerRef = partner?.owner?._ref;
        
        sessionStorage.setItem("theater_id", ownerRef)
      } else {
        console.error("Login failed:", data.error);
      }
    } catch (err) {
      console.error("Auth error after create:", err);
    }
  };

  return (
    <div className="w-full min-h-[120vh] relative bg-amber-700">
      <div className="w-full h-full">
        <img
          src="/images/auth-background.jpg"
          alt="background"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="w-full h-full absolute top-0 left-0 bg-[#F4F6F5]/75 backdrop-blur-md flex items-center justify-center">
        <div className="w-fit h-fit p-20 flex flex-col gap-10 bg-[#F4F6F5] rounded-2xl">
          {/* Conditional rendering based on the isPasswordSet state */}
          {!isPasswordSet ? (
            <>
              <h1 className="text-xl ppns-semibold">Setup a Password</h1>
              <Input
                onChange={handlePasswordChange}
                value={password}
                type="text"
                placeholder="Password"
                className="w-[400px] h-10 ppns-regular border border-black"
              />
              <Button
                onClick={handlePassword}
                className="cursor-pointer bg-black hover:bg-gray-700 transition duration-300 text-white"
              >
                Submit
              </Button>
            </>
          ) : (
            <>
              <h1 className="text-xl ppns-semibold">Create a Theater</h1>
              <div className="w-full flex flex-col gap-6">
                {partnerData && (
                  <>
                    <p className="text-gray-600 m">Basic information</p>
                    <Input
                      onChange={handleNameChange}
                      value={theaterNameChange}
                      type="text"
                      placeholder="Theater Name"
                      className="w-[400px] h-10 ppns-regular border border-black"
                    />
                    <Input
                      onChange={handleLocationChange}
                      value={locationChange}
                      type="text"
                      placeholder="Location"
                      className="w-[400px] h-10 ppns-regular border border-black"
                    />
                    <p className="text-gray-600 m">Pricing</p>
                    <Label htmlFor="adultPrice">Adult Price (LKR)</Label>
                    <Input
                      onChange={handleAdultPriceChange}
                      value={adultPrice}
                      type="text"
                      placeholder="Price for an Adult"
                      className="w-[400px] h-10 ppns-regular border border-black"
                    />
                    <Label htmlFor="childPrice">Child Price (LKR)</Label>
                    <Input
                      onChange={handleChildPriceChange}
                      value={childPrice}
                      type="text"
                      placeholder="Price for a Child"
                      className="w-[400px] h-10 ppns-regular border border-black"
                    />
                    <div className="w-full flex flex-row justify-between pt-5 gap-6">
                      <Button
                        onClick={handleBack}
                        className="w-[120px] cursor-pointer border border-gray-400 bg-gray-200 hover:bg-gray-300 transition duration-300 text-black"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handleCreateTheater}
                        className="w-[120px] cursor-pointer bg-black hover:bg-gray-700 transition duration-300 text-white"
                      >
                        Create Theater
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SetupPage;
