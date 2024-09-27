import {
  VideoSideFragment$data,
  VideoSideFragment$key,
} from "@/__generated__/VideoSideFragment.graphql";
import { VideoSideLogProgressMutation } from "@/__generated__/VideoSideLogProgressMutation.graphql";
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
import { orderBy } from "lodash";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { useFragment, useMutation } from "react-relay";
import { graphql } from "relay-runtime";
import { dispatch } from "use-bus";
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
  const [selected, setSelected] = useState(0);

  const videos = content.mediaRecords.filter((x) => x.type === "VIDEO");
  const currentRecord = videos[selected];

  const videoRef = useRef<MediaPlayerInstance>(null);

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

  return (
    <div>
      {/* media record selector */}
      {(videos?.length ?? 0) > 1 && (
        <Select
          label="name"
          value={selected}
          onChange={(e) => setSelected(e.target.value as number)}
        >
          {videos!.map((mediaRecord, index) => (
            <MenuItem value={index} key={mediaRecord.id}>
              {mediaRecord.name}
            </MenuItem>
          ))}
        </Select>
      )}

      {/* player */}

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

      {/* current segment */}

      {currentSegment && (
        <>
          <div className="mt-4"></div>
          <CurrentSegment
            segment={currentSegment}
            content={content}
            progress={currentSegmentProgress}
          />
          <Divider className="my-4" />
        </>
      )}

      {/* all segments */}
      <div className="mt-2 flex flex-col gap-1">
        {segments.map((segment) => (
          <Segment
            key={segment.id}
            segment={segment}
            content={content}
            videoRef={videoRef}
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
  segment,
  content,
  videoRef,
}: {
  segment: VideoSideFragment$data["mediaRecords"][0]["segments"][0];
  content: VideoSideFragment$data;
  videoRef: MutableRefObject<MediaPlayerInstance | null>;
}) {
  const links = content.segmentLinks
    .filter((x) => x.segment1.id === segment.id || x.segment2.id === segment.id)
    .map((x) => (x.segment1.id === segment.id ? x.segment2.id : x.segment1.id));

  const linkedRecords = content.mediaRecords
    .flatMap((x) => x.segments)
    .filter((x) => links.includes(x.id));

  return (
    <div
      onClick={() => {
        if (videoRef.current && segment.startTime !== undefined)
          videoRef.current.currentTime = segment.startTime;
      }}
      key={segment.id}
      className={` overflow-hidden relative border  shadow  text-xs rounded-md p-2 transition duration-100  flex gap-2 bg-slate-50 hover:bg-slate-100 border-slate-200 cursor-pointer`}
    >
      <img className="h-16" alt={segment.title!} src={segment.thumbnail!} />
      <div className="flex-1">
        <div className="text-slate-500">
          {dayjs.duration(segment.startTime ?? 0, "seconds").format("HH:mm:ss")}
        </div>
        {segment.title}
      </div>
      <div className="flex-1">
        {linkedRecords.length > 0 && (
          <div>
            {linkedRecords.map((x) => (
              <div key={x.id}>
                {linkedRecords.map((x) => (
                  <div
                    className="text-xs font-medium text-emerald-900/80 hover:text-emerald-900 rounded-sm p-1 transition-all cursor-pointer text-end"
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
      key={segment.id}
      className={` overflow-hidden relative border  shadow  text-xs rounded-md p-2 transition duration-100  flex gap-2 bg-emerald-700/10 border-emerald-600/20`}
    >
      <img className="h-16" alt={segment.title!} src={segment.thumbnail!} />
      <div className="flex-1">
        <div className="text-slate-500">
          {dayjs.duration(segment.startTime ?? 0, "seconds").format("HH:mm:ss")}
        </div>
        {segment.title}
      </div>
      <div className="flex-1">
        {linkedRecords.length > 0 && (
          <div>
            {linkedRecords.map((x) => (
              <div key={x.id}>
                {linkedRecords.map((x) => (
                  <div
                    className="text-xs font-medium text-emerald-900/80 hover:text-emerald-900 rounded-sm p-1 transition-all cursor-pointer text-end"
                    key={x.id}
                    onClick={() => {
                      dispatch({ type: "openPage", page: x.page });
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
          className="text-xs font-medium text-emerald-900/80 hover:text-emerald-900 rounded-sm p-1 transition-all cursor-pointer text-end"
          onClick={(e) => {
            dispatch({ type: "searchSimilarSegment", segmentId: segment.id });
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
