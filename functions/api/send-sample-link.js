// Вебхук для инструмента Майи (ElevenLabs) send_sample_link.
// Тонкий прокси в стиле call-summary.js: сам эндпоинт публикуется как
// Cloudflare Pages Function на coldcore.uk (тот же способ, что уже работает
// для call-summary), а реальная отправка (WhatsApp/SMS через Twilio, все
// защиты, campaign_sent.json и т.п.) сделана на Python-сервере Dana
// (/home/alex/dana/sample_link_server.py) и наружу отдана через
// cloudflared-туннель. Здесь мы просто пробрасываем запрос туда.
//
// ВНИМАНИЕ ПРИ ДЕПЛОЕ: этот файл нельзя задеплоить с этой машины (alex) - тут
// нет ни git push доступа к GitHub, ни авторизации wrangler/Cloudflare. Его
// нужно задеплоить тому, у кого есть доступ к Cloudflare Pages проекта
// coldcore-site (Time Ampy / Mike), тем же способом, каким деплоился текущий
// call-summary.js.
//
// В переменных окружения Cloudflare Pages для этого проекта нужно завести:
//   SAMPLE_LINK_UPSTREAM  - текущий публичный адрес Python-сервера. Он меняется
//                            при перезапуске cloudflared-туннеля на сервере -
//                            ПЕРЕД деплоем проверьте свежее значение в
//                            /home/alex/dana/cf_sample_link_state.log (там же
//                            пишет себя update_tool_url.py - тот же скрипт
//                            держит актуальным url у инструмента send_sample_link
//                            в ElevenLabs, но эту JS-заглушку он не трогает).
//   SAMPLE_LINK_TOKEN      - секретный токен, см. отчёт по задаче
// Если переменные не заданы, ниже есть safe-фолбэк (значение на момент
// написания файла, 27.07.2026 17:55 BST), но правильный вариант - вынести оба
// значения в env Cloudflare Pages и держать их свежими, а не полагаться на код.

const FALLBACK_UPSTREAM = 'https://legitimate-teens-beatles-ticket.trycloudflare.com';
const FALLBACK_TOKEN = '8b6bc61debc8623bb6ac8f10c237770cae285877b89d493b';

export async function onRequestPost(context) {
  const { env, request } = context;

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ sent: false, channel: null, reason: 'bad_json' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const upstream = env.SAMPLE_LINK_UPSTREAM || FALLBACK_UPSTREAM;
  const token = env.SAMPLE_LINK_TOKEN || FALLBACK_TOKEN;

  console.log('[SEND-SAMPLE-LINK] proxying to', upstream, 'phone:', body?.phone);

  let upstreamRes;
  try {
    upstreamRes = await fetch(upstream + '/send-sample-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Api-Key': token },
      body: JSON.stringify(body),
    });
  } catch (e) {
    console.log('[SEND-SAMPLE-LINK] upstream unreachable:', e.message);
    return new Response(JSON.stringify({ sent: false, channel: null, reason: 'upstream_unreachable' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  const text = await upstreamRes.text();
  console.log('[SEND-SAMPLE-LINK] upstream status', upstreamRes.status, text.slice(0, 300));

  // отдаём агенту то же тело, что вернул апстрим (там уже правильная форма
  // {sent, channel, reason}), статус всегда 200 - иначе ElevenLabs может
  // засчитать это как ошибку инструмента вместо вежливого отказа
  return new Response(text || '{"sent":false,"channel":null,"reason":"empty_upstream_response"}',
    { status: 200, headers: { 'Content-Type': 'application/json' } });
}
