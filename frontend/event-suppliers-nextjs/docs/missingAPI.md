# Missing APIs for User Dashboard

## Integrated ✅
| Feature | API | Status |
|---------|-----|--------|
| My Tenders | `GET /v1/users/me/jobs` | ✅ Integrated |
| My Favorites (suppliers) | `GET /v1/users/me/favorites` | ✅ Hook added, not yet wired in UI |

## Still using demo/mock data ❌
| Feature | Current | Missing API |
|---------|---------|-------------|
| Concepts I Liked | Hardcoded `likedConcepts` array | Need `GET /v1/users/me/concepts` or `GET /v1/users/me/favorites?type=concept` to fetch user's liked/pinned event concepts |
| Supplier Approval Count | Uses favorites count as proxy | Need `GET /v1/users/me/tenders/{id}/applications/count` or stats endpoint to get pending supplier application count per job |

## Partially integrated ⚠️
| Feature | API Used | Note |
|---------|----------|------|
| Supplier Approval Card | `GET /v1/users/me/favorites` | Shows saved suppliers count as proxy for "awaiting approval" — real approval count needs a job applications summary endpoint |
| Additional Suppliers Section | Uses internal mock data component | `GET /v1/suppliers` is available but `AdditionalSuppliersSection` fetches its own data |

## Suggested New Endpoints
1. `GET /v1/users/me/concepts` — return list of concepts the user has liked/saved  
2. `GET /v1/users/me/stats` — return counters (pending applications, active tenders, etc.)
