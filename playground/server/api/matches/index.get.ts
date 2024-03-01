export default defineEventHandler(async () => {
  const matches = serverMatchFind(() => true);

  return matches.map((match) => match.state);
});