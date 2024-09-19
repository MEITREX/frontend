import { DocumentSideFragment$key } from "@/__generated__/DocumentSideFragment.graphql";
import { DocumentSideLogProgressMutation } from "@/__generated__/DocumentSideLogProgressMutation.graphql";
import { PdfViewer } from "@/components/PdfViewer";
import { Check } from "@mui/icons-material";
import { Button, MenuItem, Select } from "@mui/material";
import { differenceInHours } from "date-fns";
import { useState } from "react";
import { graphql, useFragment, useMutation } from "react-relay";

export function DocumentSide({
  setError,
  _content,
}: {
  setError: (err: any) => void;
  _content: DocumentSideFragment$key;
}) {
  const [progress, setProgress] = useState(0);
  const content = useFragment(
    graphql`
      fragment DocumentSideFragment on MediaContent {
        id

        mediaRecords {
          id
          ...ContentMediaDisplayFragment
          type
          name
          downloadUrl
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

            __typename
          }
        }
      }
    `,
    _content
  );
  const [selected, setSelected] = useState(0);

  const documents = content.mediaRecords.filter((x) => x.type !== "VIDEO");
  const currentRecord = documents[selected];

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

  return (
    <div>
      {(documents?.length ?? 0) > 1 && (
        <Select
          label="name"
          value={selected}
          onChange={(e) => setSelected(e.target.value as number)}
        >
          {documents!.map((mediaRecord, index) => (
            <MenuItem value={index} key={mediaRecord.id}>
              {mediaRecord.name}
            </MenuItem>
          ))}
        </Select>
      )}

      {currentRecord && (
        <PdfViewer
          onProgressChange={() => null}
          url={currentRecord.downloadUrl}
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
