import { Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableHead, TableRow, Stack } from '@mui/material';

// Mock de rutina con series por ejercicio y diseño mobile tipo tabla
const mockDay = {
  ejercicios: [
    {
      nombre: 'PIN SQUAT',
      rangoReps: '4-6',
      series: [
        { reps: 'AAA', carga: 'AAA', rirEsperado: '4-6', rirReal: 'AAA', rpeReal: 'AAA' },
        { reps: 'BBB', carga: 'BBB', rirEsperado: '4-6', rirReal: 'BBB', rpeReal: 'BBB' },
        { reps: 'CCC', carga: 'CCC', rirEsperado: '4-6', rirReal: 'CCC', rpeReal: 'CCC' }
      ]
    },
    {
      nombre: 'TEMPO BENCH PRESS',
      rangoReps: '4-6',
      series: [
        { reps: 'AAA', carga: 'AAA', rirEsperado: '4-6', rirReal: 'AAA', rpeReal: 'AAA' },
        { reps: 'BBB', carga: 'BBB', rirEsperado: '4-6', rirReal: 'BBB', rpeReal: 'BBB' },
        { reps: 'CCC', carga: 'CCC', rirEsperado: '4-6', rirReal: 'CCC', rpeReal: 'CCC' }
      ]
    },
    {
      nombre: 'LATERAL RAISE SEMI-LOW PULLEY',
      rangoReps: '4-6',
      series: [
        { reps: 'AAA', carga: 'AAA', rirEsperado: '4-6', rirReal: 'AAA', rpeReal: 'AAA' },
        { reps: 'BBB', carga: 'BBB', rirEsperado: '4-6', rirReal: 'BBB', rpeReal: 'BBB' },
        { reps: 'CCC', carga: 'CCC', rirEsperado: '4-6', rirReal: 'CCC', rpeReal: 'CCC' }
      ]
    },
    {
      nombre: 'LEG EXTENSION',
      rangoReps: '4-6',
      series: [
        { reps: 'AAA', carga: 'AAA', rirEsperado: '4-6', rirReal: 'AAA', rpeReal: 'AAA' },
        { reps: 'BBB', carga: 'BBB', rirEsperado: '4-6', rirReal: 'BBB', rpeReal: 'BBB' },
        { reps: 'CCC', carga: 'CCC', rirEsperado: '4-6', rirReal: 'CCC', rpeReal: 'CCC' }
      ]
    }
  ]
};

export const RoutineMobileSeriesMock = () => (
  <Box sx={{ p: 1, maxWidth: 480, mx: 'auto' }}>
    <Stack spacing={2}>
      {mockDay.ejercicios.map((ej, i) => (
        <Card key={i} sx={{ bgcolor: '#ff9800', borderRadius: 3, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" align="center" color="#222">
              {ej.nombre}
            </Typography>
            <Table size="small" sx={{ mt: 1, background: 'transparent' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', borderBottom: 'none' }}>Rango de reps</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', borderBottom: 'none' }}>REPS</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', borderBottom: 'none' }}>CARGA (KG)</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', borderBottom: 'none' }}>RIR ESPERADO</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', borderBottom: 'none' }}>RIR REAL</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', borderBottom: 'none' }}>RPE REAL</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ej.series.map((serie, j) => (
                  <TableRow key={j}>
                    <TableCell>{ej.rangoReps}</TableCell>
                    <TableCell>{serie.reps}</TableCell>
                    <TableCell>{serie.carga}</TableCell>
                    <TableCell>{serie.rirEsperado}</TableCell>
                    <TableCell>{serie.rirReal}</TableCell>
                    <TableCell>{serie.rpeReal}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </Stack>
  </Box>
);
