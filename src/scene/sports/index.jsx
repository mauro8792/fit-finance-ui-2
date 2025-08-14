import AddIcon from "@mui/icons-material/Add";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import DescriptionIcon from "@mui/icons-material/Description";
import EditIcon from "@mui/icons-material/Edit";
import InfoIcon from "@mui/icons-material/Info";
import SportsIcon from "@mui/icons-material/Sports";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Tooltip,
  Typography,
  useTheme,
  Alert,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { useEffect, useState, useCallback, useMemo } from "react";

import Header from "../../components/Header";
import { useSportsStore } from "../../hooks";
import { tokens } from "../../theme";
import { SportWizard } from "./SportWizard";
import { UpdateSportModal } from "./UpdateSport";
import { ViewSportModal } from "./ViewSport";

export const Sports = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const { findAllSports, sports, update } = useSportsStore();

  const [loading, setLoading] = useState(true);
  const [sportSelected, setSportSelected] = useState(null);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [openWizard, setOpenWizard] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchSports = useCallback(async () => {
    try {
      setLoading(true);
      await findAllSports();
    } catch (error) {
      console.error("Error al obtener los deportes:", error);
    } finally {
      setLoading(false);
    }
  }, [findAllSports]);

  const handleSaveChanges = useCallback(async (updatedSport) => {
    try {
      await update(updatedSport);
      await fetchSports(); // Recargar después de actualizar
    } catch (error) {
      console.error("Error updating sport:", error);
    }
  }, [update, fetchSports]);

  const handleOpenViewModal = useCallback((sport) => {
    setSportSelected(sport);
    setOpenViewModal(true);
  }, []);

  const handleOpenUpdateModal = useCallback((sport) => {
    setSportSelected(sport);
    setOpenUpdateModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSportSelected(null);
    setOpenViewModal(false);
    setOpenUpdateModal(false);
  }, []);

  // Filtrar deportes basado en el término de búsqueda
  const filteredSports = useMemo(() => {
    if (!searchTerm.trim()) return sports;
    
    return sports.filter(sport =>
      sport.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sport.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sports, searchTerm]);

  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  useEffect(() => {
    fetchSports();
  }, [fetchSports]);

  /* eslint-disable react/prop-types */
  const SportCard = ({ sport }) => {
    // Validación defensiva para evitar errores
    if (!sport) return null;

    const plansCount = sport.sportPlans?.length || 0;
    const hasPlans = plansCount > 0;

    return (
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <Card
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
            },
            background: `linear-gradient(135deg, ${colors.grey[800]}, ${colors.blueAccent[700]})`,
            border: `1px solid ${colors.grey[600]}`,
          }}
          className="animate__animated animate__fadeIn animate__faster"
        >
          <CardContent sx={{ flexGrow: 1, p: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar
                sx={{
                  backgroundColor: colors.orangeAccent[500],
                  mr: 2,
                  width: 50,
                  height: 50,
                }}
              >
                <SportsIcon />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h6"
                  component="h2"
                  fontWeight="bold"
                  color="white"
                  sx={{ 
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {sport.name || "Sin nombre"}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                  <Chip
                    label="Activo"
                    size="small"
                    sx={{
                      backgroundColor: colors.greenAccent[500],
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "0.7rem",
                    }}
                  />
                  <Chip
                    label={`${plansCount} ${plansCount === 1 ? 'plan' : 'planes'}`}
                    size="small"
                    sx={{
                      backgroundColor: hasPlans ? colors.blueAccent[500] : colors.grey[500],
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "0.7rem",
                    }}
                  />
                </Box>
              </Box>
            </Box>

            {hasPlans ? (
              <Box mb={2}>
                <Box display="flex" alignItems="center" mb={1}>
                  <AttachMoneyIcon sx={{ color: colors.orangeAccent[300], mr: 1 }} />
                  <Typography variant="h6" color="white" fontWeight="bold">
                    ${Math.min(...sport.sportPlans.map(p => parseFloat(p.monthlyFee))).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color={colors.grey[300]} sx={{ ml: 1 }}>
                    - ${Math.max(...sport.sportPlans.map(p => parseFloat(p.monthlyFee))).toLocaleString()} / mes
                  </Typography>
                </Box>
                <Typography variant="body2" color={colors.blueAccent[200]} sx={{ fontSize: '0.8rem' }}>
                  Rango de precios según plan elegido
                </Typography>
              </Box>
            ) : (
              <Box mb={2}>
                <Box display="flex" alignItems="center" mb={1}>
                  <AttachMoneyIcon sx={{ color: colors.grey[500], mr: 1 }} />
                  <Typography variant="body2" color={colors.grey[400]}>
                    Sin planes configurados
                  </Typography>
                </Box>
              </Box>
            )}

            {sport.description && (
              <Box mb={2}>
                <Box display="flex" alignItems="flex-start" mb={1}>
                  <DescriptionIcon sx={{ color: colors.grey[300], mr: 1, mt: 0.2, fontSize: '1rem' }} />
                  <Typography
                    variant="body2"
                    color={colors.grey[200]}
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      fontSize: '0.85rem'
                    }}
                  >
                    {sport.description}
                  </Typography>
                </Box>
              </Box>
            )}
          </CardContent>

          <CardActions sx={{ p: 2, pt: 0, flexWrap: 'wrap', gap: 1 }}>
            <Button
              size="small"
              startIcon={<InfoIcon />}
              onClick={() => handleOpenViewModal(sport)}
              sx={{
                color: "white",
                backgroundColor: colors.blueAccent[500],
                "&:hover": {
                  backgroundColor: colors.blueAccent[600],
                  transform: "scale(1.05)",
                },
                borderRadius: "6px",
                textTransform: "none",
                fontWeight: "bold",
              }}
            >
              Ver
            </Button>
            <Button
              size="small"
              startIcon={<EditIcon />}
              onClick={() => handleOpenUpdateModal(sport)}
              sx={{
                color: "white",
                backgroundColor: colors.orangeAccent[500],
                "&:hover": {
                  backgroundColor: colors.orangeAccent[600],
                  transform: "scale(1.05)",
                },
                borderRadius: "6px",
                textTransform: "none",
                fontWeight: "bold",
                ml: 1,
              }}
            >
              Editar
            </Button>
          </CardActions>
        </Card>
      </Grid>
    );
  };

  return (
    <Box
      m="20px"
      sx={{
        height: "calc(100vh - 80px)", // Más margen para las cards de abajo
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header
        title="Disciplinas Deportivas"
        subtitle="Gestiona las disciplinas base del gimnasio"
      ></Header>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>🎯 Nuevo:</strong> Utiliza el asistente paso a paso para crear disciplinas y configurar sus planes automáticamente. 
          También puedes ver los detalles y editar cada disciplina usando los botones &ldquo;Ver&rdquo; y &ldquo;Editar&rdquo;.
        </Typography>
      </Alert>

      {/* Barra de búsqueda */}
      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder="Buscar disciplinas por nombre o descripción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: colors.grey[500] }} />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleClearSearch}
                  size="small"
                  sx={{ color: colors.grey[500] }}
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '&:hover fieldset': {
                borderColor: colors.orangeAccent[500],
              },
              '&.Mui-focused fieldset': {
                borderColor: colors.orangeAccent[500],
              },
            },
          }}
        />
        {searchTerm && (
          <Typography variant="body2" sx={{ mt: 1, color: colors.grey[600] }}>
            Mostrando {filteredSports.length} de {sports.length} disciplinas
          </Typography>
        )}
      </Box>

      <Box mb={3}>
        <Tooltip title="Crear nueva disciplina paso a paso" placement="top">
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenWizard(true)}
            sx={{
              backgroundColor: colors.orangeAccent[500],
              "&:hover": { backgroundColor: colors.orangeAccent[600] },
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: "bold",
            }}
          >
            Crear Nueva Disciplina
          </Button>
        </Tooltip>
      </Box>

      <SportWizard
        open={openWizard}
        onClose={() => setOpenWizard(false)}
        onComplete={fetchSports}
      />

      <Box
        sx={{
          flex: 1, // Toma el espacio restante
          overflow: "auto", // Habilita el scroll
          paddingRight: "8px", // Espacio para la scrollbar
          marginBottom: "20px", // Espacio extra en la parte inferior
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: colors.primary[800],
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: colors.orangeAccent[500],
            borderRadius: "4px",
            "&:hover": {
              background: colors.orangeAccent[400],
            },
          },
        }}
      >
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="400px"
          >
            <CircularProgress
              size={60}
              sx={{ color: colors.orangeAccent[500] }}
            />
          </Box>
        ) : (
          <Grid container spacing={3} sx={{ mt: 1, pb: 6, px: 1 }}>
            {filteredSports && filteredSports.length > 0 ? (
              filteredSports
                .filter((sport) => sport && sport.id) // Filtrar deportes válidos
                .map((sport) => <SportCard key={sport.id} sport={sport} />)
            ) : searchTerm ? (
              <Grid item xs={12}>
                <Box textAlign="center" py={8}>
                  <SearchIcon
                    sx={{ fontSize: 80, color: colors.grey[500], mb: 2 }}
                  />
                  <Typography
                    variant="h5"
                    color={colors.grey[500]}
                    gutterBottom
                  >
                    No se encontraron resultados
                  </Typography>
                  <Typography variant="body1" color={colors.grey[600]}>
                    No hay disciplinas que coincidan con &ldquo;{searchTerm}&rdquo;
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={handleClearSearch}
                    sx={{ mt: 2 }}
                  >
                    Limpiar búsqueda
                  </Button>
                </Box>
              </Grid>
            ) : (
              <Grid item xs={12}>
                <Box textAlign="center" py={8}>
                  <SportsIcon
                    sx={{ fontSize: 80, color: colors.grey[500], mb: 2 }}
                  />
                  <Typography
                    variant="h5"
                    color={colors.grey[500]}
                    gutterBottom
                  >
                    No hay deportes registrados
                  </Typography>
                  <Typography variant="body1" color={colors.grey[600]}>
                    Comienza agregando tu primera disciplina
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        )}
      </Box>

      {sportSelected && openUpdateModal && (
        <UpdateSportModal
          openModal={openUpdateModal}
          setOpenModal={setOpenUpdateModal}
          sportSelected={sportSelected}
          onSaveChanges={handleSaveChanges}
          setSportSelected={setSportSelected}
          onComplete={fetchSports}
        />
      )}

      {sportSelected && (
        <ViewSportModal
          openModal={openViewModal}
          selectedUser={sportSelected}
          handleCloseModal={handleCloseModal}
        />
      )}
    </Box>
  );
};
