import type { ProjectPreview } from "../../types";
import nightShippersThumbnail from "../../../assets/thumbnails/night-shippers.jpg";
import gamblingGnomesThumbnail from "../../../assets/thumbnails/gambling-gnomes.png";
import personalProjectThumbnail from "../../../assets/thumbnails/personal-project.png";

import nightShippersLogo from "../../../assets/images/logos/night-shippers-logo.png";

export default [
  {
    title: "Night Shippers",
    slug: "night-shippers",
    thumbnail: nightShippersThumbnail,
    logo: nightShippersLogo,
    description: "3D Environment & co-op horror food delivery game set in the underworld on Steam.",
  },
  {
    title: "Gambling Gnomes",
    slug: "gambling-gnomes",
    thumbnail: gamblingGnomesThumbnail,
    logo: gamblingGnomesThumbnail,
    description: "3D Environment & dark survival card game against cunning, sinister gnomes.",
  },
  {
    title: "Personal Project",
    slug: "personal-project",
    thumbnail: personalProjectThumbnail,
    logo: personalProjectThumbnail,
    description: "3D Environment Design & mystical astral chamber lighting diorama.",
  },
] as const satisfies ProjectPreview[];
