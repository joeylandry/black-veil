/** Shared-secret auth for the staff-only /admin claim queue. No per-staff accounts yet. */
export function isAuthorizedAdmin(request: Request) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}
