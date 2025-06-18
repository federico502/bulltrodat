let activoSeleccionado = "XAGUSD";
let operacionesUsuario = [];
let balanceGlobal = 0;
let balanceInicial = 0;
let preciosTiempoReal = {};
let usuarioId = null;
let equidadAnterior = 0;
let tipoOperacionPendiente = ""; // "buy" o "sell"

document.addEventListener("DOMContentLoaded", () => {
  fetch("/me")
    .then((res) => {
      if (!res.ok) throw new Error("No autenticado");
      return res.json();
    })
    .then((user) => {
      usuarioId = user.id;
      document.getElementById(
        "balance-display"
      ).textContent = `Balance: $${parseFloat(user.balance).toFixed(2)}`;
      actualizarGananciasYBalancePeriodicamente();
      iniciarPlataforma();
    })
    .catch(() => {
      window.location.href = "login.html";
    });
});

function iniciarPlataforma() {
  const forexAssets = [
    { symbol: "SOLUSDT" },
    { symbol: "BTCUSDT" },
    { symbol: "ETHUSDT" },
    { symbol: "XRPUSDT" },
    { symbol: "BNBUSDT" },
  ];

  const stockAssets = [
    { symbol: "AAPL" },
    { symbol: "AMZN" },
    { symbol: "GOOGL" },
  ];

  updateTable("forex-table", forexAssets);
  updateTable("stocks-table", stockAssets);

  conectarWebSocketMultiplexado(
    [...forexAssets, ...stockAssets].map((a) => a.symbol)
  );
  cambiarActivoEnGrafico(activoSeleccionado);
  cargarHistorial();
  cargarUsuario();
}

function updateTable(tableId, data) {
  const tbody = document.getElementById(tableId);
  tbody.innerHTML = "";
  data.forEach((asset) => {
    const row = document.createElement("tr");
    row.classList.add("cursor-pointer", "hover:bg-gray-700");
    row.setAttribute("data-symbol", asset.symbol);
    row.innerHTML = `
      <td>${asset.symbol}</td>
      <td class="text-green-400 precio-binance">---</td>
      <td class="text-red-400">Binance</td>
    `;
    row.addEventListener("click", () => {
      activoSeleccionado = asset.symbol;
      cambiarActivoEnGrafico(activoSeleccionado);
      const header = document.getElementById("activo-actual");
      if (header) header.textContent = "Activo: " + activoSeleccionado;
    });
    tbody.appendChild(row);
  });
}

function conectarWebSocketMultiplexado(activos) {
  const streams = activos
    .map((symbol) => `${symbol.toLowerCase()}@trade`)
    .join("/");
  const socket = new WebSocket(
    `wss://stream.binance.com:9443/stream?streams=${streams}`
  );

  socket.onmessage = (event) => {
    const mensaje = JSON.parse(event.data);
    if (mensaje?.data?.s && mensaje?.data?.p) {
      const symbol = mensaje.data.s;
      const precio = parseFloat(mensaje.data.p);
      preciosTiempoReal[symbol.toUpperCase()] = precio;

      const fila = document.querySelector(`tr[data-symbol="${symbol}"]`);
      if (fila) {
        fila.querySelector(".precio-binance").textContent = precio.toFixed(4);
      }
    }
  };

  socket.onclose = () => {
    console.warn("🔁 Reintentando conexión WebSocket...");
    setTimeout(() => conectarWebSocketMultiplexado(activos), 2000);
  };
}

function cambiarActivoEnGrafico(symbol) {
  const widgetDiv = document.getElementById("tradingview-widget");
  widgetDiv.innerHTML = "";
  new TradingView.widget({
    container_id: "tradingview-widget",
    width: "100%",
    height: "100%",
    symbol: symbol,
    interval: "1",
    timezone: "Etc/UTC",
    theme: "dark",
    style: "3",
    locale: "es",
    toolbar_bg: "#222",
    enable_publishing: false,
    hide_top_toolbar: true,
    save_image: false,
  });
}

function confirmarOperacion() {
  const volumen = parseFloat(document.getElementById("inputVolumen").value);
  const tp = parseFloat(document.getElementById("inputTP").value);
  const sl = parseFloat(document.getElementById("inputSL").value);
  const precio = preciosTiempoReal[activoSeleccionado];

  if (!precio || isNaN(precio)) {
    mostrarAlerta("⚠️ No se pudo obtener el precio actual.", "error");
    return;
  }
  const capitalNecesario = precio * volumen;
  const metricas = calcularMetricasFinancieras(
    operacionesUsuario,
    balanceGlobal
  );

  if (capitalNecesario > parseFloat(metricas.margenLibre)) {
    mostrarAlerta(
      "❌ Margen libre insuficiente para abrir esta operación.",
      "error"
    );
    return;
  }
  if (isNaN(volumen) || volumen <= 0) {
    mostrarAlerta("❌ Volumen inválido.", "error");
    return;
  }

  fetch("/operar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      usuario_id: usuarioId,
      activo: activoSeleccionado,
      tipo_operacion: tipoOperacionPendiente,
      volumen,
      precio_entrada: precio,
      take_profit: isNaN(tp) ? null : tp,
      stop_loss: isNaN(sl) ? null : sl,
    }),
  })
    .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
    .then(({ ok, data }) => {
      if (ok && data.success) {
        mostrarAlerta("✅ Operación enviada", "success");
        cerrarModalOperacionNueva();
        cargarHistorial();
        actualizarBalance();
        cargarOperaciones();
      } else {
        mostrarAlerta(data.error || "❌ Error al operar", "error");
      }
    })
    .catch((err) => {
      console.error(err);
      mostrarAlerta("❌ Error al enviar operación", "error");
    });
}

function cargarHistorial() {
  const filtro = document.getElementById("filtroHistorial")?.value || "todas";

  fetch("/historial")
    .then((res) => res.json())
    .then((data) => {
      const tbody = document.getElementById("trade-history");
      tbody.innerHTML = "";

      data.forEach((op) => {
        if (op.usuario_id !== usuarioId) return;

        if (
          (filtro === "abiertas" && op.cerrada) ||
          (filtro === "cerradas" && !op.cerrada)
        ) {
          return;
        }

        const precioActual = preciosTiempoReal[op.activo?.toUpperCase()];

        let ganancia = "--";
        let gananciaNum = 0;

        if (op.cerrada && op.ganancia !== null) {
          // Mostrar la ganancia fija si la operación está cerrada
          gananciaNum = parseFloat(op.ganancia);
          ganancia = gananciaNum.toFixed(2);
        } else if (precioActual && op.precio_entrada && op.volumen) {
          const diff = precioActual - op.precio_entrada;
          gananciaNum =
            op.tipo_operacion === "sell"
              ? -diff * op.volumen
              : diff * op.volumen;
          ganancia = gananciaNum.toFixed(2);
        }

        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${new Date(op.fecha).toLocaleString()}</td>
          <td>${op.tipo_operacion}</td>
          <td>${op.volumen}</td>
          <td>${op.activo}</td>
          <td>${op.precio_entrada}</td>
          <td>${
            op.precio_cierre ? parseFloat(op.precio_cierre).toFixed(2) : "-"
          }</td>
          <td>${parseFloat(op.take_profit ?? 0).toFixed(2)}</td>
          <td>${parseFloat(op.stop_loss ?? 0).toFixed(2)}</td>
          <td>${parseFloat(op.capital_invertido ?? 0).toFixed(2)}</td>
          
          <td class="${
            gananciaNum >= 0 ? "text-green-400" : "text-red-400"
          }">${ganancia}</td>
          <td>
            ${
              op.cerrada
                ? `<span class="bg-gray-600 px-2 py-1 rounded text-xs cursor-default inline-block text-center w-full">Cerrado</span>`
                : `<button class="cerrar-btn bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs w-full" data-id="${op.id}" data-ganancia="${gananciaNum}">Cerrar</button>`
            }
          </td>
          
        `;
        row.addEventListener("click", (e) => {
          // Solo evitamos que se abra el modal si se hizo clic en un botón "cerrar"
          if (e.target.classList.contains("cerrar-btn")) return;
          mostrarDetalleOperacion(op);
        });
        tbody.appendChild(row);
      });

      document.querySelectorAll(".cerrar-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = parseInt(btn.getAttribute("data-id"));
          const ganancia = parseFloat(btn.getAttribute("data-ganancia"));
          cerrarOperacion(btn, id, ganancia);
        });
      });
    })
    .catch((err) => {
      console.error("❌ Error al cargar historial:", err);
    });
}

function cerrarOperacion(btn) {
  const id = btn.dataset.id;
  const ganancia = parseFloat(btn.dataset.ganancia) || 0;

  fetch("/cerrar-operacion", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ operacion_id: id, ganancia }), // ✅ CORRECTO
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        mostrarAlerta("✅ Operación cerrada con éxito", "success");
        cargarOperaciones();
        cargarBalance();
        actualizarMetricas();
      } else {
        alert("❌ Error al cerrar operación");
      }
    })
    .catch((err) => {
      console.error("❌ Error al cerrar operación:", err);
    });
}

function actualizarBalance() {
  fetch("/me")
    .then((res) => res.json())
    .then((user) => {
      const balanceSpan = document.getElementById("balance-display");
      if (balanceSpan)
        balanceSpan.textContent = `Balance: $${parseFloat(user.balance).toFixed(
          2
        )}`;
    });
}

function logout() {
  fetch("/logout", { method: "POST" }).then(() => {
    window.location.href = "login.html";
  });
}

document
  .getElementById("filtroHistorial")
  ?.addEventListener("change", cargarHistorial);

function cargarEstadisticas() {
  fetch("/estadisticas")
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("totalInvertido").textContent = `$${parseFloat(
        data.total_invertido || 0
      ).toFixed(2)}`;
      document.getElementById("gananciaTotal").textContent = `$${parseFloat(
        data.ganancia_total || 0
      ).toFixed(2)}`;
      document.getElementById("abiertas").textContent = data.abiertas || 0;
      document.getElementById("cerradas").textContent = data.cerradas || 0;
    })
    .catch((err) => {
      console.error("❌ Error al cargar estadísticas:", err);
    });
}

function cargarEstadisticas() {
  fetch("/estadisticas")
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("totalInvertido").textContent = `$${parseFloat(
        data.total_invertido || 0
      ).toFixed(2)}`;
      document.getElementById("gananciaTotal").textContent = `$${parseFloat(
        data.ganancia_total || 0
      ).toFixed(2)}`;
      document.getElementById("abiertas").textContent = data.abiertas || 0;
      document.getElementById("cerradas").textContent = data.cerradas || 0;
    })
    .catch((err) => {
      console.error("❌ Error al cargar estadísticas:", err);
    });
}

function actualizarGananciasYBalancePeriodicamente() {
  setInterval(() => {
    actualizarMetricas();
    actualizarOperacionesTabla();
    cargarOperaciones();
    cargarHistorial();
    actualizarBalance();
    cargarEstadisticas();
    cargarGraficoRendimiento(); // ⬅️ Añadido aquí
  }, 1000); // cada 2 segundos
}

let chart;
function cargarGraficoRendimiento() {
  Promise.all([
    fetch("/rendimiento").then((res) => res.json()),
    fetch("/rendimiento-operaciones").then((res) => res.json()),
  ])
    .then(([rendimientoDiario, operaciones]) => {
      const fechasDiarias = rendimientoDiario.map((r) => r.fecha);
      const gananciasDiarias = rendimientoDiario.map((r) =>
        parseFloat(r.ganancia_dia || 0).toFixed(2)
      );

      const fechasOps = operaciones.map((op) => `${op.fecha} #${op.id}`);
      const gananciasOps = operaciones.map((op) =>
        parseFloat(op.ganancia || 0).toFixed(2)
      );

      const ctx = document
        .getElementById("graficoRendimiento")
        .getContext("2d");
      if (chart) chart.destroy();

      chart = new Chart(ctx, {
        type: "line",
        data: {
          labels:
            fechasDiarias.length > fechasOps.length ? fechasDiarias : fechasOps,
          datasets: [
            {
              label: "Ganancia diaria",
              data: gananciasDiarias,
              borderWidth: 2,
              borderColor: "rgba(75, 192, 192, 1)",
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              fill: true,
              tension: 0.3,
            },
            {
              label: "Ganancia por operación",
              data: gananciasOps,
              borderWidth: 2,
              borderColor: "rgb(99, 107, 255)",
              backgroundColor: "rgba(255, 99, 132, 0.2)",
              fill: false,
              tension: 0.1,
            },
          ],
        },
        options: {
          responsive: false,
          scales: {
            x: {
              grid: {
                display: true, // ✅ activa líneas verticales
                color: "#444444", // puedes cambiar el color
              },
              ticks: {
                display: false, // ❌ oculta las fechas (etiquetas del eje X)
              },
            },
            y: {
              beginAtZero: true,
              grid: {
                display: true, // ✅ activa líneas horizontales
                color: "#444444",
              },
            },
          },
          plugins: {
            legend: { display: false },
          },
        },
      });
    })
    .catch((err) =>
      console.error("❌ Error al cargar gráfico de rendimiento:", err)
    );
}

function mostrarAlerta(mensaje, tipo = "info") {
  const alerta = document.getElementById("alerta");
  alerta.textContent = mensaje;

  // Colores según tipo
  alerta.className = `fixed top-4 right-4 z-[9999] px-4 py-2 rounded shadow text-white text-sm ${
    tipo === "error"
      ? "bg-red-600"
      : tipo === "success"
      ? "bg-green-600"
      : "bg-blue-600"
  }`;

  alerta.classList.remove("hidden");

  // Ocultar después de 3 segundos
  setTimeout(() => {
    alerta.classList.add("hidden");
  }, 3000);
}

function cargarUsuario() {
  fetch("/usuario")
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("nombreUsuario").textContent =
        data.username || "Usuario";
    })
    .catch(() => {
      mostrarAlerta("❌ No se pudo cargar el usuario", "error");
    });
}

function mostrarDetalleOperacion(op) {
  const contenedor = document.getElementById("detalleOperacion");
  contenedor.innerHTML = `
    <p><strong>ID:</strong> ${op.id}</p>
    <p><strong>Activo:</strong> ${op.activo}</p>
    <p><strong>Tipo:</strong> ${op.tipo_operacion}</p>
    <p><strong>Volumen:</strong> ${op.volumen}</p>
    <p><strong>Precio entrada:</strong> ${op.precio_entrada}</p>
    <p><strong>Fecha:</strong> ${new Date(op.fecha).toLocaleString()}</p>
    <p><strong>Estado:</strong> ${op.cerrada ? "Cerrada" : "Abierta"}</p>
    ${
      op.cerrada
        ? `<p><strong>Ganancia:</strong> ${parseFloat(op.ganancia || 0).toFixed(
            2
          )}</p>
`
        : ""
    }
  `;
  document.getElementById("modalOperacion").classList.remove("hidden");
}

function cerrarModalOperacion() {
  document.getElementById("modalOperacion").classList.add("hidden");
}

const rol = localStorage.getItem("rol");
if (rol === "admin") {
  document.getElementById("panel-admin").classList.remove("hidden");
} else {
  document.getElementById("panel-admin").classList.add("hidden");
}

fetch("/me")
  .then((res) => {
    if (!res.ok) throw new Error("No autenticado");
    return res.json();
  })
  .then((user) => {
    console.log("Bienvenido,", user.nombre);
    window.usuarioActual = user;

    // Mostrar panel admin si el rol es admin
    if (user.rol === "admin") {
      document.getElementById("panel-admin").classList.remove("hidden");
    }

    // Mostrar nombre y balance
    const nombreUsuario = document.getElementById("nombreUsuario");
    if (nombreUsuario) nombreUsuario.textContent = user.nombre;

    const balanceSpan = document.getElementById("balance-display");
    if (balanceSpan)
      balanceSpan.textContent = `Balance: $${parseFloat(user.balance).toFixed(
        2
      )}`;
  })
  .catch((err) => {
    console.warn("No hay sesión activa");
    window.location.href = "login.html";
  });

function abrirGestorUsuarios() {
  alert("Aquí irá el panel para gestionar usuarios (pendiente de implementar)");
}

function cargarUsuarios() {
  fetch("/usuarios")
    .then((res) => {
      if (!res.ok) throw new Error("Error al cargar usuarios");
      return res.json();
    })
    .then((usuarios) => {
      const tbody = document.getElementById("usuarios-body");
      tbody.innerHTML = "";
      usuarios.forEach((usuario) => {
        const row = document.createElement("tr");

        row.innerHTML = `
        <td class="px-2 py-1 text-blue-600 underline cursor-pointer" onclick="verOperacionesUsuario(${
          usuario.id
        })">${usuario.id}</td>
          <td class="px-2 py-1"><input type="text" value="${
            usuario.nombre
          }" class="w-full p-1 border rounded nombre-${usuario.id}"></td>
          <td class="px-2 py-1"><input type="email" value="${
            usuario.email
          }" class="w-full p-1 border rounded email-${usuario.id}"></td>
          <td class="px-2 py-1"><input type="number" step="0.01" value="${parseFloat(
            usuario.balance
          ).toFixed(2)}" class="w-full p-1 border rounded balance-${
          usuario.id
        }"></td>
          <td class="px-2 py-1">
            <select class="w-full p-1 border rounded rol-${usuario.id}">
              <option value="usuario" ${
                usuario.rol === "usuario" ? "selected" : ""
              }>Usuario</option>
              <option value="admin" ${
                usuario.rol === "admin" ? "selected" : ""
              }>Admin</option>
            </select>
          </td>
          <td class="px-2 py-1">
            <button onclick="guardarCambiosUsuario(${
              usuario.id
            })" class="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs">Guardar</button>
          </td>
        `;
        tbody.appendChild(row);
      });
    })
    .catch((err) => {
      console.error("❌ Error cargando usuarios:", err);
    });
}

// Llamar cuando admin vea el panel
if (localStorage.getItem("rol") === "admin") {
  cargarUsuarios();
}

function cambiarRol(id, rolActual) {
  fetch("/cambiar-rol", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ usuarioId: id, rolActual }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Error al cambiar rol");
      return res.json();
    })
    .then((data) => {
      alert(`✅ Rol cambiado a: ${data.nuevoRol}`);
      cargarUsuarios(); // Recargar tabla
    })
    .catch((err) => {
      console.error("❌ Error cambiando rol:", err);
    });
}

function abrirModalUsuarios() {
  document.getElementById("modalUsuarios").classList.remove("hidden");
  cargarUsuarios(); // Cargar al abrir
}

function cerrarModalUsuarios() {
  document.getElementById("modalUsuarios").classList.add("hidden");
}

function guardarCambiosUsuario(id) {
  const nombre = document.querySelector(`.nombre-${id}`).value.trim();
  const email = document.querySelector(`.email-${id}`).value.trim();
  const balance = parseFloat(document.querySelector(`.balance-${id}`).value);
  const rol = document.querySelector(`.rol-${id}`).value;

  fetch("/actualizar-usuario", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id, nombre, email, balance, rol }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Error al actualizar");
      return res.json();
    })
    .then((data) => {
      mostrarAlerta("✅ Usuario actualizado correctamente", "success");
      cargarUsuarios(); // refrescar tabla
    })
    .catch((err) => {
      console.error("❌ Error al actualizar usuario:", err);
    });
}

function verOperacionesUsuario(usuarioId) {
  // Obtener nombre del usuario desde la tabla
  const fila = document.querySelector(
    `tr td:first-child[onclick="verOperacionesUsuario(${usuarioId})"]`
  );
  const nombre =
    fila?.nextElementSibling?.querySelector("input")?.value || "Usuario";

  document.getElementById("modalOperaciones").classList.remove("hidden");
  document.getElementById("operaciones-user-id").textContent = nombre;

  fetch(`/admin-operaciones/${usuarioId}`)
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("operaciones-user-id").textContent = data.nombre;

      const tbody = document.getElementById("operaciones-body");
      tbody.innerHTML = "";

      data.operaciones.forEach((op) => {
        const row = document.createElement("tr");
        row.innerHTML = `
      <td class="px-2 py-1">${op.id}</td>
      <td class="px-2 py-1">${op.activo}</td>
      <td class="px-2 py-1">${op.tipo_operacion}</td>
      <td class="px-2 py-1">${op.volumen}</td>
      <td class="px-2 py-1 text-black">
        <input type="number" step="0.0001" value="${op.precio_entrada}" 
               class="w-full p-1 border rounded precio-${op.id}">
      </td>
      <td class="px-2 py-1">${new Date(op.fecha).toLocaleString()}</td>
      <td class="px-2 py-1">${op.cerrada ? "Sí" : "No"}</td>
      <td class="px-2 py-1">
        <button onclick="guardarNuevoPrecio(${
          op.id
        })" class="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs">Guardar</button>
      </td>
    `;
        tbody.appendChild(row);
      });
    })

    .catch((err) => {
      console.error("❌ Error cargando operaciones:", err);
    });
}

function cerrarModalOperaciones() {
  document.getElementById("modalOperaciones").classList.add("hidden");
}

function actualizarPrecioEntrada(id, nuevoPrecio) {
  fetch("/actualizar-precio", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, nuevoPrecio: parseFloat(nuevoPrecio) }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Error al actualizar precio");
      return res.json();
    })
    .then((data) => {
      mostrarAlerta("✅ Precio de entrada actualizado", "success");
      verOperacionesUsuario(data.usuario_id); // Recargar operaciones
    })
    .catch((err) => {
      console.error("❌ Error actualizando precio:", err);
    });
}

function guardarNuevoPrecio(id) {
  const input = document.querySelector(`.precio-${id}`);
  const nuevoPrecio = parseFloat(input.value);

  if (isNaN(nuevoPrecio)) {
    alert("❌ Precio inválido");
    return;
  }

  fetch("/actualizar-precio", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, nuevoPrecio }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        mostrarAlerta("✅ Precio actualizado correctamente", "success");

        // Recargar toda la tabla con las nuevas ganancias
        verOperacionesUsuario(data.usuario_id);

        // Actualizar estadísticas, balance y gráfico
        actualizarBalance();
        cargarEstadisticas();
        cargarGraficoRendimiento();
        cargarOperaciones(); // actualiza operacionesUsuario
        cargarBalance(); // actualiza balance y balanceInicial
        actualizarMetricas(); // recalcula métricas
      } else {
        throw new Error("Error al actualizar precio");
      }
    })
    .catch((err) => {
      console.error("❌ Error al guardar nuevo precio:", err);
      alert("❌ Error al guardar nuevo precio");
    });
}

async function cargarBalance() {
  try {
    const res = await fetch("/balance");
    const data = await res.json();
    balanceGlobal = parseFloat(data.balance);
    balanceInicial = parseFloat(data.balanceReal); // ✅ Aquí lo asignas
    document.getElementById("balance").textContent = balanceGlobal.toFixed(2);
    actualizarMetricas();
  } catch (error) {
    console.error("❌ Error al cargar balance:", error);
  }
}

async function cargarOperaciones() {
  try {
    const res = await fetch("/operaciones");
    const data = await res.json();

    if (!Array.isArray(data)) {
      console.error("⚠️ Respuesta inválida de /operaciones:", data);
      return;
    }

    operacionesUsuario = data;
    actualizarMetricas();
  } catch (error) {
    console.error("❌ Error al cargar operaciones:", error);
  }
}

function calcularMetricasFinancieras(operaciones, balance) {
  const abiertas = operaciones.filter((op) => !op.cerrada);
  const gananciaFlotante = abiertas.reduce((total, op) => {
    const precioActual = preciosTiempoReal[op.activo] || op.precio_entrada;
    const ganancia =
      op.tipo_operacion === "buy"
        ? (precioActual - op.precio_entrada) * op.volumen
        : (op.precio_entrada - precioActual) * op.volumen;
    return total + ganancia;
  }, 0);

  const margenUsado = abiertas.reduce((total, op) => {
    return total + op.volumen * op.precio_entrada;
  }, 0);

  const equidad = balance + gananciaFlotante;
  const margenLibre = equidad - margenUsado;
  const nivelMargen = margenUsado > 0 ? (equidad / margenUsado) * 100 : 0;

  return {
    equidad: equidad.toFixed(2),
    margenUsado: margenUsado.toFixed(2),
    margenLibre: margenLibre.toFixed(2),
    nivelMargen: nivelMargen.toFixed(2),
  };
}

function actualizarMetricas() {
  const abiertas = operacionesUsuario.filter((op) => !op.cerrada);
  const metricas = calcularMetricasFinancieras(abiertas, balanceGlobal);

  const equidadActual = parseFloat(metricas.equidad);
  const equidadElem = document.getElementById("equidad");

  if (equidadElem) {
    equidadElem.textContent = metricas.equidad;

    if (equidadAnterior) {
      if (equidadActual > equidadAnterior) {
        equidadElem.classList.add("text-green-400");
        equidadElem.classList.remove("text-red-400");
      } else if (equidadActual < equidadAnterior) {
        equidadElem.classList.add("text-red-400");
        equidadElem.classList.remove("text-green-400");
      }
    }

    equidadAnterior = equidadActual;
  }

  document.getElementById("margenUsado").textContent = metricas.margenUsado;
  document.getElementById("margenLibre").textContent = metricas.margenLibre;
  document.getElementById("nivelMargen").textContent =
    metricas.nivelMargen + "%";
}

document.addEventListener("DOMContentLoaded", () => {
  cargarBalance();
  cargarOperaciones();
});

function actualizarOperacionesTabla() {
  const filas = document.querySelectorAll("#tabla-operaciones tr");

  operacionesUsuario.forEach((op, index) => {
    if (op.cerrada) return;

    const precioActual = preciosTiempoReal[op.activo] || op.precio_entrada;
    const ganancia =
      op.tipo_operacion === "buy"
        ? (precioActual - op.precio_entrada) * op.volumen
        : (op.precio_entrada - precioActual) * op.volumen;

    const fila = filas[index];
    if (!fila) return;

    const celdaGanancia = fila.children[5];
    celdaGanancia.textContent = ganancia.toFixed(2);
    celdaGanancia.className = ganancia >= 0 ? "text-green-400" : "text-red-400";
  });
}

document.querySelector(".bg-red-500").addEventListener("click", () => {
  tipoOperacionPendiente = "sell";
  abrirModalOperacionNueva();
});

document.querySelector(".bg-green-500").addEventListener("click", () => {
  tipoOperacionPendiente = "buy";
  abrirModalOperacionNueva();
});

function abrirModalOperacionNueva() {
  document.getElementById("modalOperacionNueva").classList.remove("hidden");
  document.getElementById("modalTitulo").textContent =
    tipoOperacionPendiente === "buy" ? "Comprar Activo" : "Vender Activo";
}

function cerrarModalOperacionNueva() {
  document.getElementById("modalOperacionNueva").classList.add("hidden");
}
