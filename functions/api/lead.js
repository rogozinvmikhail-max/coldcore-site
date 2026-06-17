export async function onRequestPost(context) {
  const { request } = context;
  let body;
  try { body = await request.json(); } catch { return Response.json({ ok: true }); }
  const { name, contact } = body || {};
  console.log(`[LEAD] ${new Date().toISOString()} | ${name} | ${contact}`);
  return Response.json({ ok: true });
}
