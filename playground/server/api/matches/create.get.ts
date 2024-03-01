export default defineEventHandler(async () => {
  const match = await serverMatchCreate("city");

  return match.state;
});
