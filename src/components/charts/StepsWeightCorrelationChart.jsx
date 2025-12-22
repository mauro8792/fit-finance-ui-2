import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  useMediaQuery,
} from '@mui/material';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { financeApi } from '../../api';

const COLORS = {
  green: '#4cceac',
  orange: '#ff9800',
  red: '#f44336',
  blue: '#6870fa',
  purple: '#a855f7',
  textMuted: '#888',
  text: '#e0e0e0',
  card: '#1a1a2e',
};

const StepsWeightCorrelationChart = ({ studentId, studentName }) => {
  const [loading, setLoading] = useState(true);
  const [stepsData, setStepsData] = useState(null);
  const [weightData, setWeightData] = useState(null);
  const [error, setError] = useState(null);
  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Obtener ambos datos en paralelo
        const [stepsResponse, weightResponse] = await Promise.all([
          financeApi.get(`/cardio/${studentId}/steps-weekly-stats?weeks=8`),
          financeApi.get(`/health/weight/${studentId}/weekly-stats?weeks=8`),
        ]);
        setStepsData(stepsResponse.data);
        setWeightData(weightResponse.data);
      } catch (err) {
        console.error('Error fetching correlation data:', err);
        setError('Error al cargar datos de correlación');
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchData();
    }
  }, [studentId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={32} sx={{ color: COLORS.purple }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ bgcolor: 'rgba(244,67,54,0.1)' }}>
        {error}
      </Alert>
    );
  }

  // Verificar que tengamos datos de ambos
  const hasStepsData = stepsData?.hasData && stepsData?.weeks?.length > 0;
  const hasWeightData = weightData?.hasData && weightData?.weeks?.length > 0;

  if (!hasStepsData && !hasWeightData) {
    return (
      <Alert severity="info" sx={{ bgcolor: 'rgba(33,150,243,0.1)' }}>
        No hay suficientes datos de pasos y peso para mostrar correlación
      </Alert>
    );
  }

  // Combinar datos por semana
  const combinedData = [];
  const maxWeeks = Math.max(
    stepsData?.weeks?.length || 0,
    weightData?.weeks?.length || 0
  );

  for (let i = 0; i < maxWeeks; i++) {
    const stepsWeek = stepsData?.weeks?.[i];
    const weightWeek = weightData?.weeks?.[i];

    // Usar la fecha de cualquiera de los dos que exista
    const weekStart = stepsWeek?.weekStart || weightWeek?.weekStart;
    const weekEnd = stepsWeek?.weekEnd || weightWeek?.weekEnd;

    combinedData.push({
      name: `S${i + 1}`,
      weekStart,
      weekEnd,
      pasos: stepsWeek?.averageSteps || null,
      peso: weightWeek?.averageWeight || null,
      stepsVariation: stepsWeek?.variationSteps,
      weightVariation: weightWeek?.variationGrams,
      stepsTotal: stepsWeek?.totalSteps,
      daysWithSteps: stepsWeek?.daysWithData,
    });
  }

  // Calcular dominios para los ejes Y
  const stepsValues = combinedData.filter(d => d.pasos).map(d => d.pasos);
  const weightValues = combinedData.filter(d => d.peso).map(d => d.peso);

  const minSteps = stepsValues.length > 0 ? Math.min(...stepsValues) : 0;
  const maxSteps = stepsValues.length > 0 ? Math.max(...stepsValues) : 10000;
  const stepsPadding = (maxSteps - minSteps) * 0.2 || 1000;

  const minWeight = weightValues.length > 0 ? Math.min(...weightValues) : 0;
  const maxWeight = weightValues.length > 0 ? Math.max(...weightValues) : 100;
  const weightPadding = (maxWeight - minWeight) * 0.2 || 2;

  // Calcular correlación simple
  const calculateCorrelation = () => {
    const validData = combinedData.filter(d => d.pasos && d.peso);
    if (validData.length < 2) return null;

    // Calcular si hay correlación negativa (más pasos = menos peso)
    let stepsUp = 0, stepsDown = 0;
    let weightUp = 0, weightDown = 0;
    let inversions = 0;

    for (let i = 1; i < validData.length; i++) {
      const stepsDiff = validData[i].pasos - validData[i-1].pasos;
      const weightDiff = validData[i].peso - validData[i-1].peso;

      if (stepsDiff > 0) stepsUp++;
      else if (stepsDiff < 0) stepsDown++;

      if (weightDiff > 0) weightUp++;
      else if (weightDiff < 0) weightDown++;

      // Correlación esperada: pasos sube → peso baja (inversa)
      if ((stepsDiff > 0 && weightDiff < 0) || (stepsDiff < 0 && weightDiff > 0)) {
        inversions++;
      }
    }

    const totalChanges = validData.length - 1;
    const correlationScore = totalChanges > 0 ? Math.round((inversions / totalChanges) * 100) : 0;

    return {
      score: correlationScore,
      message: correlationScore >= 60 
        ? '✅ Buena correlación: más pasos = menos peso' 
        : correlationScore >= 40 
        ? '⚠️ Correlación moderada' 
        : '📊 Correlación baja - revisar otros factores',
      color: correlationScore >= 60 ? COLORS.green : correlationScore >= 40 ? COLORS.orange : COLORS.red,
    };
  };

  const correlation = calculateCorrelation();

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      return (
        <Box
          sx={{
            bgcolor: COLORS.card,
            p: 1.5,
            borderRadius: 1,
            border: '1px solid rgba(255,255,255,0.2)',
            minWidth: 180,
          }}
        >
          <Typography fontSize={13} fontWeight="bold" color={COLORS.text}>
            Semana {data.name?.replace('S', '')}
          </Typography>
          <Typography fontSize={10} color={COLORS.textMuted} mb={1}>
            {data.weekStart} - {data.weekEnd}
          </Typography>
          
          {data.pasos && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography fontSize={12} color={COLORS.orange}>
                🚶 Pasos/día:
              </Typography>
              <Typography fontSize={12} color={COLORS.orange} fontWeight="bold">
                {data.pasos?.toLocaleString()}
              </Typography>
            </Box>
          )}
          
          {data.peso && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography fontSize={12} color={COLORS.green}>
                ⚖️ Peso prom:
              </Typography>
              <Typography fontSize={12} color={COLORS.green} fontWeight="bold">
                {data.peso} kg
              </Typography>
            </Box>
          )}

          {data.stepsVariation !== null && data.stepsVariation !== undefined && (
            <Typography 
              fontSize={11} 
              color={data.stepsVariation > 0 ? COLORS.green : data.stepsVariation < 0 ? COLORS.red : COLORS.textMuted}
            >
              Pasos: {data.stepsVariation > 0 ? '+' : ''}{data.stepsVariation?.toLocaleString()} vs anterior
            </Typography>
          )}

          {data.weightVariation !== null && data.weightVariation !== undefined && (
            <Typography 
              fontSize={11} 
              color={data.weightVariation < 0 ? COLORS.green : data.weightVariation > 0 ? COLORS.red : COLORS.textMuted}
            >
              Peso: {data.weightVariation > 0 ? '+' : ''}{data.weightVariation}g vs anterior
            </Typography>
          )}
        </Box>
      );
    }
    return null;
  };

  // Calcular resumen
  const stepsChange = stepsData?.summary?.totalChange;
  const weightChange = weightData?.summary?.totalChange;

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'flex-start' : 'center', 
        flexDirection: isMobile ? 'column' : 'row',
        mb: 2, 
        gap: 1 
      }}>
        <Box>
          <Typography variant={isMobile ? 'subtitle1' : 'h6'} color={COLORS.text} fontWeight="bold">
            📊 Correlación Pasos-Peso
          </Typography>
          <Typography fontSize={11} color={COLORS.textMuted}>
            ¿Más actividad = mejor progreso?
          </Typography>
        </Box>
        
        {correlation && (
          <Chip
            label={correlation.message}
            size="small"
            sx={{
              backgroundColor: `${correlation.color}20`,
              color: correlation.color,
              fontWeight: 600,
              fontSize: isMobile ? 10 : 12,
              maxWidth: isMobile ? '100%' : 'auto',
              height: 'auto',
              '& .MuiChip-label': {
                whiteSpace: 'normal',
                padding: '4px 8px',
              },
            }}
          />
        )}
      </Box>

      {/* Resumen de cambios */}
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        mb: 2, 
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        {stepsChange !== null && stepsChange !== undefined && (
          <Box sx={{ 
            textAlign: 'center', 
            p: 1.5, 
            borderRadius: 2, 
            bgcolor: 'rgba(255,152,0,0.1)',
            border: '1px solid rgba(255,152,0,0.3)',
            minWidth: 120,
          }}>
            <Typography fontSize={10} color={COLORS.textMuted}>Cambio en Pasos</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
              {stepsChange > 0 ? <TrendingUpIcon sx={{ color: COLORS.green, fontSize: 18 }} /> : <TrendingDownIcon sx={{ color: COLORS.red, fontSize: 18 }} />}
              <Typography fontSize={16} fontWeight="bold" color={stepsChange > 0 ? COLORS.green : COLORS.red}>
                {stepsChange > 0 ? '+' : ''}{stepsChange?.toLocaleString()}
              </Typography>
            </Box>
            <Typography fontSize={10} color={COLORS.textMuted}>pasos/día promedio</Typography>
          </Box>
        )}

        {weightChange !== null && weightChange !== undefined && (
          <Box sx={{ 
            textAlign: 'center', 
            p: 1.5, 
            borderRadius: 2, 
            bgcolor: 'rgba(76,206,172,0.1)',
            border: '1px solid rgba(76,206,172,0.3)',
            minWidth: 120,
          }}>
            <Typography fontSize={10} color={COLORS.textMuted}>Cambio en Peso</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
              {weightChange < 0 ? <TrendingDownIcon sx={{ color: COLORS.green, fontSize: 18 }} /> : <TrendingUpIcon sx={{ color: COLORS.red, fontSize: 18 }} />}
              <Typography fontSize={16} fontWeight="bold" color={weightChange < 0 ? COLORS.green : COLORS.red}>
                {weightChange > 0 ? '+' : ''}{(weightChange / 1000).toFixed(1)} kg
              </Typography>
            </Box>
            <Typography fontSize={10} color={COLORS.textMuted}>en {weightData?.summary?.totalWeeks} semanas</Typography>
          </Box>
        )}

        {/* Indicador de correlación visual */}
        {stepsChange !== null && weightChange !== null && (
          <Box sx={{ 
            textAlign: 'center', 
            p: 1.5, 
            borderRadius: 2, 
            bgcolor: (stepsChange > 0 && weightChange < 0) ? 'rgba(76,206,172,0.15)' : 'rgba(244,67,54,0.1)',
            border: `1px solid ${(stepsChange > 0 && weightChange < 0) ? 'rgba(76,206,172,0.4)' : 'rgba(244,67,54,0.3)'}`,
            minWidth: 120,
          }}>
            <Typography fontSize={10} color={COLORS.textMuted}>Tendencia</Typography>
            <Typography fontSize={24}>
              {(stepsChange > 0 && weightChange < 0) ? '🎯' : (stepsChange < 0 && weightChange > 0) ? '⚠️' : '📊'}
            </Typography>
            <Typography fontSize={10} color={(stepsChange > 0 && weightChange < 0) ? COLORS.green : COLORS.orange}>
              {(stepsChange > 0 && weightChange < 0) 
                ? '¡Excelente progreso!' 
                : (stepsChange < 0 && weightChange > 0) 
                ? 'Necesita más actividad' 
                : 'Revisar nutrición'}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Gráfico combinado */}
      <Box sx={{ height: isMobile ? 200 : 280, mb: 2, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={combinedData} margin={{ top: 10, right: isMobile ? 10 : 60, left: isMobile ? -15 : -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="name" 
              tick={{ fill: COLORS.textMuted, fontSize: isMobile ? 9 : 11 }} 
              axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
            />
            
            {/* Eje Y izquierdo - Pasos */}
            <YAxis 
              yAxisId="pasos"
              orientation="left"
              domain={[Math.max(0, minSteps - stepsPadding), maxSteps + stepsPadding]}
              tick={{ fill: COLORS.orange, fontSize: isMobile ? 8 : 10 }} 
              axisLine={{ stroke: COLORS.orange }}
              tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}
              width={isMobile ? 35 : 45}
              label={isMobile ? null : { 
                value: 'Pasos', 
                angle: -90, 
                position: 'insideLeft', 
                fill: COLORS.orange,
                fontSize: 11,
                offset: 10,
              }}
            />
            
            {/* Eje Y derecho - Peso */}
            <YAxis 
              yAxisId="peso"
              orientation="right"
              domain={[minWeight - weightPadding, maxWeight + weightPadding]}
              tick={{ fill: COLORS.green, fontSize: isMobile ? 8 : 10 }} 
              axisLine={{ stroke: COLORS.green }}
              tickFormatter={(value) => `${value}kg`}
              width={isMobile ? 35 : 50}
              label={isMobile ? null : { 
                value: 'Peso (kg)', 
                angle: 90, 
                position: 'insideRight', 
                fill: COLORS.green,
                fontSize: 11,
                offset: 10,
              }}
            />
            
            <RechartsTooltip content={<CustomTooltip />} />
            
            <Legend 
              wrapperStyle={{ 
                paddingTop: '10px',
                fontSize: isMobile ? 10 : 12,
              }}
              formatter={(value) => (
                <span style={{ color: COLORS.text }}>{value}</span>
              )}
            />
            
            {/* Barras de pasos */}
            <Bar 
              yAxisId="pasos"
              dataKey="pasos" 
              name="Pasos/día"
              fill={COLORS.orange}
              fillOpacity={0.6}
              radius={[4, 4, 0, 0]}
            />
            
            {/* Línea de peso */}
            <Line 
              yAxisId="peso"
              type="monotone" 
              dataKey="peso" 
              name="Peso (kg)"
              stroke={COLORS.green} 
              strokeWidth={3}
              dot={{ fill: COLORS.green, strokeWidth: 2, r: isMobile ? 4 : 5 }}
              activeDot={{ r: isMobile ? 6 : 7, fill: COLORS.green }}
              connectNulls
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Box>

      {/* Leyenda explicativa */}
      <Box sx={{ 
        p: 1.5, 
        borderRadius: 2, 
        bgcolor: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}>
        <Typography fontSize={11} color={COLORS.textMuted} textAlign="center">
          💡 <strong>Interpretación:</strong> Las barras naranjas muestran los pasos promedio por día. 
          La línea verde muestra la evolución del peso. 
          Idealmente, cuando las barras suben, la línea debería bajar.
        </Typography>
      </Box>
    </Box>
  );
};

export default StepsWeightCorrelationChart;

