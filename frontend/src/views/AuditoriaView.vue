<template>
  <AppLayout title="Auditoría">
    <div class="card panel">
      <div class="panel__head">
        <div class="panel__title">Bitácora de acciones</div>
        <span class="muted">{{ meta.total }} registro(s)</span>
      </div>

      <div class="field-row" style="margin-bottom:18px">
        <div class="field">
          <label>Entidad</label>
          <select v-model="filtros.entidad" @change="filtrar">
            <option :value="''">Todas</option>
            <option v-for="e in entidades" :key="e" :value="e">{{ e }}</option>
          </select>
        </div>
        <div class="field">
          <label>Acción</label>
          <select v-model="filtros.accion" @change="filtrar">
            <option :value="''">Todas</option>
            <option v-for="a in ACCIONES" :key="a" :value="a">{{ a }}</option>
          </select>
        </div>
      </div>

      <div v-if="loading" class="spinner">Cargando…</div>
      <table v-else-if="entradas.length">
        <thead>
          <tr>
            <th>Fecha y hora</th>
            <th>Usuario</th>
            <th>Acción</th>
            <th>Entidad</th>
            <th>Registro</th>
            <th>Detalle</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="e in entradas" :key="e.id_auditoria">
            <td>{{ fechaHora(e.timestamp) }}</td>
            <td>{{ e.usuario?.nombre_usuario || '—' }}</td>
            <td><span :class="`tag ${colorAccion(e.accion)}`">{{ e.accion }}</span></td>
            <td>{{ e.entidad }}</td>
            <td>{{ e.id_registro ?? '—' }}</td>
            <td class="detalle">{{ resumen(e) }}</td>
          </tr>
        </tbody>
      </table>
      <div v-else class="empty">No hay entradas para estos filtros.</div>

      <Paginacion :meta="meta" @cambiar="irAPagina" />
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import AppLayout from '../components/layout/AppLayout.vue';
import Paginacion from '../components/ui/Paginacion.vue';
import api from '../services/api.js';

const LIMITE_AUDITORIA = 25;

const ACCIONES = ['CREAR', 'ACTUALIZAR', 'ELIMINAR', 'ANULAR', 'LOGIN'];
const COLOR_ACCION = {
  CREAR: 'tag--green',
  ACTUALIZAR: 'tag--yellow',
  ELIMINAR: 'tag--red',
  ANULAR: 'tag--red',
  LOGIN: 'tag--orange',
};
const CAMPOS_OMITIDOS = ['timestamp', 'createdAt', 'updatedAt'];

const entradas = ref([]);
const entidades = ref([]);
const meta = ref({ total: 0, page: 1, limit: LIMITE_AUDITORIA, totalPages: 0 });
const page = ref(1);
const loading = ref(true);
const filtros = reactive({ entidad: '', accion: '' });

const colorAccion = (accion) => COLOR_ACCION[accion] || 'tag--orange';

const fechaHora = (valor) => (valor ? new Date(valor).toLocaleString('es-GT') : '—');

/**
* Convierte un objeto del detalle en una cadena corta y legible, dejando fuera
* los campos de control y los valores vacíos.
*
* @param {object} obj fragmento del detalle guardado en la bitácora
* @param {number} max cantidad máxima de campos a mostrar
* @returns {string} resumen en una línea
**/
const pares = (obj, max = 4) => Object.entries(obj)
  .filter(([clave, valor]) => !CAMPOS_OMITIDOS.includes(clave) && valor !== null && valor !== undefined && valor !== '')
  .slice(0, max)
  .map(([clave, valor]) => `${clave}: ${valor}`)
  .join(' · ');

/**
* Arma el resumen legible de una entrada. Para las actualizaciones compara el
* antes contra el después y muestra únicamente los campos que cambiaron, que es
* lo que realmente interesa al revisar la bitácora.
*
* @param {object} entrada fila de auditoría devuelta por la API
* @returns {string} texto a mostrar en la columna de detalle
**/
const resumen = (entrada) => {
  const detalle = entrada.detalle;
  if (!detalle || typeof detalle !== 'object') return '—';

  if (detalle.antes && detalle.despues) {
    const cambios = Object.keys(detalle.despues)
      .filter((clave) => !CAMPOS_OMITIDOS.includes(clave) && String(detalle.antes[clave]) !== String(detalle.despues[clave]))
      .map((clave) => `${clave}: ${detalle.antes[clave]} → ${detalle.despues[clave]}`);
    return cambios.length ? cambios.join(' · ') : 'Sin cambios efectivos';
  }

  if (detalle.eliminado) {
    const tipo = detalle.logico ? 'Desactivado' : 'Eliminado';
    return `${tipo} — ${pares(detalle.eliminado)}`;
  }

  return pares(detalle) || '—';
};

async function cargar() {
  loading.value = true;
  try {
    const params = { page: page.value, limit: LIMITE_AUDITORIA };
    if (filtros.entidad) params.entidad = filtros.entidad;
    if (filtros.accion) params.accion = filtros.accion;
    const { data } = await api.get('/auditoria', { params });
    entradas.value = data.data;
    meta.value = data.meta;
    // La lista de entidades se acumula para que no se vacíe al filtrar por una.
    const vistas = new Set([...entidades.value, ...data.data.map((e) => e.entidad)]);
    entidades.value = [...vistas].sort();
  } finally {
    loading.value = false;
  }
}

function filtrar() {
  page.value = 1;
  cargar();
}

function irAPagina(nueva) {
  page.value = nueva;
  cargar();
}

onMounted(cargar);
</script>

<style scoped>
.detalle { color: var(--text-muted); font-size: 13px; max-width: 380px; }
</style>
