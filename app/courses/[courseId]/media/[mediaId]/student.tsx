"use client";
/* eslint-disable @next/next/no-img-element */
import { studentContentDownloadButtonFragment$key } from "@/__generated__/studentContentDownloadButtonFragment.graphql";
import { studentMediaQuery } from "@/__generated__/studentMediaQuery.graphql";
import { ContentTags } from "@/components/ContentTags";
import { Heading } from "@/components/Heading";
import { PageError } from "@/components/PageError";
import { Download, Forum as ForumIcon } from "@mui/icons-material";
import { Alert, Box, Button, IconButton } from "@mui/material";
import "@vidstack/react/player/styles/default/layouts/video.css";
import "@vidstack/react/player/styles/default/theme.css";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { clamp } from "lodash";
import { DocumentSide } from "./DocumentSide";
import { VideoSide } from "./VideoSide";

import { useParams, usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { graphql, useFragment, useLazyLoadQuery } from "react-relay";
import { SimilarSegments } from "./SimilarSegments";

dayjs.extend(duration);

export default function StudentMediaPage() {
  const router = useRouter();
  const { mediaId, courseId } = useParams();

  const pathname = usePathname();
  const isForumActive = pathname.includes("/forum");

  const handleToggleForum = () => {
    if (isForumActive) {
      router.push(`/courses/${courseId}/media/${mediaId}`);
    } else {
      router.push(`/courses/${courseId}/media/${mediaId}/forum`);
    }
  };

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

  const [error, setError] = useState<any>(null);
  const ref = useRef<HTMLDivElement>(null);
  const [splitPercentage, setSplitPercentage] = useState(50);

  if (!content) {
    return <PageError message="No content found." />;
  }
  if (content.metadata.type !== "MEDIA") {
    return <PageError title={content.metadata.name} message="Wrong content type." />;
  }
  if (!content.mediaRecords?.length) {
    return <PageError title={content.metadata.name} message="Content has no media records." />;
  }

  const hasDocuments = content.mediaRecords.some((x) => x.type !== "VIDEO");
  const hasVideos = content.mediaRecords.some((x) => x.type === "VIDEO");

  return (
    <Box sx={{position:"relative"}}>
      <SimilarSegments />
      <Heading
        title={content.metadata.name}
        overline={content.metadata.name}
        backButton
      />
      <ContentTags metadata={content.metadata} />

      <Box
        sx={{
          position: 'absolute',
          top: 1,
          right: 1,
          zIndex: 1000,
        }}
      >
        <IconButton
          onClick={handleToggleForum}
          size="large"
          sx={{
            backgroundColor: !isForumActive ? '#1976d2' : 'white',
            color: !isForumActive ? 'white' : 'black',
            border: '1px solid #ddd',
            '&:hover': {
              backgroundColor: !isForumActive ? '#1565c0' : '#f0f0f0',
            },
          }}
        >
          <ForumIcon />
        </IconButton>
      </Box>


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
        {hasDocuments && <DocumentSide setError={setError} _content={content} />}
      </div>
    </Box>
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