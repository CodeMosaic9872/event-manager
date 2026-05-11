# API Integration
- Backend wraps all responses in `{ success: true, data: { items: [...] } }`; every RTK Query endpoint needs `transformResponse` to unwrap `r.data.items ?? r.data ?? r`. Confidence: 0.85
- Jobs endpoints are `/v1/jobs/{id}`, `/v1/jobs/{id}/publish`, `/v1/jobs/{id}/applications` — NOT `/v1/users/me/jobs/{id}`. Confidence: 0.70
- `/v1/auth/me` returns `{ data: { items: [{ id, email, roles, avatarImageUrl, coverImageUrl, supplier }] } }` — extract `data.items[0]` in transformResponse. Confidence: 0.80
- Supplier profile PATCH/POST requires `slug` field always — generate from `businessName` via `toSlug()`: lowercase, strip non-alphanumeric, spaces to hyphens. Confidence: 0.80
- Login payload accepts OTP `code` directly (`{ phone, code }`) — no separate verify-otp step for login. Confidence: 0.75
- Register flow: request-otp (phone only) → verify-otp → register with full details. Confidence: 0.75
