import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import { clearMeals, deleteMeal, getMeal, listMeals, upsertMeal } from "../src/lib/nomory-db.ts";

function createTestDb() {
  const sqlite = new DatabaseSync(":memory:");
  for (const migration of [
    "0001_init.sql",
    "0003_add_location.sql",
    "0003_thumbnail.sql",
    "0004_add_price_rating.sql",
    "0007_menu_items.sql",
  ]) {
    sqlite.exec(readFileSync(new URL(`../migrations/${migration}`, import.meta.url), "utf8"));
  }
  return {
    close: () => sqlite.close(),
    prepare(sql) {
      const statement = sqlite.prepare(sql);
      return {
        bind(...values) {
          return {
            run: async () => statement.run(...values),
            first: async () => statement.get(...values) ?? null,
            all: async () => ({ results: statement.all(...values) }),
          };
        },
      };
    },
  };
}

test("meal save, update, list and delete work with the production schema", async () => {
  const db = createTestDb();
  try {
    const meal = {
      id: "test-meal-1",
      originalImage: "",
      processedImage: "https://nomory.site/media/test.jpg",
      thumbnailImage: "https://nomory.site/media/thumb.jpg",
      useOriginal: false,
      mealName: "Lunch",
      menuItems: [
        { name: "Rice", price: 20000 },
        { name: "Tea", price: 5000 },
      ],
      mealType: "lunch",
      note: "Good lunch",
      location: "Home",
      price: 25000,
      rating: 4,
      mealDate: "2026-09-23",
      mealTime: "12:30",
      createdAt: 1000,
      updatedAt: 1000,
    };

    await upsertMeal(db, "user-a", meal);
    assert.deepEqual(await getMeal(db, "user-a", meal.id), {
      ...meal,
      originalImage: meal.processedImage,
    });
    assert.equal((await listMeals(db, "user-a")).length, 1);
    assert.equal(await getMeal(db, "user-b", meal.id), null);

    await upsertMeal(db, "user-a", { ...meal, note: "Updated", updatedAt: 2000 });
    assert.equal((await getMeal(db, "user-a", meal.id)).note, "Updated");
    await upsertMeal(db, "user-a", { ...meal, note: "Stale", updatedAt: 1500 });
    assert.equal((await getMeal(db, "user-a", meal.id)).note, "Updated");
    await upsertMeal(db, "user-b", { ...meal, note: "Other account", updatedAt: 3000 });
    assert.equal((await getMeal(db, "user-a", meal.id)).note, "Updated");

    await deleteMeal(db, "user-b", meal.id);
    assert.equal((await listMeals(db, "user-a")).length, 1);
    await clearMeals(db, "user-a");
    assert.equal((await listMeals(db, "user-a")).length, 0);
  } finally {
    db.close();
  }
});
