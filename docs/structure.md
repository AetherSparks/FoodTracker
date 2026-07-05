# Absolute Tracker — Project Structure

## Overview

Multi-outlet buffet food tracker. Mobile-first (max-width: 480px), dark-themed, built for single-handed use. Tracks units (sticks/portions) × pieces-per-unit per food item per daily session.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS 3
- **Backend:** Firebase v10 (Auth + Firestore)
- **Package Manager:** pnpm

## Firestore Schema

```
/companies/{companyId}/food_items/{docId}
  ├── name: string
  ├── category: "Veg" | "Non-Veg"
  └── defaultPiecesPerUnit: number

/companies/{companyId}/users/{uid}/sessions/{dateYMD}
  ├── date: string        // "2026-07-05"
  └── items: {
        [itemId]: {
          units: number         // sticks/portions eaten
          piecesPerUnit: number // pieces per stick (snapshot from catalog on first touch)
        }
      }
```

**Company context:** Hardcoded to `"absolute-barbecue"` in `src/lib/constants.ts`. All Firestore paths use `COMPANY_ID`.

**User key:** Firebase Auth UID (not email). Avoids dot/encoding issues in document paths. Security rules match `request.auth.uid`.

## Directory Structure

```
src/
├── app/
│   ├── globals.css                      # Tailwind directives, scrollbar, tap highlight
│   ├── layout.tsx                       # Root: AuthProvider, max-w-[480px] wrapper
│   ├── page.tsx                         # Auto-redirect to /track or /login
│   ├── login/page.tsx                   # Server shell → LoginScreen
│   └── (protected)/track/
│       ├── layout.tsx                   # Auth guard, SessionProvider
│       └── page.tsx                     # Orchestrator (see component tree below)
├── components/
│   ├── LoginScreen.tsx                  # Google OAuth button, redirect to /track
│   ├── SessionStarter.tsx               # "Start New Session" CTA
│   ├── SessionSummary.tsx               # Stats card: total units/pieces, veg/non-veg
│   ├── CategoryFilter.tsx               # [All | Veg | Non-Veg] pill tabs
│   ├── SearchBar.tsx                    # Search with clear button
│   ├── FoodCatalog.tsx                  # Pure presentational: renders groups
│   ├── CategoryGroup.tsx                # Sticky header + item cards, count badge
│   ├── FoodItemCard.tsx                 # Card row: name, badge, Counter
│   ├── Counter.tsx                      # − / units / + , inline PPU edit, total pcs
│   └── AddMissingItemForm.tsx           # Collapsible bottom form, adds to global catalog
├── context/
│   ├── AuthContext.tsx                  # onAuthStateChanged, signInWithRedirect, signOut
│   └── SessionContext.tsx               # Today's session, optimistic counts, debounced sync (400ms)
├── hooks/
│   ├── useDebounce.ts                   # Generic debounce (available but not currently used — inline in context)
│   └── useFoodItems.ts                  # Fetch + seed catalog, expose refresh()
└── lib/
    ├── constants.ts                     # COMPANY_ID = "absolute-barbecue"
    ├── firebase.ts                      # Firebase init (long-polling enabled for Chrome)
    ├── firestore.ts                     # All Firestore CRUD helpers
    ├── seed.ts                          # Seeds 20 menu items on first catalog load
    └── types.ts                         # FoodItem, SessionItem, FoodSession, CategoryGroup
```

## Component Tree (Runtime)

```
<RootLayout>                          ← server component
  <AuthProvider>                      ← listens to onAuthStateChanged
    <div max-w-[480px]>
      <TrackLayout>                   ← auth guard, wraps SessionProvider
        <SessionProvider>             ← fetches today's session, manages items state
          <TrackPage>                 ← orchestrator
            <Header>                  ← sticky: logo, user name, Exit button, date/outlet bar
            <SessionSummary stats />  ← total units, total pieces, veg/non-veg breakdown
            <CategoryFilter />        ← [All | Veg | Non-Veg] state lifted to TrackPage
            <SearchBar />             ← search query state lifted to TrackPage
            <FoodCatalog groups />    ← receives filtered/grouped items
              <CategoryGroup>
                <FoodItemCard>
                  <Counter />
              ...
            <AddMissingItemForm />    ← collapsible fixed bottom, calls refresh() on add
```

## Data Flow

```
1. AUTH → AuthContext reads onAuthStateChanged → provides user, loading, signInWithGoogle, signOut

2. SESSION → SessionProvider reads /companies/{COMPANY_ID}/users/{uid}/sessions/{today}
   - Existing session → populate items map
   - No session → hasSession=false → show SessionStarter
   - "Start New Session" → createSession(uid, today) → set items={}

3. CATALOG → useFoodItems hook:
   - On mount: seedFoodItems() then fetchFoodItems()
   - Returns { items, loading, refresh }
   - refresh() called after AddMissingItemForm submits

4. FILTERING → TrackPage computes filteredGroups:
   - filter !== "all" → category match
   - searchQuery → name includes (case-insensitive)
   - Groups by category → renders FoodCatalog

5. STATS → TrackPage computes from sessionItems + foodItems:
   - totalUnits, totalPieces, vegUnits, nonVegUnits

6. COUNTER → optimistic local state, debounced Firestore write (400ms):
   - increment(itemId, defaultPPU): creates or increments units
   - decrement(itemId): decrements units (min 0)
   - setPiecesPerUnit(itemId, value): updates piecesPerUnit (min 1)
   - triggerSync: clearTimeout → setTimeout → updateSessionItems
```

## Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Auth method | `signInWithRedirect` | Avoids Chrome COOP policy breaking popups |
| Firestore init | `experimentalForceLongPolling: true` | Avoids WebSocket transport issues in Chrome |
| User doc key | Firebase UID | Cleaner than email (no dot escaping), easy to match in security rules |
| Session items shape | `{ units, piecesPerUnit }` | Separates stick count from piece multiplier |
| PPU snapshot | Captured on first touch | Changing catalog default doesn't retroactively affect existing sessions |
| Sync strategy | Debounced full-write (400ms) | Optimistic UI; last write wins; simple, no conflict logic needed |
| Catalog fetch | useFoodItems hook | Single source of truth, re-fetched on add-item |
| state management | In TrackPage (filter, search) | Lifted from children → clean, testable, no prop drilling beyond one level |
| Add form | Collapsible (tap to expand) | Saves screen space on mobile |

## Security Rules (Firestore)

Location: `firestore.rules` — paste into Firebase Console → Firestore → Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /companies/{company}/food_items/{item} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if false;
    }
    match /companies/{company}/users/{uid}/sessions/{date} {
      allow read, write: if request.auth != null
        && request.auth.uid == uid;
    }
  }
}
```

## Environment Variables (.env.local)

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## Future Expansion Points

- **Multi-company:** `COMPANY_ID` is already parameterized; add a company selector or onboarding flow
- **Past sessions history:** Query `/companies/{companyId}/users/{uid}/sessions/` ordered by date desc
- **End session / locking:** Add a "finalize" button that sets a flag or writes a snapshot
- **Analytics:** Aggregate across sessions for trend charts
- **Offline:** Firebase Firestore has offline persistence by default; UI could show "syncing" indicator

---

*Keep this file updated when adding new components, changing the schema, or modifying the data flow.*
