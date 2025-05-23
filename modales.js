document.addEventListener('DOMContentLoaded', function () {
  // --- LÓGICA DE MODALES DE ACCESO Y REGISTRO ---
  const btnAcceso = document.querySelector('.btn-acceso');
  const btnRegistro = document.querySelector('.btn-registro');
  const modalAcceso = document.getElementById('modalAcceso');
  const modalRegistro = document.getElementById('modalRegistro');
  const cerrarModales = document.querySelectorAll('.cerrar-modal');

  function abrirModal(modal) {
    if (modal) {
      modal.style.display = 'block';
    }
  }

  function cerrarModal(modal) {
    if (modal) {
      modal.style.display = 'none';
    }
  }

  if (btnAcceso) {
    btnAcceso.addEventListener('click', function () {
      abrirModal(modalAcceso);
    });
  }

  if (btnRegistro) {
    btnRegistro.addEventListener('click', function () {
      abrirModal(modalRegistro);
    });
  }

  cerrarModales.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const modalId = this.getAttribute('data-modal-id');
      const modalACerrar = document.getElementById(modalId);
      if (modalId !== 'modalCarrito') {
          cerrarModal(modalACerrar);
      }
    });
  });
  


  // --- LÓGICA DEL CARRITO DE COMPRAS ---
  let carrito = [];
  const botonesAnadirCarrito = document.querySelectorAll('.btn-anadir-carrito');
  const iconoCarrito = document.querySelector('.cart-container');
  const cartCountElement = document.querySelector('.cart-count');
  const modalCarrito = document.getElementById('modalCarrito');
  const carritoContenidoElement = document.getElementById('carritoContenido');
  const carritoTotalPrecioElement = document.getElementById('carritoTotalPrecio');
  const btnCerrarModalCarrito = modalCarrito ? modalCarrito.querySelector('.cerrar-modal[data-modal-id="modalCarrito"]') : null;
  const btnPagar = document.getElementById('btnPagar');
  const mensajeCarritoVacio = modalCarrito ? modalCarrito.querySelector('.carrito-vacio-mensaje') : null;

  function actualizarContadorCarrito() {
    if (!cartCountElement) return;
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    cartCountElement.textContent = totalItems;
  }

  function formatearPrecio(precio) {
    return precio.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  function renderizarCarrito() {
    if (!carritoContenidoElement || !carritoTotalPrecioElement) return;
    carritoContenidoElement.innerHTML = ''; 

    if (carrito.length === 0) {
      if(mensajeCarritoVacio) mensajeCarritoVacio.style.display = 'block';
    } else {
      if(mensajeCarritoVacio) mensajeCarritoVacio.style.display = 'none';
      carrito.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('carrito-item');
        itemDiv.innerHTML = `
          <span class="carrito-item-nombre">${item.nombre} (x${item.cantidad})</span>
          <div class="carrito-item-controles">
            <button class="btn-decrementar" data-nombre="${item.nombre}">-</button>
            <button class="btn-incrementar" data-nombre="${item.nombre}">+</button>
            <button class="btn-eliminar-item" data-nombre="${item.nombre}">&times;</button>
          </div>
          <span class="carrito-item-precio">${formatearPrecio(item.precio * item.cantidad)}</span>
        `;
        carritoContenidoElement.appendChild(itemDiv);
      });
    }

    const precioTotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    carritoTotalPrecioElement.textContent = formatearPrecio(precioTotal);
    actualizarContadorCarrito();
  }
  
  function manejarClickEnControlesCarrito(event) {
    const target = event.target;
    const nombreProducto = target.dataset.nombre;

    if (target.classList.contains('btn-incrementar')) {
      agregarAlCarrito(nombreProducto, parseFloat(carrito.find(p => p.nombre === nombreProducto).precio), false);
    } else if (target.classList.contains('btn-decrementar')) {
      const productoEnCarrito = carrito.find(p => p.nombre === nombreProducto);
      if (productoEnCarrito) {
        if (productoEnCarrito.cantidad > 1) {
          productoEnCarrito.cantidad--;
        } else {
          carrito = carrito.filter(p => p.nombre !== nombreProducto);
        }
      }
    } else if (target.classList.contains('btn-eliminar-item')) {
      carrito = carrito.filter(p => p.nombre !== nombreProducto);
    }
    renderizarCarrito();
  }

  if (carritoContenidoElement) {
    carritoContenidoElement.addEventListener('click', manejarClickEnControlesCarrito);
  }

  function agregarAlCarrito(nombre, precio, desdeBotonProducto = true) {
    const productoExistente = carrito.find(item => item.nombre === nombre);
    if (productoExistente) {
      productoExistente.cantidad++;
    } else {
      carrito.push({ nombre, precio, cantidad: 1 });
    }
    if (desdeBotonProducto) {
        console.log(`${nombre} añadido al carrito.`);
    }
    renderizarCarrito();
  }

  botonesAnadirCarrito.forEach(boton => {
    boton.addEventListener('click', function () {
      const productoDiv = this.closest('.producto-item');
      const nombre = productoDiv.dataset.nombre;
      const precio = parseFloat(productoDiv.dataset.precio);
      agregarAlCarrito(nombre, precio);
    });
  });

  if (iconoCarrito) {
    iconoCarrito.addEventListener('click', function () {
      renderizarCarrito(); 
      abrirModal(modalCarrito);
    });
  }

  if (btnCerrarModalCarrito) {
      btnCerrarModalCarrito.addEventListener('click', function() {
          cerrarModal(modalCarrito);
      });
  }
  
  if (btnPagar) {
    btnPagar.addEventListener('click', async function() { // Convertir a función asíncrona
      if (carrito.length > 0) {
        // 1. Preparar los datos para Mercado Pago
        const itemsParaMercadoPago = carrito.map(item => ({
          title: item.nombre,
          quantity: item.cantidad,
          unit_price: item.precio,
          currency_id: 'COP' // Asegúrate que esta sea la moneda correcta
        }));


        try {
          // 2. Simular envío al backend 
          const response = await fetch('crear_preferencia_mercadopago.php', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ items: itemsParaMercadoPago })
          });

          if (!response.ok) {
            // Si el backend devuelve un error HTTP (ej. 500, 400)
            const errorData = await response.json().catch(() => ({ message: 'Error al contactar el servidor.' }));
            throw new Error(errorData.message || `Error del servidor: ${response.status}`);
          }

          const data = await response.json();

          // 3. Redirigir al init_point de Mercado Pago si existe
          if (data.init_point) {
            window.location.href = data.init_point;
            // No limpiar carrito aquí, Mercado Pago maneja la sesión de pago.
            // Se limpiaría después de una confirmación exitosa vía webhook.
          } else {
            throw new Error(data.message || 'No se recibió el punto de inicio de Mercado Pago.');
          }
        } catch (error) {
          console.error('Error al procesar el pago con Mercado Pago:', error);
          alert(`Error al procesar el pago: ${error.message}. Intenta de nuevo.`);
          // Reactivar el botón en caso de error
          btnPagar.disabled = false;
          btnPagar.textContent = 'Pagar';
        }
 

      } else {
        alert('Tu carrito está vacío.');
      }
    });
  }

  window.addEventListener('click', function (event) {
    if (event.target === modalAcceso) cerrarModal(modalAcceso);
    if (event.target === modalRegistro) cerrarModal(modalRegistro);
    if (event.target === modalCarrito) cerrarModal(modalCarrito);
  });
  
  renderizarCarrito(); 

  // --- LÓGICA DE SUBCATEGORÍAS DE MAQUILLAJE (NUEVA) ---
  const categoriaMaquillajeBtn = document.getElementById('categoriaMaquillaje');
  const seccionCategoriasPrincipal = document.querySelector('section.categorias');
  const seccionProductosDestacados = document.querySelector('section.productos-destacados');
  const seccionSubcategoriasMaquillaje = document.getElementById('subcategoriasMaquillaje');
  const btnVolverCategorias = document.getElementById('btnVolverCategorias');

  if (categoriaMaquillajeBtn && seccionCategoriasPrincipal && seccionProductosDestacados && seccionSubcategoriasMaquillaje && btnVolverCategorias) {
    categoriaMaquillajeBtn.addEventListener('click', function() {
      seccionCategoriasPrincipal.style.display = 'none';
      seccionProductosDestacados.style.display = 'none';
      seccionSubcategoriasMaquillaje.style.display = 'block'; 
    });

    btnVolverCategorias.addEventListener('click', function() {
      seccionCategoriasPrincipal.style.display = 'block'; 
      seccionProductosDestacados.style.display = 'block'; 
      seccionSubcategoriasMaquillaje.style.display = 'none';
    });

    // Opcional: Event listeners para los items de subcategoría
    const subcategoriaItems = seccionSubcategoriasMaquillaje.querySelectorAll('.subcategoria-item');
    subcategoriaItems.forEach(item => {
      item.addEventListener('click', function() {
        const subcategoriaSeleccionada = this.dataset.subcategoria;
        alert(`Has hecho clic en la subcategoría: ${subcategoriaSeleccionada}. Aquí se mostrarían los productos de ${subcategoriaSeleccionada}.`);
        // Aquí iría la lógica para cargar/filtrar productos de esa subcategoría.
      });
    });

  } else {
    console.error('No se pudieron encontrar todos los elementos para la funcionalidad de subcategorías.');
  }
// --- LÓGICA PARA OTRAS SUBCATEGORÍAS ---

  // Referencias a los elementos del DOM
  const categoriaCuidadoPielBtn = document.getElementById('categoriaCuidadoDePiel');
  const seccionSubcategoriasCuidadoPiel = document.getElementById('subcategoriasCuidadoDePiel');
  const btnVolverCategoriasCuidadoPiel = document.getElementById('btnVolverCategoriasDesdeCuidadoPiel');

  const categoriaBrochasEsponjasBtn = document.getElementById('categoriaBrochasEsponjas');
  const seccionSubcategoriasBrochasEsponjas = document.getElementById('subcategoriasBrochasEsponjas');
  const btnVolverCategoriasBrochas = document.getElementById('btnVolverCategoriasDesdeBrochas');

  const categoriaAccesoriosBtn = document.getElementById('categoriaAccesorios');
  const seccionSubcategoriasAccesorios = document.getElementById('subcategoriasAccesorios');
  const btnVolverCategoriasAccesorios = document.getElementById('btnVolverCategoriasDesdeAccesorios');

  const categoriaCapilarBtn = document.getElementById('categoriaCapilar');
  const seccionSubcategoriasCapilar = document.getElementById('subcategoriasCapilar');
  const btnVolverCategoriasCapilar = document.getElementById('btnVolverCategoriasDesdeCapilar');

  // Función genérica para mostrar subcategorías y ocultar principales
  function mostrarSubcategorias(seccionSubcategoriasAMostrar) {
    if (seccionCategoriasPrincipal) seccionCategoriasPrincipal.style.display = 'none';
    if (seccionProductosDestacados) seccionProductosDestacados.style.display = 'none';
    if (seccionSubcategoriasMaquillaje) seccionSubcategoriasMaquillaje.style.display = 'none';
    if (seccionSubcategoriasCuidadoPiel) seccionSubcategoriasCuidadoPiel.style.display = 'none';
    if (seccionSubcategoriasBrochasEsponjas) seccionSubcategoriasBrochasEsponjas.style.display = 'none';
    if (seccionSubcategoriasAccesorios) seccionSubcategoriasAccesorios.style.display = 'none';
    if (seccionSubcategoriasCapilar) seccionSubcategoriasCapilar.style.display = 'none';

    if (seccionSubcategoriasAMostrar) {
      seccionSubcategoriasAMostrar.style.display = 'block'; // o 'flex'
    }
  }

  // Función genérica para volver a las categorías principales
  function volverACategorias() {
    if (seccionCategoriasPrincipal) seccionCategoriasPrincipal.style.display = 'block'; 
    if (seccionProductosDestacados) seccionProductosDestacados.style.display = 'block'; 
    if (seccionSubcategoriasMaquillaje) seccionSubcategoriasMaquillaje.style.display = 'none';
    if (seccionSubcategoriasCuidadoPiel) seccionSubcategoriasCuidadoPiel.style.display = 'none';
    if (seccionSubcategoriasBrochasEsponjas) seccionSubcategoriasBrochasEsponjas.style.display = 'none';
    if (seccionSubcategoriasAccesorios) seccionSubcategoriasAccesorios.style.display = 'none';
    if (seccionSubcategoriasCapilar) seccionSubcategoriasCapilar.style.display = 'none';
  }

  // Función genérica para manejar clics en items de subcategoría
  function manejarClickSubcategoriaItem(event) {
    const subcategoriaSeleccionada = event.currentTarget.dataset.subcategoria;
    alert(`Has hecho clic en la subcategoría: ${subcategoriaSeleccionada}. Aquí se mostrarían los productos de ${subcategoriaSeleccionada}.`);
    // Aquí iría la lógica para cargar/filtrar productos de esa subcategoría.
  }

// Event Listeners para Maquillaje
if (categoriaMaquillajeBtn && seccionSubcategoriasMaquillaje && btnVolverCategorias) {
  categoriaMaquillajeBtn.addEventListener('click', function() {
    mostrarSubcategorias(seccionSubcategoriasMaquillaje);
  });

  btnVolverCategorias.addEventListener('click', volverACategorias);

  seccionSubcategoriasMaquillaje.querySelectorAll('.subcategoria-item').forEach(item => {
    item.addEventListener('click', manejarClickSubcategoriaItem);
  });
}

  // Event Listeners para Cuidado de la Piel
  if (categoriaCuidadoPielBtn && seccionSubcategoriasCuidadoPiel && btnVolverCategoriasCuidadoPiel) {
    categoriaCuidadoPielBtn.addEventListener('click', function() {
      mostrarSubcategorias(seccionSubcategoriasCuidadoPiel);
    });
    btnVolverCategoriasCuidadoPiel.addEventListener('click', volverACategorias);
    seccionSubcategoriasCuidadoPiel.querySelectorAll('.subcategoria-item').forEach(item => {
      item.addEventListener('click', manejarClickSubcategoriaItem);
    });
  } else {
    console.error('Faltan elementos para subcategorías de Cuidado de la Piel.');
  }

  // Event Listeners para Brochas y Esponjas
  if (categoriaBrochasEsponjasBtn && seccionSubcategoriasBrochasEsponjas && btnVolverCategoriasBrochas) {
    categoriaBrochasEsponjasBtn.addEventListener('click', function() {
      mostrarSubcategorias(seccionSubcategoriasBrochasEsponjas);
    });
    btnVolverCategoriasBrochas.addEventListener('click', volverACategorias);
    seccionSubcategoriasBrochasEsponjas.querySelectorAll('.subcategoria-item').forEach(item => {
      item.addEventListener('click', manejarClickSubcategoriaItem);
    });
  } else {
    console.error('Faltan elementos para subcategorías de Brochas y Esponjas.');
  }

  // Event Listeners para Accesorios
  if (categoriaAccesoriosBtn && seccionSubcategoriasAccesorios && btnVolverCategoriasAccesorios) {
    categoriaAccesoriosBtn.addEventListener('click', function() {
      mostrarSubcategorias(seccionSubcategoriasAccesorios);
    });
    btnVolverCategoriasAccesorios.addEventListener('click', volverACategorias);
    seccionSubcategoriasAccesorios.querySelectorAll('.subcategoria-item').forEach(item => {
      item.addEventListener('click', manejarClickSubcategoriaItem);
    });
  } else {
    console.error('Faltan elementos para subcategorías de Accesorios.');
  }

  // Event Listeners para Capilar
  if (categoriaCapilarBtn && seccionSubcategoriasCapilar && btnVolverCategoriasCapilar) {
    categoriaCapilarBtn.addEventListener('click', function() {
      mostrarSubcategorias(seccionSubcategoriasCapilar);
    });
    btnVolverCategoriasCapilar.addEventListener('click', volverACategorias);
    seccionSubcategoriasCapilar.querySelectorAll('.subcategoria-item').forEach(item => {
      item.addEventListener('click', manejarClickSubcategoriaItem);
    });
  } else {
    console.error('Faltan elementos para subcategorías de Capilar.');
  }

  // Ajustar la lógica existente de Maquillaje para usar las nuevas funciones genéricas
  if (categoriaMaquillajeBtn && seccionSubcategoriasMaquillaje && btnVolverCategorias) {
    categoriaMaquillajeBtn.addEventListener('click', function() {
      mostrarSubcategorias(seccionSubcategoriasMaquillaje);
    });

     btnVolverCategorias.addEventListener('click', function() {
       seccionCategoriasPrincipal.style.display = 'block';
       seccionProductosDestacados.style.display = 'block';
       seccionSubcategoriasMaquillaje.style.display = 'none';
    
       if (seccionSubcategoriasCuidadoPiel) seccionSubcategoriasCuidadoPiel.style.display = 'none';
       if (seccionSubcategoriasBrochasEsponjas) seccionSubcategoriasBrochasEsponjas.style.display = 'none';
       if (seccionSubcategoriasAccesorios) seccionSubcategoriasAccesorios.style.display = 'none';
       if (seccionSubcategoriasCapilar) seccionSubcategoriasCapilar.style.display = 'none';
     });

    seccionSubcategoriasMaquillaje.querySelectorAll('.subcategoria-item').forEach(item => {
        item.addEventListener('click', manejarClickSubcategoriaItem);
    });
  }
});