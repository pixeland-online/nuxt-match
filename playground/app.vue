<template>App</template>

<script setup lang="ts">
let ws: WebSocket | undefined;

onMounted(() => {
  ws = new WebSocket("ws://localhost:3000/match");
});
</script>
