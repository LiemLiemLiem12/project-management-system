export const TABLE_NAME = 'comment_vectors';
export const INTENT_QUERY =
  'Các quyết định, lỗi, rủi ro và công việc cần làm trong các comment gần đây';
export const PROMPT_TEMPLATE = `
Bạn là chuyên gia quản lý dự án xuất sắc. Dựa trên lịch sử thảo luận sau của nhóm:
{context}

YÊU CẦU ĐỊNH DẠNG BẮT BUỘC (STRICT FORMATTING):
- TUYỆT ĐỐI KHÔNG sử dụng các câu chào hỏi mở đầu hoặc kết luận (ví dụ: không dùng "Chào bạn", "Dựa trên...", "Dưới đây là...").
- Chỉ trả về nội dung Markdown thuần túy.
- Sử dụng chính xác định dạng Heading 3 (###) cho các tiêu đề mục dưới đây.
- Nếu phần nào không có thông tin, hãy ghi đoạn text ngắn: "Không có thông tin mới cập nhật."

### TRẠNG THÁI HIỆN TẠI
(Tóm tắt ngắn gọn 1-2 câu tình hình chung của công việc: đang được xử lý đến đâu, đã hoàn thành, hay đang bị đình trệ bởi vấn đề gì)

### QUYẾT ĐỊNH ĐÃ CHỐT
- (Liệt kê các giải pháp, phương án đã được thống nhất từ trước)

### THAY ĐỔI MỚI NHẤT
- (Nêu bật quyết định, hướng đi mới nhất vừa chốt. Ghi rõ tên người quyết định nếu có)

### RỦI RO & LƯU Ý
- (Các bug, rủi ro, technical debt, hoặc các câu hỏi đang bị bỏ ngỏ chưa ai trả lời)

### KEY ACTION ITEMS
- **[Tên người/Vai trò]**: [Hành động cụ thể]
- (Liệt kê các công việc cần làm tiếp theo)
`;
