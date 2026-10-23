import type { ProjectContent } from "../../types";
import personalProjectThumbnail from "../../../assets/thumbnails/personal-project.png";

export default {
  title: "Personal Project",
  theme: "dark",
  logo: personalProjectThumbnail,
  tags: ["blender", "unity", "unreal"],
  description:
    "study set-up assets from Alissa Corbut's model in Sketchfab",
  components: [
    {
      type: "media",
      props: {
        type: "image",
        src: personalProjectThumbnail,
        alt: "Personal Project 3D Environment - Astral Chamber",
        caption: "Không gian phòng áp mái huyền bí với ngôi sao vàng lơ lửng, bàn cúng lễ và ánh nến tím huyền ảo.",
      },
    },
    {
      type: "text",
      props: {
        title: "Thiết kế Môi trường 3D & Ánh sáng Huyền bí",
        text: "Không gian 3D được xây dựng và bố cục chi tiết với tông màu tím huyền ảo kết hợp sắc vàng của các vì sao và nến. Mọi chi tiết từ sofa nhung, bàn thờ bài tây, rèm sao và sách cổ đều được thiết kế tỉ mỉ mang đậm phong cách fantasy huyền bí.",
      },
    },
    {
      type: "imageText",
      props: {
        imagePosition: "right",
        src: personalProjectThumbnail,
        alt: "Chi tiết nội thất & Đạo cụ 3D",
        border: true,
        component: {
          type: "list",
          props: {
            title: "Điểm nhấn Thiết kế 3D & Bố cục Không gian",
            items: [
              "<strong>Kiến trúc Mái vòm & Hoa văn:</strong> Thiết kế vách áp mái dốc với họa tiết hoa văn cổ điển và cửa sổ sao lớn đón ánh sáng bầu trời đêm.",
              "<strong>Đạo cụ Trang trí & Nội thất:</strong> Bàn tròn trung tâm, ghế đẩu bọc da, tủ kệ chạm khắc ngôi sao, sách cổ và bình độc dược ma thuật.",
              "<strong>Dây Sao & Ngôi sao Lơ lửng:</strong> Dây đèn sao vàng cùng các biểu tượng ngôi sao 4 cánh thả trôi tạo cảm giác không trọng lực kỳ ảo.",
              "<strong>Hiệu ứng Ánh sáng Volumetric:</strong> Điểm sáng tím dịu dàng kết hợp ánh nến vàng ấm áp tạo chiều sâu thị giác phong phú.",
            ],
          },
        },
      },
    },
    {
      type: "text",
      props: {
        title: "Dấu ấn Cá nhân & Sáng tạo Nghệ thuật",
        text: "Dự án thể hiện niềm đam mê khám phá các phong cách mỹ thuật không gian độc đáo, thử nghiệm ánh sáng thời gian thực và tạo dựng thế giới mang đậm chất huyền thoại.",
      },
    },
  ],
} as const satisfies ProjectContent;
