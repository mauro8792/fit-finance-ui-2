import { LockOutlined as LockIcon } from "@mui/icons-material";
import { Box, Grid, Typography, useMediaQuery } from "@mui/material";
import PropTypes from "prop-types";

export const AuthLayout = ({ children }) => {
  const isMobile = useMediaQuery("(max-width:768px)");

  // ========== VERSIÓN MOBILE ==========
  if (isMobile) {
    return (
      <Grid
        container
        spacing={0}
        direction="column"
        alignItems="center"
        justifyContent="center"
        sx={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #2c2c2c 100%)",
          padding: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 4,
            animation: "fadeInDown 0.6s ease-out",
          }}
        >
          <Box
            component="img"
            src="/WHITE.png"
            alt="Logo"
            sx={{
              width: 150,
              height: 150,
              mb: 3,
              filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.5))",
              transition: "transform 0.3s ease",
              "&:hover": { transform: "scale(1.05)" },
            }}
          />
          <Typography
            variant="h4"
            sx={{
              color: "#fff",
              fontWeight: 800,
              textShadow: "0 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            FIT MANAGER
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "rgba(255,255,255,0.7)",
              textAlign: "center",
              mt: 0.5,
            }}
          >
            Gestiona tu gimnasio profesionalmente
          </Typography>
        </Box>

        <Grid
          item
          sx={{
            width: "90%",
            maxWidth: 400,
            backgroundColor: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(15px)",
            padding: 3,
            borderRadius: 3,
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow:
              "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
            animation: "fadeInUp 0.6s ease-out",
          }}
        >
          {children}
        </Grid>

        <style>{`
          @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </Grid>
    );
  }

  // ========== VERSIÓN DESKTOP - DISEÑO UNIFICADO ==========
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Efectos de fondo sutiles */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(ellipse at 30% 20%, rgba(255,152,0,0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 80%, rgba(255,215,0,0.05) 0%, transparent 50%)
          `,
          pointerEvents: "none",
        }}
      />

      {/* Contenedor principal - Card grande */}
      <Box
        sx={{
          display: "flex",
          width: "90%",
          maxWidth: 1100,
          minHeight: 600,
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: "0 25px 80px rgba(0,0,0,0.5)",
          border: "1px solid rgba(255,255,255,0.05)",
          animation: "fadeIn 0.8s ease-out",
        }}
      >
        {/* LADO IZQUIERDO - Branding */}
        <Box
          sx={{
            flex: 1,
            background: "linear-gradient(180deg, #111 0%, #0a0a0a 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 6,
            position: "relative",
            borderRight: "1px solid rgba(255,152,0,0.1)",
          }}
        >
          {/* Acento superior naranja */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background:
                "linear-gradient(90deg, transparent, #ff9800, #ffd700, #ff9800, transparent)",
            }}
          />

          {/* Logo - usando el logo completo horizontal */}
          <Box
            component="img"
            src="/WHITE.png"
            alt="BRACAMP Logo"
            sx={{
              maxWidth: 280,
              height: "auto",
              mb: 5,
              filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.5))",
              transition: "all 0.4s ease",
              "&:hover": {
                transform: "scale(1.03)",
                filter: "drop-shadow(0 12px 28px rgba(255,152,0,0.15))",
              },
            }}
          />

          <Typography
            variant="h3"
            sx={{
              color: "#fff",
              fontWeight: 800,
              letterSpacing: 3,
              textAlign: "center",
              mb: 1,
            }}
          >
            FIT MANAGER
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "rgba(255,255,255,0.4)",
              fontWeight: 300,
              letterSpacing: 6,
              textTransform: "uppercase",
              fontSize: 12,
              mb: 5,
            }}
          >
            Sistema de Gestión
          </Typography>

          {/* Features */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {["📋 Rutinas", "🥗 Nutrición", "📈 Progreso", "🏃 Cardio"].map(
              (item, i) => (
                <Box
                  key={item}
                  sx={{
                    px: 2,
                    py: 0.8,
                    borderRadius: 2,
                    border: "1px solid rgba(255,152,0,0.2)",
                    background: "rgba(255,152,0,0.03)",
                    animation: `fadeInUp 0.5s ease-out ${0.3 + i * 0.1}s both`,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: "rgba(255,255,255,0.6)", fontWeight: 500 }}
                  >
                    {item}
                  </Typography>
                </Box>
              )
            )}
          </Box>

          {/* Footer */}
          <Typography
            sx={{
              position: "absolute",
              bottom: 20,
              color: "rgba(255,255,255,0.2)",
              fontSize: 11,
            }}
          >
            © 2025 BRACAMP Bodybuilding
          </Typography>
        </Box>

        {/* LADO DERECHO - Formulario */}
        <Box
          sx={{
            width: 440,
            background: "linear-gradient(180deg, #111 0%, #0a0a0a 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 5,
            position: "relative",
          }}
        >
          {/* Acento superior */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background:
                "linear-gradient(90deg, transparent, #ff9800, #ffd700, #ff9800, transparent)",
            }}
          />

          <Box sx={{ width: "100%", maxWidth: 340 }}>
            {/* Ícono de candado */}
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <Box
                sx={{
                  width: 70,
                  height: 70,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, rgba(255,152,0,0.15) 0%, rgba(255,152,0,0.05) 100%)",
                  border: "2px solid rgba(255,152,0,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto",
                  mb: 2.5,
                  animation: "pulse 2s ease-in-out infinite",
                }}
              >
                <LockIcon sx={{ fontSize: 32, color: "#ff9800" }} />
              </Box>

              <Typography
                variant="h5"
                sx={{
                  color: "#fff",
                  fontWeight: 700,
                  mb: 0.5,
                }}
              >
                Bienvenido
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "rgba(255,255,255,0.4)",
                }}
              >
                Ingresá tus credenciales para continuar
              </Typography>
            </Box>

            {/* Formulario */}
            {children}

            {/* Divider decorativo */}
            <Box sx={{ display: "flex", alignItems: "center", my: 3 }}>
              <Box
                sx={{
                  flex: 1,
                  height: 1,
                  background: "rgba(255,255,255,0.08)",
                }}
              />
              <Typography
                sx={{ px: 2, color: "rgba(255,255,255,0.2)", fontSize: 11 }}
              >
                BRACAMP
              </Typography>
              <Box
                sx={{
                  flex: 1,
                  height: 1,
                  background: "rgba(255,255,255,0.08)",
                }}
              />
            </Box>

            {/* Footer */}
            <Typography
              variant="caption"
              sx={{
                display: "block",
                textAlign: "center",
                color: "rgba(255,255,255,0.25)",
                lineHeight: 1.6,
              }}
            >
              ¿Problemas para acceder?
              <br />
              Contactá a tu entrenador
            </Typography>
          </Box>
        </Box>
      </Box>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,152,0,0.2); } 
          50% { box-shadow: 0 0 0 8px rgba(255,152,0,0); } 
        }
      `}</style>
    </Box>
  );
};

AuthLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
