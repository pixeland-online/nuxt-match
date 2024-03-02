export default defineEventHandler(async (event) => {
  const body = await readBody<{ name: string }>(event); // TODO use zod validator
  const match = await serverMatchCreate(body.name);

  return {
    match: {
      id: match.id,
      name: match.name,
    },
  };
});
