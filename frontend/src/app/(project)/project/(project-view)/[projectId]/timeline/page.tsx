import TimelineClient from "@/components/Timeline/TimelineClient";

export default async function TimelinePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <TimelineClient projectId={projectId} />;
}
