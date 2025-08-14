// Script de prueba para verificar la API de deportes

const API_URL = "http://localhost:3000/api";

async function testSportsAPI() {
  try {
    console.log("🔍 Probando API de deportes...");

    // Test 1: Sin parámetros (comportamiento actual)
    const response1 = await fetch(`${API_URL}/sports`);
    const data1 = await response1.json();
    console.log("📊 Sin parámetros:", data1.sports.length, "deportes");

    // Test 2: Con límite alto
    const response2 = await fetch(`${API_URL}/sports?limit=100`);
    const data2 = await response2.json();
    console.log("📊 Con limit=100:", data2.sports.length, "deportes");

    // Test 3: Mostrar los últimos IDs para verificar orden
    console.log("🆔 Últimos IDs:");
    data2.sports.slice(0, 5).forEach((sport) => {
      console.log(`- ID: ${sport.id}, Nombre: ${sport.name}`);
    });

    // Test 4: Buscar deportes específicos mencionados por el usuario
    const searchNames = [
      "Calistenia",
      "Aqua Aeróbicos",
      "Boxeo2",
      "boxeoEcample",
      "Leandro",
      "funcional boxeo",
    ];
    console.log("🔍 Buscando deportes específicos:");
    searchNames.forEach((name) => {
      const found = data2.sports.find((sport) => sport.name === name);
      console.log(
        `- ${name}: ${
          found ? "✅ Encontrado (ID: " + found.id + ")" : "❌ No encontrado"
        }`
      );
    });
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Ejecutar si se usa desde Node.js
if (typeof module !== "undefined" && module.exports) {
  testSportsAPI();
}

// Para uso en browser console
console.log("Ejecuta: testSportsAPI()");
