# Absolute Tracker — Project Structure

## Overview

Multi-outlet buffet food tracker. Mobile-first (max-width: 480px), dark-themed, built for single-handed use. Tracks units (sticks/portions/scoops) × pieces-per-unit per food item per daily session. Supports multiple restaurants/companies, each with its own menu and leaderboard.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS 3
- **Backend:** Firebase v10 (Auth + Firestore)
- **Package Manager:** pnpm

## Firestore Schema

```
/restaurants/{companyId}
  └── name: string                   // display name, e.g. "Absolute Barbecue"

/companies/{companyId}/food_items/{docId}
  ├── name: string
  ├── category: string               // "Chicken" | "Seafood" | "Veg Grill" | ...
  ├── defaultPiecesPerUnit: number
  └── unitType: "stick" | "piece" | "scoop" | "bowl" | "plate" | "skewer"

/companies/{companyId}/users/{uid}/sessions/{dateYMD}
  ├── date: string                   // "2026-07-05"
  ├── companyId: string
  ├── notes?: string                 // user's personal notes for the session
  └── items: {
        [itemId]: {
          units: number              // sticks/scoops/bowls/etc eaten
          piecesPerUnit: number      // pieces per serving (snapshot on first touch)
        }
      }

/companies/{companyId}/leaderboard/{uid}
  ├── uid: string
  ├── displayName: string
  ├── photoURL: string
  ├── bestScore: number              // total pieces of the user's best session
  ├── bestDate: string               // date of best session
  └── bestItems: {                   // snapshot of best session's items
        [itemId]: { units, piecesPerUnit }
      }
```

**User key:** Firebase Auth UID (not email). Security rules match `request.auth.uid`.

## Directory Structure

```
src/
├── app/
│   ├── globals.css                      # Tailwind directives, scrollbar, tap highlight
│   ├── layout.tsx                       # Root: AuthProvider, max-w-[480px] wrapper
│   ├── page.tsx                         # Auto-redirect to /companies or /login
│   ├── login/page.tsx                   # Server shell → LoginScreen
│   └── (protected)/
│       ├── layout.tsx                   # Auth guard (shared across all protected routes)
│       ├── companies/
│       │   └── page.tsx                 # Restaurant selector (lists /restaurants)
│       ├── track/
│       │   ├── layout.tsx               # SessionProvider
│       │   └── page.tsx                 # Tracker (reads ?company= & ?date= from URL)
│       ├── sessions/
│       │   └── page.tsx                 # Per-company session list + Start Today
│       └── leaderboard/
│           └── page.tsx                 # Top 3 users, live onSnapshot, expandable cards
├── components/
│   ├── LoginScreen.tsx                  # Google OAuth button, redirect to /companies
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
│   └── SessionContext.tsx               # Load by (companyId, date), leaderboard update, debounced sync
├── hooks/
│   └── useFoodItems.ts                  # Per-company fetch + seed catalog
└── lib/
    ├── constants.ts                     # DEFAULT_COMPANY_ID, CATEGORY_ORDER
    ├── firebase.ts                      # Firebase init (long-polling enabled for Chrome)
    ├── firestore.ts                     # All Firestore CRUD helpers (company-aware)
    ├── seed.ts                          # Seeds 27 menu items, deduplicates, upgrades old fields
    └── types.ts                         # FoodItem, SessionItem, FoodSession, Restaurant, LeaderboardEntry, etc.
```

## Component Tree (Runtime)

### Navigation Flow
```
<RootLayout>
  <AuthProvider>
    <div max-w-[480px]>
      <ProtectedLayout>                ← auth guard: redirects to /login if unauthenticated

        /companies → <CompaniesPage>  ← lists /restaurants, kind="Absolute Barbecue"
                      Click → /sessions?company=X

        /sessions?company=X → <SessionsPage>  ← per-company session list
          ├── "Leaderboard" button → /leaderboard?company=X
          ├── "Switch" button → /companies
          └── Click session → /track?company=X&date=Y

        /track?company=X&date=Y → <TrackLayout>
                                    <SessionProvider>
                                      <TrackPage>  ← calls loadSession(companyId, date)
                                        <Header>
                                          "Back" → /sessions?company=X
                                        <SessionSummary />
                                        <CategoryFilter />
                                        <SearchBar />
                                        <FoodCatalog groups />
                                        <SessionNotes />

        /leaderboard?company=X → <LeaderboardPage>  ← onSnapshot live top 3
                                   Click card → expand dishes from best session
```

### Data Flow
```
1. AUTH → AuthContext → user, signInWithPopup, signOut

2. COMPANY → CompaniesPage → listRestaurants() → user picks → /sessions?company=X

3. SESSION LIST → SessionsPage → listSessions(uid, companyId)
   - Today session card or "Start New Session" button
   - Past sessions list with stats

4. SESSION LOAD → TrackPage → loadSession(companyId, date) on SessionContext
   - Fetches session doc, populates items + notes
   - Fetches leaderboard entry → bestScoreRef for comparison

5. CATALOG → useFoodItems(companyId) → seedFoodItems(companyId) → fetchFoodItems(companyId)
   - Returns { items, loading } scoped to the company

6. FILTERING / STATS / COUNTERS → unchanged from previous

7. LEADERBOARD UPDATE → in SessionContext.triggerSync:
   - Compute total pieces of current session
   - If > bestScoreRef → updateLeaderboard(companyId, uid, { displayName, photoURL, bestScore, bestDate, bestItems })

8. LEADERBOARD PAGE → listenLeaderboard(companyId) via onSnapshot
   - Order by bestScore desc, limit 3
   - Resolve itemIds → names via useFoodItems catalog
   - Click to expand card → show dishes with units + pieces
```

## Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Auth method | `signInWithPopup` | Avoids CSP issues from Next.js dev overlay; no COOP header needed |
| Company scope | Dynamic `companyId` via URL param | Supports future multi-restaurant expansion; no hardcoded ID |
| Restaurant registry | `/restaurants/{id}` collection | Simple discovery; seeded with "Absolute Barbecue" on first visit |
| Leaderboard storage | Per-company `/leaderboard/{uid}` docs | Efficient query (orderBy + limit 3) with real-time onSnapshot |
| Leaderboard update | Triggered in session sync debounce | No extra infrastructure; updates only when current session beats best |
| Leaderboard score | Total pieces (units × piecesPerUnit) | More precise than raw unit count |
| Leaderboard dishes | Snapshot in leaderboard doc | Resolved to names via catalog on the leaderboard page |
| Session navigation | `?company=X&date=Y` query params | Clean URL-based routing; each component reads its own params |
| Catalog fetch | useFoodItems(companyId) hook | Per-company seeding + fetching in one hook |
| User display name | Firebase Auth displayName/email fallback | Used in leaderboard; no separate profile needed |

## Seed Data (27 Items)

See `docs/dishes.md` for full menu reference with Firestore document IDs.

| Item | Category | unitType | defaultPPU |
|---|---|---|---|
| Golgappe | Chaat | piece | 1 |
| Papdi chaat | Chaat | bowl | 1 |
| Aaloo tikki | Chaat | piece | 1 |
| Corn Mutter Ki Tikki | Veg Starters | piece | 1 |
| American Cheesy Potato | Veg Starters | piece | 1 |
| Crispy Corn | Veg Starters | scoop | 1 |
| Lebanese Mushroom Tikka | Veg Grill | stick | 3 |
| Tandoori Grill Veg | Veg Grill | plate | 1 |
| Achari Paneer Tikka | Veg Grill | stick | 1 |
| Afghani Soya Chaap | Veg Grill | stick | 2 |
| Malai Chaap | Veg Grill | piece | 1 |
| Churrasco Pineapple | Veg Grill | stick | 3 |
| Hariyali Chicken Tikka | Chicken | stick | 3 |
| Angara Malai Tangdi | Chicken | piece | 1 |
| Chicken Seekh Kebab | Chicken | skewer | 1 |
| Chicken wings | Chicken | piece | 1 |
| Mustard Kasundi Fish Tikka | Seafood | stick | 2 |
| Chilli Garlic Prawns | Seafood | stick | 3 |
| Octopus and squid bowl | Seafood | bowl | 1 |
| Cake | Desserts | piece | 1 |
| Pastry | Desserts | piece | 1 |
| Ice Cream | Desserts | scoop | 1 |
| Jalebi | Desserts | piece | 1 |
| Gulab Jamun | Desserts | piece | 1 |
| Halwa | Desserts | scoop | 1 |
| Brownie | Desserts | piece | 1 |
| Custard | Desserts | scoop | 1 |

## Security Rules (Firestore)

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /restaurants/{restaurant} {
      allow read: if request.auth != null;
      allow write: if false;
    }
    match /companies/{company}/food_items/{item} {
      allow read: if request.auth != null;
      allow write: if false;
    }
    match /companies/{company}/users/{uid}/sessions/{date} {
      allow read, write: if request.auth != null
        && request.auth.uid == uid;
    }
    match /companies/{company}/leaderboard/{uid} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
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

- **End session / locking:** Add a "finalize" button that sets a flag
- **Analytics:** Aggregate across sessions for trend charts
- **Offline:** Firestore offline persistence; UI could show "syncing" indicator
- **Admin catalog editor:** Simple page to manage food_items (add/edit/delete items)
- **Calories:** Add calorie field to dishes, score leaderboard by calories instead of pieces

---

*Keep this file updated when adding new components, changing the schema, or modifying the data flow.*
