"use client";

import dynamic from "next/dynamic";

const HylimoEditor = dynamic(() => import('../../components/hylimo/HylimoEditor'), {
  ssr: false,
  loading: () => <p>Load Editor...</p>
});


export default function MainHylimoEditor ()  {


  return (
    <HylimoEditor/>
  );
};

