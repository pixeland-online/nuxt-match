export default defineEventHandler(async (event) => {
  const body = await readBody<{ name: string }>(event); // TODO use zod validator
  const match = await serverMatchCreate(body.name);

  return {
    uuid: match.context.uuid,
    name: match.context.name,
    clients: match.context.clients.length,
  };
});
