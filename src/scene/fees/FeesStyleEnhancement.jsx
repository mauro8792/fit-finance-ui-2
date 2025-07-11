/**
 * MEJORAS VISUALES PARA LA VISTA DE CUOTAS
 * Archivo de mejoras de estilo que puedes aplicar gradualmente
 */

// 1. PANEL DE FILTROS MEJORADO
export const FilterPanelStyles = {
  container: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    margin: "16px",
    padding: "24px",
    backdropFilter: "blur(10px)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  },
  
  filterGroup: {
    backgroundColor: "rgba(79, 195, 247, 0.1)",
    borderRadius: "12px",
    padding: "16px",
    border: "1px solid rgba(79, 195, 247, 0.3)",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  
  select: {
    backgroundColor: "rgba(255,255,255,0.05)",
    color: "white",
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(79, 195, 247, 0.5)",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#4fc3f7",
    },
  }
};

// 2. TARJETAS DE CUOTA MEJORADAS
export const CardStyles = {
  main: {
    height: "100%",
    width: "100%",
    maxWidth: "380px",
    minWidth: "300px",
    display: "flex",
    flexDirection: "column",
    borderRadius: "20px",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    overflow: "hidden",
    "&:hover": {
      transform: "translateY(-12px) scale(1.02)",
    },
  },
  
  // Efecto de brillo para tarjetas pagadas
  shimmerEffect: {
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: "-100%",
      width: "100%",
      height: "100%",
      background: "linear-gradient(90deg, transparent, rgba(76,175,80,0.1), transparent)",
      transition: "left 0.6s",
    },
    "&:hover::before": {
      left: "100%",
    },
  }
};

// 3. CHIPS Y ESTADÍSTICAS MEJORADAS
export const StatsChipStyles = {
  total: {
    backgroundColor: "rgba(79, 195, 247, 0.2)",
    color: "#4fc3f7",
    border: "1px solid rgba(79, 195, 247, 0.5)",
    fontWeight: "bold",
    fontSize: "0.875rem",
    padding: "4px",
  },
  
  paid: {
    backgroundColor: "rgba(76, 175, 80, 0.2)",
    color: "#4caf50",
    border: "1px solid rgba(76, 175, 80, 0.5)",
    fontWeight: "bold",
    fontSize: "0.875rem",
    padding: "4px",
  },
  
  pending: {
    backgroundColor: "rgba(244, 67, 54, 0.2)",
    color: "#f44336",
    border: "1px solid rgba(244, 67, 54, 0.5)",
    fontWeight: "bold",
    fontSize: "0.875rem",
    padding: "4px",
  }
};

// 4. BARRA DE PROGRESO MEJORADA
export const ProgressBarStyles = {
  container: {
    width: "100%",
    height: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  
  bar: (isFullyPaid, isPartialPaid, progressPercentage) => ({
    width: `${progressPercentage}%`,
    height: "100%",
    background: isFullyPaid
      ? "linear-gradient(45deg, #4caf50, #66bb6a)"
      : isPartialPaid
      ? "linear-gradient(45deg, #ff9800, #ffb74d)"
      : "linear-gradient(45deg, #f44336, #ef5350)",
    transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: isFullyPaid
      ? "0 0 12px rgba(76,175,80,0.6)"
      : isPartialPaid
      ? "0 0 8px rgba(255,152,0,0.4)"
      : "0 0 8px rgba(244,67,54,0.4)",
  })
};

// 5. BOTONES MEJORADOS
export const ButtonStyles = {
  edit: {
    color: "#FFC107",
    borderColor: "#FFC107",
    "&:hover": {
      backgroundColor: "rgba(255, 193, 7, 0.15)",
      borderColor: "#FFC107",
      transform: "translateY(-2px)",
      boxShadow: "0 4px 12px rgba(255, 193, 7, 0.3)",
    },
    borderRadius: "12px",
    textTransform: "none",
    fontWeight: "600",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  
  view: {
    color: "#4fc3f7",
    borderColor: "#4fc3f7",
    "&:hover": {
      backgroundColor: "rgba(79, 195, 247, 0.15)",
      borderColor: "#4fc3f7",
      transform: "translateY(-2px)",
      boxShadow: "0 4px 12px rgba(79, 195, 247, 0.3)",
    },
    borderRadius: "12px",
    textTransform: "none",
    fontWeight: "600",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  
  pay: {
    background: "linear-gradient(45deg, #66bb6a, #4caf50)",
    "&:hover": {
      background: "linear-gradient(45deg, #4caf50, #388e3c)",
      transform: "translateY(-2px)",
      boxShadow: "0 6px 16px rgba(76, 175, 80, 0.4)",
    },
    borderRadius: "12px",
    fontWeight: "bold",
    textTransform: "none",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  }
};

// 6. ESTADO VACÍO MEJORADO
export const EmptyStateStyles = {
  container: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: "20px",
    border: "2px dashed rgba(255, 255, 255, 0.2)",
    margin: "20px",
    padding: "40px",
    textAlign: "center",
  },
  
  icon: {
    fontSize: "4rem",
    marginBottom: "16px",
    filter: "grayscale(100%)",
    opacity: 0.6,
  }
};

// 7. SCROLLBAR PERSONALIZADA
export const ScrollbarStyles = {
  "&::-webkit-scrollbar": {
    width: "12px",
  },
  "&::-webkit-scrollbar-track": {
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: "8px",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "linear-gradient(45deg, #4fc3f7, #66bb6a)",
    borderRadius: "8px",
    border: "2px solid rgba(255, 255, 255, 0.1)",
    "&:hover": {
      background: "linear-gradient(45deg, #29b6f6, #4caf50)",
    },
  },
};

// 8. ANIMACIONES CSS
export const cssAnimations = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  @keyframes slide {
    0% { left: -100%; }
    100% { left: 100%; }
  }
  
  @keyframes gentle-float {
    0%, 100% { transform: translateY(-12px) scale(1.02); }
    50% { transform: translateY(-16px) scale(1.02); }
  }
  
  .card-hover-effect {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .card-hover-effect:hover {
    animation: gentle-float 2s ease-in-out infinite;
  }
`;

// INSTRUCCIONES DE USO:
/*
1. Importa los estilos que necesites en tu componente
2. Aplica gradualmente los estilos usando sx props
3. Agrega las animaciones CSS al final del archivo

Ejemplo:
import { FilterPanelStyles, CardStyles } from './FeesStyleEnhancement';

<Box sx={FilterPanelStyles.container}>
  // tu contenido
</Box>

<Card sx={CardStyles.main}>
  // tu contenido de tarjeta
</Card>
*/
