import DashboardLayout from "@/components/DashboardLayout";
import React from "react";

const bookingDetails = () => {
  return <div>bookingDetails</div>;
};

bookingDetails.getLayout = function getLayout(page) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default bookingDetails;
