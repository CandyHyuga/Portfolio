import type { ProjectContent } from "../../types";
import personalProjectThumbnail from "../../../assets/thumbnails/personal-project.png";

export default {
  title: "Personal Project",
  theme: "dark",
  logo: personalProjectThumbnail,
  tags: ["blender", "unity", "unreal"],
  description:
    "A personal 3D environment art exploration featuring a mystical astral chamber with floating golden stars, occult props, and atmospheric lighting.",
  components: [
    {
      type: "media",
      props: {
        type: "image",
        src: personalProjectThumbnail,
        alt: "Personal Project 3D Environment - Astral Chamber",
        caption: "Mystical attic sanctuary featuring floating golden stars, ritual round table, and ethereal purple ambient lighting.",
      },
    },
    {
      type: "text",
      props: {
        title: "3D Environment Design & Astral Atmosphere",
        text: "Designed and arranged a cozy yet enigmatic attic chamber bathed in deep indigo and violet hues, accented by warm golden candlelight and luminous floating constellations.",
      },
    },
    {
      type: "imageText",
      props: {
        imagePosition: "right",
        src: personalProjectThumbnail,
        alt: "Interior Details & 3D Props",
        border: true,
        component: {
          type: "list",
          props: {
            title: "Key 3D Environment & Architecture Highlights",
            items: [
              "<strong>Attic Architecture & Patterned Ceiling:</strong> Sloped roof panels with ornamental wallpaper patterns and triangular star window framing the night sky.",
              "<strong>Magical Props & Custom Furniture:</strong> Central ceremonial table, cushioned wooden stools, carved star cabinets, ancient spellbooks, and glowing potions.",
              "<strong>Suspended Star Garlands & Runes:</strong> Floating golden star frames and delicate string lights creating a zero-gravity astral charm.",
              "<strong>Atmospheric Lighting & Color Harmony:</strong> Soft violet wall wash lights paired with flickering candles for dramatic visual storytelling.",
            ],
          },
        },
      },
    },
    {
      type: "text",
      props: {
        title: "Artistic Vision & Technical Craft",
        text: "This personal showcase highlights creative exploration in mood lighting, stylized prop modeling, and world-building for atmospheric gaming environments.",
      },
    },
  ],
} as const satisfies ProjectContent;
