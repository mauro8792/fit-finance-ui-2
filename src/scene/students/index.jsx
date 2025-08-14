import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EditIcon from "@mui/icons-material/Edit";
import InfoIcon from "@mui/icons-material/Info";
import PersonIcon from "@mui/icons-material/Person";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PhoneIcon from "@mui/icons-material/Phone";
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
import { useEffect, useState, useCallback } from "react";

import Header from "../../components/Header";
import { useSportsStore, useStudentsStore } from "../../hooks";
import { tokens } from "../../theme";
import { AddStudentModal } from "./AddStudent";
import { UpdateStudentModal } from "./UpdateStudent/UpdateStudentModal";
import { ViewStudentModal } from "./ViewStudent";

export const Students = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const { findAll, students, update } = useStudentsStore();
  const { findAllSports, sports } = useSportsStore();

  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);

  const fetchStudents = useCallback(async () => {
    try {
      await findAll();
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error al obtener los estudiantes:", error);
    }
  }, [findAll]);

  const fetchSports = useCallback(async () => {
    try {
      await findAllSports();
    } catch (error) {
      console.error("Error al obtener los deportes:", error);
    }
  }, [findAllSports]);

  const handleSaveChanges = useCallback(async (updatedStudent) => {
    await update(updatedStudent);
    setLoading(true);
    await fetchStudents();
  }, [update, fetchStudents]);

  const handleOpenViewModal = useCallback((user) => {
    setSelectedUser(user);
    setOpenViewModal(true);
  }, []);

  const handleOpenUpdateModal = useCallback((user) => {
    setSelectedUser(user);
    setOpenUpdateModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedUser(null);
    setOpenViewModal(false);
    setOpenUpdateModal(false);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      await fetchStudents();
      await fetchSports();
    };
    loadData();
  }, [fetchStudents, fetchSports]);

  /* eslint-disable react/prop-types */
  const StudentCard = ({ student }) => (
    <Grid item xs={12} sm={6} md={4} lg={3}>
      <Card
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRadius: "12px",
          boxShadow: 3,
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: 6,
          },
          background: `linear-gradient(135deg, ${colors.primary[400]}, ${colors.primary[600]})`,
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
              <PersonIcon />
            </Avatar>
            <Box>
              <Typography
                variant="h6"
                component="h2"
                fontWeight="bold"
                color={colors.grey[100]}
              >
                {student.firstName} {student.lastName}
              </Typography>
              <Chip
                label={student.isActive ? "Activo" : "Inactivo"}
                size="small"
                sx={{
                  backgroundColor: student.isActive
                    ? colors.greenAccent[500]
                    : colors.redAccent[500],
                  color: "white",
                  fontWeight: "bold",
                }}
              />
            </Box>
          </Box>

          <Box display="flex" alignItems="center" mb={1}>
            <SportsIcon
              sx={{ color: colors.orangeAccent[500], mr: 1, fontSize: 18 }}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="body2" color={colors.grey[200]}>
                {student.sport?.name || student.sportName || "Sin deporte"}
              </Typography>
              {student.sportPlan ? (
                <Typography variant="caption" color={colors.grey[300]} sx={{ fontStyle: 'italic' }}>
                  Plan: {student.sportPlan.name} - ${student.sportPlan.monthlyFee}/mes
                </Typography>
              ) : student.sport ? (
                <Typography variant="caption" color={colors.grey[300]} sx={{ fontStyle: 'italic' }}>
                  Precio base: ${student.sport.monthlyFee}/mes
                </Typography>
              ) : null}
            </Box>
          </Box>

          <Box display="flex" alignItems="center" mb={1}>
            <CalendarTodayIcon
              sx={{ color: colors.orangeAccent[500], mr: 1, fontSize: 18 }}
            />
            <Typography variant="body2" color={colors.grey[200]}>
              Inicio: {student.startDate}
            </Typography>
          </Box>

          {student.phone && (
            <Box display="flex" alignItems="center" mb={1}>
              <PhoneIcon
                sx={{ color: colors.orangeAccent[500], mr: 1, fontSize: 18 }}
              />
              <Typography variant="body2" color={colors.grey[200]}>
                {student.phone}
              </Typography>
            </Box>
          )}
        </CardContent>

        <CardActions sx={{ p: 2, pt: 0 }}>
          <Button
            size="small"
            startIcon={<InfoIcon />}
            onClick={() => handleOpenViewModal(student)}
            sx={{
              color: colors.blueAccent[300],
              "&:hover": { backgroundColor: colors.blueAccent[800] },
            }}
          >
            Ver
          </Button>
          <Button
            size="small"
            startIcon={<EditIcon />}
            onClick={() => handleOpenUpdateModal(student)}
            sx={{
              color: colors.orangeAccent[300],
              "&:hover": { backgroundColor: colors.orangeAccent[800] },
            }}
          >
            Editar
          </Button>
        </CardActions>
      </Card>
    </Grid>
  );

  return (
    <Box m="20px">
      <Header
        title="Alumnos"
        subtitle="Gestión de estudiantes del gimnasio"
      ></Header>

      <Box mb={3}>
        <Tooltip title="Agregar nuevo alumno" placement="top">
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => setOpenAddModal(true)}
            sx={{
              backgroundColor: colors.orangeAccent[500],
              "&:hover": { backgroundColor: colors.orangeAccent[600] },
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: "bold",
            }}
          >
            Agregar Nuevo Alumno
          </Button>
        </Tooltip>
      </Box>

      <AddStudentModal
        openModal={openAddModal}
        setOpenModal={setOpenAddModal}
        fetchStudents={fetchStudents}
        sports={sports}
      />

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
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {students.map((student) => (
            <StudentCard key={student.id} student={student} />
          ))}
          {students.length === 0 && (
            <Grid item xs={12}>
              <Box textAlign="center" py={8}>
                <PersonIcon
                  sx={{ fontSize: 80, color: colors.grey[500], mb: 2 }}
                />
                <Typography variant="h5" color={colors.grey[500]} gutterBottom>
                  No hay estudiantes registrados
                </Typography>
                <Typography variant="body1" color={colors.grey[600]}>
                  Comienza agregando tu primer alumno
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      )}

      {selectedUser && openUpdateModal && (
        <UpdateStudentModal
          setSelectedUser={setSelectedUser}
          setOpenModal={setOpenUpdateModal}
          openModal={openUpdateModal}
          selectedUser={selectedUser}
          onSaveChanges={handleSaveChanges}
          sports={sports}
        />
      )}

      {selectedUser && (
        <ViewStudentModal
          openModal={openViewModal}
          selectedUser={selectedUser}
          handleCloseModal={handleCloseModal}
        />
      )}
    </Box>
  );
};
