import React, { useState, useEffect } from 'react';
import { getPublicNote } from './api';
import { Box, CircularProgress, Typography, Paper, Chip } from '@mui/material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.bubble.css'; // Read-only theme

const PublicNoteViewer = ({ uuid }) => {
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNote = async () => {
      try {
        setLoading(true);
        const fetchedNote = await getPublicNote(uuid);
        setNote(fetchedNote);
      } catch (err) {
        setError('Not bulunamadı veya artık paylaşıma açık değil.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (uuid) {
      fetchNote();
    }
  }, [uuid]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Typography color="error">{error}</Typography></Box>;
  }

  if (!note) {
    return null;
  }

  return (
    <Box sx={{ maxWidth: '800px', margin: 'auto', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {note.title}
        </Typography>
        <Typography variant="caption" color="text.secondary" gutterBottom>
          Yazar: @{note.owner} | Son Güncelleme: {new Date(note.updated_at).toLocaleString()}
        </Typography>
        <Box sx={{ my: 2 }}>
            <ReactQuill
                value={note.content}
                readOnly={true}
                theme="bubble"
            />
        </Box>
        {note.tags && note.tags.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
            {note.tags.map(tag => (
              <Chip key={tag} label={tag} />
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default PublicNoteViewer;
