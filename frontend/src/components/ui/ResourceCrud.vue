<template>
  <div class="card panel">
    <div class="panel__head">
      <div class="panel__title">{{ title }}</div>
      <button v-if="canWrite" class="btn btn--primary" @click="openCreate">+ Agregar</button>
    </div>

    <div v-if="loading" class="spinner">Cargando…</div>

    <table v-else-if="items.length">
      <thead>
        <tr>
          <th v-for="c in columns" :key="c.key">{{ c.label }}</th>
          <th v-if="canWrite" style="width:120px">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in items" :key="row[pk]">
          <td v-for="c in columns" :key="c.key" v-html="render(row, c)"></td>
          <td v-if="canWrite">
            <button class="action-btn edit" title="Editar" @click="openEdit(row)">✎</button>
            <button class="action-btn del" title="Eliminar" @click="remove(row)">🗑</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-else class="empty">No hay registros todavía.</div>

    <!-- Formulario -->
    <Modal v-if="showModal" :title="editing ? `Editar ${singular}` : `Nuevo ${singular}`" @close="showModal = false">
      <div v-if="formError" class="error-text">{{ formError }}</div>
      <template v-for="f in fields" :key="f.key">
        <div class="field">
          <label>{{ f.label }}</label>

          <select v-if="f.type === 'select'" v-model="form[f.key]">
            <option :value="null" disabled>Seleccione…</option>
            <option v-for="opt in optionsFor(f)" :key="opt[f.optionValue]" :value="opt[f.optionValue]">
              {{ opt[f.optionLabel] }}
            </option>
          </select>

          <select v-else-if="f.type === 'boolean'" v-model="form[f.key]">
            <option :value="true">Activo</option>
            <option :value="false">Inactivo</option>
          </select>

          <input v-else-if="f.type === 'number'" type="number" step="any" v-model.number="form[f.key]" />
          <input v-else :type="f.type || 'text'" v-model="form[f.key]" />
        </div>
      </template>

      <template #footer>
        <button class="btn btn--ghost" @click="showModal = false">Cancelar</button>
        <button class="btn btn--primary" :disabled="saving" @click="save">
          {{ saving ? 'Guardando…' : 'Guardar' }}
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import api from '../../services/api.js';
import Modal from './Modal.vue';
import { useAuthStore } from '../../stores/auth.js';

const props = defineProps({
  title: String,
  singular: { type: String, default: 'registro' },
  apiPath: String,
  pk: String,
  columns: Array,   // [{ key, label, type?: 'bool'|'money'|'relation', path? }]
  fields: Array,    // [{ key, label, type, optionsApi, optionValue, optionLabel }]
  writeRoles: { type: Array, default: null },
});

const auth = useAuthStore();
const canWrite = computed(() => !props.writeRoles || auth.puede(props.writeRoles));

const items = ref([]);
const loading = ref(true);
const showModal = ref(false);
const editing = ref(false);
const saving = ref(false);
const formError = ref('');
const form = reactive({});
const optionsCache = reactive({});

async function load() {
  loading.value = true;
  const { data } = await api.get(props.apiPath);
  items.value = data;
  loading.value = false;
}

async function loadOptions() {
  for (const f of props.fields.filter((x) => x.type === 'select' && x.optionsApi)) {
    if (!optionsCache[f.key]) {
      const { data } = await api.get(f.optionsApi);
      optionsCache[f.key] = data;
    }
  }
}
const optionsFor = (f) => f.options || optionsCache[f.key] || [];

function blankForm() {
  Object.keys(form).forEach((k) => delete form[k]);
  props.fields.forEach((f) => {
    form[f.key] = f.type === 'boolean' ? true : null;
  });
}

async function openCreate() {
  formError.value = '';
  editing.value = false;
  blankForm();
  await loadOptions();
  showModal.value = true;
}

async function openEdit(row) {
  formError.value = '';
  editing.value = true;
  blankForm();
  props.fields.forEach((f) => { form[f.key] = row[f.key]; });
  form[props.pk] = row[props.pk];
  await loadOptions();
  showModal.value = true;
}

async function save() {
  saving.value = true;
  formError.value = '';
  try {
    const payload = {};
    props.fields.forEach((f) => { payload[f.key] = form[f.key]; });
    if (editing.value) {
      await api.put(`${props.apiPath}/${form[props.pk]}`, payload);
    } else {
      await api.post(props.apiPath, payload);
    }
    showModal.value = false;
    await load();
  } catch (e) {
    formError.value = e.response?.data?.message || 'Error al guardar';
  } finally {
    saving.value = false;
  }
}

async function remove(row) {
  if (!confirm(`¿Eliminar este ${props.singular}?`)) return;
  try {
    await api.delete(`${props.apiPath}/${row[props.pk]}`);
    await load();
  } catch (e) {
    alert(e.response?.data?.message || 'No se pudo eliminar');
  }
}

function render(row, c) {
  let val = c.path ? c.path.split('.').reduce((o, k) => o?.[k], row) : row[c.key];
  if (c.type === 'bool') {
    return val
      ? '<span class="tag tag--green">Activo</span>'
      : '<span class="tag tag--red">Inactivo</span>';
  }
  if (c.type === 'estado') {
    const map = { disponible: 'tag--green', agotado: 'tag--red', vencido: 'tag--orange' };
    return `<span class="tag ${map[val] || 'tag--orange'}">${val ?? '-'}</span>`;
  }
  if (c.type === 'money') return `Q ${Number(val ?? 0).toFixed(2)}`;
  return val ?? '-';
}

onMounted(load);
</script>
