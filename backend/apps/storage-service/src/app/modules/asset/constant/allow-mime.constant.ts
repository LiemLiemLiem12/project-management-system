export const ALLOWED_MIME_TYPES = [
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',

  // Videos
  'video/mp4',
  'video/mpeg',
  'video/quicktime', // .mov

  // Documents (PDF)
  'application/pdf',

  // Word
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx

  // PowerPoint
  'application/vnd.ms-powerpoint', // .ppt
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx

  // Archives (ZIP)
  'application/zip',
  'application/x-zip-compressed', // Bổ sung thêm để tương thích tốt nhất với Windows
];
