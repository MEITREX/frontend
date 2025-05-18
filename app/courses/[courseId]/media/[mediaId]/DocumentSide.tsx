import { DocumentSideFragment$key } from "@/__generated__/DocumentSideFragment.graphql";
import { DocumentSideLogProgressMutation } from "@/__generated__/DocumentSideLogProgressMutation.graphql";
import { Check } from "@mui/icons-material";
import { Button, MenuItem, Select } from "@mui/material";
import { differenceInHours } from "date-fns";
import { useState } from "react";
import { graphql, useFragment, useMutation } from "react-relay";

import duration from "dayjs/plugin/duration";
import { Document, Page, pdfjs, Thumbnail } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { useDebounceValue, useResizeObserver } from "usehooks-ts";

import { CircularProgress } from "@mui/material";
import { times } from "lodash";
import { useRef } from "react";
import useBus, { dispatch } from "use-bus";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();
dayjs.extend(duration);

import dayjs from "dayjs";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

export function DocumentSide({
  setError,
  _content,
}: {
  setError: (err: any) => void;
  _content: DocumentSideFragment$key;
}) {
  const content = useFragment(
    graphql`
      fragment DocumentSideFragment on MediaContent {
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
          ...ContentMediaDisplayFragment
          type
          name

          standardizedDownloadUrl

          userProgressData {
            dateWorkedOn
          }
          closedCaptions

          segments {
            id

            id
            thumbnail
            ... on DocumentRecordSegment {
              page
            }
            ... on VideoRecordSegment {
              startTime
            }

            __typename
          }
        }
      }
    `,
    _content
  );
  const documents = content.mediaRecords.filter((x) => x.type !== "VIDEO");

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(
    searchParams.get("page") ? Number(searchParams.get("page")) : 1
  );

  const currentRecord =
    documents.find((x) => x.id === searchParams.get("selectedDocument")) ??
    documents[0];

  const segment = currentRecord.segments.find(
    (x) => (x.page ?? -1) + 1 === pageNumber
  );

  const links = content.segmentLinks
    .filter(
      (x) => x.segment1.id === segment?.id || x.segment2.id === segment?.id
    )
    .map((x) =>
      x.segment1.id === segment?.id ? x.segment2.id : x.segment1.id
    );

  const linkedRecords = content.mediaRecords
    .flatMap((x) => x.segments)
    .filter((x) => links.includes(x.id));

  const [mediaRecordWorkedOn] =
    useMutation<DocumentSideLogProgressMutation>(graphql`
      mutation DocumentSideLogProgressMutation($id: UUID!) {
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

  const ref = useRef<HTMLDivElement>(null);
  const { width = 0 } = useResizeObserver({
    ref,
    box: "border-box",
  });

  const [debouncedWidth] = useDebounceValue(width, 200);

  useBus("openPage", (e) => {
    if ("page" in e) {
      setPageNumber(e.page + 1);
    }
  });

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  return (
    <div>
      {(documents?.length ?? 0) > 1 && (
        <Select
          label="name"
          value={currentRecord.id}
          onChange={(e) => {
            const p = new URLSearchParams(searchParams.toString());
            p.set("selectedDocument", e.target.value);
            router.push(pathname + "?" + p.toString());
          }}
        >
          {documents!.map((mediaRecord) => (
            <MenuItem value={mediaRecord.id} key={mediaRecord.id}>
              {mediaRecord.name}
            </MenuItem>
          ))}
        </Select>
      )}

      <div className="w-full" ref={ref}>
        <Document
          className="flex flex-col justify-center w-full"
          file={currentRecord.standardizedDownloadUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<CircularProgress />}
        >
          <div>
            <Page
              width={debouncedWidth}
              loading={<CircularProgress />}
              pageNumber={pageNumber}
            />
          </div>

          {linkedRecords.length > 0 && (
            <>
              <div className="flex text-slate-500 items-center gap-2 text-xs font-medium px-1">
                Referenced at:
                {linkedRecords.map((linkedRecord) => (
                  <div
                    key={linkedRecord.id}
                    onClick={() =>
                      dispatch({ type: "jumpTo", time: linkedRecord.startTime })
                    }
                    className="w-12 aspect-video rounded-sm overflow-hidden shadow-lg relative"
                  >
                    <div className="w-full h-full z-10 absolute flex transition-all items-center justify-center cursor-pointer hover:bg-slate-900/40 text-[10px]">
                      {dayjs
                        .duration(linkedRecord.startTime ?? 0, "seconds")
                        .format(
                          linkedRecord.startTime &&
                            linkedRecord.startTime > 60 * 60
                            ? "HH:mm:ss"
                            : "mm:ss"
                        )}
                    </div>
                    <img src={linkedRecord.thumbnail} alt="" />
                  </div>
                ))}
              </div>
            </>
          )}
          <div className="flex w-full overflow-x-auto mt-6 gap-3 p-2">
            {numPages != null &&
              times(numPages, () => null).map((_, idx) => (
                <Thumbnail
                  width={debouncedWidth / 5 - 20}
                  className={
                    idx + 1 === pageNumber
                      ? "ring-offset-2 rounded-sm ring-slate-600 ring-2"
                      : "opacity-75"
                  }
                  onClick={() => setPageNumber(idx + 1)}
                  pageNumber={idx + 1}
                  key={idx}
                ></Thumbnail>
              ))}
          </div>
        </Document>
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
