import { createSlice } from "@reduxjs/toolkit";

// Helpers para localStorage con userId
const getStoredActiveProfile = (userId) => {
  if (!userId) return null;
  try {
    return localStorage.getItem(`activeProfile_${userId}`) || null;
  } catch {
    return null;
  }
};

const saveActiveProfile = (userId, profile) => {
  if (!userId) return;
  try {
    localStorage.setItem(`activeProfile_${userId}`, profile);
  } catch (e) {
    console.warn('No se pudo guardar preferencia de perfil:', e);
  }
};

const clearStoredActiveProfile = (userId) => {
  if (!userId) return;
  try {
    localStorage.removeItem(`activeProfile_${userId}`);
  } catch (e) {
    // Ignorar
  }
};

export const authSlice = createSlice({
  name: "auth",
  initialState: {
    status: "checking", // 'authenticated','not-authenticated','checking','select-profile'
    user: {},
    student: null, // Información específica del estudiante si es tipo 'student'
    userType: null, // 'admin', 'student', 'coach'
    errorMessage: undefined,
    token: null,
    // ========== PERFIL DUAL ==========
    profiles: { coach: null, student: null }, // Perfiles disponibles
    hasMultipleProfiles: false, // ¿Tiene perfil dual?
    activeProfile: null, // 'coach' | 'student' | null - se carga después del login
  },
  reducers: {
    onChecking: (state) => {
      state.status = "checking";
      state.user = {};
      state.student = null;
      state.userType = null;
      state.errorMessage = undefined;
      state.profiles = { coach: null, student: null };
      state.hasMultipleProfiles = false;
      state.activeProfile = null;
    },
    onLogin: (state, { payload }) => {
      const userId = payload.id || payload.user?.id;
      
      console.log('🔐 onLogin - userId:', userId);
      console.log('🔐 onLogin - hasMultipleProfiles:', payload.hasMultipleProfiles);
      console.log('🔐 onLogin - profiles:', payload.profiles);
      
      state.user = payload.user || payload;
      state.student = payload.student || null;
      state.token = payload.token;
      state.errorMessage = undefined;
      
      // Datos de perfil dual
      state.profiles = payload.profiles || { coach: null, student: null };
      state.hasMultipleProfiles = payload.hasMultipleProfiles || false;
      
      // Recuperar activeProfile guardado para ESTE usuario
      const storedProfile = getStoredActiveProfile(userId);
      console.log('🔐 onLogin - storedProfile from localStorage:', storedProfile);
      
      // Check robusto: tiene perfil dual
      const hasDualProfile = payload.hasMultipleProfiles || 
        (payload.profiles?.coach && payload.profiles?.student);
      
      console.log('🔐 onLogin - hasDualProfile:', hasDualProfile);
      
      // Si tiene múltiples perfiles
      if (hasDualProfile) {
        if (storedProfile) {
          // Ya tiene perfil guardado para este usuario, usar ese
          console.log('🔐 onLogin - Usando perfil guardado:', storedProfile);
          state.activeProfile = storedProfile;
          state.status = "authenticated";
          state.userType = storedProfile;
          state.hasMultipleProfiles = true; // Asegurar que esté en true
          // Si el perfil activo es student, asegurar que student tenga datos
          if (storedProfile === 'student') {
            state.student = payload.profiles?.student || payload.student;
          }
        } else {
          // Primera vez - ir a pantalla de selección de perfil
          console.log('🔐 onLogin - Primera vez, mostrar selector');
          state.activeProfile = null;
          state.status = "select-profile";
          state.userType = null;
          state.hasMultipleProfiles = true;
        }
      } else {
        // Flujo normal sin perfil dual
        console.log('🔐 onLogin - Sin perfil dual, userType:', payload.userType);
        state.activeProfile = null;
        state.status = "authenticated";
        state.userType = payload.userType || "admin";
      }
    },
    onLogout: (state, { payload }) => {
      // Limpiar preferencia de perfil del usuario que hace logout
      const userId = state.user?.id;
      if (userId) {
        clearStoredActiveProfile(userId);
      }
      
      state.status = "not-authenticated";
      state.user = {};
      state.student = null;
      state.userType = null;
      state.token = null;
      state.errorMessage = payload;
      state.profiles = { coach: null, student: null };
      state.hasMultipleProfiles = false;
      state.activeProfile = null;
    },
    clearErrorMessage: (state) => {
      state.errorMessage = undefined;
    },
    updateStudentInfo: (state, { payload }) => {
      state.student = payload;
    },
    // ========== ACCIONES PARA PERFIL DUAL ==========
    selectProfile: (state, { payload }) => {
      const { profile } = payload;
      const userId = state.user?.id;
      
      console.log('🎯 selectProfile - profile:', profile, 'userId:', userId);
      
      state.activeProfile = profile;
      state.userType = profile;
      state.status = "authenticated";
      
      // Si selecciona student, cargar datos del student
      if (profile === 'student' && state.profiles.student) {
        state.student = state.profiles.student;
      }
      
      // SIEMPRE guardar el perfil seleccionado para este usuario
      if (userId) {
        saveActiveProfile(userId, profile);
        console.log('💾 Perfil guardado en localStorage:', `activeProfile_${userId}`, '=', profile);
      } else {
        console.warn('⚠️ No se pudo guardar perfil: userId es null');
      }
    },
    switchProfile: (state) => {
      // Alternar entre coach y student
      if (state.hasMultipleProfiles) {
        const userId = state.user?.id;
        const newProfile = state.activeProfile === 'coach' ? 'student' : 'coach';
        state.activeProfile = newProfile;
        state.userType = newProfile;
        
        // Actualizar student si cambia a student
        if (newProfile === 'student' && state.profiles.student) {
          state.student = state.profiles.student;
        }
        
        // Actualizar localStorage para este usuario
        if (userId) {
          saveActiveProfile(userId, newProfile);
        }
      }
    },
    clearActiveProfile: (state) => {
      const userId = state.user?.id;
      state.activeProfile = null;
      if (userId) {
        clearStoredActiveProfile(userId);
      }
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  onChecking,
  onLogin,
  onLogout,
  clearErrorMessage,
  updateStudentInfo,
  selectProfile,
  switchProfile,
  clearActiveProfile,
} = authSlice.actions;
