import React from 'react';
import Login from '@/components/Login';

import { client } from '@/lib/client';

const login = ({ partnerData }) => {
  return (
    <Login partner={partnerData} />
  )
}

export const getServerSideProps = async () => {
  const query = '*[_type == "partner"]';
  const partnerData = await client.fetch(query);

  return {
    props: { partnerData },
  };
}

export default login