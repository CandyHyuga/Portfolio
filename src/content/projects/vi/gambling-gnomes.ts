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
    "Tựa game co-op bài bạc nổi bật với thiết kế môi trường 3D quán rượu hầm u tối, phong cách stylized độc đáo và ván cược sinh tử.",
  components: [
    {
      type: "media",
      props: {
        type: "image",
        src: gg1,
        alt: "Màn hình chính Gambling Gnome",
        caption: "Gambling Gnome - Bối cảnh mở đầu với dao găm, ánh nến và ván cược sinh tử.",
      },
    },
    {
      type: "text",
      props: {
        title: "Thiết kế Môi trường 3D & Không khí Hắc ám",
        text: "Dựng hình không gian 3D quán rượu ngầm bằng Blender và Unity với ánh sáng neon tương phản cao, kết hợp phong cách hoạt hình cổ điển tạo bầu không khí căng thẳng nghẹt thở.",
      },
    },
    {
      type: "imageText",
      props: {
        imagePosition: "right",
        src: gg2,
        alt: "Cơ chế trò chơi & Đối đầu Gnome",
        border: true,
        component: {
          type: "list",
          props: {
            title: "Điểm nhấn Môi trường 3D & Mỹ thuật Game",
            items: [
              "<strong>Môi trường 3D & Bối cảnh Quán rượu:</strong> Thiết kế hầm đá trung cổ, kệ thùng rượu và kiến trúc tavern u tối.",
              "<strong>3D Props & Đạo cụ Chi tiết:</strong> Bàn cược tử thần, bài tây, dao găm và vật phẩm gian lận.",
              "<strong>Ánh sáng & Bầu không khí:</strong> Ánh nến lung linh, sương mù và đèn neon mờ tỏ trong không gian chật hẹp.",
              "<strong>Shaders & Tối ưu hóa:</strong> Viền line đậm cho vật thể tạo cảm giác nặng nề và đổ bóng thời gian thực tối ưu mượt mà.",
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
        alt: "Màn đối đầu căng thẳng trên bàn cược",
        caption: "Bàn cược tử thần - Màn đối đầu tâm lý căng thẳng cùng các mánh khóe ma thuật.",
      },
    },
    {
      type: "text",
      props: {
        title: "Kinh dị Tâm lý & Dấu ấn Thị giác",
        text: "Sự kết hợp độc đáo giữa tạo hình hoạt hình ngộ nghĩnh và không gian môi trường 3D rùng rợn tạo nên dấu ấn thị giác khác biệt.",
      },
    },
  ],
} as const satisfies ProjectContent;

