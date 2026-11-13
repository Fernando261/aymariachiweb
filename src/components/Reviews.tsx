import { useEffect, useState, type FormEvent } from 'react';

type Review = { id: string; name: string; rating: number; comment: string };
type ReviewPage = { reviews: Review[]; nextCursor: string | null };

const api = '/api/resenas';
const ratings = [5, 4, 3, 2, 1];

async function fetchReviews(cursor?: string, signal?: AbortSignal): Promise<ReviewPage> {
  const url = cursor ? `${api}?cursor=${encodeURIComponent(cursor)}` : api;
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error('Review listing unavailable');
  const result: ReviewPage = await response.json();
  return result;
}

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState(false);
  const [name, setName] = useState('');
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sendError, setSendError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    fetchReviews(undefined, controller.signal).then((result) => {
      setReviews(result.reviews);
      setCursor(result.nextCursor);
    }).catch(() => {
      if (!controller.signal.aborted) setListError(true);
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, []);

  async function loadMore() {
    setLoading(true);
    setListError(false);
    try {
      const result = await fetchReviews(cursor ?? undefined);
      setReviews((previous) => [...previous, ...result.reviews.filter((item) => !previous.some(({ id }) => id === item.id))]);
      setCursor(result.nextCursor);
    } catch {
      setListError(true);
    } finally {
      setLoading(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !rating || !comment.trim() || !consent || sending) return;
    setSending(true);
    setSuccess(false);
    setSendError('');
    const fallback = 'No pudimos enviar tu reseña. Inténtalo de nuevo.';
    try {
      const response = await fetch(api, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, rating: Number(rating), comment, consent }),
      });
      const result = await response.json();
      if (response.status === 201 && result.received === true) {
        setName('');
        setRating('');
        setComment('');
        setConsent(false);
        setSuccess(true);
      } else {
        setSendError(typeof result.error === 'string' ? result.error : fallback);
      }
    } catch {
      setSendError(fallback);
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="section reviews-section" id="opiniones" aria-labelledby="reviews-title">
      <div className="container guide-grid reviews-grid">
        <div>
          <h2 className="section-title" id="reviews-title">Opiniones <em>de clientes.</em></h2>
          {reviews.length > 0 && <ul className="catalog-list reviews-list">
            {reviews.map((review) => (
              <li key={review.id} className="catalog-card">
                <p className="review-stars" aria-label={`${review.rating} de 5 estrellas`}>
                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </p>
                <blockquote>{review.comment}</blockquote>
                <p className="review-author">{review.name}</p>
              </li>
            ))}
          </ul>}
          <div aria-live="polite">
            {loading && <p className="section-body">Cargando opiniones…</p>}
            {listError && <p className="section-body">No pudimos cargar las opiniones.</p>}
            {!loading && !listError && !cursor && !reviews.length && <p className="section-body">Aún no hay opiniones publicadas.</p>}
          </div>
          {!loading && (cursor || listError) && <button type="button" className="button button--outline" onClick={loadMore}>
            {listError ? 'Volver a intentar' : 'Ver más opiniones'}
          </button>}
        </div>
        <form className="catalog review-form" onSubmit={submit}>
          <h3>Cuéntanos cómo te fue</h3>
          <label>Tu nombre <input type="text" required maxLength={60} value={name} onChange={(event) => setName(event.target.value)} /></label>
          <fieldset className="catalog-event">
            <legend>Calificación</legend>
            <div className="review-ratings">
              {ratings.map((value) => (
                <label key={value}>
                  <input type="radio" name="review-rating" value={value} required checked={rating === String(value)} onChange={(event) => setRating(event.target.value)} />
                  <span>{value} <span aria-hidden="true">★</span></span>
                </label>
              ))}
            </div>
          </fieldset>
          <label>Tu comentario <textarea required maxLength={800} rows={4} value={comment} onChange={(event) => setComment(event.target.value)} /></label>
          <label className="review-consent">
            <input type="checkbox" required checked={consent} onChange={(event) => setConsent(event.target.checked)} />
            Autorizo que se publiquen mi nombre, calificación y comentario.
          </label>
          <button type="submit" className="button button--gold" disabled={sending}>{sending ? 'Enviando…' : 'Enviar reseña'}</button>
          {success && <p role="status">Gracias por tu reseña. Está pendiente de revisión.</p>}
          {sendError && <p role="alert">{sendError}</p>}
        </form>
      </div>
    </section>
  );
}
