import React, { useState } from "react";
import { useRouter } from "next/router";
import { client } from "@/lib/client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { IoCheckmark } from "react-icons/io5";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  theaterName: z.string().min(1),
  address: z.string().min(1),
  contactNumber: z.string().min(1),
  email: z.string().email(),
  adminName: z.string().min(1),
  adminContact: z.string().min(1),
  registrationDoc: z.any().refine((file) => file instanceof File, {
    message: "A valid file is required.",
  }),
  
  verifiedTerms: z.literal(true, {
    errorMap: () => ({ message: "You must confirm before proceeding." }),
  }),
});

const Signup = () => {
  const router = useRouter();
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCheckboxChange = () => {
    setIsChecked((prev) => !prev); // just toggle directly
  };

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      theaterName: "",
      address: "",
      contactNumber: "",
      email: "",
      adminName: "",
      adminContact: "",
      registrationDoc: "",
    },
  });

  const onSubmit = async (values) => {
    const file = values.registrationDoc;
    setLoading(true);

    console.log("Form Submission:");
    console.log("Theater Name:", values.theaterName);
    console.log("Address:", values.address);
    console.log("Contact Number:", values.contactNumber);
    console.log("Email:", values.email);
    console.log("Admin Name:", values.adminName);
    console.log("Admin Contact:", values.adminContact);
    console.log("File:", {
      name: file?.name,
      size: file?.size,
      type: file?.type,
    });
    console.log("Agreement Checked:", values.verifiedTerms);

    try {
      let uploadedFile = null;

      if (file) {
        uploadedFile = await client.assets.upload("file", file, {
          filename: file.name,
          contentType: file.type,
        });
        console.log("📄 File uploaded to Sanity:", uploadedFile);
        console.log("fileGG", uploadedFile.assetId);
      }

      const doc = {
        _type: "partner",
        theaterName: values.theaterName,
        theaterAddress: values.address,
        contactTheater: values.contactNumber,
        email: values.email,
        adminName: values.adminName,
        contactAdmin: values.adminContact,
        status: "pending",
        ...(uploadedFile &&
          uploadedFile._id && {
            registrationDoc: {
              _type: "file",
              asset: {
                _type: "reference",
                _ref: uploadedFile._id,
              },
            },
          }),
      };

      const created = await client.create(doc);
      console.log("✅ Partner document created:", created);

      // Build the document URL
      const registrationDocUrl = `https://cdn.sanity.io/files/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/production/${uploadedFile.assetId}.pdf`;

      // Then send this link in the request body to /api/send-email
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
          theaterName: values.theaterName,
          theaterAddress: values.address,
          contactTheater: values.contactNumber,
          adminName: values.adminName,
          adminContact: values.adminContact,
          registrationDocUrl,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        console.log(result.message); // Email sent successfully
      } else {
        console.log("Failed to send email:", result.message);
      }

      router.push("/success");
    } catch (err) {
      console.error("❌ Error creating partner doc:", err);
      setLoading(false);
    }
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
        <div className="min-h-screen flex items-center justify-center">
          <div className="mt-20 w-[85%] sm:w-[500px] lg:w-[80%] flex flex-col items-center">
            <div className="bg-blue-900">Image</div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full p-6 space-y-7"
              >
                <FormField
                  control={form.control}
                  name="theaterName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0b090a]">
                        Theater Name
                      </FormLabel>
                      <FormControl className="bg-[#E0E2E1] border border-[#c0c0c0]">
                        <Input placeholder="e.g. Galaxy Cinemas" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0b090a]">Address</FormLabel>
                      <FormControl className="bg-[#E0E2E1] border border-[#c0c0c0]">
                        <Input
                          placeholder="e.g. 123 Main Street, Mumbai"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0b090a]">
                        Official Contact Number
                      </FormLabel>
                      <FormControl className="bg-[#E0E2E1] border border-[#c0c0c0]">
                        <Input placeholder="e.g. +91 9876543210" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0b090a]">
                        Official Email
                      </FormLabel>
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
                  name="adminName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0b090a]">
                        Admin Full Name
                      </FormLabel>
                      <FormControl className="bg-[#E0E2E1] border border-[#c0c0c0]">
                        <Input placeholder="e.g. Rahul Mehta" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="adminContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0b090a]">
                        Admin Contact Number
                      </FormLabel>
                      <FormControl className="bg-[#E0E2E1] border border-[#c0c0c0]">
                        <Input placeholder="e.g. +91 9123456780" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="registrationDoc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0b090a]">
                        {/* Business Registration Document (PDF or Image) */}
                        Business Registration Document (PDF)
                      </FormLabel>
                      <FormControl className="bg-[#E0E2E1] border border-[#c0c0c0]">
                        <Input
                          type="file"
                          // accept=".pdf,.png,.jpg,.jpeg"
                          accept=".pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 2 * 1024 * 1024) {
                                form.setError("registrationDoc", {
                                  type: "manual",
                                  message: "File must be smaller than 2MB.",
                                });
                                e.target.value = ""; // Clear the file input
                                return;
                              }
                              field.onChange(file); // Valid file
                            }
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Upload your registration certificate (PDF, JPG, or PNG
                        under 2MB).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="verifiedTerms"
                  rules={{ required: "You must confirm before proceeding." }}
                  render={({ field }) => (
                    <FormItem>
                      <div className="h-[100px] flex flex-row">
                        <div className="w-[25px] h-full flex justify-center">
                          <div
                            className="w-full h-[25px] relative"
                            onClick={() => {
                              handleCheckboxChange();
                              field.onChange(!isChecked);
                            }}
                          >
                            {isChecked ? (
                              <div>
                                <input
                                  type="checkbox"
                                  className="appearance-none w-[20px] h-[20px] cursor-pointer bg-[#1B1B20] rounded-sm border border-white"
                                />
                                <span className="absolute left-[2px] top-[2px] text-gray-400 cursor-pointer">
                                  <IoCheckmark color="white" />
                                </span>
                              </div>
                            ) : (
                              <input
                                type="checkbox"
                                className="appearance-none w-[20px] h-[20px] cursor-pointer bg-white rounded-sm border border-[#777779]"
                              />
                            )}
                          </div>
                        </div>

                        <div className="h-full pl-2">
                          <p className="text-[15px] text-[#0b090a]">
                            I hereby confirm that all the information provided
                            above is true, complete, and accurate to the best of
                            my knowledge.
                          </p>
                          <FormMessage />
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
                {loading ? (
                  <Button
                    type="submit"
                    className="cursor-pointer ml-auto flex flex-row gap-3"
                    disabled={!isChecked}
                  >
                    <AiOutlineLoading3Quarters className="animate-spin" />
                    Submitting ...
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="cursor-pointer ml-auto block"
                    disabled={!isChecked}
                  >
                    Submit Details
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

export default Signup;
