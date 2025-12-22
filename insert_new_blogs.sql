-- Script khởi tạo dữ liệu Blog mới cho 9F Universe
-- Bạn hãy copy và chạy script này trong SQL Editor của Supabase

-- Xóa dữ liệu cũ nếu muốn (CÂN NHẮC TRƯỚC KHI CHẠY DÒNG DƯỚI)
-- DELETE FROM posts;

INSERT INTO posts (
    title, 
    slug, 
    content, 
    excerpt, 
    cover_image, 
    status, 
    featured, 
    display_order, 
    seo_title, 
    seo_description, 
    keywords, 
    tags,
    created_at,
    updated_at
) VALUES 
(
    'The Future of Motion Design in Web3', 
    'future-of-motion-design-web3', 
    '<h1>Cuộc cách mạng của Motion Design</h1><p>Motion design không chỉ là những chuyển động mượt mà, nó là ngôn ngữ giao tiếp mới trong kỷ nguyên Web3. Với sự lên ngôi của NFT và Metaverse, khả năng tương tác sống động trở thành yếu tố then chốt.</p><h2>Tại sao Motion Design quan trọng?</h2><ul><li>Tăng trải nghiệm người dùng (UX)</li><li>Kể chuyện thương hiệu một cách cuốn hút</li><li>Tạo sự khác biệt trong thị trường NFT</li></ul><p>Chúng ta đang đứng trước ngưỡng cửa của một kỷ nguyên sáng tạo mới, nơi ranh giới giữa nghệ thuật và công nghệ dần xóa nhòa.</p>', 
    'Khám phá tầm ảnh hưởng của Motion Design đối với trải nghiệm người dùng trong thế giới Web3 và tương lai của nghệ thuật kỹ thuật số.', 
    'https://res.cloudinary.com/dzp7v7i7e/image/upload/v1700000000/blog/motion-design-web3.jpg', 
    'published', 
    true, 
    1, 
    'Tương lai Motion Design trong Web3 | 9F Universe', 
    'Bài viết phân tích về xu hướng Motion Design và tầm quan trọng của nó trong hệ sinh thái Web3 và NFT.', 
    ARRAY['motion design', 'web3', 'nft', 'digital art'], 
    ARRAY['Design', 'Technology'],
    NOW(),
    NOW()
),
(
    'How to Build a High-Performance Portfolio', 
    'build-high-performance-portfolio', 
    '<h1>Bí quyết xây dựng Portfolio đỉnh cao</h1><p>Một Portfolio tốt không chỉ đẹp mà còn phải chạy nhanh và tối ưu SEO. Đối với các nghệ sĩ Digital, dự án của bạn chính là bộ mặt đại diện trên không gian mạng.</p><h2>Các yếu tố cần chú trọng</h2><ol><li>Tối ưu dung lượng hình ảnh và video</li><li>Sử dụng các công nghệ hiện đại như React/Next.js</li><li>Trình bày quy trình làm việc (Case Study) rõ ràng</li></ol><p>Hãy bắt đầu xây dựng thương hiệu cá nhân của bạn ngay hôm nay bằng một Portfolio chuyên nghiệp.</p>', 
    'Hướng dẫn chi tiết từ kỹ thuật đến tư duy thẩm mỹ để tạo ra một trang web Portfolio thu hút khách hàng và nhà tuyển dụng.', 
    'https://res.cloudinary.com/dzp7v7i7e/image/upload/v1700000000/blog/portfolio-tips.jpg', 
    'published', 
    false, 
    2, 
    'Cách xây dựng Portfolio hiệu suất cao | Sáng tạo & Công nghệ', 
    'Tìm hiểu các bước để xây dựng một Portfolio chuyên nghiệp, tối ưu tốc độ và thu hút người xem.', 
    ARRAY['portfolio', 'web development', 'career tips'], 
    ARRAY['Tutorial', 'Career'],
    NOW(),
    NOW()
),
(
    'The Rise of Generative AI in Creative Industries', 
    'generative-ai-creative-rise', 
    '<h1>Sự trỗi dậy của Trí tuệ nhân tạo (AI) trong sáng tạo</h1><p>AI đang thay đổi cách chúng ta làm việc. Từ Midjourney đến Stable Diffusion, các công cụ này không thay thế nghệ sĩ mà đang trở thành cộng sự đắc lực.</p><blockquote>"AI sẽ không thay thế nghệ sĩ, nhưng những nghệ sĩ biết dùng AI sẽ thay thế những người không biết."</blockquote><p>Trong bài viết này, chúng ta sẽ xem xét cách tích hợp AI vào quy trình làm việc để tăng gấp đôi năng suất sáng tạo.</p>', 
    'Phân tích sự tác động của AI đối với ngành công nghiệp sáng tạo và cách các nghệ sĩ có thể tận dụng AI như một công cụ hỗ trợ.', 
    'https://res.cloudinary.com/dzp7v7i7e/image/upload/v1700000000/blog/ai-creative.jpg', 
    'published', 
    false, 
    3, 
    'Trí tuệ nhân tạo trong ngành Sáng tạo | 9F Universe Blog', 
    'Cập nhật xu hướng AI trong năm 2024 và cách các nhà sáng tạo nội dung có thể ứng dụng AI vào công việc hàng ngày.', 
    ARRAY['AI', 'Generative Art', 'Future of Work'], 
    ARRAY['AI', 'Trends'],
    NOW(),
    NOW()
);
