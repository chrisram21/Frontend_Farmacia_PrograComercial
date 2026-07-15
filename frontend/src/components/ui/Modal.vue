<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal__head">
        <div class="modal__title">{{ title }}</div>
        <button class="icon-btn" @click="$emit('close')">✕</button>
      </div>
      <div class="modal__body">
        <slot />
      </div>
      <div class="modal__foot">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ title: { type: String, default: '' } });
defineEmits(['close']);
</script>
