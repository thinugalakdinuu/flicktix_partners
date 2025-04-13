import DashboardLayout from '@/components/DashboardLayout';
import React from 'react'

const hello = () => {
  return (
    <div>hello</div>
  )
}

hello.getLayout = function getLayout(page) {
    return <DashboardLayout>{page}</DashboardLayout>;
  };

export default hello