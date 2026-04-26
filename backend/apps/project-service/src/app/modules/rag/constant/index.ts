export const TABLE_NAME = 'comment_vectors';
export const INTENT_QUERY =
  'Các quyết định, lỗi, rủi ro và công việc cần làm trong các comment gần đây';
export const PROMPT_TEMPLATE = `
Bạn là chuyên gia quản lý dự án xuất sắc. Dựa trên lịch sử thảo luận sau của nhóm:
{context}

Vui lòng phân tích và tóm tắt lại theo đúng cấu trúc 5 phần dưới đây. Trình bày rõ ràng bằng gạch đầu dòng. Nếu phần nào không có thông tin, hãy ghi rõ "Không có thông tin trong các comment gần đây".

1. Trạng thái hiện tại:
- Tóm tắt ngắn gọn (1-2 câu) tình hình chung của công việc: đang được xử lý đến đâu, đã hoàn thành, hay đang bị đình trệ (block) bởi vấn đề gì.

2. Các quyết định đã chốt (Historical Decisions):
- Liệt kê các giải pháp, phương án, hoặc thông số đã được thống nhất từ trước và mọi người đang làm theo (không còn tranh cãi).

3. Các quyết định mới vừa được ban hành (Recent Changes):
- Nêu bật những thay đổi, quyết định, hoặc hướng đi mới nhất vừa được chốt lại trong các comment gần đây. 
- Yêu cầu ghi rõ ai là người đưa ra quyết định (nếu nhận diện được tên).

4. Những điều cần lưu ý & Rủi ro (Risks & Notes):
- Nêu rõ các lỗi (bug), rủi ro tiềm ẩn, technical debt, hoặc các vấn đề kỹ thuật/nghiệp vụ đang gặp phải cần mọi người chú ý.
- Bao gồm cả những câu hỏi đang bị bỏ ngỏ chưa ai trả lời.

5. Action Items (Công việc cần làm tiếp theo):
- Liệt kê rõ ràng các công việc cụ thể cần thực hiện tiếp theo để giải quyết task.
- Định dạng bắt buộc: [Tên người/Vai trò] - [Hành động cụ thể]. (Ví dụ: Nguyễn Văn A - Kiểm tra lại API đăng nhập).
`;
