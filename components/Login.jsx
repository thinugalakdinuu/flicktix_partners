import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import jwt from "jsonwebtoken";
import { client } from "@/lib/client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" })
    .max(100, { message: "Password is too long" }),
});

const PasswordInput = ({ field }) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  return (
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        placeholder="Enter your password"
        className="w-full text-sm h-9 p-3 bg-[#E0E2E1] border border-[#c0c0c0] focus:outline-none rounded-md"
        {...field}
      />
      <span
        className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
        onClick={togglePasswordVisibility}
      >
        {showPassword ? (
          <IoEyeOffOutline className="text-gray-500" />
        ) : (
          <IoEyeOutline className="text-gray-500" />
        )}
      </span>
    </div>
  );
};

const Login = ({ partner }) => {
  const router = useRouter();

  useEffect(() => {
    console.log("qwertyui");
    if (localStorage.getItem("auth_token")) {
      console.log("Token douns");
      const token = localStorage.getItem("auth_token");
      validateToken(token);
    }
  }, []);

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
        router.push("/dashboard");
      } else {
        console.log("Invalid token");
        router.push("/login");
      }
    } catch (error) {
      console.error("Error validating token:", error);
      router.push("/login");
    }
  };

  const [loading, setLoading] = useState(false);
  console.log(partner);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Convert ArrayBuffer to Hexadecimal string
  const arrayBufferToHex = (buffer) => {
    const byteArray = new Uint8Array(buffer);
    return byteArray.reduce(
      (hex, byte) => hex + byte.toString(16).padStart(2, "0"),
      ""
    );
  };

  // SHA-256 Password Hashing Function
  const handlePasswordHashing = async (password) => {
    const encoder = new TextEncoder();
    const passwordBytes = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", passwordBytes);
    return arrayBufferToHex(hashBuffer);
  };

  const onSubmit = async (values) => {
    const { email, password } = values;
    setLoading(true);

    // Hash the password before submission (this should match the password hash stored in the database)
    const hashedPassword = await handlePasswordHashing(password);

    // Find the matching partner by email
    const matchingPartner = partner.find((partner) => partner.email === email);

    if (matchingPartner) {
      // Check if the partner's status is approved
      if (matchingPartner.status === "approved") {
        // Check if the hashed password matches the stored password
        if (hashedPassword === matchingPartner.password) {
          console.log("User authenticated successfully!");

          try {
            const response = await fetch("/api/login", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok && data.token) {
              // Store the JWT token in localStorage
              localStorage.setItem("auth_token", data.token);
              sessionStorage.setItem("partner_id", matchingPartner._id);

              console.log("Token stored:", data.token);
              // Redirect to dashboard after successful login
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

              sessionStorage.setItem("theater_id", ownerRef);
            } else {
              console.log("Error during login:", data.error);
            }
          } catch (error) {
            console.error("Error during login request:", error);
          }
        } else {
          console.log("Incorrect password");
        }
      } else {
        console.log("Account not approved");
      }
    } else {
      console.log("No partner found with this email");
    }

    setLoading(false);
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col lg:flex-row overflow-hidden">
      <div className="w-full h-full block lg:hidden fixed top-0 left-0 z-0">
        <img
          src="/images/auth-background.jpg"
          alt="background"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="w-full lg:w-1/2 relative z-10 lg:static overflow-y-auto bg-[#F4F6F5]/70 backdrop-blur-md lg:bg-[#F4F6F5] flex items-center justify-center">
        <div className="min-h-screen w-[85%] flex items-center justify-center">
          <div className="mt-20 w-full sm:w-[500px] lg:w-[80%] flex flex-col items-center">
            <div className="bg-blue-900">Image</div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full p-6 space-y-7"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0b090a]">Email</FormLabel>
                      <FormControl className="bg-[#E0E2E1] border border-[#c0c0c0]">
                        <Input
                          placeholder="e.g. contact@galaxycinemas.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0b090a]">Password</FormLabel>
                      <FormControl className="bg-[#E0E2E1] border border-[#c0c0c0]">
                        <PasswordInput field={field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {loading ? (
                  <Button
                    type="submit"
                    className="cursor-pointer ml-auto flex flex-row gap-3"
                  >
                    <AiOutlineLoading3Quarters className="animate-spin" />
                    Processing ...
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="cursor-pointer ml-auto block px-7"
                  >
                    Login
                  </Button>
                )}
              </form>
            </Form>
          </div>
        </div>
      </div>
      <div className="hidden lg:block lg:w-1/2 h-full fixed right-0 top-0 z-0">
        <img
          src="/images/auth-background.jpg"
          alt="background"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export default Login;
