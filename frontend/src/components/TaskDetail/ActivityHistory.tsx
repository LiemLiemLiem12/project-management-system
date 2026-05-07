import { AuditLog, AuditLogResponse } from "@/API/audit.api";
import { useGetAuditLog } from "@/services/audit.service";
import { useGetUsersById } from "@/services/user.service";
import { useTaskStore } from "@/store/task.store";
import { ArrowRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

// Khai báo các field chứa ID của user để map dữ liệu
const USER_FIELDS = ["assignee_id", "created_by", "user_id"];

const getDiffs = (oldValStr: string, newValStr: string) => {
  if (!oldValStr || !newValStr) return [];

  try {
    const oldObj = JSON.parse(oldValStr);
    const newObj = JSON.parse(newValStr);
    const changes: { field: string; from: any; to: any }[] = [];

    const allKeys = new Set([
      ...Object.keys(oldObj || {}),
      ...Object.keys(newObj || {}),
    ]);

    allKeys.forEach((key) => {
      const oldV = oldObj[key];
      const newV = newObj[key];

      if (JSON.stringify(oldV) !== JSON.stringify(newV)) {
        changes.push({
          field: key,
          from: oldV === null || oldV === undefined ? "None" : oldV,
          to: newV === null || newV === undefined ? "None" : newV,
        });
      }
    });

    return changes;
  } catch (error) {
    return [{ field: "data", from: oldValStr, to: newValStr }];
  }
};

const formatValue = (value: any) => {
  if (value === "None") return value;
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const formatLabels = (labelsData: any) => {
  if (!labelsData || labelsData === "None") return "None";

  if (Array.isArray(labelsData)) {
    const names = labelsData.map((label: any) => label?.name).filter(Boolean);
    return names.length > 0 ? names.join(", ") : "None";
  }

  return formatValue(labelsData);
};

export default function ActivityHistory() {
  const [offset, setOffset] = useState<number>(0);
  const [limit, setLimit] = useState<number>(10);
  const [historyData, setHistoryData] = useState<AuditLog[]>([]);

  const currentTask = useTaskStore((s) => s.currentTask);

  const { data: auditDatas, isPending: pendingAuditData } = useGetAuditLog(
    "entity_id",
    currentTask?.id,
    limit,
    offset,
  );

  // 1. Gom tất cả user_id (kể cả trong diffs) để fetch 1 lần
  const userIds = useMemo(() => {
    if (!auditDatas?.data || auditDatas.data.length === 0) return [];

    // Dùng Set để loại bỏ các ID trùng lặp
    const ids = new Set<string>();

    auditDatas.data.forEach((data) => {
      // Add ID của người thực hiện hành động
      if (data.user_id) ids.add(data.user_id);

      // Add ID từ các thay đổi (vd: assignee_id)
      const diffs = getDiffs(data.old_value, data.new_value);
      diffs.forEach((diff) => {
        if (USER_FIELDS.includes(diff.field)) {
          if (diff.from !== "None") ids.add(diff.from);
          if (diff.to !== "None") ids.add(diff.to);
        }
      });
    });

    return Array.from(ids);
  }, [auditDatas]);

  const { data: users, isPending: pendingUsers } = useGetUsersById(
    userIds || [],
  );

  useEffect(() => {
    if (auditDatas?.data) {
      if (offset === 0) {
        setHistoryData(auditDatas.data);
      } else {
        setHistoryData((prev: AuditLog[]) => [...prev, ...auditDatas.data]);
      }
    }
  }, [auditDatas?.data, offset]);

  // Hàm tiện ích để lấy tên user từ ID
  const getUserName = (id: any) => {
    if (id === "None") return id;
    const user = users?.find((u) => u.id === id);
    return user?.fullName || formatValue(id); // Nếu không tìm thấy user, hiển thị ID gốc
  };

  if (pendingAuditData && offset === 0) {
    return (
      <div className="text-sm text-slate-500 animate-pulse">
        Loading history...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {historyData.map((item) => {
        const diffs = getDiffs(item.old_value, item.new_value);

        // Thông tin người thực hiện hành động
        const authorInfo = users?.find((u) => u.id === item.user_id) || {
          fullName: item.user_id,
        };

        return (
          <div key={item.id} className="flex gap-3">
            {/* <Avatar initials={item.avatar} /> */}
            <div className="flex-1">
              <div className="flex items-baseline gap-1 mb-0.5">
                <span className="font-semibold text-[#172B4D]">
                  {authorInfo?.fullName}
                </span>
                <span className="text-[#172B4D]">
                  {item.action || "updated the task"}
                </span>
              </div>

              <div className="text-xs text-slate-500 mb-2">
                {new Date(item.created_at).toLocaleString()}
              </div>

              <div className="space-y-1">
                {diffs.map((diff, index) => {
                  // Kiểm tra xem field thay đổi có phải là liên quan đến user không

                  let displayFrom = "NONE";
                  let displayTo = "NONE";

                  if (USER_FIELDS.includes(diff.field)) {
                    displayFrom = getUserName(diff.from);
                    displayTo = getUserName(diff.to);
                  } else if (diff.field === "labels") {
                    displayFrom = formatLabels(diff.from);
                    displayTo = formatLabels(diff.to);
                  } else if (
                    diff.field === "created_at" ||
                    diff.field === "due_date"
                  ) {
                    displayFrom = new Date(diff.from).toLocaleString();
                    displayTo = new Date(diff.to).toLocaleString();
                  } else if (diff.field === "groupTask") {
                    displayFrom = diff.from?.title || "NONE";
                    displayTo = diff.to?.title || "NONE";
                  } else if (diff.field === "group_task_id") {
                    return;
                  } else {
                    displayFrom = formatValue(diff.from);
                    displayTo = formatValue(diff.to);
                  }

                  return (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm text-[#172B4D] flex-wrap"
                    >
                      <span className="font-medium text-slate-600 capitalize">
                        {diff.field.replace(/_/g, " ")}:
                      </span>

                      <span className="text-slate-600 line-through">
                        {displayFrom}
                      </span>

                      <ArrowRight size={14} className="text-slate-400" />

                      <span className="border border-slate-300 rounded px-1.5 py-0.5 text-xs font-semibold bg-slate-50 text-slate-600">
                        {displayTo}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}

      {auditDatas?.data?.length === limit && (
        <button
          onClick={() => setOffset((prev) => prev + limit)}
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          Load More
        </button>
      )}
    </div>
  );
}
