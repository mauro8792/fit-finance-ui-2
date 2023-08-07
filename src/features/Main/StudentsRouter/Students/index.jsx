import  { useState, useEffect } from 'react';

const Students = () => {
  const [students, setStudents] = useState([]);

  // Simulación de datos de estudiantes (puedes reemplazar esto con tu lógica para obtener los datos de la API o la base de datos)
  const mockStudentsData = [
    { id: 1, name: 'Juan Perez', age: 25, sport: 'Fútbol' },
    { id: 2, name: 'Ana López', age: 22, sport: 'Natación' },
    { id: 3, name: 'Carlos Gómez', age: 20, sport: 'Baloncesto' },
  ];

  useEffect(() => {
    // Aquí podrías hacer una llamada a la API o a la base de datos para obtener los datos reales de estudiantes
    // En este ejemplo, simplemente utilizamos los datos simulados mockStudentsData
    setStudents(mockStudentsData);
  }, []);

  return (
    <div>
      <h2>Lista de Estudiantes</h2>
      <ul>
        {students.map((student) => (
          <li key={student.id}>
            <strong>Nombre:</strong> {student.name}, <strong>Edad:</strong> {student.age}, <strong>Deporte:</strong> {student.sport}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Students;
