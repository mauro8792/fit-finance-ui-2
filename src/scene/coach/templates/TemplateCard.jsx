import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { useTheme } from '@mui/material';
import { tokens } from '../../../theme';
import { deleteTemplate, duplicateTemplate, getCategoryInfo } from '../../../api/templateApi';

const TemplateCard = ({ template, onAssign, onEdit, onDelete, onDuplicate }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [anchorEl, setAnchorEl] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [duplicating, setDuplicating] = useState(false);

  const categoryInfo = getCategoryInfo(template.templateCategory);

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteTemplate(template.id);
      setShowDeleteDialog(false);
      onDelete?.();
    } catch (err) {
      console.error('Error eliminando plantilla:', err);
      alert('Error al eliminar la plantilla');
    } finally {
      setDeleting(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      setDuplicating(true);
      handleMenuClose();
      await duplicateTemplate(template.id);
      onDuplicate?.();
    } catch (err) {
      console.error('Error duplicando plantilla:', err);
      alert('Error al duplicar la plantilla');
    } finally {
      setDuplicating(false);
    }
  };

  // Parsear tags
  const tags = template.templateTags 
    ? template.templateTags.split(',').map(t => t.trim()).filter(Boolean)
    : [];

  return (
    <>
      <Box
        sx={{
          background: colors.primary[400],
          borderRadius: 3,
          overflow: 'hidden',
          border: `1px solid ${colors.primary[300]}`,
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 8px 24px rgba(0,0,0,0.3)`,
            borderColor: categoryInfo.color,
          },
        }}
      >
        {/* Header con color de categoría */}
        <Box
          sx={{
            height: 4,
            background: `linear-gradient(90deg, ${categoryInfo.color} 0%, ${categoryInfo.color}88 100%)`,
          }}
        />

        {/* Contenido */}
        <Box sx={{ p: { xs: 2, md: 2.5 } }}>
          {/* Top row: categoría + menú */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
            <Chip
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <span>{categoryInfo.emoji}</span>
                  {categoryInfo.label}
                </Box>
              }
              size="small"
              sx={{
                backgroundColor: `${categoryInfo.color}22`,
                color: categoryInfo.color,
                fontWeight: 600,
                fontSize: 11,
              }}
            />
            
            <IconButton 
              size="small" 
              onClick={handleMenuOpen}
              sx={{ color: colors.grey[400] }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Nombre */}
          <Typography 
            variant="h6" 
            fontWeight={700} 
            color={colors.grey[100]}
            sx={{ mb: 0.5, lineHeight: 1.2, fontSize: { xs: 16, md: 18 } }}
          >
            {template.templateName || template.name}
          </Typography>

          {/* Descripción */}
          {template.templateDescription && (
            <Typography 
              variant="body2" 
              color={colors.grey[400]}
              sx={{ 
                mb: 1.5,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.4,
                fontSize: { xs: 12, md: 13 },
              }}
            >
              {template.templateDescription}
            </Typography>
          )}

          {/* Stats - más compactos */}
          <Box sx={{ display: 'flex', gap: { xs: 1.5, md: 2 }, mb: 1.5, flexWrap: 'wrap' }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 0.5,
              background: `${colors.greenAccent[600]}15`,
              px: 1,
              py: 0.3,
              borderRadius: 1,
            }}>
              <CalendarTodayIcon sx={{ fontSize: 14, color: colors.greenAccent[500] }} />
              <Typography variant="body2" color={colors.grey[300]} fontSize={12}>
                {template.microcyclesCount || 0} semanas
              </Typography>
            </Box>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 0.5,
              background: `${colors.blueAccent[500]}15`,
              px: 1,
              py: 0.3,
              borderRadius: 1,
            }}>
              <FitnessCenterIcon sx={{ fontSize: 14, color: colors.blueAccent[400] }} />
              <Typography variant="body2" color={colors.grey[300]} fontSize={12}>
                {template.totalExercises || 0} ejercicios
              </Typography>
            </Box>
          </Box>

          {/* Tags - más compactos */}
          {tags.length > 0 && (
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1.5 }}>
              {tags.slice(0, 3).map((tag, idx) => (
                <Chip
                  key={idx}
                  label={`#${tag}`}
                  size="small"
                  sx={{
                    fontSize: 10,
                    height: 18,
                    backgroundColor: colors.primary[500],
                    color: colors.grey[400],
                  }}
                />
              ))}
              {tags.length > 3 && (
                <Chip
                  label={`+${tags.length - 3}`}
                  size="small"
                  sx={{
                    fontSize: 10,
                    height: 18,
                    backgroundColor: colors.primary[500],
                    color: colors.grey[400],
                  }}
                />
              )}
            </Box>
          )}

          {/* Botones de acción - más compactos */}
          <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<PersonAddIcon sx={{ fontSize: '16px !important' }} />}
              onClick={onAssign}
              fullWidth
              sx={{
                background: `linear-gradient(135deg, ${colors.greenAccent[600]} 0%, ${colors.greenAccent[700]} 100%)`,
                fontWeight: 600,
                py: 0.8,
                fontSize: 12,
                '&:hover': {
                  background: `linear-gradient(135deg, ${colors.greenAccent[500]} 0%, ${colors.greenAccent[600]} 100%)`,
                },
              }}
            >
              Asignar
            </Button>
            <Tooltip title="Editar plantilla">
              <Button
                variant="outlined"
                size="small"
                onClick={onEdit}
                sx={{
                  minWidth: 38,
                  px: 1,
                  borderColor: colors.grey[600],
                  color: colors.grey[300],
                  '&:hover': {
                    borderColor: colors.blueAccent[400],
                    color: colors.blueAccent[400],
                    background: `${colors.blueAccent[400]}15`,
                  },
                }}
              >
                <EditIcon sx={{ fontSize: 18 }} />
              </Button>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* Menú contextual */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            backgroundColor: colors.primary[400],
            border: `1px solid ${colors.primary[300]}`,
          },
        }}
      >
        <MenuItem onClick={() => { handleMenuClose(); onEdit?.(); }}>
          <ListItemIcon>
            <EditIcon fontSize="small" sx={{ color: colors.grey[300] }} />
          </ListItemIcon>
          <ListItemText>Editar</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDuplicate} disabled={duplicating}>
          <ListItemIcon>
            {duplicating ? (
              <CircularProgress size={18} />
            ) : (
              <ContentCopyIcon fontSize="small" sx={{ color: colors.grey[300] }} />
            )}
          </ListItemIcon>
          <ListItemText>Duplicar</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => { handleMenuClose(); setShowDeleteDialog(true); }}
          sx={{ color: colors.redAccent[400] }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" sx={{ color: colors.redAccent[400] }} />
          </ListItemIcon>
          <ListItemText>Eliminar</ListItemText>
        </MenuItem>
      </Menu>

      {/* Dialog de confirmación de eliminación */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        PaperProps={{
          sx: {
            backgroundColor: colors.primary[400],
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ color: colors.grey[100] }}>
          ¿Eliminar plantilla?
        </DialogTitle>
        <DialogContent>
          <Typography color={colors.grey[300]}>
            Esta acción eliminará permanentemente la plantilla "{template.templateName || template.name}".
            <br /><br />
            <strong>Nota:</strong> Las rutinas ya asignadas a alumnos NO se verán afectadas.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={() => setShowDeleteDialog(false)}
            sx={{ color: colors.grey[400] }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            disabled={deleting}
            sx={{
              backgroundColor: colors.redAccent[600],
              '&:hover': { backgroundColor: colors.redAccent[700] },
            }}
          >
            {deleting ? <CircularProgress size={20} /> : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TemplateCard;

