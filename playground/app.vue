<template>
  <div v-if="pong">PONG</div>
  <div v-else>PING</div>
  <button @click="ping">Send Ping</button>
</template>

<script setup lang="ts">
let ws: WebSocket | undefined;
const pong = ref(true);

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
    data.match.id;

  ws = new WebSocket(url);

  await new Promise((resolve) => ws?.addEventListener("open", resolve));

  return ws;
}

function ping() {
  if (!ws) return;
  pong.value = false;
  ws.send("ping");
}

onMounted(async () => {
  const ws = await connect();

  ws.addEventListener("message", (message) => {
    if (message.data == "pong") {
      pong.value = true;
    }
  });
});
</script>
