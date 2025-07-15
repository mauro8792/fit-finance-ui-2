import { Box, Card, CardContent, Typography, Button, Chip, Stack } from '@mui/material';

// Mock de rutina anidada
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
              ejercicios: [
                { nombre: 'Press Banca 30°', musculo: 'Pectoral', reps: 8, carga: 40, rir: 4, rpe: 7, descanso: 2 },
                { nombre: 'Sentadilla', musculo: 'Cuádriceps', reps: 8, carga: 60, rir: 4, rpe: 6, descanso: 2 }
              ]
            },
            {
              dia: 2,
              fecha: '02/07/2025',
              ejercicios: [
                { nombre: 'Remo', musculo: 'Espalda', reps: 10, carga: 30, rir: 3, rpe: 8, descanso: 2 }
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
              ejercicios: [
                { nombre: 'Press Banca 30°', musculo: 'Pectoral', reps: 8, carga: 45, rir: 3, rpe: 8, descanso: 2 }
              ]
            }
          ]
        }
      ]
    }
  ]
};

export const RoutineMobileMock = () => (
  <Box sx={{ p: 1, maxWidth: 480, mx: 'auto' }}>
    <Card sx={{ mb: 2, bgcolor: '#e3f2fd' }}>
      <CardContent>
        <Typography variant="h5" fontWeight="bold">{mockRoutine.nombre}</Typography>
        <Typography variant="body2" color="text.secondary">Rutina anual</Typography>
      </CardContent>
    </Card>
    <Stack spacing={2}>
      {mockRoutine.mesociclos.map((meso, i) => (
        <Card key={i} sx={{ bgcolor: '#fffde7', boxShadow: 2 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" color="primary">{meso.nombre}</Typography>
            <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 1 }}>
              {meso.microciclos.map((micro, j) => (
                <Card key={j} sx={{ minWidth: 220, bgcolor: '#f1f8e9', mx: 1 }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold" color="secondary">{micro.nombre}</Typography>
                    <Stack spacing={1}>
                      {micro.dias.map((dia, k) => (
                        <Card key={k} sx={{ bgcolor: '#e0f7fa', mb: 1 }}>
                          <CardContent>
                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                              <Typography variant="body2" fontWeight="bold">Día {dia.dia}</Typography>
                              <Chip label={dia.fecha} size="small" color="info" />
                            </Stack>
                            <Stack spacing={1} mt={1}>
                              {dia.ejercicios.map((ej, l) => (
                                <Card key={l} sx={{ bgcolor: '#fff', boxShadow: 1, p: 1 }}>
                                  <CardContent sx={{ p: 1 }}>
                                    <Typography fontWeight="bold">{ej.nombre}</Typography>
                                    <Typography variant="body2" color="text.secondary">{ej.musculo}</Typography>
                                    <Stack direction="row" spacing={1} mt={0.5}>
                                      <Chip label={`Reps: ${ej.reps}`} size="small" />
                                      <Chip label={`Carga: ${ej.carga}kg`} size="small" />
                                      <Chip label={`RIR: ${ej.rir}`} size="small" />
                                      <Chip label={`RPE: ${ej.rpe}`} size="small" />
                                      <Chip label={`Desc: ${ej.descanso}min`} size="small" />
                                    </Stack>
                                  </CardContent>
                                </Card>
                              ))}
                            </Stack>
                          </CardContent>
                        </Card>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  </Box>
);
