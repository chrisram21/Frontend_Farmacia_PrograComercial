<template>
  <div v-if="meta.total" class="paginacion">
    <span class="muted">{{ meta.total }} registro(s)</span>
    <div class="paginacion__ctrl">
      <button class="btn btn--ghost" :disabled="meta.page <= 1" @click="$emit('cambiar', meta.page - 1)">
        ← Anterior
      </button>
      <span class="muted">Página {{ meta.page }} de {{ totalPaginas }}</span>
      <button class="btn btn--ghost" :disabled="meta.page >= totalPaginas" @click="$emit('cambiar', meta.page + 1)">
        Siguiente →
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  meta: { type: Object, default: () => ({ total: 0, page: 1, limit: 10, totalPages: 0 }) },
});

defineEmits(['cambiar']);

const totalPaginas = computed(() => Math.max(props.meta.totalPages || 0, 1));
</script>
