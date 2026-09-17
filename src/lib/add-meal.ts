export const ADD_MEAL_EVENT = "nomory:add-meal";

export function requestAddMeal() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(ADD_MEAL_EVENT));
}
