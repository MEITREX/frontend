import * as React from 'react';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';

type CompetencyProgressbarProps = {
    competencyName: string;
    progressValue: number;
  };

  export default function CompetencyProgressbar(props: CompetencyProgressbarProps) {
  
  const { competencyName } = props;
  const { progressValue } = props;

  return (
    <Box sx={{ width: '100%' }}>
      <label>{ competencyName }</label>
      <LinearProgress variant="determinate" value={progressValue} />
    </Box>
  );
}

