import { ref } from "vue";

// Default to user's signature character: Lime Green Hair & Shirt, Purple Pants, Lime Green Shoes
export const DEFAULT_SHIRT_COLOR = "#a8e038";
export const DEFAULT_PANTS_COLOR = "#6c5ce7";
export const DEFAULT_SHOES_COLOR = "#a8e038";
export const DEFAULT_HAIR_COLOR = "#a8e038";
export const DEFAULT_SKIN_COLOR = "#f1d5c5";

const savedShirt = typeof localStorage !== "undefined" ? localStorage.getItem("avatar-shirt-color") : null;
const savedPants = typeof localStorage !== "undefined" ? localStorage.getItem("avatar-pants-color") : null;
const savedShoes = typeof localStorage !== "undefined" ? localStorage.getItem("avatar-shoes-color") : null;
const savedHair = typeof localStorage !== "undefined" ? localStorage.getItem("avatar-hair-color") : null;
const savedSkin = typeof localStorage !== "undefined" ? localStorage.getItem("avatar-skin-color") : null;
const savedExp = typeof localStorage !== "undefined" ? localStorage.getItem("avatar-face-expression") : null;

export const shirtColor = ref(savedShirt && savedShirt !== "#34bfff" ? savedShirt : DEFAULT_SHIRT_COLOR);
export const pantsColor = ref(savedPants && savedPants !== "#2d2a24" ? savedPants : DEFAULT_PANTS_COLOR);
export const shoesColor = ref(savedShoes && savedShoes !== "#34bfff" ? savedShoes : DEFAULT_SHOES_COLOR);
export const hairColor = ref(savedHair && savedHair !== "#2d2a24" ? savedHair : DEFAULT_HAIR_COLOR);
export const skinColor = ref(savedSkin || DEFAULT_SKIN_COLOR);
export const faceExpression = ref<string>(savedExp || "auto");

export const resetAvatar = () => {
  shirtColor.value = DEFAULT_SHIRT_COLOR;
  pantsColor.value = DEFAULT_PANTS_COLOR;
  shoesColor.value = DEFAULT_SHOES_COLOR;
  hairColor.value = DEFAULT_HAIR_COLOR;
  skinColor.value = DEFAULT_SKIN_COLOR;
  faceExpression.value = "auto";
  saveAvatarSettings();
};

export const saveAvatarSettings = () => {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem("avatar-shirt-color", shirtColor.value);
  localStorage.setItem("avatar-pants-color", pantsColor.value);
  localStorage.setItem("avatar-shoes-color", shoesColor.value);
  localStorage.setItem("avatar-hair-color", hairColor.value);
  localStorage.setItem("avatar-skin-color", skinColor.value);
  localStorage.setItem("avatar-face-expression", faceExpression.value);
};
