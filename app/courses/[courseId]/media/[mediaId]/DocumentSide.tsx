import { DocumentSideFragment$key } from "@/__generated__/DocumentSideFragment.graphql";
import { DocumentSideLogProgressMutation } from "@/__generated__/DocumentSideLogProgressMutation.graphql";
import { Check, ChevronLeft, ChevronRight } from "@mui/icons-material";
import { Button, MenuItem, Select } from "@mui/material";
import { differenceInHours } from "date-fns";
import { useCallback, useEffect, useRef, useState } from "react";
import { graphql, useFragment, useMutation } from "react-relay";

import { Document, Page, pdfjs, Thumbnail } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { useDebounceValue, useResizeObserver } from "usehooks-ts";

import { CircularProgress } from "@mui/material";
import { times } from "lodash";
import useBus from "use-bus";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

export function DocumentSide({
  _content,
  setError,
}: {
  _content: DocumentSideFragment$key;
  setError?: (e: Error | null) => void;
}) {
  const content = useFragment(
    graphql`
      fragment DocumentSideFragment on MediaContent {
        mediaRecords {
          id
          type
          name
          standardizedDownloadUrl
          userProgressData {
            dateWorkedOn
          }
          closedCaptions
          segments {
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

  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [isMarkedLocally, setIsMarkedLocally] = useState(false);
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(
    searchParams.get("page") ? Number(searchParams.get("page")) : 1
  );

  const currentRecord =
    documents.find((x) => x.id === searchParams.get("selectedDocument")) ??
    documents[0];

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
    ) < 24 || isMarkedLocally;

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

  const goPrev = useCallback(() => {
    setPageNumber((p) => Math.max(1, p - 1));
  }, []);

  const goNext = useCallback(() => {
    setPageNumber((p) => Math.min(numPages ?? p, p + 1));
  }, [numPages]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const tag = t?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || (e as any).isComposing)
        return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goPrev, goNext]);

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
          <div className="relative">
            <Page
              width={debouncedWidth}
              loading={<CircularProgress />}
              pageNumber={pageNumber}
            />

            <div className="absolute inset-y-0 left-0 w-10 z-10 group select-none">
              <button
                type="button"
                onClick={goPrev}
                className="flex w-full h-full opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center bg-black/10 hover:bg-black/20 rounded-l-md focus:outline-none"
                aria-label="Previous slide"
              >
                <ChevronLeft />
              </button>
            </div>

            <div className="absolute inset-y-0 right-0 w-10 z-10 group select-none">
              <button
                type="button"
                onClick={goNext}
                className="flex w-full h-full opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center bg-black/10 hover:bg-black/20 rounded-r-md focus:outline-none"
                aria-label="Next slide"
              >
                <ChevronRight />
              </button>
            </div>
          </div>

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
                />
              ))}
          </div>
        </Document>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <Button
          disabled={workedOnToday}
          variant="contained"
          onClick={() =>
            mediaRecordWorkedOn({
              variables: { id: currentRecord!.id },
              onError: setError ? (err) => setError(err) : undefined,
              onCompleted() {
                setIsMarkedLocally(true);
              },
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
