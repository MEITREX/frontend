"use client";
/* eslint-disable @next/next/no-img-element */
import { studentContentDownloadButtonFragment$key } from "@/__generated__/studentContentDownloadButtonFragment.graphql";
import { studentMediaQuery } from "@/__generated__/studentMediaQuery.graphql";
import { ContentTags } from "@/components/ContentTags";
import { Heading } from "@/components/Heading";
import { PageError } from "@/components/PageError";
import { Download } from "@mui/icons-material";
import { Alert, Box, Button, IconButton, Tooltip } from "@mui/material";
import "@vidstack/react/player/styles/default/layouts/video.css";
import "@vidstack/react/player/styles/default/theme.css";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { clamp } from "lodash";
import { DocumentSide } from "./DocumentSide";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

dayjs.extend(duration);

import { useParams } from "next/navigation";

import { useRef, useState } from "react";
import { graphql, useFragment, useLazyLoadQuery } from "react-relay";
import { SimilarSegments } from "./SimilarSegments";
import { VideoSide } from "./VideoSide";
import CloseIcon from "@mui/icons-material/Close";
import ForumIcon from "@mui/icons-material/Forum";
import ForumOverview from "@/components/forum/ForumOverview";

export default function StudentMediaPage() {
  const [displayForum, setDisplayForum] = useState<boolean>(false);
  const { mediaId } = useParams();
  const {
    contentsByIds: [content],
  } = useLazyLoadQuery<studentMediaQuery>(
    graphql`
      query studentMediaQuery($mediaId: UUID!) {
        contentsByIds(ids: [$mediaId]) {
          metadata {
            name
            type
            ...ContentTags
          }
          ... on MediaContent {
            mediaRecords {
              type
              id
            }
          }
          ...DocumentSideFragment
          ...VideoSideFragment
        }
      }
    `,
    { mediaId }
  );

  const [nagDismissed, setNagDismissed] = useState(false);

  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<any>(null);
  const ref = useRef<HTMLDivElement>(null);

  const [selected, setSelected] = useState({ left: 0, right: 0 });
  const [splitPercentage, setSplitPercentage] = useState(50); // Initial split at 50%

  if (!content) {
    return <PageError message="No content found." />;
  }

  if (content.metadata.type !== "MEDIA") {
    return (
      <PageError title={content.metadata.name} message="Wrong content type." />
    );
  }
  if (!content.mediaRecords?.length) {
    return (
      <PageError
        title={content.metadata.name}
        message="Content has no media records."
      />
    );
  }

  const hasDocuments = content.mediaRecords.some((x) => x.type !== "VIDEO");
  const hasVideos = content.mediaRecords.some((x) => x.type === "VIDEO");

  return (
    <main className="flex flex-col h-full">
      <SimilarSegments />
      <PanelGroup direction="horizontal" className="w-full h-full flex-grow">
        <Panel
          defaultSize={displayForum ? 50 : 100}
          minSize={0}
          className="flex flex-col h-full overflow-hidden p-4"
        >
          <Heading
            title={content.metadata.name}
            overline={content.metadata.name}
            backButton
          />

          <ContentTags metadata={content.metadata} />

          {error?.source.errors.map((err: any, i: number) => (
            <Alert
              key={i}
              severity="error"
              sx={{ minWidth: 400, maxWidth: 800, width: "fit-content" }}
              onClose={() => setError(null)}
            >
              {err.message}
            </Alert>
          ))}

          {/* TODO progress tracking */}
          {/* <Dialog open={progress > 0.8 && !workedOnToday && !nagDismissed}>
        <DialogTitle>Do you want to mark this as understood?</DialogTitle>
        <DialogContent>
          You&apos;ve completed more than 80% of this content - this could be a
          good time to mark it as completed.
        </DialogContent>
        <DialogActions>
          <Button variant="text" onClick={() => setNagDismissed(true)}>
            No thanks
          </Button>
          <Button
            variant="text"
            onClick={() =>
              mediaRecordWorkedOn({
                variables: { id: mainRecord.id },
                onError: setError,
              })
            }
          >
            Ok
          </Button>
        </DialogActions>
      </Dialog> */}

          <div
            ref={ref}
            className="grid gap-4 w-full h-full"
            style={
              hasVideos && hasDocuments
                ? {
                    gridTemplateColumns: `calc(${splitPercentage}% - 10px) 20px calc(${
                      100 - splitPercentage
                    }% - 10px)`,
                  }
                : { gridTemplateColumns: `100%` }
            }
          >
            {hasVideos && <VideoSide setError={setError} _content={content} />}
            {hasVideos && hasDocuments && (
              <div
                onMouseDown={() => {
                  const l = (e: MouseEvent) => {
                    const dimensions = ref.current?.getBoundingClientRect();
                    if (!dimensions) return;

                    e.stopPropagation();

                    setSplitPercentage(
                      clamp(
                        (100 * (e.screenX - dimensions.x)) / dimensions.width,
                        20,
                        70
                      )
                    );
                  };

                  window.addEventListener("mousemove", l);

                  window.onmouseup = () =>
                    window.removeEventListener("mousemove", l);
                }}
                className="group w-full flex items-center justify-center cursor-col-resize"
              >
                <div className="w-[4px] flex items-center justify-center group-hover:w-[6px] group-active:w-[6px] transition-all h-full bg-slate-50 rounded-full group-hover:bg-slate-300 group-active:bg-slate-200">
                  <div className="bg-slate-300 transition-all group-hover:bg-slate-500 w-[2px] h-[20px] group-hover:h-[40px]"></div>
                </div>
              </div>
            )}
            {hasDocuments && (
              <DocumentSide setError={setError} _content={content} />
            )}
          </div>
        </Panel>
        {displayForum && (
          <>
            <div className="relative w-1 h-full">
              <PanelResizeHandle className="w-2 h-full bg-gray-200 hover:bg-gray-400 cursor-ew-resize flex items-center justify-center"></PanelResizeHandle>
              <Tooltip title={displayForum ? "Close Forum" : "Open Forum"}>
                <IconButton
                  onClick={() => setDisplayForum((prev) => !prev)}
                  color="primary"
                  aria-label={displayForum ? "Close Forum" : "Open Forum"}
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "-15px",
                    transform: "translateY(-50%)",
                    backgroundColor: "primary.main",
                    color: "white",
                    boxShadow: 3,
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: "primary.dark",
                    },
                    width: 36,
                    height: 36,
                    zIndex: 50,
                  }}
                >
                  <ArrowForwardIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </div>

            <Panel
              defaultSize={displayForum ? 50 : 0}
              minSize={displayForum ? 50 : 0}
              className="h-full overflow-hidden"
            >
              <ForumOverview></ForumOverview>
            </Panel>
          </>
        )}
      </PanelGroup>

      {!displayForum && (
        <Box sx={{ position: "fixed", bottom: 124, right: 34, zIndex: 10 }}>
          <Tooltip title={displayForum ? "Close Forum" : "Open Forum"}>
            <IconButton
              onClick={() => setDisplayForum((prev) => !prev)}
              color="primary"
              aria-label={displayForum ? "Close Forum" : "Open Forum"}
              sx={{
                backgroundColor: "primary.main",
                color: "white",
                boxShadow: 3,
                "&:hover": {
                  backgroundColor: "primary.dark",
                },
                width: "60",
                height: "60",
              }}
            >
              <ForumIcon fontSize="large" />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </main>
  );
}

export function DownloadButton({
  _record,
}: {
  _record: studentContentDownloadButtonFragment$key;
}) {
  const mediaRecord = useFragment(
    graphql`
      fragment studentContentDownloadButtonFragment on MediaRecord {
        name
        downloadUrl
      }
    `,
    _record
  );

  function downloadFile(url: string, fileName: string) {
    fetch(url, {
      method: "get",
      referrerPolicy: "no-referrer",
    })
      .then((res) => res.blob())
      .then((res) => {
        const aElement = document.createElement("a");
        aElement.setAttribute("download", fileName);
        const href = URL.createObjectURL(res);
        aElement.href = href;
        aElement.setAttribute("target", "_blank");
        aElement.click();
        URL.revokeObjectURL(href);
      });
  }

  return (
    <Button
      href={""}
      target="_blank"
      onClick={() => downloadFile(mediaRecord.downloadUrl, mediaRecord.name)}
      sx={{ color: "text.secondary" }}
      startIcon={<Download />}
    >
      Download
    </Button>
  );
}
