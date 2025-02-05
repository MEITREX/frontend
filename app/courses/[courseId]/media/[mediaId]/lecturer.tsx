"use client";

import { lecturerDeleteMediaContentMutation } from "@/__generated__/lecturerDeleteMediaContentMutation.graphql";
import { lecturerMediaQuery } from "@/__generated__/lecturerMediaQuery.graphql";
import { ContentLink } from "@/components/content-link/ContentLink";
import { ContentTags } from "@/components/ContentTags";
import { Heading } from "@/components/Heading";
import { MediaContentModal } from "@/components/MediaContentModal";
import { PageError } from "@/components/PageError";
import { Delete, Edit } from "@mui/icons-material";
import { Alert, Button, CircularProgress, Typography } from "@mui/material";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { graphql, useLazyLoadQuery, useMutation } from "react-relay";
import { ContentMediaDisplay } from "./ContentMediaDisplay";
import { DownloadButton } from "./student";

export default function LecturerMediaPage() {
  const { mediaId, courseId } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const media = useLazyLoadQuery<lecturerMediaQuery>(
    graphql`
      query lecturerMediaQuery($mediaId: UUID!, $courseId: UUID!) {
        contentsByIds(ids: [$mediaId]) {
          id
          metadata {
            name
            type
            chapterId
            ...ContentTags
          }
          ... on MediaContent {
            mediaRecords {
              id
              name
              ...ContentMediaDisplayFragment
              ...studentContentDownloadButtonFragment
            }
          }

          ...MediaContentModal
          ...ContentLinkFragment
        }
        ...MediaRecordSelector
      }
    `,
    { mediaId, courseId }
  );

  const [del, deleting] =
    useMutation<lecturerDeleteMediaContentMutation>(graphql`
      mutation lecturerDeleteMediaContentMutation($id: UUID!) {
        mutateContent(contentId: $id) {
          deleteContent
        }
      }
    `);

  const [editOpen, setEditOpen] = useState(false);
  const [error, setError] = useState<any>();

  if (media.contentsByIds.length == 0) {
    return <PageError message="No content found with given id." />;
  }

  const content = media.contentsByIds[0];
  if (content.metadata.type !== "MEDIA") {
    return (
      <PageError title={content.metadata.name} message="Wrong content type." />
    );
  }
  if (!content.mediaRecords) {
    return (
      <PageError
        title={content.metadata.name}
        message="Content has no media records."
      />
    );
  }

  const recordId = searchParams.get("recordId");
  const mainRecord = recordId
    ? content.mediaRecords.find((record) => record.id === recordId)
    : content.mediaRecords[0];

  if (recordId && mainRecord == null) {
    return (
      <PageError
        title={content.metadata.name}
        message="Content has no record with given id."
      />
    );
  }

  const relatedRecords = content.mediaRecords.filter(
    (record) => record.id !== mainRecord?.id
  );

  return (
    <main className="flex flex-col h-full">
      {error?.source.errors.map((err: any, i: number) => (
        <Alert key={i} severity="error" onClose={() => setError(null)}>
          {err.message}
        </Alert>
      ))}

      <Heading
        title={mainRecord?.name ?? content.metadata.name}
        overline={mainRecord != null ? content.metadata.name : undefined}
        action={
          <div className="flex gap-2">
            {mainRecord && <DownloadButton _record={mainRecord} />}{" "}
            <Button
              sx={{ color: "text.secondary" }}
              startIcon={deleting ? <CircularProgress size={16} /> : <Delete />}
              onClick={() => {
                if (
                  confirm(
                    "Do you really want to delete this content? This can't be undone."
                  )
                ) {
                  del({
                    variables: { id: content.id },
                    onCompleted() {
                      router.push(`/courses/${courseId}`);
                    },
                    onError(error) {
                      setError(error);
                    },
                    updater(store) {
                      store.get(content.id)?.invalidateRecord();
                    },
                  });
                }
              }}
            >
              Delete
            </Button>
            <Button
              sx={{ color: "text.secondary" }}
              startIcon={<Edit />}
              onClick={() => setEditOpen(true)}
            >
              Edit
            </Button>
          </div>
        }
        backButton
      />

      <ContentTags metadata={content.metadata} />
      <div className="my-8 grow">
        {mainRecord && (
          <ContentMediaDisplay
            onProgressChange={() => {}}
            _record={mainRecord}
          />
        )}
      </div>
      {relatedRecords.length > 0 && (
        <>
          <Typography variant="h2">Related media</Typography>
          <div className="mt-4 flex flex-col gap-2">
            {relatedRecords.map((record) => (
              <ContentLink
                courseId={courseId}
                key={record.id}
                _content={content}
              />
            ))}
          </div>
        </>
      )}

      <MediaContentModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        _existingMediaContent={media.contentsByIds[0]}
        _mediaRecords={media}
      />
    </main>
  );
}
