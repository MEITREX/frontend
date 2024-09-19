"use client";
/* eslint-disable @next/next/no-img-element */
import {
  MediaPlayer,
  MediaPlayerInstance,
  MediaProvider,
  Track,
} from "@vidstack/react";
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";
import "@vidstack/react/player/styles/default/layouts/video.css";
import "@vidstack/react/player/styles/default/theme.css";

import { studentContentDownloadButtonFragment$key } from "@/__generated__/studentContentDownloadButtonFragment.graphql";
import { studentContentSideFragment$key } from "@/__generated__/studentContentSideFragment.graphql";
import { studentMediaLogProgressMutation } from "@/__generated__/studentMediaLogProgressMutation.graphql";
import { studentMediaQuery } from "@/__generated__/studentMediaQuery.graphql";
import { ContentTags } from "@/components/ContentTags";
import { Heading } from "@/components/Heading";
import { PageError } from "@/components/PageError";
import { Check, Download } from "@mui/icons-material";
import { Alert, Button, MenuItem, Select } from "@mui/material";
import "@vidstack/react/player/styles/default/layouts/video.css";
import "@vidstack/react/player/styles/default/theme.css";
import { differenceInHours } from "date-fns";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { clamp, orderBy } from "lodash";

dayjs.extend(duration);

import { studentContentFragment$key } from "@/__generated__/studentContentFragment.graphql";
import { studentContentSideVideoFragment$key } from "@/__generated__/studentContentSideVideoFragment.graphql";
import { studentMediaLogProgressVideoMutation } from "@/__generated__/studentMediaLogProgressVideoMutation.graphql";

import { useParams } from "next/navigation";

import { MutableRefObject, RefObject, useRef, useState } from "react";
import {
  graphql,
  useFragment,
  useLazyLoadQuery,
  useMutation,
} from "react-relay";
import { ContentMediaDisplay } from "./ContentMediaDisplay";

export default function StudentMediaPage() {
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
              ...studentContentSideFragment
              ...studentContentSideVideoFragment
              type
              id
            }
          }

          ...MediaContentLinkFragment
          ...studentContentFragment
        }
      }
    `,
    { mediaId }
  );
  const videoRef = useRef<MediaPlayerInstance>(null);

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

  const videos = content.mediaRecords.filter((x) => x.type === "VIDEO");
  const documents = content.mediaRecords.filter((x) => x.type !== "VIDEO");

  return (
    <main className="flex flex-col h-full">
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
          videos.length && documents.length
            ? {
                gridTemplateColumns: `calc(${splitPercentage}% - 10px) 20px calc(${
                  100 - splitPercentage
                }% - 10px)`,
              }
            : {}
        }
      >
        {videos.length > 0 && (
          <VideoSide
            videoRef={videoRef}
            setError={setError}
            _records={videos}
            selected={selected.left}
            _content={content}
            setSelected={(val: number) =>
              setSelected({ ...selected, left: val })
            }
          />
        )}
        {videos.length > 0 && documents.length > 0 && (
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
        {documents.length > 0 && (
          <DocumentSide
            videoRef={videoRef}
            setError={setError}
            _records={documents}
            selected={selected.right}
            setSelected={(val: number) =>
              setSelected({ ...selected, right: val })
            }
          />
        )}
      </div>
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

function DocumentSide({
  _records,
  selected,
  setSelected,
  setError,
  videoRef,
}: {
  _records: studentContentSideFragment$key;
  selected: number;
  setSelected: (val: number) => void;
  setError: (err: any) => void;
  videoRef: RefObject<MediaPlayerInstance>;
}) {
  const [progress, setProgress] = useState(0);

  const mediaRecords = useFragment(
    graphql`
      fragment studentContentSideFragment on MediaRecord @relay(plural: true) {
        id
        name
        downloadUrl
        ...ContentMediaDisplayFragment
        userProgressData {
          dateWorkedOn
        }
      }
    `,
    _records
  );
  const currentRecord = mediaRecords[selected];

  const [mediaRecordWorkedOn] =
    useMutation<studentMediaLogProgressMutation>(graphql`
      mutation studentMediaLogProgressMutation($id: UUID!) {
        logMediaRecordWorkedOn(mediaRecordId: $id) {
          id
        }
      }
    `);

  const workedOnToday =
    Math.abs(
      differenceInHours(
        new Date(),
        new Date(currentRecord?.userProgressData.dateWorkedOn ?? "")
      )
    ) < 24;

  return (
    <div>
      {(mediaRecords?.length ?? 0) > 1 && (
        <Select
          label="name"
          value={selected}
          onChange={(e) => setSelected(e.target.value as number)}
        >
          {mediaRecords!.map((mediaRecord, index) => (
            <MenuItem value={index} key={mediaRecord.id}>
              {mediaRecord.name}
            </MenuItem>
          ))}
        </Select>
      )}

      {currentRecord && (
        <ContentMediaDisplay
          _record={currentRecord}
          onProgressChange={setProgress}
        />
      )}

      <div className="w-full flex justify-center mt-10">
        <Button
          disabled={workedOnToday}
          onClick={() =>
            mediaRecordWorkedOn({
              variables: { id: currentRecord!.id },
              onError: setError,
            })
          }
        >
          {workedOnToday && <Check className="mr-2" />}
          {workedOnToday ? "Understood" : "Mark content as understood"}
        </Button>
      </div>
    </div>
  );
}

function VideoSide({
  _records,
  selected,
  setSelected,
  setError,
  videoRef,
  _content,
}: {
  _records: studentContentSideVideoFragment$key;
  selected: number;
  setSelected: (val: number) => void;
  setError: (err: any) => void;
  videoRef: MutableRefObject<MediaPlayerInstance | null>;
  _content: studentContentFragment$key;
}) {
  const mediaRecords = useFragment(
    graphql`
      fragment studentContentSideVideoFragment on MediaRecord
      @relay(plural: true) {
        id
        name
        downloadUrl
        userProgressData {
          dateWorkedOn
        }
        closedCaptions
        segments {
          id
          ... on VideoRecordSegment {
            startTime

            transcript
            thumbnail
            title
          }
        }
      }
    `,
    _records
  );

  const content = useFragment(
    graphql`
      fragment studentContentFragment on MediaContent {
        id
        segmentLinks {
          segment1 {
            id
          }
          segment2 {
            id
          }
        }
        mediaRecords {
          name
          segments {
            id
            thumbnail
          }
        }
      }
    `,
    _content
  );
  const currentRecord = mediaRecords[selected];

  const [mediaRecordWorkedOn] =
    useMutation<studentMediaLogProgressVideoMutation>(graphql`
      mutation studentMediaLogProgressVideoMutation($id: UUID!) {
        logMediaRecordWorkedOn(mediaRecordId: $id) {
          id
        }
      }
    `);

  const workedOnToday =
    Math.abs(
      differenceInHours(
        new Date(),
        new Date(currentRecord?.userProgressData.dateWorkedOn ?? "")
      )
    ) < 24;

  const [duration, setDuration] = useState(0);
  const segments = orderBy(currentRecord.segments, (x) => x.startTime, "asc");

  return (
    <div>
      {(mediaRecords?.length ?? 0) > 1 && (
        <Select
          label="name"
          value={selected}
          onChange={(e) => setSelected(e.target.value as number)}
        >
          {mediaRecords!.map((mediaRecord, index) => (
            <MenuItem value={index} key={mediaRecord.id}>
              {mediaRecord.name}
            </MenuItem>
          ))}
        </Select>
      )}

      <MediaPlayer
        // TODO dynamic media type
        src={{ src: currentRecord.downloadUrl, type: "video/mp4" }}
        viewType="video"
        streamType="on-demand"
        ref={videoRef}
        onDurationChange={(e) => setDuration(e)}
      >
        {currentRecord.closedCaptions && (
          <Track
            content={currentRecord.closedCaptions}
            label="Captions"
            kind="captions"
            type="vtt"
          />
        )}

        <Track
          content={{
            cues: segments.map((x, idx) => ({
              startTime: x.startTime ?? 0,
              text: x.title ?? "",
              endTime: segments[idx + 1]?.startTime ?? duration,
            })),
          }}
          label="Chapters"
          kind="chapters"
          type="json"
          default
        />

        <MediaProvider />
        <DefaultVideoLayout
          icons={defaultLayoutIcons}
          thumbnails={segments.map((x) => ({
            startTime: x.startTime ?? 0,
            url: x.thumbnail ?? "",
          }))}
        />
      </MediaPlayer>

      <div className="mt-2 flex flex-col gap-1">
        {segments.map((segment) => {
          const links = content.segmentLinks.filter(
            (x) => x.segment1.id === segment.id || x.segment2.id === segment.id
          );

          return (
            <div
              onClick={() => {
                if (videoRef.current && segment.startTime !== undefined)
                  videoRef.current.currentTime = segment.startTime;
              }}
              key={segment.id}
              className="bg-slate-50 border borders-slate-200 shadow hover:bg-slate-100 text-xs rounded-md p-2 transition duration-100 cursor-pointer flex gap-2"
            >
              <img
                className="h-16"
                alt={segment.title!}
                src={segment.thumbnail!}
              />
              <div>
                <div className="text-slate-500">
                  {dayjs
                    .duration(segment.startTime ?? 0, "seconds")
                    .format("HH:mm:ss")}
                </div>
                {segment.title}
              </div>
            </div>
          );
        })}
      </div>

      <div className="w-full flex justify-center mt-10">
        <Button
          disabled={workedOnToday}
          onClick={() =>
            mediaRecordWorkedOn({
              variables: { id: currentRecord!.id },
              onError: setError,
            })
          }
        >
          {workedOnToday && <Check className="mr-2" />}
          {workedOnToday ? "Understood" : "Mark content as understood"}
        </Button>
      </div>
    </div>
  );
}
