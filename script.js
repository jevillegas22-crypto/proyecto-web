// Espera a que todo el HTML se cargue antes de ejecutar la logica
document.addEventListener("DOMContentLoaded", () => {
  // ARCHIVO REGISTRO (index.html)
  const registroForm = document.getElementById("registroForm"); 
  if (registroForm) {
    registroForm.addEventListener("submit", async (e) => {
      e.preventDefault(); // Detiene la recarga automatica de la pagina 
      // INPUT DE ARCHIVO REGISTROS 
      const nombre = document.getElementById("nombre").value.trim(); //value extrae la ifno de la casilla .trim() Omite los espacios si el usuaro lo presiona por error
      const correo = document.getElementById("correo").value.trim();
      const password = document.getElementById("password").value.trim();
      const confirmPassword = document.getElementById("confirmPassword").value.trim();
      const mensajeError = document.getElementById("mensajeError");
      // VALIDA QUE NO QUEDEN CAMPOS VACIOS 
      if (!nombre || !correo || !password || !confirmPassword) {
        alert("Por favor, llena todos los campos obligatorios.");
        return;
      }
      // VALIDA QUE LA CONTRASEÑA Y LA CONFIRMACION  DE LA CONTRASEÑA COINCIDAN
      if (password !== confirmPassword) {
        mensajeError.textContent = "Las contraseñas no coinciden. Inténtalo de nuevo.";
        return;
      }
      // PIDE QUE LA CONTRASEÑA SEA DE MINIMO 8 CARACTEREES
      if (password.length < 8) {
        mensajeError.textContent = "La contraseña debe tener al menos 8 caracteres.";
        //alert("Correo o contraseña incorrectos. Inténtalo de nuevo.");
        return;
      }
      // ENVIAR INFORMACION AL BACKEND
      try {
        // DIRECCION DE API PARA REGISTRO 
        const respuesta = await fetch("http://127.0.0.1:8000/api/v1/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          // ENVIA LOS DATOS DEL FORMULARIO EN FORMATO JSON
          body: JSON.stringify({
            name: nombre,
            email: correo,
            password: password,
            password_confirmation: confirmPassword
          })
        });
        const data = await respuesta.json();
        if (respuesta.ok) {
          if (data.token) {
            localStorage.setItem("authToken", data.token);
          }
          alert("¡Registro exitoso! Redirigiendo a la pantalla principal...");
          window.location.href = "pantallaPrincipal.html"; 
        } else {
          // LA API DEVUELVE MENSAJE DE ERROR SI FALLA EL REGISTRO
          mensajeError.textContent = data.message || "Error al registrar usuario.";
        }
      } catch (error) {
        console.error("Error de conexión:", error);
        mensajeError.textContent = "No se pudo conectar con el servidor.";
      }
    });
  }
  // ARCHIVO DE LOGIN (login.html)
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      // INPUT DE ARCHIVO LOGIN 
      const correo = document.getElementById("loginCorreo").value.trim();
      const password = document.getElementById("loginPassword").value.trim();
      const mensajeError = document.getElementById("mensajeError");
      // ENVIAMOS CREDENCIALES AL BACKEND 
      try {
        const respuesta = await fetch("http://127.0.0.1:8000/api/v1/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            email: correo,
            password: password
          })
        });
        const data = await respuesta.json();
        if (respuesta.ok) {
          if (data.token) {
            localStorage.setItem("authToken", data.token); // Da autorizacion para dar alta al instructor
          }
          // AQIUI SE PONE LA REDIRECCION A LA PAGINA PRINCIPAL
          window.location.href = "pantallaPrincipal.html";
        } else {
          mensajeError.textContent = data.message || "Correo o contraseña incorrectos.";
        }
      } catch (error) {
        console.error("Error de conexión:", error);
        mensajeError.textContent = "No se pudo conectar con el servidor.";
      }
    });
  }

   // ARCHIVO DE ALTA DE INSTRUCTOR (alta-instructor.html)
  const altaInstructorForm = document.getElementById("altaInstructorForm");
  if (altaInstructorForm) {
    altaInstructorForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const token = localStorage.getItem("authToken");

      if (!token) {
        alert("Debes iniciar sesion para darte de alta como un instructor.");
        window.location.href = "login.html";
        return;
      }
      // INPUT DE ARCHIVO ALTA DE INSTRUCTOR 
      const headline = document.getElementById("headline").value.trim();
      const specialty = document.getElementById("specialty").value.trim();
      const biography = document.getElementById("biography").value.trim();
      const fotoInput = document.getElementById("fotografia");  
      try {
        const respuesta = await fetch("http://127.0.0.1:8000/api/v1/instructors", {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            headline: headline,
            specialty: specialty,
            biography: biography
          })
        });
        const data = await respuesta.json();
        if (!respuesta.ok) {
          alert(data.message || "Error al registrar instructor.");
          return;
        }

          if (data.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
          }
          if (fotoInput.files.length > 0) {
            const formData = new FormData();
            formData.append("photo", fotoInput.files[0]);
            const photoResponse = await fetch("http://localhost:8000/api/v1/instructors/me/photo", {
              method: "POST",
              headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: formData
          });
          if (!photoResponse.ok) {
            const photoError = await photoResponse.json();
            alert(`Perfil creado, pero hubo un detalle con la foto: ${photoError.message}`);
          }
          }
          alert("Felicidades, tu perfil de instructor ha sido creado exitosamente.");
          window.location.href="pantallaPrincipalInstructor.html"
      } catch (error) {
        console.error("Error de red:", error);
        alert("No se pudo conectar con el servidor.");
      }
    });
  }

  // CAPTURAMOS EL FORMULARIO 
  const crearCursoForm = document.getElementById('crearCursoForm');

  if (crearCursoForm) {
    crearCursoForm.addEventListener('submit', async (e) => {
      e.preventDefault(); // Evita que la pagina se recargue

      //Obtenemos el token de autenticación
      const token = localStorage.getItem('authToken'); 

      if (!token) {
        alert('Sesión no válida o expirada. Por favor, inicia sesión.');
        window.location.href = 'login.html';
        return;
      }

      // Capturamos los valores ingresados en el formulario
      const title = document.getElementById('titulo').value.trim();
      const category_id = document.getElementById('categoria').value;
      const level = document.getElementById('nivel').value;
      const description = document.getElementById('descripcion').value.trim();

      // bjeto JSON que requiere la API
      const datosCurso = {
        title: title,
        category_id: parseInt(category_id), // category_id PARA QUE SEA UN ENTERO
        level: level,
        description: description
      };

      try {
        // Hacemos la peticion POST a la API
        const response = await fetch('http://127.0.0.1:8000/api/v1/courses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(datosCurso)
        });

        const data = await response.json();

        //  respuesta
        if (response.ok) {
          alert('¡Curso creado exitosamente!');
          window.location.href = 'misCursos.html';
        } else {
          // Si la API devuelve errores de validacion (por ejemplo, error 422)
          if (data.errors) {
            const mensajes = Object.values(data.errors).flat().join('\n');
            alert(`Error de validación:\n${mensajes}`);
          } else {
            alert(data.message || 'No se pudo crear el curso.');
          }
       }
      } catch (error) {
        console.error('Error al conectar con la API:', error);
        alert('Ocurrio error al intentar conectar con el servidor.');
      }
    });
  }


  // ARCHIVO MIS CURSOS (misCursos.html)
  const gridCursos = document.getElementById("grid-cursos");
  const estadoVacio = document.getElementById("estado-vacio");

  if (gridCursos && estadoVacio) {
    async function obtenerCursos() {
      const token = localStorage.getItem("authToken");
      try {
        const respuesta = await fetch("http://127.0.0.1:8000/api/v1/courses/me", {
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });

        const data = await respuesta.json();

        if (respuesta.ok) {
          const cursos = data.courses || data;

          if (Array.isArray(cursos) && cursos.length > 0) {
            estadoVacio.classList.add("d-none");
            gridCursos.classList.remove("d-none");

            gridCursos.innerHTML = cursos.map(curso => `
              <div class="card-curso">
                <img src="${curso.cover_url || 'https://via.placeholder.com/300x169?text=Sin+Portada'}" style="width:100%; aspect-ratio:16/9; object-fit:cover;">
                <h3>${curso.title}</h3>
                <p>${curso.description}</p>
                <span class="badge">${curso.level}</span>
                <span class="badge-estado">${curso.status || 'draft'}</span>
              </div>
            `).join('');
          } else {
            estadoVacio.classList.remove("d-none");
            gridCursos.classList.add("d-none");
          }
        }
      } catch (error) {
        console.error("Error al obtener los cursos:", error);
      }
    }

    obtenerCursos();
  }
});
