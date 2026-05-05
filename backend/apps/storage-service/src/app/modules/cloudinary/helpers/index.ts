export const getResourceType = (fileName: string | undefined) => {
  if (!fileName) return 'raw';

  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'pdf'];
  const videoExts = ['mp4', 'mov', 'avi', 'wmv', 'flv', 'webm', 'mp3', 'wav'];

  if (imageExts.includes(ext)) {
    return 'image';
  } else if (videoExts.includes(ext)) {
    return 'video';
  } else {
    return 'raw';
  }
};
