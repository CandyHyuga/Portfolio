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
    "Tựa game co-op kinh dị trên Steam nổi bật với thiết kế môi trường 3D ngõ hẻm Việt Nam ma mị, bối cảnh u ám và lối chơi sinh tồn giao hàng kịch tính.",
  live: "https://store.steampowered.com/app/3761880/Night_Shippers/",
  components: [
    {
      type: "media",
      props: {
        type: "image",
        src: ns1,
        alt: "Night Shippers Gameplay",
        caption: "Night Shippers Gameplay - Trải nghiệm sinh tồn giao hàng âm giới độc đáo trên Steam.",
      },
    },
    {
      type: "text",
      props: {
        title: "Thiết kế Môi trường 3D & Xây dựng Thế giới",
        text: "Xây dựng toàn diện môi trường 3D, từ các con hẻm chật hẹp đặc trưng Việt Nam đến hành lang chung cư u ám, kết hợp ánh sáng toả mờ từ xa để tạo chiều sâu thị giác sống động.",
      },
    },
    {
      type: "imageText",
      props: {
        imagePosition: "right",
        src: ns2,
        alt: "Môi trường ngõ phố & hành lang ma mị",
        border: true,
        component: {
          type: "list",
          props: {
            title: "Điểm nhấn Môi trường 3D & Kỹ thuật",
            items: [
              "<strong>Môi trường 3D & Level Design:</strong> Quy hoạch khu ngõ hẻm đô thị, chung cư cũ và hành lang u tối.",
              "<strong>3D Props & Tài nguyên:</strong> Xe máy giao hàng, thùng hàng và vật phẩm bối cảnh tối ưu mesh.",
              "<strong>Ánh sáng & Bầu không khí:</strong> Sương mù, đèn huỳnh quang chập chờn và tone màu neon ma mị.",
              "<strong>Tối ưu hóa Game Engine:</strong> Shader thời gian thực, trải nghiệm game mượt mà cho co-op 8 người dành cho tất cả hệ máy.",
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
        alt: "Chạm trán quái vật âm giới",
        caption: "Thực thể âm giới kỳ bí - Hệ thống ánh sáng và không gian kinh dị môi trường.",
      },
    },
    {
      type: "text",
      props: {
        title: "Phát hành trên Steam & Dấu ấn Cộng đồng",
        text: "Tựa game co-op indie nổi bật trên Steam, khẳng định năng lực kể chuyện bằng thiết kế Môi trường 3D và mỹ thuật game độc đáo.",
      },
    },
  ],
} as const satisfies ProjectContent;

