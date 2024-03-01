<template>
  App
</template>

<script setup lang="ts">
let ws: WebSocket | undefined;

onMounted(() => {
  ws = new WebSocket('wss://crispy-doodle-4v5qgw4xpxr37vxw-3000.app.github.dev/match')
})
</script>