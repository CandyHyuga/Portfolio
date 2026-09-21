import { ref } from "vue";

// Exact palette requested by user:
// - Màu tím quần: #b7aff3
// - Màu xanh quần áo (áo & giày): #d3f58f
// - Màu xanh tóc: #baf04c
// - Màu da: #f1d5c5
export const DEFAULT_SHIRT_COLOR = "#d3f58f";
export const DEFAULT_PANTS_COLOR = "#b7aff3";
export const DEFAULT_SHOES_COLOR = "#d3f58f";
export const DEFAULT_HAIR_COLOR = "#baf04c";
export const DEFAULT_SKIN_COLOR = "#f1d5c5";

// Auto-migrate cached localStorage to the exact signature palette
const AVATAR_VERSION = "v3-exact-palette";
if (typeof localStorage !== "undefined") {
  if (localStorage.getItem("avatar-version") !== AVATAR_VERSION) {
    localStorage.removeItem("avatar-shirt-color");
    localStorage.removeItem("avatar-pants-color");
    localStorage.removeItem("avatar-shoes-color");
    localStorage.removeItem("avatar-hair-color");
    localStorage.setItem("avatar-version", AVATAR_VERSION);
  }
}

const savedShirt = typeof localStorage !== "undefined" ? localStorage.getItem("avatar-shirt-color") : null;
const savedPants = typeof localStorage !== "undefined" ? localStorage.getItem("avatar-pants-color") : null;
const savedShoes = typeof localStorage !== "undefined" ? localStorage.getItem("avatar-shoes-color") : null;
const savedHair = typeof localStorage !== "undefined" ? localStorage.getItem("avatar-hair-color") : null;
const savedSkin = typeof localStorage !== "undefined" ? localStorage.getItem("avatar-skin-color") : null;
const savedExp = typeof localStorage !== "undefined" ? localStorage.getItem("avatar-face-expression") : null;

export const shirtColor = ref(savedShirt || DEFAULT_SHIRT_COLOR);
export const pantsColor = ref(savedPants || DEFAULT_PANTS_COLOR);
export const shoesColor = ref(savedShoes || DEFAULT_SHOES_COLOR);
export const hairColor = ref(savedHair || DEFAULT_HAIR_COLOR);
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
