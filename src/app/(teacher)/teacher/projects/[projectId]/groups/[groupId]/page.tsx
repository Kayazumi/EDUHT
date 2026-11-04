// [FE] Xem chi tiết một nhóm · tài liệu mục 3.3 và 4.5 · TODO: hiện thực

export default async function TeacherProjectGroupDetailPage({
  params,
}: {
  params: Promise<{ projectId: string; groupId: string }>;
}) {
  const { projectId, groupId } = await params;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Xem một nhóm: {groupId} (Dự án {projectId})</h1>
      <p className="text-sm text-gray-500">Khung trang, chưa hiện thực (tài liệu mục 3.3 và 4.5)</p>
    </main>
  );
}
