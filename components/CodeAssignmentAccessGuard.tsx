import { useEffect, useState } from "react";
import { useAccessTokenCheck } from "@/components/useAccessTokenCheck";
import {
  codeAssessmentProvider,
  providerConfig,
} from "@/components/ProviderConfig";
import { ProviderAuthorizationDialog } from "@/components/ProviderAuthorizationDialog";
import { useRouter } from "next/navigation";
import { CircularProgress } from "@mui/material";

type Status = "checking" | "unauthorized" | "authorized" | "redirecting";

export function CodeAssignmentAccessGuard({
  courseId,
  children,
}: {
  courseId: string;
  children: React.ReactNode;
}) {
  const checkAccessToken = useAccessTokenCheck();
  const provider = providerConfig[codeAssessmentProvider];
  const router = useRouter();

  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    const check = async () => {
      const hasToken = await checkAccessToken();
      setStatus(hasToken ? "authorized" : "unauthorized");
    };

    check();
  }, [checkAccessToken]);

  if (status === "redirecting") {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <CircularProgress />
      </div>
    );
  }

  if (status === "unauthorized") {
    return (
      <ProviderAuthorizationDialog
        onAuthorize={() => setStatus("redirecting")}
        onClose={() => {
          setStatus("redirecting");
          router.push(`/courses/${courseId}`);
        }}
        alertMessage={`You must authorize via ${provider.name} to access this code assignment.`}
        _provider={codeAssessmentProvider}
      />
    );
  }

  if (status === "authorized") {
    return <>{children}</>;
  }

  return null;
}
