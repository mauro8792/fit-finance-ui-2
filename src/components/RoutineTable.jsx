import React, { useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, IconButton, TextField } from '@mui/material';
import { Edit, Save, Add } from '@mui/icons-material';

// Mock de rutina (puedes mover esto a un archivo aparte luego)
const initialRoutine = [
  {
    id: 1,
    ejercicio: 'PRESS BANCA 30°',
    musculo: 'Pectoral',
    series: [
      { reps: 8, carga: 40, rir: 4, rpe: 7, descanso: 2 },
      { reps: 8, carga: 50, rir: 4, rpe: 8, descanso: 2 }
    ]
  },
  {
    id: 2,
    ejercicio: 'SENTADILLA',
    musculo: 'Cuádriceps',
    series: [
      { reps: 8, carga: 60, rir: 4, rpe: 6, descanso: 2 },
      { reps: 8, carga: 70, rir: 4, rpe: 7, descanso: 2 }
    ]
  }
];

export const RoutineTable = ({ isCoachOrStudent = true }) => {
  const [routine, setRoutine] = useState(initialRoutine);
  const [editRow, setEditRow] = useState(null);
  const [editSeries, setEditSeries] = useState({});

  const handleEdit = (rowIdx, seriesIdx) => {
    setEditRow({ row: rowIdx, series: seriesIdx });
    setEditSeries(routine[rowIdx].series[seriesIdx]);
  };

  const handleSave = (rowIdx, seriesIdx) => {
    const updated = [...routine];
    updated[rowIdx].series[seriesIdx] = { ...editSeries };
    setRoutine(updated);
    setEditRow(null);
  };

  const handleChange = (field, value) => {
    setEditSeries({ ...editSeries, [field]: value });
  };

  const handleAddExercise = () => {
    setRoutine([
      ...routine,
      {
        id: Date.now(),
        ejercicio: '',
        musculo: '',
        series: [{ reps: '', carga: '', rir: '', rpe: '', descanso: '' }]
      }
    ]);
  };

  return (
    <Box mt={4}>
      <Typography variant="h5" fontWeight="bold" mb={2}>
        Rutina de Entrenamiento
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Ejercicio</TableCell>
              <TableCell>Músculo Objetivo</TableCell>
              <TableCell>Reps</TableCell>
              <TableCell>Carga (kg)</TableCell>
              <TableCell>RIR</TableCell>
              <TableCell>RPE</TableCell>
              <TableCell>Descanso (min)</TableCell>
              {isCoachOrStudent && <TableCell>Acciones</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {routine.map((row, rowIdx) => (
              row.series.map((serie, seriesIdx) => (
                <TableRow key={`${row.id}-${seriesIdx}`}> 
                  <TableCell>
                    {seriesIdx === 0 ? row.ejercicio : ''}
                  </TableCell>
                  <TableCell>
                    {seriesIdx === 0 ? row.musculo : ''}
                  </TableCell>
                  <TableCell>
                    {editRow && editRow.row === rowIdx && editRow.series === seriesIdx ? (
                      <TextField size="small" value={editSeries.reps} onChange={e => handleChange('reps', e.target.value)} />
                    ) : (
                      serie.reps
                    )}
                  </TableCell>
                  <TableCell>
                    {editRow && editRow.row === rowIdx && editRow.series === seriesIdx ? (
                      <TextField size="small" value={editSeries.carga} onChange={e => handleChange('carga', e.target.value)} />
                    ) : (
                      serie.carga
                    )}
                  </TableCell>
                  <TableCell>
                    {editRow && editRow.row === rowIdx && editRow.series === seriesIdx ? (
                      <TextField size="small" value={editSeries.rir} onChange={e => handleChange('rir', e.target.value)} />
                    ) : (
                      serie.rir
                    )}
                  </TableCell>
                  <TableCell>
                    {editRow && editRow.row === rowIdx && editRow.series === seriesIdx ? (
                      <TextField size="small" value={editSeries.rpe} onChange={e => handleChange('rpe', e.target.value)} />
                    ) : (
                      serie.rpe
                    )}
                  </TableCell>
                  <TableCell>
                    {editRow && editRow.row === rowIdx && editRow.series === seriesIdx ? (
                      <TextField size="small" value={editSeries.descanso} onChange={e => handleChange('descanso', e.target.value)} />
                    ) : (
                      serie.descanso
                    )}
                  </TableCell>
                  {isCoachOrStudent && (
                    <TableCell>
                      {editRow && editRow.row === rowIdx && editRow.series === seriesIdx ? (
                        <IconButton onClick={() => handleSave(rowIdx, seriesIdx)}><Save /></IconButton>
                      ) : (
                        <IconButton onClick={() => handleEdit(rowIdx, seriesIdx)}><Edit /></IconButton>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {isCoachOrStudent && (
        <Button startIcon={<Add />} onClick={handleAddExercise} sx={{ mt: 2 }} variant="contained" color="primary">
          Agregar Ejercicio
        </Button>
      )}
    </Box>
  );
};
