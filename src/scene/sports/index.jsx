import AddIcon from "@mui/icons-material/Add";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import DescriptionIcon from "@mui/icons-material/Description";
import EditIcon from "@mui/icons-material/Edit";
import InfoIcon from "@mui/icons-material/Info";
import SportsIcon from "@mui/icons-material/Sports";
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
} from "@mui/material";
import { useEffect, useState } from "react";

import Header from "../../components/Header";
import { useSportsStore } from "../../hooks";
import { tokens } from "../../theme";
import { AddSportModal } from "./AddSport";
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
  const [openAddModal, setOpenAddModal] = useState(false);

  const fetchSports = async () => {
    try {
      setLoading(true);
      await findAllSports();
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener los deportes:", error);
      setLoading(false);
      // Mostrar un error más amigable al usuario si es necesario
    }
  };

  const handleSaveChanges = async (updatedSport) => {
    await update(updatedSport);
    setLoading(true);
    await fetchSports();
  };

  const handleOpenViewModal = (sport) => {
    setSportSelected(sport);
    setOpenViewModal(true);
  };

  const handleOpenUpdateModal = (sport) => {
    setSportSelected(sport);
    setOpenUpdateModal(true);
  };

  const handleCloseModal = () => {
    setSportSelected(null);
    setOpenViewModal(false);
    setOpenUpdateModal(false);
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchSports();
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {}, [sports]);

  /* eslint-disable react/prop-types */
  const SportCard = ({ sport }) => {
    // Validación defensiva para evitar errores
    if (!sport) return null;

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
              <Box>
                <Typography
                  variant="h6"
                  component="h2"
                  fontWeight="bold"
                  color="white"
                >
                  {sport.name || "Sin nombre"}
                </Typography>
                <Chip
                  label="Activo"
                  size="small"
                  sx={{
                    backgroundColor: colors.greenAccent[500],
                    color: "white",
                    fontWeight: "bold",
                  }}
                />
              </Box>
            </Box>

            <Box display="flex" alignItems="center" mb={2}>
              <AttachMoneyIcon
                sx={{ color: colors.orangeAccent[500], mr: 1, fontSize: 18 }}
              />
              <Typography variant="body2" color="rgba(255,255,255,0.9)">
                ${sport.monthlyFee || "0"} / mes
              </Typography>
            </Box>

            {sport.description && (
              <Box display="flex" alignItems="flex-start" mb={1}>
                <DescriptionIcon
                  sx={{
                    color: colors.orangeAccent[500],
                    mr: 1,
                    fontSize: 18,
                    mt: 0.2,
                  }}
                />
                <Typography
                  variant="body2"
                  color="rgba(255,255,255,0.8)"
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {sport.description}
                </Typography>
              </Box>
            )}
          </CardContent>

          <CardActions sx={{ p: 2, pt: 0 }}>
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
        title="Disciplinas"
        subtitle="Gestión de deportes y disciplinas del gimnasio"
      ></Header>

      <Box mb={3}>
        <Tooltip title="Agregar nueva disciplina" placement="top">
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenAddModal(true)}
            sx={{
              backgroundColor: colors.orangeAccent[500],
              "&:hover": { backgroundColor: colors.orangeAccent[600] },
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: "bold",
            }}
          >
            Agregar Nueva Disciplina
          </Button>
        </Tooltip>
      </Box>

      <AddSportModal
        openModal={openAddModal}
        setOpenModal={setOpenAddModal}
        fetchSports={fetchSports}
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
            {sports && sports.length > 0 ? (
              sports
                .filter((sport) => sport && sport.id) // Filtrar deportes válidos
                .map((sport) => <SportCard key={sport.id} sport={sport} />)
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
