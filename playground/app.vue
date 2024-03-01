<template>
  App
</template>

<script setup lang="ts">
let ws: WebSocket | undefined;

// Test Connect WebSocket
async function connect() {
  if (ws) {
    ws.close();
  }

  const isSecure = location.protocol === "https:";
  const url = (isSecure ? "wss://" : "ws://") + location.host + "/match";

  ws = new WebSocket(url);

  await new Promise((resolve) => ws?.addEventListener('open', resolve))
}

onMounted(() => {
  connect()
});
</script>
