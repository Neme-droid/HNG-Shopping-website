'use client';

import { useState } from 'react';

export default function NewsletterForm() {
  const [status, setStatus] = useState<{ type: 'error' | 'success' | ''; text: string }>({ type: '', text: '' });
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="newsletter-form" noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const email = String(new FormData(form).get('email') ?? '').trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
          setStatus({ type: 'error', text: 'Please enter a valid email address.' });
          return;
        }
        setBusy(true);
        // TODO: POST to a route handler that stores the address (and sends the code via Mailgun).
        setTimeout(() => {
          setStatus({ type: 'success', text: `Thanks! Your 10% code is on its way to ${email}.` });
          form.reset();
          setBusy(false);
        }, 700);
      }}
    >
      <div className="form-group">
        <label htmlFor="newsletter-email">Email address</label>
        <input type="email" id="newsletter-email" name="email" placeholder="you@example.com" required aria-invalid={status.type === 'error'} />
      </div>
      <button type="submit" className="cta-button primary" disabled={busy}>
        {busy ? 'Subscribing…' : 'Subscribe and save 10%'}
      </button>
      <div className={`form-message ${status.type}`} id="form-message" aria-live="polite">{status.text}</div>
    </form>
  );
}
