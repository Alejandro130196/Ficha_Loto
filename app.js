'use strict';

/* ─── ESTADO GLOBAL ─────────────────────────────────────────────────────── */
let points = [];

/* ─── DATOS DE REFERENCIA ───────────────────────────────────────────────── */
const ENERGY_TYPES = {
  electrica:  { label: 'Eléctrica',   badge: 'badge-electrica',  candado: 'AZUL',   candadoClass: 'badge-candado-azul',   accion: 'Abrir + bloquear' },
  neumatica:  { label: 'Neumática',   badge: 'badge-neumatica',  candado: 'ROJO',   candadoClass: 'badge-candado-rojo',   accion: 'Cerrar + purgar' },
  hidraulica: { label: 'Hidráulica',  badge: 'badge-hidraulica', candado: 'ROJO',   candadoClass: 'badge-candado-rojo',   accion: 'Cerrar + despresurizar' },
  termica:    { label: 'Térmica',     badge: 'badge-termica',    candado: 'NEGRO',  candadoClass: 'badge-candado-negro',  accion: 'Cortar suministro + esperar T<50°C' },
  mecanica:   { label: 'Mecánica',    badge: 'badge-mecanica',   candado: 'ROJO',   candadoClass: 'badge-candado-rojo',   accion: 'Bloquear con tope / cadena' },
  quimica:    { label: 'Química',     badge: 'badge-quimica',    candado: 'NEGRO',  candadoClass: 'badge-candado-negro',  accion: 'Cerrar válvula + purgar' },
};

const RESIDUALS = {
  res_capacitiva:  { label: '⚡ Carga capacitiva', protocol: 'Esperar 5 min. Medir DC bus < 50 V con multímetro.' },
  res_neumatica:   { label: '💨 Presión neumática', protocol: 'Purgar línea completa. Verificar manómetro = 0 bar.' },
  res_gravitacional: { label: '⬇️ Energía gravitacional', protocol: 'Instalar tope físico o cadena. No trabajar bajo carga.' },
  res_termica:     { label: '🌡️ Calor residual', protocol: 'Esperar T < 50°C. EPI térmico obligatorio.' },
  res_inercia:     { label: '🔄 Inercia mecánica', protocol: 'Esperar parada completa. Confirmar 0 rpm en SCADA.' },
  res_hidraulica:  { label: '💧 Presión hidráulica', protocol: 'Cerrar válvula. Despresurizar acumulador. Manómetro = 0.' },
};

const EPI_LIST = {
  epi_guantes:  '🧤 Guantes dieléctricos (clase 0 · 1000 V)',
  epi_pantalla: '🛡️ Pantalla facial (cuadros BT)',
  epi_calzado:  '👟 Calzado aislante',
  epi_gafas:    '🥽 Gafas de seguridad',
  epi_arcflash: '⚡ EPI Arc Flash clase 2',
  epi_termico:  '🌡️ EPI térmico (horno / secadero)',
};

/* ─── PUNTOS: CRUD ──────────────────────────────────────────────────────── */
function addPoint() {
  points.push({ tipo: 'electrica', elemento: '', ubicacion: '' });
  renderPointsEditor();
  updatePreview();
}

function deletePoint(idx) {
  points.splice(idx, 1);
  renderPointsEditor();
  updatePreview();
}

function updatePointField(idx, field, value) {
  points[idx][field] = value;
  updatePreview();
}

function renderPointsEditor() {
  const container = document.getElementById('pointsEditor');
  if (points.length === 0) {
    container.innerHTML = '<div style="font-size:11px;color:#aaa;font-style:italic;padding:8px 0;">Sin puntos — pulsa «+ Añadir punto»</div>';
    return;
  }

  container.innerHTML = points.map((pt, idx) => `
    <div class="point-card">
      <div class="point-card-header">
        <div class="point-num">${idx + 1}</div>
        <div class="point-card-title">Punto de aislamiento ${idx + 1}</div>
        <button class="btn-del-point" onclick="deletePoint(${idx})" title="Eliminar punto">✕</button>
      </div>
      <div class="field-group">
        <label class="field-label">Tipo de energía</label>
        <select class="field-input" onchange="updatePointField(${idx}, 'tipo', this.value)">
          ${Object.entries(ENERGY_TYPES).map(([key, val]) =>
            `<option value="${key}" ${pt.tipo === key ? 'selected' : ''}>${val.label}</option>`
          ).join('')}
        </select>
      </div>
      <div class="field-group">
        <label class="field-label">Dispositivo / Referencia (ej: Q3, VA-12, S01)</label>
        <input type="text" class="field-input" value="${escHtml(pt.elemento)}"
          placeholder="Seccionador, válvula, interruptor..."
          oninput="updatePointField(${idx}, 'elemento', this.value)">
      </div>
      <div class="field-group">
        <label class="field-label">Ubicación física</label>
        <input type="text" class="field-input" value="${escHtml(pt.ubicacion)}"
          placeholder="Cuadro general, pie máquina, lateral..."
          oninput="updatePointField(${idx}, 'ubicacion', this.value)">
      </div>
    </div>
  `).join('');
}

/* ─── ACTUALIZAR VISTA PREVIA ───────────────────────────────────────────── */
function updatePreview() {
  const get = id => document.getElementById(id);
  const val = id => (get(id) ? get(id).value.trim() : '');

  // Cabecera
  const codigo = val('codigoEquipo');
  get('prev_codigo').textContent       = codigo || '—';
  get('prev_codigoCell').textContent   = codigo || '—';
  get('prev_linea').textContent        = val('lineaZona') || '—';
  get('prev_descripcion').textContent  = val('descripcion') || '—';
  get('prev_ubicacion').textContent    = val('ubicacionFisica') || '—';
  get('prev_plano').textContent        = val('planoElectrico') || '—';

  // Marca + serie
  const marca = val('marcaModelo');
  const serie = val('numSerie');
  get('prev_marca').textContent = [marca, serie].filter(Boolean).join(' · ') || '—';

  // Autor + fecha
  const autor = val('redactadoPor');
  const fecha = val('fechaDoc');
  get('prev_autor').textContent = [autor, fecha ? formatDate(fecha) : ''].filter(Boolean).join(' · ') || '—';

  // Riesgo
  const riesgo = val('nivelRiesgo');
  const riesgoEl = get('prev_riesgo');
  const riesgoMap = { ALTO: { txt: '🔴 ALTO', color: '#b91c1c' }, MEDIO: { txt: '🟡 MEDIO', color: '#b45309' }, BAJO: { txt: '🟢 BAJO', color: '#166534' } };
  if (riesgoMap[riesgo]) {
    riesgoEl.textContent = riesgoMap[riesgo].txt;
    riesgoEl.style.color = riesgoMap[riesgo].color;
  }

  // Tabla puntos
  renderPreviewPoints();

  // Energías residuales
  renderPreviewResiduals();

  // EPI
  renderPreviewEPI();
}

function renderPreviewPoints() {
  const tbody = document.getElementById('prev_pointsBody');
  const prefEl = document.getElementById('prev_bloqueoPreferente');

  if (points.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="ficha-table-empty">Sin puntos definidos — añade puntos en el formulario</td></tr>';
    prefEl.innerHTML = '<strong>⚡ PUNTO DE BLOQUEO PREFERENTE:</strong> Define los puntos de aislamiento para ver la recomendación automática.';
    return;
  }

  tbody.innerHTML = points.map((pt, idx) => {
    const info = ENERGY_TYPES[pt.tipo] || ENERGY_TYPES.electrica;
    return `
      <tr>
        <td style="text-align:center;font-weight:700;">${idx + 1}</td>
        <td><span class="badge-energy ${info.badge}">${info.label}</span></td>
        <td style="font-weight:600;">${escHtml(pt.elemento) || '<span style="color:#aaa;font-style:italic;">—</span>'}</td>
        <td>${escHtml(pt.ubicacion) || '<span style="color:#aaa;font-style:italic;">—</span>'}</td>
        <td style="font-size:8px;">${info.accion}</td>
        <td><span class="${info.candadoClass}">${info.candado}</span></td>
        <td style="text-align:center;font-size:13px;">☐</td>
      </tr>
    `;
  }).join('');

  // Bloque preferente automático
  const electricos = points.filter(p => p.tipo === 'electrica');
  const mecanicos  = points.filter(p => p.tipo !== 'electrica');
  let prefText = '<strong>⚡ PUNTO DE BLOQUEO PREFERENTE:</strong> ';
  const parts = [];
  if (electricos.length > 0) {
    const pt = electricos[0];
    parts.push(`Intervención eléctrica → bloquear en <strong>Punto ${points.indexOf(pt) + 1}</strong> (${escHtml(pt.elemento) || 'punto aguas arriba'})`);
  }
  if (mecanicos.length > 0) {
    const pt = mecanicos[0];
    parts.push(`Intervención mecánica → usar <strong>Punto ${points.indexOf(pt) + 1}</strong> (${escHtml(pt.elemento) || 'seccionador local'})`);
  }
  prefEl.innerHTML = prefText + parts.join(' &nbsp;|&nbsp; ');
}

function renderPreviewResiduals() {
  const container = document.getElementById('prev_residuals');
  const active = Object.entries(RESIDUALS).filter(([id]) => {
    const el = document.getElementById(id);
    return el && el.checked;
  });

  if (active.length === 0) {
    container.className = 'ficha-residual-empty';
    container.innerHTML = 'Sin energías residuales marcadas';
    return;
  }

  container.className = 'ficha-residual-grid';
  container.innerHTML = active.map(([, data]) => `
    <div class="ficha-residual-item">
      <strong>${data.label}</strong>
      ${data.protocol}
    </div>
  `).join('');

  // Mostrar/ocultar check de variador
  const capEl = document.getElementById('prev_checkVariador');
  const hasCap = document.getElementById('res_capacitiva');
  if (capEl && hasCap) {
    capEl.style.display = hasCap.checked ? 'flex' : 'none';
  }
}

function renderPreviewEPI() {
  const container = document.getElementById('prev_epiGrid');
  const active = Object.entries(EPI_LIST).filter(([id]) => {
    const el = document.getElementById(id);
    return el && el.checked;
  });

  if (active.length === 0) {
    container.className = 'ficha-residual-empty';
    container.innerHTML = 'Sin EPI marcados';
    return;
  }

  container.className = 'ficha-epi-grid';
  container.innerHTML = active.map(([, label]) => `
    <div class="ficha-epi-item">${label}</div>
  `).join('');
}

/* ─── PERSISTENCIA LOCAL ────────────────────────────────────────────────── */
function gatherFormData() {
  const ids = ['codigoEquipo','lineaZona','nivelRiesgo','descripcion','marcaModelo','numSerie','ubicacionFisica','planoElectrico','redactadoPor','fechaDoc'];
  const form = {};
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) form[id] = el.value;
  });

  const residuales = {};
  Object.keys(RESIDUALS).forEach(id => {
    const el = document.getElementById(id);
    if (el) residuales[id] = el.checked;
  });

  const epis = {};
  Object.keys(EPI_LIST).forEach(id => {
    const el = document.getElementById(id);
    if (el) epis[id] = el.checked;
  });

  return { form, residuales, epis, points };
}

function applyFormData(data) {
  if (!data) return;
  if (data.form) {
    Object.entries(data.form).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    });
  }
  if (data.residuales) {
    Object.entries(data.residuales).forEach(([id, checked]) => {
      const el = document.getElementById(id);
      if (el) el.checked = checked;
    });
  }
  if (data.epis) {
    Object.entries(data.epis).forEach(([id, checked]) => {
      const el = document.getElementById(id);
      if (el) el.checked = checked;
    });
  }
  if (data.points) {
    points = data.points;
    renderPointsEditor();
  }
}

function saveToLocal() {
  try {
    const data = gatherFormData();
    const key = 'loto_' + (data.form.codigoEquipo || 'borrador');
    localStorage.setItem(key, JSON.stringify(data));
    localStorage.setItem('loto_last_key', key);
    showToast(`💾 Guardado: "${key}"`);
  } catch (e) {
    showToast('⚠️ Error al guardar');
  }
}

function loadFromLocal() {
  try {
    const key = localStorage.getItem('loto_last_key') || 'loto_borrador';
    const raw = localStorage.getItem(key);
    if (!raw) { showToast('📂 No hay borrador guardado'); return; }
    applyFormData(JSON.parse(raw));
    updatePreview();
    showToast(`📂 Cargado: "${key}"`);
  } catch (e) {
    showToast('⚠️ Error al cargar');
  }
}

/* ─── IMPRIMIR ──────────────────────────────────────────────────────────── */
function printFicha() {
  updatePreview();
  window.print();
}

/* ─── UTILIDADES ────────────────────────────────────────────────────────── */
function escHtml(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function formatDate(iso) {
  if (!iso) return '';
  try {
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  } catch { return iso; }
}

let toastTimer;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
}

/* ─── AUTO-UPDATE EN CAMBIOS DE FORMULARIO ──────────────────────────────── */
function initAutoUpdate() {
  const ids = ['codigoEquipo','lineaZona','nivelRiesgo','descripcion','marcaModelo',
               'numSerie','ubicacionFisica','planoElectrico','redactadoPor','fechaDoc'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updatePreview);
    if (el) el.addEventListener('change', updatePreview);
  });
  [...Object.keys(RESIDUALS), ...Object.keys(EPI_LIST)].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', updatePreview);
  });
}

/* ─── INIT ──────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Fecha de hoy por defecto
  const fechaEl = document.getElementById('fechaDoc');
  if (fechaEl && !fechaEl.value) {
    fechaEl.value = new Date().toISOString().split('T')[0];
  }

  // Auto-recuperar último borrador si existe
  try {
    const key = localStorage.getItem('loto_last_key');
    if (key && localStorage.getItem(key)) {
      applyFormData(JSON.parse(localStorage.getItem(key)));
      showToast('📂 Borrador recuperado automáticamente');
    }
  } catch {}

  initAutoUpdate();
  renderPointsEditor();
  updatePreview();
});
