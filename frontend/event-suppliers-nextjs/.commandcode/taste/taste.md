# API Integration
See [api-integration/taste.md](api-integration/taste.md)
# Auth & Token Management
- Store tokens under `auth` key in localStorage. Confidence: 0.85
- Hydrate auth state from localStorage BEFORE setting up the store subscriber. Confidence: 0.80
- Check `isAuthHydrated` before redirecting unauthenticated users. Confidence: 0.85
- OTP flow: 6-digit inputs with auto-focus, `inputMode=numeric`, `maxLength={1}`, Backspace moves to previous field. Confidence: 0.75

# Form Validation Patterns
- Israeli phone: `/^(0\\d{9}|\\+972\\d{9})$/` with `maxLength={13}`. Confidence: 0.85
- Email: `/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/`. Confidence: 0.85
- URL validation: `/^(https?:\\/\\/)?[\\w.-]+\\.[a-z]{2,}(\\/\\S*)?$/i`. Confidence: 0.70
- Description min length: 10 characters. Confidence: 0.70

# File Upload
- Use `POST /v1/auth/me/media/upload-file` (multipart FormData with `file` + `imageKind`). Confidence: 0.80
- Upload on Save button click, not on file select; show local preview via `URL.createObjectURL`. Confidence: 0.75

# Button & Loading States
- During API calls: show spinner SVG + saving text, disable button with `opacity-60 cursor-not-allowed`. Confidence: 0.85
- Disable all form inputs during save via local `isSubmitting` state. Confidence: 0.75

# Session-Based Multi-Step Flow
- Join supplier wizard uses `sessionStorage(supplierJoinStep1)` leading to step-2/3/4/5. Confidence: 0.70

# Codebase Organization
- SVGs in `/public/icons/`, PNGs in `/public/images/`, avatars in `/public/avatars/`. Confidence: 0.80
- `use client` directive must be the VERY first line of a file. Confidence: 0.80
- Use `requestAnimationFrame(() => router.replace(...))` for client-only redirects. Confidence: 0.70
