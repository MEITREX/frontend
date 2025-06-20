import { Done } from "@mui/icons-material";
import { ReactNode } from "react";

export function Section({
  children,
  done = false,
}: {
  children: ReactNode;
  done?: boolean;
}) {
  return (
    <div className="border-gray-200 w-fit flex flex-col shrink-0">
      {children}
      {done && <SectionDone />}
    </div>
  );
}

export function SectionHeader({
  children,
  action,
}: {
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className={`flex gap-2 items-center mb-1`}>
      {children && (
        <div className="py-2 h-full text-center font-medium self-start">
          {children}
        </div>
      )}
      {action}
    </div>
  );
}

export function SectionContent({ children }: { children: ReactNode }) {
  return <div className="grow py-4">{children}</div>;
}

function SectionDone() {
  return (
    <div className="flex items-stretch">
      <div className="w-8 mr-4 py-4 flex justify-center">
        <Done className="text-green-600" />
      </div>
      <div className="grow mr-4 flex items-center text-gray-400">
        Section completed
      </div>
    </div>
  );
}
