# Absolute Tracker — Project Structure

## Overview

Multi-outlet buffet food tracker. Mobile-first (max-width: 480px), dark-themed, built for single-handed use. Tracks units (sticks/portions/scoops) × pieces-per-unit per food item per daily session.

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
  ├── category: string               // "Chicken" | "Seafood" | "Veg Grill" | ...
  ├── defaultPiecesPerUnit: number
  └── unitType: "stick" | "piece" | "scoop" | "bowl" | "plate" | "skewer"

/companies/{companyId}/users/{uid}/sessions/{dateYMD}
  ├── date: string                   // "2026-07-05"
  ├── notes?: string                 // user's personal notes for the session
  └── items: {
        [itemId]: {
          units: number              // sticks/scoops/bowls/etc eaten
          piecesPerUnit: number      // pieces per serving (snapshot on first touch)
        }
      }
```

**Company context:** Hardcoded to `"absolute-barbecue"` in `src/lib/constants.ts`. All Firestore paths use `COMPANY_ID`.

**User key:** Firebase Auth UID (not email). Security rules match `request.auth.uid`.

## Directory Structure

```
src/
├── app/
│   ├── globals.css                      # Tailwind directives, scrollbar, tap highlight
│   ├── layout.tsx                       # Root: AuthProvider, max-w-[480px] wrapper
│   ├── page.tsx                         # Auto-redirect to /sessions or /login
│   ├── login/page.tsx                   # Server shell → LoginScreen
│   └── (protected)/
│       ├── layout.tsx                   # Auth guard (shared across all protected routes)
│       ├── track/
│       │   ├── layout.tsx               # SessionProvider
│       │   └── page.tsx                 # Tracker (reads ?date= from URL)
│       └── sessions/
│           └── page.tsx                 # Session list + Start Today
├── components/
│   ├── LoginScreen.tsx                  # Google OAuth button, redirect to /sessions
│   ├── SessionSummary.tsx               # Stats card: total units/pieces, top 3 categories
│   ├── CategoryFilter.tsx               # Dynamic pill tabs from catalog categories
│   ├── SearchBar.tsx                    # Search with clear button
│   ├── SessionNotes.tsx                 # Personal notes textarea, auto-saved to session
│   ├── FoodCatalog.tsx                  # Pure presentational: renders groups
│   ├── CategoryGroup.tsx                # Sticky header + item cards, count badge
│   ├── FoodItemCard.tsx                 # Card row: name, badge, Counter
│   └── Counter.tsx                      # − / units / + , inline PPU edit, unitType label
├── context/
│   ├── AuthContext.tsx                  # onAuthStateChanged, signInWithPopup, signOut
│   └── SessionContext.tsx               # Session loading by date, optimistic counts, debounced sync (400ms)
├── hooks/
│   ├── useDebounce.ts                   # Generic debounce (available but not currently used)
│   └── useFoodItems.ts                  # Fetch + seed catalog
└── lib/
    ├── constants.ts                     # COMPANY_ID = "absolute-barbecue"
    ├── firebase.ts                      # Firebase init (long-polling enabled for Chrome)
    ├── firestore.ts                     # All Firestore CRUD helpers
    ├── seed.ts                          # Seeds 20 menu items, deduplicates, upgrades old fields
    └── types.ts                         # FoodItem, SessionItem, FoodSession, UnitType, CategoryGroup
```

## Component Tree (Runtime)

### Auth Flow
```
<RootLayout>
  <AuthProvider>
    <div max-w-[480px]>
      <ProtectedLayout>                ← auth guard: redirects to /login if unauthenticated
        ├── /sessions → <SessionsPage> ← lists all sessions, "Start Today" button
        └── /track?date= → <TrackLayout>
                             <SessionProvider>
                               <TrackPage>  ← reads ?date= from URL, calls loadSession(date)
                                 <Header>
                                 <SessionSummary />
                                 <CategoryFilter />
                                 <SearchBar />
                                 <FoodCatalog groups />
                                   <CategoryGroup>
                                     <FoodItemCard>
                                       <Counter />
                                 <SessionNotes />
```

### Session Selection Flow
```
1. User logs in → redirects to /sessions
2. SessionsPage fetches ALL session docs (ordered by date desc)
3a. If today's session exists → shows "Today's Session" card with Continue button
3b. If not → shows "Start New Session" button (creates session doc + navigates)
4. Past sessions shown as list with date, item count, units, pieces
5. Click any session → navigates to /track?date=YYYY-MM-DD
```

## Data Flow

```
1. AUTH → AuthContext reads onAuthStateChanged → provides user, signInWithPopup, signOut

2. SESSION LIST → SessionsPage fetches /companies/{COMPANY_ID}/users/{uid}/sessions (all docs)
   - Shows today's session (if exists) or Start Today button
   - Lists past sessions with item/unit/piece counts
   - Tapping a session navigates to /track?date={date}

3. SESSION LOAD → TrackPage reads ?date= from URL → calls loadSession(date) on SessionContext
   - If session doc exists → populate items map + notes
   - If no session → show error

4. CATALOG → useFoodItems hook:
   - On mount: seedFoodItems() (deduplicates + upgrades existing docs) then fetchFoodItems()
   - Returns { items, loading }
   - Catalog is read-only from the UI (no user additions)

5. FILTERING → TrackPage computes filteredGroups:
   - active filter → category match
   - searchQuery → name includes (case-insensitive)
   - Groups by category → renders FoodCatalog

6. STATS → TrackPage computes:
   - totalUnits, totalPieces (across all items)
   - topCategories: top 3 by unit count

7. COUNTER → optimistic local state, debounced Firestore write (400ms):
   - increment(itemId, defaultPPU): creates or increments units
   - decrement(itemId): decrements units (min 0)
   - setPiecesPerUnit(itemId, value): updates piecesPerUnit (min 1)
   - triggerSync: clearTimeout → setTimeout → updateSessionItems

8. NOTES → SessionNotes component, debounced Firestore write (600ms):
   - Notes are written to session.notes field on the session document
   - Uses session.date to write to the correct session
```

## Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Auth method | `signInWithPopup` | Avoids CSP issues from Next.js dev overlay; no COOP header needed |
| Firestore init | `experimentalForceLongPolling: true` | Avoids WebSocket transport issues in Chrome |
| User doc key | Firebase UID | Cleaner than email, easy to match in security rules |
| Session items shape | `{ units, piecesPerUnit }` | Separates serving count from piece multiplier |
| PPU snapshot | Captured on first touch | Changing catalog default doesn't retroactively affect existing sessions |
| Sync strategy | Debounced full-write (400ms) | Optimistic UI; last write wins; simple, no conflict logic needed |
| Session navigation | `?date=` query param | Clean URL-based routing; sessions page controls the flow |
| Catalog fetch | useFoodItems hook | Single source of truth; catalog is admin-curated only |
| Unit type | `unitType` field on FoodItem | Describes serving method: stick, scoop, bowl, plate, etc. |
| Categories | Dynamic strings (not enum) | Flexible for new menu sections without code changes |
| Category filter | Dynamic pills from catalog | Always stays in sync with actual data |
| User additions | Replaced by session notes | Prevents catalog pollution; notes are personal |
| Notes persistence | Debounced to session doc | Same session document, merged silently |
| Duplicate cleanup | Seed function deduplicates by name | Keeps Firestore clean when schema evolves |
| State management | In TrackPage (filter, search) | Lifted from children → clean, testable, no deep prop drilling |

## Seed Data (20 Items)

| Item | Category | unitType | defaultPPU |
|---|---|---|---|
| Hariyali Chicken Tikka | Chicken | stick | 3 |
| Angara Malai Tangdi | Chicken | piece | 1 |
| Chicken Seekh Kebab | Chicken | skewer | 1 |
| Chicken wings | Chicken | piece | 1 |
| Mustard Kasundi Fish Tikka | Seafood | stick | 2 |
| Chilli Garlic Prawns | Seafood | stick | 3 |
| Octopus and squid bowl | Seafood | bowl | 1 |
| Lebanese Mushroom Tikka | Veg Grill | stick | 3 |
| Tandoori Grill Veg | Veg Grill | plate | 1 |
| Achari Paneer Tikka | Veg Grill | stick | 1 |
| Afghani Soya Chaap | Veg Grill | stick | 2 |
| Malai Chaap | Veg Grill | piece | 1 |
| Churrasco Pineapple | Veg Grill | stick | 3 |
| Corn Mutter Ki Tikki | Veg Starters | piece | 1 |
| American Cheesy Potato | Veg Starters | piece | 1 |
| Crispy Corn | Veg Starters | scoop | 1 |
| Golgappe | Chaat | piece | 1 |
| Papdi chaat | Chaat | bowl | 1 |
| Aaloo tikki | Chaat | piece | 1 |
| Cake | Desserts | piece | 1 |

## Security Rules (Firestore)

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /companies/{company}/food_items/{item} {
      allow read: if request.auth != null;
      allow write: if false;                    // admin only via Firebase Console
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
- **End session / locking:** Add a "finalize" button that sets a flag
- **Analytics:** Aggregate across sessions for trend charts
- **Offline:** Firestore offline persistence is enabled by default; UI could show "syncing" indicator
- **Admin catalog editor:** Simple page to manage food_items (add/edit/delete items)

---

*Keep this file updated when adding new components, changing the schema, or modifying the data flow.*
