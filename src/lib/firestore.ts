import { db } from "./firebase";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { DEFAULT_COMPANY_ID } from "./constants";
import type {
  FoodItem,
  FoodSession,
  SessionItem,
  Restaurant,
  LeaderboardEntry,
} from "./types";

function foodItemsRef(companyId: string) {
  return collection(db!, "companies", companyId, "food_items");
}

function sessionRef(uid: string, companyId: string, date: string) {
  return doc(db!, "companies", companyId, "users", uid, "sessions", date);
}

function leaderboardDocRef(companyId: string, uid: string) {
  return doc(db!, "companies", companyId, "leaderboard", uid);
}

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function listRestaurants(): Promise<Restaurant[]> {
  if (!db) return [];
  const snap = await getDocs(collection(db!, "restaurants"));
  return snap.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as Restaurant
  );
}

export async function seedDefaultRestaurant(): Promise<void> {
  if (!db) return;
  const ref = doc(db!, "restaurants", DEFAULT_COMPANY_ID);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { name: "Absolute Barbecue" });
  }
}

export async function fetchFoodItems(
  companyId: string
): Promise<FoodItem[]> {
  if (!db) return [];
  const q = query(foodItemsRef(companyId), orderBy("category", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as FoodItem
  );
}

export async function getSession(
  uid: string,
  companyId: string,
  date: string
): Promise<FoodSession | null> {
  if (!db) return null;
  const ref = sessionRef(uid, companyId, date);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data() as FoodSession;
  if (!data.items) data.items = {};
  return data;
}

export async function listSessions(
  uid: string,
  companyId: string
): Promise<FoodSession[]> {
  if (!db) return [];
  const ref = collection(
    db!,
    "companies",
    companyId,
    "users",
    uid,
    "sessions"
  );
  const q = query(ref, orderBy("date", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data() as FoodSession;
    if (!data.items) data.items = {};
    return data;
  });
}

export async function createSession(
  uid: string,
  companyId: string,
  date: string
): Promise<void> {
  if (!db) return;
  const ref = sessionRef(uid, companyId, date);
  await setDoc(ref, { date, items: {}, companyId });
}

export async function updateSessionItems(
  uid: string,
  companyId: string,
  date: string,
  items: Record<string, SessionItem>
): Promise<void> {
  if (!db) return;
  const ref = sessionRef(uid, companyId, date);
  await setDoc(ref, { items }, { merge: true });
}

export async function updateSessionNotes(
  uid: string,
  companyId: string,
  date: string,
  notes: string
): Promise<void> {
  if (!db) return;
  const ref = sessionRef(uid, companyId, date);
  await setDoc(ref, { notes }, { merge: true });
}

export async function updateLeaderboard(
  companyId: string,
  uid: string,
  data: {
    displayName: string;
    photoURL: string;
    bestScore: number;
    bestDate: string;
    bestItems: Record<string, SessionItem>;
    scores: Record<string, number>;
  }
): Promise<void> {
  if (!db) return;
  const ref = leaderboardDocRef(companyId, uid);
  await setDoc(ref, data);
}

export function listenLeaderboard(
  companyId: string,
  callback: (entries: LeaderboardEntry[]) => void
): () => void {
  if (!db) return () => {};
  const q = query(
    collection(db!, "companies", companyId, "leaderboard"),
    orderBy("bestScore", "desc"),
    limit(3)
  );
    const unsub = onSnapshot(q, (snap) => {
    const entries = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        uid: data.uid,
        displayName: data.displayName,
        photoURL: data.photoURL,
        bestScore: data.bestScore,
        bestDate: data.bestDate,
        bestItems: data.bestItems ?? {},
        scores: data.scores ?? {},
      } as LeaderboardEntry;
    });
    callback(entries);
  });
  return unsub;
}

export async function getLeaderboardEntry(
  companyId: string,
  uid: string
): Promise<LeaderboardEntry | null> {
  if (!db) return null;
  const ref = leaderboardDocRef(companyId, uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    id: snap.id,
    uid: data.uid,
    displayName: data.displayName,
    photoURL: data.photoURL,
    bestScore: data.bestScore,
    bestDate: data.bestDate,
    bestItems: data.bestItems ?? {},
    scores: data.scores ?? {},
  } as LeaderboardEntry;
}
