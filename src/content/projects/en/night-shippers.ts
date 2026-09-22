import type { ProjectContent } from "../../types";
import ns1 from "../../../assets/images/projects/night-shippers/night-shippers-1.jpg";
import ns2 from "../../../assets/images/projects/night-shippers/night-shippers-2.jpg";
import ns3 from "../../../assets/images/projects/night-shippers/night-shippers-3.jpg";
import nightShippersLogo from "../../../assets/images/logos/night-shippers-logo.png";

export default {
  title: "Night Shippers",
  theme: "dark",
  logo: nightShippersLogo,
  tags: ["blender", "unreal", "steam", "coop", "youngbuffalostudio"],
  description:
    "Co-op horror game on Steam featuring detailed 3D environment art, modular Vietnamese alleyways, and eerie underworld survival gameplay.",
  live: "https://store.steampowered.com/app/3761880/Night_Shippers/",
  components: [
    {
      type: "media",
      props: {
        type: "image",
        src: ns1,
        alt: "Night Shippers Gameplay",
        caption: "Night Shippers Gameplay - Underworld food delivery horror simulation on Steam.",
      },
    },
    {
      type: "text",
      props: {
        title: "3D Environment & Atmospheric World-Building",
        text: "Crafted atmospheric 3D environments, modular Vietnamese streetscapes, and claustrophobic interior corridors in Blender, optimized for real-time lighting and immersive world-building.",
      },
    },
    {
      type: "imageText",
      props: {
        imagePosition: "right",
        src: ns2,
        alt: "Haunted Alleyways & 3D Environments",
        border: true,
        component: {
          type: "list",
          props: {
            title: "Key 3D Art & Development Highlights",
            items: [
              "<strong>3D Environment & Level Design:</strong> Modular urban alleyways, rundown corridors, and detailed Vietnamese streetscapes.",
              "<strong>3D Props & Assets:</strong> Stylized motorbikes, delivery gear, and interactive objects with game-ready topology.",
              "<strong>Lighting & Atmosphere:</strong> Volumetric fog, flickering fluorescents, and eerie neon setting a tense horror mood.",
              "<strong>Game Engine Integration:</strong> Optimized real-time shaders, collision meshes, and LODs for smooth 8-player co-op.",
            ],
          },
        },
      },
    },
    {
      type: "media",
      props: {
        type: "image",
        src: ns3,
        alt: "Underworld Monster Encounter",
        caption: "Supernatural Underworld Entities - Atmospheric lighting and environmental horror.",
      },
    },
  ],
} as const satisfies ProjectContent;

