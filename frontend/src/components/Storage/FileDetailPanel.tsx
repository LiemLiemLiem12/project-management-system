import { StorageFile, users, getUser } from "@/store/storageStore";

export default function FileDetailPanel({
  file,
  onClose,
}: {
  file: StorageFile;
  onClose: () => void;
}) {
  const modifier = getUser(file.modifiedBy);

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <p className="text-sm font-semibold text-gray-900 truncate">{file.name}</p>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-50"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Preview */}
      <div className="px-5 pt-4 pb-3">
        {file.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={file.thumbnail}
            alt={file.name}
            className="w-full h-44 object-cover rounded-xl"
          />
        ) : (
          <div className="w-full h-44 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#D1D5DB" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        )}
      </div>

      <div className="px-5 overflow-y-auto flex-1 space-y-5 pb-6">
        {/* Who has access */}
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2">Who has access</p>
          <div className="flex items-center gap-1">
            {file.accessUserIds.map((uid, i) => {
              const u = getUser(uid);
              if (!u) return null;
              return (
                <div
                  key={uid}
                  title={u.name}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white border-2 border-white cursor-pointer hover:scale-110 transition-transform"
                  style={{ background: u.color, marginLeft: i > 0 ? -4 : 0 }}
                >
                  {u.initials}
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-gray-100" />

        {/* Files Detail */}
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-3">Files Detail</p>
          <div className="space-y-3">
            <DetailRow label="Locations" value={file.location} />
            <DetailRow label="Type" value={file.type.charAt(0).toUpperCase() + file.type.slice(1)} />
            <DetailRow label="Size" value={file.size} />
          </div>
        </div>

        {/* Modifier */}
        {modifier && (
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
              style={{ background: modifier.color }}
            >
              {modifier.initials}
            </div>
            <span className="text-sm font-medium text-gray-700">{modifier.name}</span>
          </div>
        )}

        <div>
          <p className="text-xs font-semibold text-gray-500 mb-1">Modified</p>
          <p className="text-sm text-gray-600">
            {file.modifiedAt}{modifier ? ` by ${modifier.name}` : ""}
          </p>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm text-gray-700">{value}</p>
    </div>
  );
}
