export default defineEventHandler(async () => {
  const matches = serverMatchFind(() => true); // all matches

  return matches;
});
