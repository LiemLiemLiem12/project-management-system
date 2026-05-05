"use client";

export default function DocumentThumbnail({ fileUrl }: { fileUrl: string }) {
  const msViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
    fileUrl,
  )}`;

  return (
    <div className="relative w-full aspect-[4/3] bg-white overflow-hidden rounded-t-xl">
      <iframe
        src={msViewerUrl}
        className="absolute top-0 left-0 w-[400%] h-[400%] origin-top-left scale-[0.25] pointer-events-none"
        title="Document Thumbnail"
        frameBorder="0"
      />
    </div>
  );
}
