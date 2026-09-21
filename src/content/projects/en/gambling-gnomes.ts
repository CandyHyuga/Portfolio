import type { ProjectContent } from "../../types";
import gg1 from "../../../assets/images/projects/gambling-gnomes/gambling-gnomes-1.png";
import gg2 from "../../../assets/images/projects/gambling-gnomes/gambling-gnomes-2.png";
import gg3 from "../../../assets/images/projects/gambling-gnomes/gambling-gnomes-3.png";
import gamblingGnomesLogo from "../../../assets/thumbnails/gambling-gnomes.png";

export default {
  title: "Gambling Gnomes",
  theme: "dark",
  logo: gamblingGnomesLogo,
  tags: ["blender", "unity", "steam", "coop", "youngbuffalostudio"],
  description:
    "A psychological survival game featuring stylized 3D dungeon tavern environments, high-stakes bets, and eerie cartoon horror.",
  components: [
    {
      type: "media",
      props: {
        type: "image",
        src: gg1,
        alt: "Gambling Gnome Title Screen",
        caption: "Gambling Gnome - Main menu setting the eerie tone with dim candlelight and high stakes.",
      },
    },
    {
      type: "text",
      props: {
        title: "3D Tavern Environment & Dark Atmosphere",
        text: "Crafted a stylized 3D underground tavern with chiaroscuro lighting and hand-painted textures, blending vintage cartoon aesthetics with claustrophobic psychological tension.",
      },
    },
    {
      type: "imageText",
      props: {
        imagePosition: "right",
        src: gg2,
        alt: "Gameplay & Gnome Showdown",
        border: true,
        component: {
          type: "list",
          props: {
            title: "Key 3D Environment & Art Highlights",
            items: [
              "<strong>3D Environment & Tavern Setting:</strong> Medieval stone vaults, wooden keg racks, and gritty tavern interiors.",
              "<strong>3D Props & Table Assets:</strong> Bloody butcher knives, detailed playing cards, and interactive survival items.",
              "<strong>Lighting & Atmosphere:</strong> Flickering candlelight, volumetric depth fog, and dramatic shadow contrast.",
              "<strong>Shaders & Real-time Visuals:</strong> Custom cell-shaded outlines, blood decals, and optimized real-time rendering.",
            ],
          },
        },
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        src: gg3,
        alt: "Gambling Gnome Table Showdown",
        caption: "Table Showdown - Tense psychological face-off with sanity meters and high-risk wagers.",
      },
    },
    {
      type: "text",
      props: {
        title: "Psychological Horror & Visual Identity",
        text: "Striking contrast between playful cartoon proportions and a sinister 3D environment, creating a distinctive and memorable visual identity.",
      },
    },
  ],
} as const satisfies ProjectContent;

