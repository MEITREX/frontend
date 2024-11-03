"use client";
import { ContentMediaDisplayFragment$key } from "@/__generated__/ContentMediaDisplayFragment.graphql";
import { ContentMediaDisplayVideoFragment$key } from "@/__generated__/ContentMediaDisplayVideoFragment.graphql";
import { PdfViewer } from "@/components/PdfViewer";
import { MediaPlayer, MediaProvider } from "@vidstack/react";
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";
import "@vidstack/react/player/styles/default/layouts/video.css";
import "@vidstack/react/player/styles/default/theme.css";
import { useFragment } from "react-relay";
import { graphql } from "relay-runtime";

export function ContentMediaDisplay({
  _record,
  onProgressChange,
}: {
  _record: ContentMediaDisplayFragment$key;
  onProgressChange: (fraction: number) => void;
}) {
  const mediaRecord = useFragment(
    graphql`
      fragment ContentMediaDisplayFragment on MediaRecord {
        type
        name
        standardizedDownloadUrl
        downloadUrl
        ...ContentMediaDisplayVideoFragment
      }
    `,
    _record
  );

  switch (mediaRecord.type) {
    case "VIDEO":
      return <VideoPlayer _video={mediaRecord} />;
    case "PRESENTATION":
    case "DOCUMENT":
      return (
        <PdfViewer
          onProgressChange={onProgressChange}
          url={mediaRecord.standardizedDownloadUrl ?? mediaRecord.downloadUrl}
        />
      );
    case "IMAGE":
      // eslint-disable-next-line @next/next/no-img-element
      return (
        <img
          alt={mediaRecord.name}
          src={mediaRecord.standardizedDownloadUrl ?? mediaRecord.downloadUrl}
          className="max-h-md flex justify-center mx-auto"
        ></img>
      );
    default:
      return <>Unsupported media type</>;
  }
}

export function VideoPlayer({
  _video,
}: {
  _video: ContentMediaDisplayVideoFragment$key;
}) {
  const mediaRecord = useFragment(
    graphql`
      fragment ContentMediaDisplayVideoFragment on MediaRecord {
        type
        name
        standardizedDownloadUrl
        downloadUrl
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
    _video
  );

  return (
    <MediaPlayer
      src={mediaRecord.standardizedDownloadUrl ?? mediaRecord.downloadUrl}
    >
      <MediaProvider />
      <DefaultVideoLayout icons={defaultLayoutIcons} />
    </MediaPlayer>
  );
}
