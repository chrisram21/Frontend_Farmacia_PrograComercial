<template>
  <div class="app-shell">
    <Sidebar />
    <div class="app-main">
      <Topbar :title="title" />
      <main class="app-content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import Sidebar from './Sidebar.vue';
import Topbar from './Topbar.vue';

defineProps({ title: { type: String, default: '' } });
</script>
