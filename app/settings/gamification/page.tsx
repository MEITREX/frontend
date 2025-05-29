"use client";

import React, { Suspense } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import SettingsSkeleton from "@/components/settings/SettingsSkeleton";
import GamificationSettingsPage from "@/components/settings/GamificationSettings";
import { pageUserInfoGamificationQuery } from "@/__generated__/pageUserInfoGamificationQuery.graphql";

export default function Page() {
  const { currentUserInfo } = useLazyLoadQuery<pageUserInfoGamificationQuery>(
    graphql`
      query pageUserInfoGamificationQuery {
        currentUserInfo {
          id
        }
      }
    `,
    {}
  );

  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <GamificationSettingsPage userId={currentUserInfo.id} />
    </Suspense>
  );
}
