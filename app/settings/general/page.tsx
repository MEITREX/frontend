"use client";

import { pageUserInfoQuery } from "@/__generated__/pageUserInfoQuery.graphql";
import GeneralSettingsPage from "@/components/settings/GeneralSettings";
import SettingsSkeleton from "@/components/settings/SettingsSkeleton";
import { Suspense } from "react";
import { useLazyLoadQuery } from "react-relay";
import { graphql } from "relay-runtime";

const Query = graphql`
  query pageUserInfoQuery {
    currentUserInfo {
      id
    }
  }
`;

const Page = () => {
  const { currentUserInfo } = useLazyLoadQuery<pageUserInfoQuery>(Query, {});

  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <GeneralSettingsPage userId={currentUserInfo.id} />
    </Suspense>
  );
};

export default Page;
