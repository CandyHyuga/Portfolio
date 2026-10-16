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
    description: "Thiết kế Môi trường 3D & game co-op kinh dị giao hàng âm giới trên Steam.",
  },
  {
    title: "Gambling Gnomes",
    slug: "gambling-gnomes",
    thumbnail: gamblingGnomesThumbnail,
    logo: gamblingGnomesThumbnail,
    description: "Thiết kế Môi trường 3D & game bài sinh tồn đối đầu với những gã Gnome xảo quyệt.",
  },
  {
    title: "Personal Project",
    slug: "personal-project",
    thumbnail: personalProjectThumbnail,
    logo: personalProjectThumbnail,
    description: "Thiết kế Môi trường 3D & không gian kiến trúc nội thất huyền bí (Astral Chamber).",
  },
] as const satisfies ProjectPreview[];
