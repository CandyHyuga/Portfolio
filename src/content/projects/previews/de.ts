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
    description: "3D-Environment & kooperatives Horror-Lieferdienst-Spiel in der Unterwelt auf Steam.",
  },
  {
    title: "Gambling Gnomes",
    slug: "gambling-gnomes",
    thumbnail: gamblingGnomesThumbnail,
    logo: gamblingGnomesThumbnail,
    description: "3D-Environment & düsteres Survival-Kartenspiel gegen listige Gnome.",
  },
  {
    title: "Personal Project",
    slug: "personal-project",
    thumbnail: personalProjectThumbnail,
    logo: personalProjectThumbnail,
    description: "3D-Environment-Design & mystische astrale Raumgestaltung.",
  },
] as const satisfies ProjectPreview[];
