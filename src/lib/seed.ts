import { db } from "./firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { COMPANY_ID } from "./constants";

const SEED_ITEMS = [
  { name: "Hariyali Chicken Tikka", category: "Non-Veg", defaultPiecesPerUnit: 3 },
  { name: "Angara Malai Tangdi", category: "Non-Veg", defaultPiecesPerUnit: 1 },
  { name: "Chicken Seekh Kebab", category: "Non-Veg", defaultPiecesPerUnit: 1 },
  { name: "Mustard Kasundi Fish Tikka", category: "Non-Veg", defaultPiecesPerUnit: 2 },
  { name: "Chilli Garlic Prawns", category: "Non-Veg", defaultPiecesPerUnit: 3 },
  { name: "Chicken wings", category: "Non-Veg", defaultPiecesPerUnit: 1 },
  { name: "Octopus and squid bowl", category: "Non-Veg", defaultPiecesPerUnit: 1 },
  { name: "Cake", category: "Non-Veg", defaultPiecesPerUnit: 1 },
  { name: "Lebanese Mushroom Tikka", category: "Veg", defaultPiecesPerUnit: 3 },
  { name: "Tandoori Grill Veg", category: "Veg", defaultPiecesPerUnit: 1 },
  { name: "Achari Paneer Tikka", category: "Veg", defaultPiecesPerUnit: 1 },
  { name: "Corn Mutter Ki Tikki", category: "Veg", defaultPiecesPerUnit: 1 },
  { name: "Afghani Soya Chaap", category: "Veg", defaultPiecesPerUnit: 2 },
  { name: "Malai Chaap", category: "Veg", defaultPiecesPerUnit: 1 },
  { name: "American Cheesy Potato", category: "Veg", defaultPiecesPerUnit: 1 },
  { name: "Crispy Corn", category: "Veg", defaultPiecesPerUnit: 1 },
  { name: "Churrasco Pineapple", category: "Veg", defaultPiecesPerUnit: 3 },
  { name: "Golgappe", category: "Veg", defaultPiecesPerUnit: 1 },
  { name: "Papdi chaat", category: "Veg", defaultPiecesPerUnit: 1 },
  { name: "Aaloo tikki", category: "Veg", defaultPiecesPerUnit: 1 },
] as const;

export async function seedFoodItems(): Promise<void> {
  if (!db) return;
  const ref = collection(db, "companies", COMPANY_ID, "food_items");
  const snap = await getDocs(ref);
  if (!snap.empty) return;

  const writes = SEED_ITEMS.map((item) => addDoc(ref, { ...item }));
  await Promise.all(writes);
}
