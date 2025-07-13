import React from 'react';
import { Typography, Box, useTheme } from "@mui/material";
import { tokens } from "../theme";

const Header = ({ title, subtitle }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <Box mb={{ xs: "10px", sm: "15px" }}>
      <Typography
        variant="h4"
        color={colors.grey[100]}
        fontWeight="bold"
        sx={{ 
          m: "0 0 2px 0",
          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
        }}
      >
        {title}
      </Typography>
      <Typography 
        variant="h6" 
        color={colors.greenAccent[400]}
        sx={{
          fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' }
        }}
      >
        {subtitle}
      </Typography>
    </Box>
  );
};

export default Header;