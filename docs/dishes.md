# Absolute Barbecue — Menu Reference

**Company ID:** `absolute-barbecue`

All dishes are stored in `/companies/absolute-barbecue/food_items/`.  
To update the seed list, edit `src/lib/seed.ts`.

---

## Chaat

| Dish | unitType | defaultPPU | Firestore Doc ID |
|---|---|---|---|
| Golgappe | piece | 1 | `1cLJzSqkXlOTy1hlrBlD` |
| Papdi chaat | bowl | 1 | `fgylXMA0itx1p8zoXjjU` |
| Aaloo tikki | piece | 1 | `GP6aFFrXzQnuTFRIQxHb` |

## Veg Starters

| Dish | unitType | defaultPPU | Firestore Doc ID |
|---|---|---|---|
| Corn Mutter Ki Tikki | piece | 1 | `JyhoGkXnjN69TjjiEzBA` |
| American Cheesy Potato | piece | 1 | `0ytBvjqWMPXP13v7p5B2` |
| Crispy Corn | scoop | 1 | `tSfNUXwr24eNfXQayD3T` |

## Veg Grill

| Dish | unitType | defaultPPU | Firestore Doc ID |
|---|---|---|---|
| Lebanese Mushroom Tikka | stick | 3 | `MCWA0TY3TzhCeMIRQXIF` |
| Tandoori Grill Veg | plate | 1 | (N/A) |
| Achari Paneer Tikka | stick | 1 | `Fd64etdqHRpS9Jjm0KhB` |
| Afghani Soya Chaap | stick | 2 | `FhmSmC9hMEOWS8bi0mdQ` |
| Malai Chaap | piece | 1 | `dzDsigGfk31Zz3LcAcvD` |
| Churrasco Pineapple | stick | 3 | `2Lte65IOlLHNz072IgID` |

## Chicken

| Dish | unitType | defaultPPU | Firestore Doc ID |
|---|---|---|---|
| Hariyali Chicken Tikka | stick | 3 | `4JRABajmTAFygoTlGtLQ` |
| Angara Malai Tangdi | piece | 1 | `CbTeJ8anriuY7e96aFpO` |
| Chicken Seekh Kebab | skewer | 1 | `8SzXyFf0lL2JGfccW6vR` |
| Chicken wings | piece | 1 | `4sebT0ZO7HAgVc8XFsx8` |

## Seafood

| Dish | unitType | defaultPPU | Firestore Doc ID |
|---|---|---|---|
| Mustard Kasundi Fish Tikka | stick | 2 | `LhqQ6dLdpw2Ty37vkmRY` |
| Chilli Garlic Prawns | stick | 3 | `bx1JObMNlStGxQlE0RIZ` |
| Octopus and squid bowl | bowl | 1 | `CERdjr8t81TLYKz7A1gg` |

## Desserts

| Dish | unitType | defaultPPU | Firestore Doc ID |
|---|---|---|---|
| Cake | piece | 1 | `F2j46gIc1TOHTVaPOsnB` |
| Pastry | piece | 1 | `2611mXsfDIxwMIrFMoRK` |
| Ice Cream | scoop | 1 | `A9OPq7weMd7SR4iIrfx0` |
| Jalebi | piece | 1 | `dBYyF8gI2DOEL2F3vf2m` |
| Gulab Jamun | piece | 1 | `bj8TlQxRnWk803us83XU` |
| Halwa | scoop | 1 | `xT5knYD3wTwQiSw4MWDL` |
| Brownie | piece | 1 | `4iPT1019KGYECRrYMplu` |
| Custard | scoop | 1 | `T8UdDje21mU7NNcXOQCM` |

---

## Adding / Removing Dishes

1. Edit the `SEED_ITEMS` array in `src/lib/seed.ts`
2. On next app mount, the seed will:
   - Update fields on existing matching docs
   - Delete duplicate docs (same name, multiple entries)
   - Create docs for any new names
3. To change a dish's category / unitType / PPU, just update its entry in the seed — the upgrade logic propagates it
4. Run `pnpm dev` to apply changes
