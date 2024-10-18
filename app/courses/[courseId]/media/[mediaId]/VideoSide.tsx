import {
  VideoSideFragment$data,
  VideoSideFragment$key,
} from "@/__generated__/VideoSideFragment.graphql";
import { VideoSideLogProgressMutation } from "@/__generated__/VideoSideLogProgressMutation.graphql";
import { NoMaxWidthTooltip } from "@/components/search/SearchResultItem";
import { Check, DescriptionOutlined, Search } from "@mui/icons-material";
import { Button, Divider, MenuItem, Select } from "@mui/material";
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

import { differenceInHours } from "date-fns";

import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { last, orderBy } from "lodash";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useFragment, useMutation } from "react-relay";
import { graphql } from "relay-runtime";
import useBus, { dispatch } from "use-bus";
dayjs.extend(duration);

export function VideoSide({
  setError,
  _content,
}: {
  setError: (err: any) => void;
  _content: VideoSideFragment$key;
}) {
  const content = useFragment(
    graphql`
      fragment VideoSideFragment on MediaContent {
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
          id

          type
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

            id
            thumbnail
            ... on DocumentRecordSegment {
              page
            }

            __typename
          }
        }
      }
    `,
    _content
  );

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const videos = content.mediaRecords.filter((x) => x.type === "VIDEO");

  const currentRecord =
    videos.find((x) => x.id === searchParams.get("selectedVideo")) ?? videos[0];

  const videoRef = useRef<MediaPlayerInstance>(null);

  useBus("jumpTo", (e) => {
    if ("time" in e && videoRef.current) {
      videoRef.current.currentTime = e.time;
    }
  });

  const [mediaRecordWorkedOn] =
    useMutation<VideoSideLogProgressMutation>(graphql`
      mutation VideoSideLogProgressMutation($id: UUID!) {
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

  const [playbackPosition, setPlaybackPosition] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaybackPosition(videoRef.current?.currentTime ?? 0);
    });
    return () => clearInterval(interval);
  }, [videoRef]);

  const currentSegment = segments.find(
    (x, idx) =>
      segments.length - 2 === idx ||
      (segments[idx + 1].startTime ?? 0) > playbackPosition
  );

  const currentSegmentProgress = currentSegment
    ? (playbackPosition - (currentSegment.startTime ?? 0)) /
      ((segments[segments.indexOf(currentSegment) + 1]?.startTime ?? duration) -
        (currentSegment.startTime ?? 0))
    : 0;

  useEffect(() => {
    if (videoRef.current && searchParams.get("videoPosition")) {
      videoRef.current.currentTime = Number(searchParams.get("videoPosition"));
    }
  }, [videoRef.current]);

  const groupedSegments = segments.reduce((prev, cur) => {
    let l = last(prev);

    if (l && l.title === cur.title) {
      l.segments.push(cur);
    } else {
      prev.push({ title: cur.title, segments: [cur] });
    }
    return prev;
  }, [] as { title: string | null | undefined; segments: typeof segments }[]);

  return (
    <div>
      {/* media record selector */}
      {(videos?.length ?? 0) > 1 && (
        <Select
          label="name"
          value={currentRecord.id}
          onChange={(e) => {
            const p = new URLSearchParams(searchParams.toString());
            p.set("selectedVideo", e.target.value);
            router.push(pathname + "?" + p.toString());
          }}
        >
          {videos!.map((mediaRecord, index) => (
            <MenuItem value={mediaRecord.id} key={mediaRecord.id}>
              {mediaRecord.name}
            </MenuItem>
          ))}
        </Select>
      )}

      {/* player */}

      <div className="bg-black rounded-t-md shadow">
        <MediaPlayer
          // TODO dynamic media type
          src={{ src: currentRecord.downloadUrl, type: "video/mp4" }}
          viewType="video"
          ref={videoRef}
          streamType="on-demand"
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
      </div>

      {/* current segment */}

      {currentSegment && (
        <>
          <CurrentSegment
            segment={currentSegment}
            content={content}
            progress={currentSegmentProgress}
          />
          <Divider className="my-4" />
        </>
      )}

      {/* all segments */}
      <div className="mt-2 flex flex-col gap-2">
        {groupedSegments.map((s) => (
          <Segment
            key={s.segments[0].id}
            segments={s.segments}
            title={s.title}
            content={content}
          />
        ))}
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

function Segment({
  title,
  segments,
  content,
}: {
  title: string | null | undefined;
  segments: VideoSideFragment$data["mediaRecords"][0]["segments"][0][];
  content: VideoSideFragment$data;
}) {
  return (
    <div
      className={`overflow-hidden border  shadow  text-xs rounded-md p-2 gap-1 grid grid-cols-[auto_2fr_1fr] bg-slate-50 border-slate-200`}
    >
      <div className="col-span-full ml-1 mb-0.5 font-medium">{title}</div>

      <div className="col-span-full border-b mb-1"></div>
      {segments.map((segment) => {
        const links = content.segmentLinks
          .filter(
            (x) => x.segment1.id === segment.id || x.segment2.id === segment.id
          )
          .map((x) =>
            x.segment1.id === segment.id ? x.segment2.id : x.segment1.id
          );
        const linkedRecords = content.mediaRecords
          .flatMap((x) => x.segments)
          .filter((x) => links.includes(x.id));

        return (
          <>
            <NoMaxWidthTooltip
              placement="right"
              title={
                <img
                  className=" max-w-[250px] lg:max-w-[500px] max-h-[500px] m-1"
                  alt={segment.title!}
                  src={segment.thumbnail!}
                />
              }
            >
              <img
                className="h-12 m-1 relative"
                alt={segment.title!}
                src={segment.thumbnail!}
              />
            </NoMaxWidthTooltip>

            <div
              onClick={() =>
                dispatch({ type: "jumpTo", time: segment.startTime })
              }
              className="p-1 rounded-[4px] text-[10px]  cursor-pointer hover:bg-slate-100 active:bg-slate-200 transition duration-100 h-14 block overflow-hidden"
            >
              <span className="text-slate-500">
                {dayjs
                  .duration(segment.startTime ?? 0, "seconds")
                  .format("HH:mm:ss")}
              </span>
              <span className="italic text-slate-400">
                {" "}
                – {segment.transcript}
              </span>
            </div>

            <div className="p-1 flex flex-col justify-center">
              {linkedRecords.length > 0 && (
                <div>
                  {linkedRecords.map((x) => (
                    <div key={x.id}>
                      {linkedRecords.map((x) => (
                        <div
                          className="text-xs font-medium text-emerald-900/80 hover:text-emerald-900 rounded-sm mb-1 transition-all cursor-pointer text-end"
                          key={x.id}
                          onClick={(e) => {
                            dispatch({ type: "openPage", page: x.page });
                            e.stopPropagation();
                          }}
                        >
                          Page {(x.page ?? 0) + 1}{" "}
                          <DescriptionOutlined className="h-4 inline mb-0.5" />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        );
      })}
    </div>
  );
}

function CurrentSegment({
  segment,
  content,
  progress,
}: {
  segment: VideoSideFragment$data["mediaRecords"][0]["segments"][0];
  content: VideoSideFragment$data;
  progress: number;
}) {
  const links = content.segmentLinks
    .filter((x) => x.segment1.id === segment.id || x.segment2.id === segment.id)
    .map((x) => (x.segment1.id === segment.id ? x.segment2.id : x.segment1.id));

  const linkedRecords = content.mediaRecords
    .flatMap((x) => x.segments)
    .filter((x) => links.includes(x.id));

  return (
    <div
      className={`overflow-hidden relative text-xs rounded-b-md p-2 gap-1 grid grid-cols-[auto_2fr_1fr] bg-slate-100`}
    >
      <div className="col-span-full ml-1 mb-0.5 font-medium">
        {segment.title}
      </div>

      <div className="col-span-full border-b mb-1"></div>

      <NoMaxWidthTooltip
        placement="right"
        title={
          <img
            className=" max-w-[250px] lg:max-w-[500px] max-h-[500px] m-1"
            alt={segment.title!}
            src={segment.thumbnail!}
          />
        }
      >
        <img
          className="h-12 m-1"
          alt={segment.title!}
          src={segment.thumbnail!}
        />
      </NoMaxWidthTooltip>

      <div className="p-1 rounded-[4px] text-[10px]  cursor-pointer hover:bg-slate-100 active:bg-slate-200 transition duration-100 h-14 block overflow-hidden">
        <span className="text-slate-500">
          {dayjs.duration(segment.startTime ?? 0, "seconds").format("HH:mm:ss")}
        </span>
        <span className="italic text-slate-400"> – {segment.transcript}</span>
      </div>

      <div className="p-1 flex flex-col justify-center">
        {linkedRecords.length > 0 && (
          <div>
            {linkedRecords.map((x) => (
              <div key={x.id}>
                {linkedRecords.map((x) => (
                  <div
                    className="text-xs font-medium text-emerald-900/80 hover:text-emerald-900  mb-1 rounded-sm transition-all cursor-pointer text-end"
                    key={x.id}
                    onClick={(e) => {
                      dispatch({ type: "openPage", page: x.page });
                      e.stopPropagation();
                    }}
                  >
                    Page {(x.page ?? 0) + 1}{" "}
                    <DescriptionOutlined className="h-4 inline mb-0.5" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        <div
          className="text-xs font-medium text-emerald-900/80 hover:text-emerald-900 rounded-sm transition-all cursor-pointer text-end"
          onClick={(e) => {
            dispatch({ type: "searchSimilarEntity", entityId: segment.id });
            e.stopPropagation();
          }}
        >
          Similar Content <Search className="h-4 inline mb-0.5" />
        </div>
      </div>

      <div
        className="bg-emerald-600 h-0.5 absolute bottom-0 left-0"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
}
