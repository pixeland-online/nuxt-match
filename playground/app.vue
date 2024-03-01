<template>
  App
</template>

<script setup lang="ts">
let ws: WebSocket | undefined;

onMounted(() => {
  const isSecure = location.protocol === "https:";
  const url = (isSecure ? "wss://" : "ws://") + location.host + "/match";

  if (ws) {
    ws.close();
  }

  ws = new WebSocket(url);
});
</script>
