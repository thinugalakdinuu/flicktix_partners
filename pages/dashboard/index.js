import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/DashboardLayout";

const dashboard = ({ partner }) => {
  

  return (
    <div>
      {/* No need to display partner name here, as it's already displayed in DashboardLayout */}dsds
    </div>
  );
};

dashboard.getLayout = function getLayout(page) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default dashboard;
