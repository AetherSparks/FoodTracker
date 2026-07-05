import { db } from "./firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { COMPANY_ID } from "./constants";
import type { UnitType } from "./types";

interface SeedItem {
  name: string;
  category: string;
  defaultPiecesPerUnit: number;
  unitType: UnitType;
}

const SEED_ITEMS: SeedItem[] = [
  { name: "Golgappe", category: "Chaat", defaultPiecesPerUnit: 1, unitType: "piece" },
  { name: "Papdi chaat", category: "Chaat", defaultPiecesPerUnit: 1, unitType: "bowl" },
  { name: "Aaloo tikki", category: "Chaat", defaultPiecesPerUnit: 1, unitType: "piece" },
  { name: "Corn Mutter Ki Tikki", category: "Veg Starters", defaultPiecesPerUnit: 1, unitType: "piece" },
  { name: "American Cheesy Potato", category: "Veg Starters", defaultPiecesPerUnit: 1, unitType: "piece" },
  { name: "Crispy Corn", category: "Veg Starters", defaultPiecesPerUnit: 1, unitType: "scoop" },
  { name: "Lebanese Mushroom Tikka", category: "Veg Grill", defaultPiecesPerUnit: 3, unitType: "stick" },
  { name: "Tandoori Grill Veg", category: "Veg Grill", defaultPiecesPerUnit: 1, unitType: "plate" },
  { name: "Achari Paneer Tikka", category: "Veg Grill", defaultPiecesPerUnit: 1, unitType: "stick" },
  { name: "Afghani Soya Chaap", category: "Veg Grill", defaultPiecesPerUnit: 2, unitType: "stick" },
  { name: "Malai Chaap", category: "Veg Grill", defaultPiecesPerUnit: 1, unitType: "piece" },
  { name: "Churrasco Pineapple", category: "Veg Grill", defaultPiecesPerUnit: 3, unitType: "stick" },
  { name: "Hariyali Chicken Tikka", category: "Chicken", defaultPiecesPerUnit: 3, unitType: "stick" },
  { name: "Angara Malai Tangdi", category: "Chicken", defaultPiecesPerUnit: 1, unitType: "piece" },
  { name: "Chicken Seekh Kebab", category: "Chicken", defaultPiecesPerUnit: 1, unitType: "skewer" },
  { name: "Chicken wings", category: "Chicken", defaultPiecesPerUnit: 1, unitType: "piece" },
  { name: "Mustard Kasundi Fish Tikka", category: "Seafood", defaultPiecesPerUnit: 2, unitType: "stick" },
  { name: "Chilli Garlic Prawns", category: "Seafood", defaultPiecesPerUnit: 3, unitType: "stick" },
  { name: "Octopus and squid bowl", category: "Seafood", defaultPiecesPerUnit: 1, unitType: "bowl" },
  { name: "Cake", category: "Desserts", defaultPiecesPerUnit: 1, unitType: "piece" },
  { name: "Pastry", category: "Desserts", defaultPiecesPerUnit: 1, unitType: "piece" },
  { name: "Ice Cream", category: "Desserts", defaultPiecesPerUnit: 1, unitType: "scoop" },
  { name: "Jalebi", category: "Desserts", defaultPiecesPerUnit: 1, unitType: "piece" },
  { name: "Gulab Jamun", category: "Desserts", defaultPiecesPerUnit: 1, unitType: "piece" },
  { name: "Halwa", category: "Desserts", defaultPiecesPerUnit: 1, unitType: "scoop" },
  { name: "Brownie", category: "Desserts", defaultPiecesPerUnit: 1, unitType: "piece" },
  { name: "Custard", category: "Desserts", defaultPiecesPerUnit: 1, unitType: "scoop" },
];

export async function seedFoodItems(): Promise<void> {
  if (!db) return;
  const ref = collection(db, "companies", COMPANY_ID, "food_items");
  const snap = await getDocs(ref);

  if (snap.empty) {
    const writes = SEED_ITEMS.map((item) => addDoc(ref, { ...item }));
    await Promise.all(writes);
    return;
  }

  // Deduplicate + upgrade existing items with new fields
  const seedNames = new Map<string, SeedItem>();
  SEED_ITEMS.forEach((item) => seedNames.set(item.name.toLowerCase(), item));

  const seen = new Set<string>();
  const batch: Promise<void>[] = [];

  snap.forEach((docSnap) => {
    const data = docSnap.data();
    const name = (data.name ?? "").toLowerCase();
    if (!seedNames.has(name)) return;

    if (seen.has(name)) {
      batch.push(deleteDoc(docSnap.ref));
    } else {
      seen.add(name);
      const seed = seedNames.get(name)!;
      batch.push(
        updateDoc(docSnap.ref, {
          category: seed.category,
          defaultPiecesPerUnit: seed.defaultPiecesPerUnit,
          unitType: seed.unitType,
        })
      );
    }
  });

  await Promise.all(batch);

  // Create any seed items that don't exist yet
  const existingNames = new Set<string>();
  snap.forEach((docSnap) => {
    const data = docSnap.data();
    existingNames.add((data.name ?? "").toLowerCase());
  });

  const creates: Promise<void>[] = [];
  for (const item of SEED_ITEMS) {
    if (!existingNames.has(item.name.toLowerCase())) {
      creates.push(addDoc(ref, { ...item }) as unknown as Promise<void>);
    }
  }
  await Promise.all(creates);
}
