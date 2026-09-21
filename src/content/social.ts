export const social = [
  { url: "mailto:candyhyuga1509@gmail.com", name: "mail" },
  { url: "/instagram-qr.png", name: "instagram" },
  { url: "/discord-qr.png", name: "discord" },
  { url: "/zalo-qr.jpg", name: "zalo" },
  { url: "/facebook-qr.png", name: "facebook" },
] as const satisfies { url: string; name: "mail" | "github" | "instagram" | "linkedin" | "x" | "zalo" | "facebook" | "discord" }[];
