"use client";

import React, { Suspense } from "react";
import { graphql, useLazyLoadQuery, useMutation } from "react-relay";
import NotificationSettingsPage from "@/components/settings/NotificationSettings";
import SettingsSkeleton from "@/components/settings/SettingsSkeleton";
import { pageUserInfoNotificationQuery } from "@/__generated__/pageUserInfoNotificationQuery.graphql";

export default function Page() {
  const { currentUserInfo } = useLazyLoadQuery<pageUserInfoNotificationQuery>(
    graphql`
      query pageUserInfoNotificationQuery {
        currentUserInfo {
          id
        }
      }
    `,
    {}
  );

  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <NotificationSettingsPage userId={currentUserInfo.id} />
    </Suspense>
  );
}
