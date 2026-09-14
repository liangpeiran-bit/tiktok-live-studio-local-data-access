export class ApplicationSubmissionError extends Error {
  constructor(code) {
    super(code)
    this.name = 'ApplicationSubmissionError'
    this.code = code
  }
}

/**
 * Submit once, without logging answers or automatically retrying a possibly accepted request.
 * A Formspree acknowledgement is not proof of Inbox delivery: spam filtering can be silent.
 * Response contract: https://github.com/formspree/formspree-js/blob/main/packages/formspree-core/src/submission.ts
 * @param {string} endpoint
 * @param {FormData} payload
 * @param {{ fetchImpl?: typeof fetch, timeoutMs?: number }} options
 */
export async function submitApplication(endpoint, payload, { fetchImpl = globalThis.fetch, timeoutMs = 20000 } = {}) {
  // Check all values, including whitespace and duplicate fields. Never silently send a cleared trap.
  if (payload.getAll('_gotcha').some(value => value !== '')) {
    throw new ApplicationSubmissionError('HONEYPOT_FILLED')
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetchImpl(endpoint, {
      method: 'POST',
      body: payload,
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    })
    if (!response.ok) throw new ApplicationSubmissionError(response.status >= 500 ? 'UNCONFIRMED' : 'REJECTED')

    const body = await response.json()
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new ApplicationSubmissionError('UNCONFIRMED')
    }
    if ('error' in body || 'errors' in body || body.ok === false) {
      throw new ApplicationSubmissionError('REJECTED')
    }
    // Formspree's official client identifies success by a string `next`, not just HTTP 2xx.
    // We keep the local success panel and never navigate to a response-provided URL.
    if (typeof body.next !== 'string') throw new ApplicationSubmissionError('UNCONFIRMED')
  } catch (error) {
    if (error instanceof ApplicationSubmissionError) throw error
    throw new ApplicationSubmissionError('UNCONFIRMED')
  } finally {
    clearTimeout(timeout)
  }
}
