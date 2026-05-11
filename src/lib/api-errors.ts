import Anthropic from '@anthropic-ai/sdk'

export type AIProvider = 'Anthropic' | 'Gemini'

export interface MappedAIError {
  message: string
  status: number
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}

function mapAnthropicError(error: unknown): MappedAIError | null {
  if (error instanceof Anthropic.AuthenticationError) {
    return { message: 'API key Anthropic invalid sau lipsește.', status: 401 }
  }
  if (error instanceof Anthropic.PermissionDeniedError) {
    return { message: 'Acces refuzat de Anthropic (verifică permisiunile cheii).', status: 403 }
  }
  if (error instanceof Anthropic.RateLimitError) {
    return { message: 'Rate limit atins. Încearcă din nou peste câteva secunde.', status: 429 }
  }
  if (error instanceof Anthropic.APIConnectionTimeoutError) {
    return { message: 'Anthropic nu a răspuns la timp. Încearcă din nou.', status: 504 }
  }
  if (error instanceof Anthropic.APIConnectionError) {
    return { message: 'Eroare de conexiune cu Anthropic. Verifică internetul.', status: 502 }
  }
  if (error instanceof Anthropic.BadRequestError) {
    return { message: `Cerere invalidă către Anthropic: ${error.message}`, status: 400 }
  }
  if (error instanceof Anthropic.InternalServerError) {
    return { message: `Anthropic a returnat o eroare internă: ${error.message}`, status: 502 }
  }
  if (error instanceof Anthropic.APIError) {
    return { message: `Anthropic a returnat o eroare: ${error.message}`, status: 502 }
  }
  return null
}

function mapGeminiError(error: unknown): MappedAIError | null {
  const msg = errorMessage(error).toLowerCase()
  if (msg.includes('api key') || msg.includes('api_key') || msg.includes('unauthorized')) {
    return { message: 'API key Gemini invalid sau lipsește.', status: 401 }
  }
  if (msg.includes('quota') || msg.includes('rate') || msg.includes('429')) {
    return { message: 'Rate limit / cota Gemini atinsă. Încearcă mai târziu.', status: 429 }
  }
  if (msg.includes('timeout') || msg.includes('deadline')) {
    return { message: 'Gemini nu a răspuns la timp. Încearcă din nou.', status: 504 }
  }
  if (msg.includes('fetch failed') || msg.includes('network') || msg.includes('econnreset')) {
    return { message: 'Eroare de conexiune cu Gemini. Verifică internetul.', status: 502 }
  }
  return null
}

export function mapAIError(error: unknown, provider: AIProvider): MappedAIError {
  const providerMapped = provider === 'Anthropic' ? mapAnthropicError(error) : mapGeminiError(error)
  if (providerMapped) return providerMapped

  if (error instanceof SyntaxError) {
    return { message: 'Răspunsul AI nu a putut fi parsat (JSON invalid).', status: 502 }
  }

  const msg = errorMessage(error)
  if (msg.includes('trunchiat')) {
    return { message: msg, status: 502 }
  }
  if (msg.includes('nu conține JSON valid')) {
    return { message: 'Răspunsul AI nu conține JSON valid.', status: 502 }
  }

  return { message: `Eroare neașteptată: ${msg}`, status: 500 }
}
