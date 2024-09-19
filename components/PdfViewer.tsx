"use client";

import { Document, Page, pdfjs, Thumbnail } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { useDebounceValue, useResizeObserver } from "usehooks-ts";

import { CircularProgress } from "@mui/material";
import { times } from "lodash";
import { useEffect, useRef, useState } from "react";
import useBus from "use-bus";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

export function PdfViewer({
  url,
  onProgressChange,
}: {
  url: string;
  onProgressChange: (fraction: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { width = 0 } = useResizeObserver({
    ref,
    box: "border-box",
  });

  const [debouncedWidth] = useDebounceValue(width, 200);

  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [_, setViewedPages] = useState([] as number[]);

  useBus("openPage", (e) => {
    console.log(e);
    if ("page" in e) {
      setPageNumber(e.page + 1);
    }
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (numPages) {
        setViewedPages((x) => {
          // add to viewed pages
          const newState = x.includes(pageNumber) ? x : [...x, pageNumber];
          // update progress
          onProgressChange(newState.length / numPages);

          return newState;
        });
      }
    }, 5_000);

    return () => clearTimeout(timeout);
  }, [pageNumber, numPages, onProgressChange]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  return (
    <div className="w-full" ref={ref}>
      <Document
        className="flex flex-col justify-center w-full"
        file={url}
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
  );
}
