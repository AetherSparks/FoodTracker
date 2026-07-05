import { db } from "./firebase";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { COMPANY_ID } from "./constants";
import type { FoodItem, FoodSession, SessionItem } from "./types";

function foodItemsRef() {
  return collection(db!, "companies", COMPANY_ID, "food_items");
}

function sessionRef(userEmail: string, date: string) {
  return doc(db!, "companies", COMPANY_ID, "users", userEmail, "sessions", date);
}

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().replace(/\./g, ",");
}

export async function fetchFoodItems(): Promise<FoodItem[]> {
  if (!db) return [];
  const q = query(foodItemsRef(), orderBy("category", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as FoodItem
  );
}

export async function getTodaySession(
  userEmail: string,
  date: string
): Promise<FoodSession | null> {
  if (!db) return null;
  const ref = sessionRef(userEmail, date);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data() as FoodSession;
  if (!data.items) data.items = {};
  return data;
}

export async function createSession(
  userEmail: string,
  date: string
): Promise<void> {
  if (!db) return;
  const ref = sessionRef(userEmail, date);
  await setDoc(ref, { date, items: {} });
}

export async function updateSessionItems(
  userEmail: string,
  date: string,
  items: Record<string, SessionItem>
): Promise<void> {
  if (!db) return;
  const ref = sessionRef(userEmail, date);
  await setDoc(ref, { items }, { merge: true });
}

export async function addFoodItem(
  name: string,
  category: string,
  defaultPiecesPerUnit: number
): Promise<void> {
  if (!db) return;
  await addDoc(foodItemsRef(), { name, category, defaultPiecesPerUnit });
}
