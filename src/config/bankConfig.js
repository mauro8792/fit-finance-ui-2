// Configuración de datos bancarios para transferencias
export const BANK_CONFIG = {
  // 🔧 CONFIGURÁ AQUÍ TUS DATOS REALES DE MERCADOPAGO 🔧
  alias: "mauro.yini.mp", // ⚠️ REEMPLAZAR con tu alias real de MercadoPago
  cbu: "", // Opcional: tu CBU (se puede dejar vacío)
  accountHolder: "GYM FIT FINANCE", // Nombre que aparecerá como titular
  bankName: "MercadoPago", // Nombre del banco/servicio

  // Instrucciones para el usuario
  instructions:
    "Transferí con tu alias y el pago se acreditará automáticamente",
};

export default BANK_CONFIG;
