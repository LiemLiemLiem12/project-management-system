import SpreadsheetClient from "@/components/Tasks/SpreadsheetClient";

export default async function SpreadsheetPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <SpreadsheetClient projectId={projectId} />;
}
