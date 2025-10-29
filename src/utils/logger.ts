// Minimal logger with levels and request logging. No external deps.
const RESET = '\x1b[0m'
const BRIGHT = '\x1b[1m'
const DIM = '\x1b[2m'
const RED = '\x1b[31m'
const YELLOW = '\x1b[33m'
const GREEN = '\x1b[32m'
const CYAN = '\x1b[36m'

function timestamp() {
	return new Date().toISOString()
}

function pad(s: string, len = 7) {
	return s + ' '.repeat(Math.max(0, len - s.length))
}

function format(level: string, color: string, msg: string) {
	return `${BRIGHT}${color}${pad(level.toUpperCase())}${RESET} ${DIM}${timestamp()}${RESET} ${msg}`
}

export function info(msg: string) {
	console.log(format('info', GREEN, msg))
}

export function warn(msg: string) {
	console.warn(format('warn', YELLOW, msg))
}

export function error(msg: string) {
	console.error(format('error', RED, msg))
}

export function debug(msg: string) {
	// Only show debug when NODE_ENV !== 'production'
	if (process.env.NODE_ENV === 'production') return
	console.debug(format('debug', CYAN, msg))
}

export type ReqLike = { method?: string | undefined; url?: string | undefined }

/** log an HTTP request/response line similar to Next.js dev server
 * example: GET /items/123 200 - 12.3 ms
 */
export function logRequest(req: ReqLike, status: number | undefined, durationMs?: number) {
	const method = (req.method ?? 'GET').toUpperCase()
	const url = req.url ?? '/' 
	const statusStr = status == null ? '-' : String(status)
	const dur = typeof durationMs === 'number' ? `${durationMs.toFixed(2)} ms` : '-'
	const color = (s: number | undefined) => {
		if (!s) return YELLOW
		if (s >= 500) return RED
		if (s >= 400) return YELLOW
		if (s >= 300) return CYAN
		return GREEN
	}
	const statusNum = typeof status === 'number' ? status : undefined
	const line = `${method} ${url} ${statusStr} - ${dur}`
	const out = `${BRIGHT}${color(statusNum)}${statusStr}${RESET} ${timestamp()} ${line}`
	console.log(out)
}

export default {
	info,
	warn,
	error,
	debug,
	logRequest,
}

