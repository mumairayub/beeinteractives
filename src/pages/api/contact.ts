import type { APIRoute } from 'astro';
import { Resend } from 'resend';

/*
 * Contact form handler: receives the form POST and emails it via Resend.
 * Runs as a Vercel serverless function (not prerendered).
 *
 * Environment variables (set in Vercel → Project → Settings → Environment
 * Variables, and in a local `.env` file for `npm run dev`):
 *   RESEND_API_KEY       – required, from https://resend.com/api-keys
 *   CONTACT_TO_EMAIL     – required, where enquiries are delivered
 *   CONTACT_FROM_EMAIL   – optional, e.g. "Umair Ayub <hello@yourdomain.com>"
 *                          (domain must be verified in Resend). Defaults to
 *                          Resend's test sender, which can only deliver to the
 *                          email address you signed up to Resend with.
 */
export const prerender = false;

const env = (name: string): string | undefined =>
  (import.meta.env[name] as string | undefined) ?? process.env[name] ?? undefined;

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const field = (form: FormData, name: string, max: number) =>
  String(form.get(name) ?? '')
    .trim()
    .slice(0, max);

/** JSON for fetch() callers, redirects for plain HTML form posts. */
const respond = (request: Request, ok: boolean, status: number, message: string) => {
  const wantsJson = (request.headers.get('accept') ?? '').includes('application/json');
  if (wantsJson) return Response.json({ ok, message }, { status });
  const url = new URL(ok ? '/thank-you' : '/#contact', request.url);
  if (!ok) url.searchParams.set('error', message);
  return Response.redirect(url, 303);
};

export const POST: APIRoute = async ({ request }) => {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return respond(request, false, 400, 'Invalid form submission.');
  }

  // Spam trap: bots fill hidden fields. Pretend success so they move on.
  if (field(form, '_honey', 200)) return respond(request, true, 200, 'Thanks!');

  const name = field(form, 'name', 100);
  const email = field(form, 'email', 200);
  const message = field(form, 'message', 5000);
  const topic = field(form, 'topic', 150) || 'Website enquiry';
  const page = field(form, 'page', 200);
  const consent = form.get('consent') ? 'Yes' : 'No';

  if (!name || !email || !isEmail(email)) {
    return respond(request, false, 400, 'Please enter your name and a valid email address.');
  }
  if (consent !== 'Yes') {
    return respond(request, false, 400, 'Please tick the consent box.');
  }

  const apiKey = env('RESEND_API_KEY');
  const to = env('CONTACT_TO_EMAIL');
  const from = env('CONTACT_FROM_EMAIL') || 'Website Contact Form <onboarding@resend.dev>';
  if (!apiKey || !to) {
    console.error('[contact] RESEND_API_KEY or CONTACT_TO_EMAIL is not set');
    return respond(request, false, 500, 'The form is not configured yet. Please try again later.');
  }

  const rows: Array<[string, string]> = [
    ['Name', name],
    ['Email', email],
    ['Message', message || '(no message)'],
    ['Form', topic],
    ['Page', page || '(unknown)'],
    ['Consent', consent],
  ];
  const html = `
    <h2 style="font-family:Arial,sans-serif;color:#0f172a">New enquiry from your website</h2>
    <table cellpadding="8" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">
      ${rows
        .map(
          ([k, v]) =>
            `<tr><th align="left" valign="top" style="background:#f1f5f9;border:1px solid #e2e8f0">${k}</th>` +
            `<td style="border:1px solid #e2e8f0;white-space:pre-wrap">${escapeHtml(v)}</td></tr>`
        )
        .join('')}
    </table>`;
  const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n');

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: to.split(',').map((s) => s.trim()),
      replyTo: email,
      subject: `New enquiry from ${name} (${topic})`,
      html,
      text,
    });
    if (error) {
      console.error('[contact] Resend error:', error);
      return respond(request, false, 502, 'Sorry, your message could not be sent. Please try again.');
    }
  } catch (err) {
    console.error('[contact] Unexpected error:', err);
    return respond(request, false, 500, 'Sorry, your message could not be sent. Please try again.');
  }

  return respond(request, true, 200, 'Thanks! Your message has been sent.');
};
