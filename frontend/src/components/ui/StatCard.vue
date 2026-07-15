<template>
  <div class="card stat">
    <div class="stat__top">
      <div class="stat__icon">{{ icon }}</div>
      <div>
        <div class="stat__label">{{ label }}</div>
        <div class="stat__value">{{ value }}</div>
      </div>
    </div>
    <div class="stat__foot">
      <span :class="trend >= 0 ? 'trend-up' : 'trend-down'">
        {{ trend >= 0 ? '▲' : '▼' }} {{ Math.abs(trend) }}%
      </span>
      <span class="muted">{{ period }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon: String,
  label: String,
  value: [String, Number],
  trend: { type: Number, default: 0 },
  period: { type: String, default: 'Este mes' },
});
</script>
