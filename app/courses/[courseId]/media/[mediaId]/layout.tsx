"use client";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { IconButton, Tooltip } from "@mui/material";
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MediaPage from "@/app/courses/[courseId]/media/[mediaId]/MediaPage";
import { useParams, usePathname, useRouter } from "next/navigation";


export default function MediaForumLayout({
                                           children
                                         }: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();

  const isForumActive = pathname.includes("/forum");

  const handleToggleForum = () => {
    const { courseId, mediaId } = params;
    if (isForumActive) {
      router.push(`/courses/${courseId}/media/${mediaId}`);
    }
  };

  return (
    <main className="flex flex-col h-full">
      <PanelGroup direction="horizontal" className="w-full h-full flex-grow">
        <Panel
          defaultSize={isForumActive ? 60 : 100}
          minSize={30}
          className="flex flex-col h-full overflow-hidden p-4"
        >
          <MediaPage/>
        </Panel>

        {isForumActive && (
          <>
            <div className="relative">
              <PanelResizeHandle className="w-2 h-full bg-gray-200 hover:bg-gray-400 cursor-ew-resize flex items-center justify-center" />
              <Tooltip title="Close Forum">
                <IconButton
                  onClick={handleToggleForum}
                  size="small"
                  sx={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)', zIndex: 10,
                    backgroundColor: 'white', border: '1px solid #ddd',
                    '&:hover': { backgroundColor: '#f0f0f0' },
                  }}
                >
                  <ChevronRightIcon />
                </IconButton>
              </Tooltip>
            </div>

            <Panel
              defaultSize={45}
              minSize={45}
              collapsible={true}
              className="h-full overflow-hidden"
            >
              {children}
            </Panel>
          </>
        )}
      </PanelGroup>
    </main>
  );
}