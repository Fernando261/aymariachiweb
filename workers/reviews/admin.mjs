const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);

const statusLabels = {
  pending: 'Pendiente', approved: 'Publicada', rejected: 'Rechazada', hidden: 'Oculta',
};
const statusActions = {
  pending: [['approved', 'Aprobar'], ['rejected', 'Rechazar']],
  approved: [['hidden', 'Ocultar']],
  rejected: [['approved', 'Aprobar']],
  hidden: [['approved', 'Volver a publicar']],
};
const dateFormatter = new Intl.DateTimeFormat('es-MX', {
  dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Mexico_City',
});

function page(content, status = 200) {
  return new Response(`<!doctype html>
<html lang="es-MX"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Moderación de reseñas · Ay! Mariachi Para Todos</title>
<style>
:root{color-scheme:dark;font:16px/1.5 system-ui;background:#15100d;color:#f5e9d5}
body{max-width:760px;margin:auto;padding:24px}
h1,h2{color:#f4cf8c;line-height:1.15}h1{font-size:clamp(1.7rem,6vw,2.3rem)}
article{border:1px solid #775737;background:#211914;padding:16px;margin:16px 0;border-radius:8px}
article h2{font-size:1.1rem;margin-top:0}article p{overflow-wrap:anywhere;white-space:pre-wrap}
form{margin:12px 0}label{display:block}input,button{font:inherit;min-height:44px;box-sizing:border-box}
input{display:block;width:min(100%,28rem);padding:8px;margin:8px 0}
button{background:#efc47b;color:#1d140b;border:0;border-radius:5px;padding:8px 14px;cursor:pointer;margin:4px 8px 4px 0}
a{color:#f4cf8c}header{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px}
</style></head><body><main>${content}</main></body></html>`, {
    status,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
      // The admin POST checks Origin, which no-referrer suppresses for form submissions.
      'referrer-policy': 'same-origin',
      'x-content-type-options': 'nosniff',
      'x-robots-tag': 'noindex, nofollow',
    },
  });
}

export function loginPage(error = '', status = 200) {
  return page(`<h1>Moderación de reseñas</h1>
${error ? `<p role="alert">${escapeHtml(error)}</p>` : ''}
<form method="post" action="/admin/resenas">
<input type="hidden" name="action" value="login">
<label>Clave de moderación <input type="password" name="password" autocomplete="current-password" required maxlength="128"></label>
<button type="submit">Entrar</button></form>`, status);
}

export function inboxPage(reviews, nextCursor, cursor, notice, showRejected) {
  const rejectedParam = showRejected ? 'view=rejected' : '';
  const startUrl = rejectedParam ? `/admin/resenas?${rejectedParam}` : '/admin/resenas';
  return page(`<header><h1>Moderación de reseñas</h1>
<form method="post" action="/admin/resenas"><button name="action" value="logout">Cerrar sesión</button></form></header>
<nav aria-label="Vistas de moderación">
<a href="/admin/resenas"${showRejected ? '' : ' aria-current="page"'}>Bandeja</a> ·
<a href="/admin/resenas?view=rejected"${showRejected ? ' aria-current="page"' : ''}>Rechazadas</a>
</nav>
${notice ? '<p role="status">Se guardó el cambio.</p>' : ''}
${reviews.length ? reviews.map((review) => `<article>
<h2>${escapeHtml(review.name)} · ${review.rating}/5 estrellas</h2>
<p>${statusLabels[review.status]} · ${dateFormatter.format(new Date(review.createdAt))}</p>
<p>${escapeHtml(review.comment)}</p>
<form method="post" action="/admin/resenas">
<input type="hidden" name="id" value="${escapeHtml(review.id)}">
<input type="hidden" name="cursor" value="${escapeHtml(cursor ?? '')}">
${showRejected ? '<input type="hidden" name="view" value="rejected">' : ''}
${statusActions[review.status].map(([action, label]) => `<button name="action" value="${action}">${label}</button>`).join('')}
</form></article>`).join('') : '<p>No hay reseñas en esta página.</p>'}
${cursor ? `<p><a href="${startUrl}">Volver al inicio</a></p>` : ''}
${nextCursor ? `<p><a href="/admin/resenas?${rejectedParam ? rejectedParam + '&amp;' : ''}cursor=${encodeURIComponent(nextCursor)}">Ver más reseñas</a></p>` : ''}`);
}

export function adminError(message, status) {
  return page(`<h1>Moderación de reseñas</h1><p role="alert">${escapeHtml(message)}</p>
<p><a href="/admin/resenas">Volver a la bandeja</a></p>`, status);
}
