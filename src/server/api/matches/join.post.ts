export default defineEventHandler(async (event) => {
  const body = await readBody<{ id: string }>(event);
  const matchs = serverMatchFind((match) => match.context.uuid == body.id);

  if (matchs.length == 0) {
    throw createError("No found match");
  }

  return {
    uuid: matchs[0].uuid,
    name: matchs[0].name,
    clients: matchs[0].clients,
  };
});
