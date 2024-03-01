export default defineEventHandler(async () => {
  const match = await createPixelandMatch('city')

  return match.state
})