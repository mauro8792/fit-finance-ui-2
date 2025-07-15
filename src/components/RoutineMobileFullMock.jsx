import { Box, Card, CardContent, Typography, Stack, Button, Chip, Tabs, Tab, IconButton } from '@mui/material';
import { useState } from 'react';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

// Mock de rutina anidada: Macrociclo > Mesociclo > Microciclo > Día > Ejercicios/Series
const mockRoutine = {
  nombre: 'Macrociclo 2025',
  mesociclos: [
    {
      nombre: 'Mesociclo 1',
      microciclos: [
        {
          nombre: 'Microciclo 1',
          dias: [
            {
              dia: 1,
              fecha: '01/07/2025',
              observaciones: 'Enfocar en técnica y control del movimiento.',
              ejercicios: [
                { nombre: 'PIN SQUAT', musculo: 'Cuádriceps, glúteos', tipo: 'Fuerza', rangoReps: '4-6', tempo: '3-1-1', series: [ { reps: '8', carga: '100', rirEsperado: '4', rirReal: '3', rpeReal: '8', observacion: 'Buena profundidad.' } ] },
                { nombre: 'TEMPO BENCH PRESS', musculo: 'Pectoral, tríceps', tipo: 'Hipertrofia', rangoReps: '4-6', tempo: '4-0-1', series: [ { reps: '8', carga: '60', rirEsperado: '4', rirReal: '3', rpeReal: '8', observacion: 'Controlar el tempo.' } ] },
                { nombre: 'DOMINADAS', musculo: 'Dorsal, bíceps', tipo: 'Fuerza', rangoReps: '5-10', tempo: '2-1-2', series: [ { reps: '7', carga: 'BW', rirEsperado: '3', rirReal: '2', rpeReal: '9', observacion: 'Buen rango.' } ] },
                { nombre: 'REMO CON BARRA', musculo: 'Espalda, bíceps', tipo: 'Hipertrofia', rangoReps: '8-12', tempo: '2-0-2', series: [ { reps: '10', carga: '50', rirEsperado: '3', rirReal: '2', rpeReal: '8', observacion: 'Buena técnica.' } ] },
                { nombre: 'PRESS MILITAR', musculo: 'Hombros, tríceps', tipo: 'Fuerza', rangoReps: '6-8', tempo: '2-1-2', series: [ { reps: '8', carga: '40', rirEsperado: '3', rirReal: '2', rpeReal: '8', observacion: 'Controlar bajada.' } ] }
              ]
            },
            {
              dia: 2,
              fecha: '02/07/2025',
              observaciones: 'Priorizar rango completo en dominadas.',
              ejercicios: [
                { nombre: 'SENTADILLA FRONTAL', musculo: 'Cuádriceps', tipo: 'Fuerza', rangoReps: '6-8', tempo: '3-1-1', series: [ { reps: '8', carga: '90', rirEsperado: '4', rirReal: '3', rpeReal: '8', observacion: 'Buena postura.' } ] },
                { nombre: 'DOMINADAS', musculo: 'Dorsal, bíceps', tipo: 'Fuerza', rangoReps: '5-10', tempo: '2-1-2', series: [ { reps: '7', carga: 'BW', rirEsperado: '3', rirReal: '2', rpeReal: '9', observacion: 'Buen rango.' } ] },
                { nombre: 'REMO CON BARRA', musculo: 'Espalda, bíceps', tipo: 'Hipertrofia', rangoReps: '8-12', tempo: '2-0-2', series: [ { reps: '10', carga: '50', rirEsperado: '3', rirReal: '2', rpeReal: '8', observacion: 'Buena técnica.' } ] },
                { nombre: 'PRESS BANCA', musculo: 'Pectoral, tríceps', tipo: 'Fuerza', rangoReps: '4-6', tempo: '2-1-2', series: [ { reps: '8', carga: '70', rirEsperado: '3', rirReal: '2', rpeReal: '8', observacion: 'Controlar bajada.' } ] },
                { nombre: 'CURL BÍCEPS', musculo: 'Bíceps', tipo: 'Hipertrofia', rangoReps: '10-12', tempo: '2-0-2', series: [ { reps: '12', carga: '20', rirEsperado: '2', rirReal: '1', rpeReal: '9', observacion: 'No balancear.' } ] }
              ]
            }
          ]
        },
        {
          nombre: 'Microciclo 2',
          dias: [
            {
              dia: 1,
              fecha: '08/07/2025',
              observaciones: 'Enfasis en fuerza máxima y técnica de sentadilla.',
              ejercicios: [
                { nombre: 'SQUAT', musculo: 'Cuádriceps, glúteos', tipo: 'Fuerza', rangoReps: '3-5', tempo: '3-1-1', series: [ { reps: '5', carga: '110', rirEsperado: '3', rirReal: '2', rpeReal: '9', observacion: 'Profundidad máxima.' } ] },
                { nombre: 'PULL UP', musculo: 'Dorsal, bíceps', tipo: 'Fuerza', rangoReps: '6-8', tempo: '2-1-2', series: [ { reps: '8', carga: 'BW', rirEsperado: '2', rirReal: '1', rpeReal: '8', observacion: 'Controlar bajada.' } ] },
                { nombre: 'PRESS BANCA', musculo: 'Pectoral, tríceps', tipo: 'Fuerza', rangoReps: '4-6', tempo: '2-1-2', series: [ { reps: '6', carga: '75', rirEsperado: '2', rirReal: '1', rpeReal: '8', observacion: 'Sin rebote.' } ] }
              ]
            },
            {
              dia: 2,
              fecha: '09/07/2025',
              observaciones: 'Trabajo de accesorios y core.',
              ejercicios: [
                { nombre: 'HIP THRUST', musculo: 'Glúteos', tipo: 'Hipertrofia', rangoReps: '8-12', tempo: '2-0-2', series: [ { reps: '12', carga: '80', rirEsperado: '3', rirReal: '2', rpeReal: '8', observacion: 'Pausa arriba.' } ] },
                { nombre: 'PLANK', musculo: 'Core', tipo: 'Resistencia', rangoReps: '30-60s', tempo: '-', series: [ { reps: '1', carga: '-', rirEsperado: '-', rirReal: '-', rpeReal: '7', observacion: 'Sin temblor.' } ] }
              ]
            }
          ]
        }
      ]
    }
  ]
};

export const RoutineMobileFullMock = () => {
  const [mesoIdx, setMesoIdx] = useState(0);
  const [microIdx, setMicroIdx] = useState(0);
  const [diaIdx, setDiaIdx] = useState(0);
  // Estado para notas por ejercicio/serie


  const mesociclos = mockRoutine.mesociclos;
  const microciclos = mesociclos[mesoIdx].microciclos;
  const dias = microciclos[microIdx].dias;
  const ejercicios = dias[diaIdx].ejercicios;

  return (
    <Box sx={{ p: 1, maxWidth: 480, mx: 'auto' }}>
      <Box
        sx={{
          bgcolor: '#e3f2fd',
          borderRadius: 3,
          p: { xs: 2, sm: 3 },
          mb: 3,
          mx: 'auto',
          maxWidth: 500,
          boxShadow: 4,
          border: '2px solid #90caf9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          variant="h4"
          color="primary"
          fontWeight={700}
          sx={{ letterSpacing: 1, textAlign: 'center' }}
        >
          {mockRoutine.nombre}
        </Typography>
      </Box>
      {/* Mesociclos selector */}
      <Tabs
        value={mesoIdx}
        onChange={(_, v) => { setMesoIdx(v); setMicroIdx(0); setDiaIdx(0); }}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 1 }}
      >
        {mesociclos.map((meso, i) => (
          <Tab key={i} label={meso.nombre} />
        ))}
      </Tabs>
      {/* Microciclos selector con flechas y solo 3 visibles */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <IconButton
          size="small"
          onClick={() => {
            if (microIdx > 0) { setMicroIdx(microIdx - 1); setDiaIdx(0); }
          }}
          disabled={microIdx === 0}
        >
          <ArrowBackIosNewIcon fontSize="small" />
        </IconButton>
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 1 }}>
          {microciclos
            .map((micro, i) => ({ ...micro, idx: i }))
            .filter((_, i) => Math.abs(i - microIdx) <= 1)
            .map((micro) => (
              <Button
                key={micro.idx}
                variant={micro.idx === microIdx ? 'contained' : 'outlined'}
                size="small"
                sx={{ minWidth: 90, bgcolor: micro.idx === microIdx ? '#ffe082' : undefined, color: '#222', fontWeight: 700 }}
                onClick={() => { setMicroIdx(micro.idx); setDiaIdx(0); }}
              >
                {micro.nombre}
              </Button>
            ))}
        </Box>
        <IconButton
          size="small"
          onClick={() => {
            if (microIdx < microciclos.length - 1) { setMicroIdx(microIdx + 1); setDiaIdx(0); }
          }}
          disabled={microIdx === microciclos.length - 1}
        >
          <ArrowForwardIosIcon fontSize="small" />
        </IconButton>
      </Box>
      {/* Días selector */}
      <Tabs
        value={diaIdx}
        onChange={(_, v) => setDiaIdx(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2 }}
      >
        {dias.map((dia, i) => (
          <Tab key={i} label={`Día ${dia.dia}`} />
        ))}
      </Tabs>
      {/* Ejercicios del día */}

      <Typography variant="body2" color="#1976d2" align="center" mb={0.5}>
        Fecha: {dias[diaIdx].fecha} {dias[diaIdx].observaciones ? '· ' + dias[diaIdx].observaciones : ''}
      </Typography>

      <Stack spacing={2}>
        {ejercicios.map((ej, i) => (
          <Box key={i} sx={{ bgcolor: '#ff9800', borderRadius: 3, boxShadow: 3, mb: 1 }}>
            <Box sx={{ p: 1 }}>
              <Typography variant="h6" fontWeight="bold" align="center" color="#222">
                {ej.nombre}
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                {ej.musculo} · {ej.tipo} · Tempo: {ej.tempo}
              </Typography>
              <Box sx={{ overflowX: 'auto', mt: 1 }}>
                <table style={{ width: '100%', background: 'transparent', fontSize: '0.95em' }}>
                  <thead>
                    <tr>
                      <th style={{ fontWeight: 'bold', borderBottom: 'none' }}>Rango reps</th>
                      <th style={{ fontWeight: 'bold', borderBottom: 'none' }}>REPS</th>
                      <th style={{ fontWeight: 'bold', borderBottom: 'none' }}>CARGA</th>
                      <th style={{ fontWeight: 'bold', borderBottom: 'none' }}>RIR ESP</th>
                      <th style={{ fontWeight: 'bold', borderBottom: 'none' }}>RIR REAL</th>
                      <th style={{ fontWeight: 'bold', borderBottom: 'none' }}>RPE</th>
                      <th style={{ fontWeight: 'bold', borderBottom: 'none' }}>Obs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ej.series.map((serie, j) => (
                      <tr key={j}>
                        <td>{ej.rangoReps}</td>
                        <td>{serie.reps}</td>
                        <td>{serie.carga}</td>
                        <td>{serie.rirEsperado}</td>
                        <td>{serie.rirReal}</td>
                        <td>{serie.rpeReal}</td>
                        <td>{serie.observacion}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </Box>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};


