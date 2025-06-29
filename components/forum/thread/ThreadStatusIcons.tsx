'use client';

import React from 'react';
import { Box, Tooltip } from '@mui/material';
import PermMediaOutlinedIcon from '@mui/icons-material/PermMediaOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { PageError } from "@/components/PageError";

type ThreadForIcons = {
  threadContentReference?: { contentId?: any } | null;
  selectedAnswer?: { id?: any } | null;
  info?: any;
  question?: any;
};

type ThreadStatusIconsProps = {
  thread: ThreadForIcons;
};

export default function ThreadStatusIcons({ thread }: ThreadStatusIconsProps) {
  if (!thread) {
    return <PageError message="Thread does not exist!"/>
  }

  return (

    <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
      {thread.threadContentReference?.contentId && (
        <Tooltip title="Dieser Beitrag ist mit einem Lerninhalt verknüpft">
          <PermMediaOutlinedIcon sx={{ color: 'text.secondary', fontSize: '1.25rem' }} />
        </Tooltip>
      )}
      {thread.selectedAnswer?.id && (
        <Tooltip title="Die Frage wurde beantwortet">
          <CheckCircleOutlineOutlinedIcon color="success" sx={{ fontSize: '1.25rem' }} />
        </Tooltip>
      )}
      {thread.info && (
        <Tooltip title="Info-Beitrag">
          {/* `color="info"` verwendet das Standard-Blau Ihres Themes */}
          <InfoOutlinedIcon color="info" sx={{ fontSize: '1.25rem' }} />
        </Tooltip>
      )}
      {thread.question && (
        <Tooltip title="Frage">
          <HelpOutlineIcon color="warning" sx={{ fontSize: '1.25rem' }} />
        </Tooltip>
      )}
    </Box>
  );
}