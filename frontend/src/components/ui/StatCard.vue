<template>
  <div class="card stat">
    <div class="stat__top">
      <div class="stat__icon">{{ icon }}</div>
      <div>
        <div class="stat__label">{{ label }}</div>
        <div class="stat__value">{{ value }}</div>
      </div>
    </div>
    <div v-if="trend !== null" class="stat__foot">
      <span :class="trend >= 0 ? 'trend-up' : 'trend-down'">
        {{ trend >= 0 ? '▲' : '▼' }} {{ Math.abs(trend) }}%
      </span>
      <span class="muted">{{ period }}</span>
    </div>
  </div>
</template>

<script setup>
/**
* Tarjeta de métrica. El pie con la tendencia solo se dibuja si se pasa `trend`;
* así la misma tarjeta sirve para métricas sin comparativo, como las del
* historial de un cliente.
**/
defineProps({
  icon: String,
  label: String,
  value: [String, Number],
  trend: { type: Number, default: null },
  period: { type: String, default: 'Este mes' },
});
</script>
