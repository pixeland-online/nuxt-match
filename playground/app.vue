<template>
  <div v-if="pong">PONG</div>
  <div v-else>PING</div>
  <button @click="ping">Send Ping</button>
</template>

<script setup lang="ts">
import { ProtocolOp } from "../src/server/utils/protocol";

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
    const { op, data } = JSON.parse(message.data);

    if (op == ProtocolOp.RECONNECT) {
      // TODO
    }

    if (op == ProtocolOp.MATCH_DATA) {
      for (let message of data) {
        if (message == "pong") {
          pong.value = true;
          console.log("pong");
        } else {
          message = JSON.parse(message);

          if (message.type == "joinPlayer") {
            console.log("joinPlayer", message.client);
          }

          if (message.type == "leavePlayer") {
            console.log("leavePlayer", message.client);
          }
        }
      }
    }
  });
});
</script>
