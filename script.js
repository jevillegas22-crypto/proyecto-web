// Espera a que todo el HTML se cargue antes de ejecutar la logica
document.addEventListener("DOMContentLoaded", () => {
  // ARCHIVO REGISTRO (index.html)
  const registroForm = document.getElementById("registroForm"); 
  if (registroForm) {
    registroForm.addEventListener("submit", async (e) => {
      e.preventDefault(); // Detiene la recarga automática de la página 
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
            localStorage.setItem("authToken", data.token);
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

  // CAPTURAMOS EL FORMULARIO (crearCurso.html)
  const crearCursoForm = document.getElementById('crearCursoForm');
  const btnAgregarModulo = document.getElementById('btnAgregarModulo');
  const contenedorModulos = document.getElementById('contenedor-modulos');
  let contadorModulo = 0;
  //  auxiliar para agregar un bloque de modulo al DOM
  function agregarBloqueModulo(titulo = '', tipo = 'text', tituloContenido = '', detalleContenido = '') {
    contadorModulo++;

    const divModulo = document.createElement('div');
    divModulo.className = 'bloque-modulo';
    divModulo.style.border = '1px solid #ccc';
    divModulo.style.padding = '15px';
    divModulo.style.borderRadius = '8px';
    divModulo.style.marginBottom = '15px';
    divModulo.style.backgroundColor = '#f9f9f9';

    divModulo.innerHTML = `
      <h4 style="margin-top:0;">Modulo ${contadorModulo}</h4>
      
      <div class="form-group">
        <label>Título del Módulo:</label>
        <input type="text" class="form-control titulo-modulo" value="${titulo}" placeholder="Ej. Introducción al curso" required>
      </div>

      <h5 style="margin-bottom:5px;">Contenido del Módulo</h5>
      
      <div class="form-group">
        <label>Tipo de Contenido:</label>
        <select class="form-control tipo-contenido">
          <option value="text" ${tipo === 'text' ? 'selected' : ''}>Texto</option>
          <option value="url" ${tipo === 'url' ? 'selected' : ''}>Enlace / URL</option>
          <option value="file" ${tipo === 'file' ? 'selected' : ''}>Archivo Descargable</option>
        </select>
      </div>

      <div class="form-group">
        <label>Título del Contenido:</label>
        <input type="text" class="form-control titulo-contenido" value="${tituloContenido}" placeholder="Ej. Lección 1" required>
      </div>

      <div class="form-group">
        <label>Detalle / URL / Archivo:</label>
        <input type="text" class="form-control detalle-contenido" value="${detalleContenido}" placeholder="Escribe el texto, pega la URL o nombre del archivo">
      </div>
    `;

    contenedorModulos.appendChild(divModulo);
  }

  //  boton "agregar modulo"
  if (btnAgregarModulo && contenedorModulos) {
    btnAgregarModulo.addEventListener('click', () => {
      agregarBloqueModulo();
    });
  }

  // verificar si viene un ID en la URL 
  if (crearCursoForm) {
    const urlParams = new URLSearchParams(window.location.search);
    const cursoId = urlParams.get('id');

    if (cursoId) {
      // Cambiar encabezado si existe
      const tituloPagina = document.querySelector('.card-header h2');
      if (tituloPagina) tituloPagina.textContent = 'EDITAR CURSO';

      const botonGuardar = crearCursoForm.querySelector('.btn-guardar');
      if (botonGuardar) botonGuardar.textContent = 'Actualizar Curso';

      // Cargar datos del curso a editar desde la API
      const token = localStorage.getItem('authToken');
      if (token) {
        fetch(`http://127.0.0.1:8000/api/v1/courses/${cursoId}`, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
        .then(res => res.json())
        .then(data => {
          const curso = data.course || data;
          if (curso) {
            document.getElementById('titulo').value = curso.title || '';
            document.getElementById('categoria').value = curso.category_id || '';
            document.getElementById('nivel').value = curso.level || '';
            document.getElementById('descripcion').value = curso.description || '';

            // Cargar los modulos existentes
            if (curso.modules && curso.modules.length > 0) {
              contenedorModulos.innerHTML = '';
              curso.modules.forEach(mod => {
                const primerContenido = (mod.contents && mod.contents.length > 0) ? mod.contents[0] : {};
                agregarBloqueModulo(
                  mod.title || '',
                  primerContenido.type || 'text',
                  primerContenido.title || '',
                  primerContenido.content || ''
                );
              });
            }
          }
        })
        .catch(err => console.error('Error al cargar datos del curso:', err));
      }
    }

    // guardar crear o actualizar)
    crearCursoForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('Sesion no valida.');
        window.location.href = 'login.html';
        return;
      }

      const bloques = document.querySelectorAll('.bloque-modulo');
      const modulos = [];

      bloques.forEach(bloque => {
        const tituloMod = bloque.querySelector('.titulo-modulo').value;
        const tipoCont = bloque.querySelector('.tipo-contenido').value;
        const tituloCont = bloque.querySelector('.titulo-contenido').value;
        const detalleCont = bloque.querySelector('.detalle-contenido').value;

        modulos.push({
          title: tituloMod,
          contents: [
            {
              type: tipoCont,
              title: tituloCont,
              content: detalleCont
            }
          ]
        });
      });

      const datosCurso = {
        title: document.getElementById('titulo').value.trim(),
        category_id: parseInt(document.getElementById('categoria').value),
        level: document.getElementById('nivel').value,
        description: document.getElementById('descripcion').value.trim(),
        modules: modulos
      };

      const esEdicion = Boolean(cursoId);
      const url = esEdicion 
        ? `http://127.0.0.1:8000/api/v1/courses/${cursoId}`
        : 'http://127.0.0.1:8000/api/v1/courses';
      const metodo = esEdicion ? 'PATCH' : 'POST';

      try {
        const response = await fetch(url, {
          method: metodo,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(datosCurso)
        });

        const data = await response.json();

        if (response.ok) {
          alert(esEdicion ? '¡Curso actualizado exitosamente!' : '¡Curso y modulos creados exitosamente!');
          window.location.href = 'misCursos.html';
        } else {
          if (data.errors) {
            const mensajes = Object.values(data.errors).flat().join('\n');
            alert(`Error de validacion:\n${mensajes}`);
          } else {
            alert(data.message || 'No se pudo guardar el curso.');
          }
        }
      } catch (error) {
        console.error('Error al conectar con la API:', error);
        alert('Ocurrio un error al intentar conectar con el servidor.');
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
          const cursosBasicos = data.courses || data;

const cursos = await Promise.all(
  cursosBasicos.map(async (curso) => {
    try {
      const resDetalle = await fetch(`http://127.0.0.1:8000/api/v1/courses/${curso.id}`, {
          headers: {
            "Accept": "application/json",
            "Authorization": "Bearer " + token
          }
        });
      if (resDetalle.ok) {
        const dataDetalle = await resDetalle.json();
        return dataDetalle.course || curso;
      }
    } catch (e) {
      console.error(e);
    }
    return curso;
  })
);
          if (Array.isArray(cursos) && cursos.length > 0) {
            estadoVacio.classList.add("d-none");
            gridCursos.classList.remove("d-none");

           gridCursos.innerHTML = `
              <div style="width: 100%; text-align: right; margin-bottom: 20px;">
                <a href="crearCurso.html" style="background-color: #28a745; color: white; padding: 10px 18px; border-radius: 5px; text-decoration: none; font-weight: bold; display: inline-block;">
                  + Crear Nuevo Curso
                </a>
              </div>
            ` + cursos.map(curso => {
              // Construimos el HTML de los módulos si existen
              const modulos = curso.modules || curso.modulos || [];
              const htmlModulos = (modulos.length > 0)
                ? modulos.map(mod => {
                    const contenidos = mod.contents || mod.contenidos || [];
                    return `
                      <div style="margin-top: 10px; padding: 8px; background: #f0f0f0; border-radius: 4px; text-align: left;">
                        <strong>Módulo: ${mod.title || mod.titulo}</strong>
                        ${
                          (contenidos.length > 0)
                            ? contenidos.map(c => `
                            <p style="margin: 4px 0 0 10px; font-size: 0.85rem;">• [${c.type || c.tipo}] ${c.title || c.titulo}: ${c.content || c.detalle}</p>
                            `).join('')
                            : '<p style="margin-left: 10px; font-size: 0.8rem; color: #666;">Sin contenido</p>'
                        }
                      </div>
                    `;
                  }).join('')
                : '<p style="color: #777; font-size: 0.85rem; margin-top:10px;">Este curso no tiene módulos creados.</p>';
              // se crean tarjeta con sus modulos y botones de accion
              return `
                <div class="card-curso" style="position: relative;">
                  <img src="${curso.cover_url || 'https://via.placeholder.com/300x169?text=Sin+Portada'}" alt="Portada">
                  <h3>${curso.title}</h3>
                  <p>${curso.description}</p>
                  <span class="badge">${curso.level}</span>
                  <span class="badge-estado">${curso.status || 'draft'}</span>
                  
                  <div class="seccion-modulos" style="margin-top: 15px; border-top: 1px solid #ddd; padding-top: 10px;">
                    <h4 style="margin: 0; font-size: 0.95rem;">Módulos del curso:</h4>
                    ${htmlModulos}
                  </div>

                  <div style="margin-top: 15px; display: flex; gap: 10px;">
                    <a href="crearCurso.html?id=${curso.id}" style="background-color: #007bff; color: white; padding: 6px 12px; border-radius: 4px; text-decoration: none; font-size: 0.85rem;">
                      Editar
                    </a>
                  </div>
                </div>
              `;
            }).join('');
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

  const gridCursosInicio = document.getElementById("grid-cursos-inicio");

  if (gridCursosInicio) {
    async function cargarCursosInicio() {
      try {
        const respuesta = await fetch("http://127.0.0.1:8000/api/v1/courses", {
          headers: {
            "Accept": "application/json"
          }
        });

        const data = await respuesta.json();

        if (respuesta.ok) {
          const cursos = Array.isArray(data) ? data : (data.courses || data.data || []);

          if (cursos.length > 0) {
            gridCursosInicio.innerHTML = cursos.map(curso => `
              <div class="card-curso">
                <img src="${curso.cover_url || 'https://via.placeholder.com/300x169?text=Curso'}" alt="${curso.title}" style="width:100%; aspect-ratio:16/9; object-fit:cover;">
                <div style="padding: 15px;">
                  <h3>${curso.title}</h3>
                  <p>${curso.description || 'Sin descripción'}</p>
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
                    <span class="badge">${curso.level || 'Básico'}</span>
                    <small>Instructor: ${curso.instructor?.name || 'Juan'}</small>
                  </div>
                </div>
              </div>
            `).join('');
          } else {
            gridCursosInicio.innerHTML = "<p>No hay cursos publicados disponibles en este momento.</p>";
          }
        } else {
          gridCursosInicio.innerHTML = "<p>Error al obtener la lista de cursos.</p>";
        }
      } catch (error) {
        console.error("Error al cargar cursos en inicio:", error);
        gridCursosInicio.innerHTML = "<p>No se pudo conectar con el servidor.</p>";
      }
    }

    cargarCursosInicio();
  }

}); 

