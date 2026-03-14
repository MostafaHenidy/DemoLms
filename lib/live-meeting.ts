/**
 * Create a Zoom or Google Meet session via their APIs.
 * Session must not be recorded or shared (enforced in meeting settings where supported).
 * Env: ZOOM_API_KEY, ZOOM_API_SECRET (Zoom); GOOGLE_CALENDAR_CREDENTIALS JSON (Meet, optional).
 */

import crypto from "crypto"

export type LiveMeetingProvider = "zoom" | "google_meet"

export interface CreateMeetingParams {
  title: string
  startTime: Date
  durationMinutes: number
}

export interface CreateMeetingResult {
  meetingId: string | null
  meetingUrl: string
  meetingPassword: string | null
}

function base64UrlEncode(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function getZoomJwt(): string | null {
  const key = process.env.ZOOM_API_KEY
  const secret = process.env.ZOOM_API_SECRET
  if (!key || !secret) return null
  const header = { alg: "HS256", typ: "JWT" }
  const payload = {
    iss: key,
    exp: Math.floor(Date.now() / 1000) + 3600,
  }
  const h = base64UrlEncode(Buffer.from(JSON.stringify(header)))
  const p = base64UrlEncode(Buffer.from(JSON.stringify(payload)))
  const sig = crypto.createHmac("sha256", secret).update(`${h}.${p}`).digest()
  return `${h}.${p}.${base64UrlEncode(sig)}`
}

export async function createZoomMeeting(params: CreateMeetingParams): Promise<CreateMeetingResult> {
  const jwt = getZoomJwt()
  if (!jwt) {
    return {
      meetingId: null,
      meetingUrl: "https://zoom.us/j/PLACEHOLDER_SET_ZOOM_API_KEY_AND_SECRET",
      meetingPassword: null,
    }
  }
  const startTimeIso = params.startTime.toISOString().replace(/\.\d{3}Z$/, "Z")
  const res = await fetch("https://api.zoom.us/v2/users/me/meetings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      topic: params.title,
      type: 2,
      start_time: startTimeIso,
      duration: params.durationMinutes,
      timezone: process.env.TZ || "UTC",
      settings: {
        host_video: true,
        participant_video: true,
        auto_recording: "none",
        allow_share_recording: false,
        join_before_host: false,
      },
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { message?: string }).message || `Zoom API error: ${res.status}`)
  }
  const data = (await res.json()) as {
    id?: number
    join_url?: string
    password?: string
  }
  return {
    meetingId: data.id != null ? String(data.id) : null,
    meetingUrl: data.join_url || "",
    meetingPassword: data.password || null,
  }
}

export async function createGoogleMeetMeeting(
  _params: CreateMeetingParams
): Promise<CreateMeetingResult> {
  // Optional: set GOOGLE_CALENDAR_CREDENTIALS (JSON) and add googleapis to create Meet via Calendar API
  return {
    meetingId: null,
    meetingUrl:
      process.env.GOOGLE_CALENDAR_CREDENTIALS
        ? "https://meet.google.com/new"
        : "https://meet.google.com/PLACEHOLDER_ADD_GOOGLE_CALENDAR_CREDENTIALS",
    meetingPassword: null,
  }
}

export async function createLiveMeeting(
  provider: LiveMeetingProvider,
  params: CreateMeetingParams
): Promise<CreateMeetingResult> {
  if (provider === "zoom") return createZoomMeeting(params)
  return createGoogleMeetMeeting(params)
}
