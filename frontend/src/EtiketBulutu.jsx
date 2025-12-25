import React from 'react';
import { Chip, Box, Typography } from '@mui/material';

const EtiketBulutu = ({ tags, onTagClick, selectedTag }) => {
  return (
    <div className="etiket-bulutu">
      <Typography variant="h6" component="h4" gutterBottom>Etiketler</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Chip
          label="Tümü"
          onClick={() => onTagClick(null)}
          variant={!selectedTag ? 'filled' : 'outlined'}
          color="primary"
          size="small"
          clickable
        />
        {tags.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            onClick={() => onTagClick(tag)}
            variant={selectedTag === tag ? 'filled' : 'outlined'}
            color="primary"
            size="small"
            clickable
          />
        ))}
      </Box>
    </div>
  );
};

export default EtiketBulutu;
