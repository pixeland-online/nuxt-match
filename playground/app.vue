<template>App</template>

<script setup lang="ts">
let ws: WebSocket | undefined;

// Test Connect WebSocket (No Reconnect)
async function connect() {
  if (ws) {
    ws.close();
  }

  const data = await $fetch("/api/matches/create", {
    method: "POST",
    body: { name: "city" },
  });

  const isSecure = location.protocol === "https:";
  const url =
    (isSecure ? "wss://" : "ws://") +
    location.host +
    "/match?matchId=" +
    data.uuid;

  ws = new WebSocket(url);

  await new Promise((resolve) => ws?.addEventListener("open", resolve));
}

onMounted(() => {
  connect();
});
</script>
