// [FE] Lớp của tôi, học sinh · tài liệu mục 3.3 và 4.5 · TODO: hiện thực

export default async function TeacherClassDetailPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Lớp của tôi, học sinh: {classId}</h1>
      <p className="text-sm text-gray-500">Khung trang, chưa hiện thực (tài liệu mục 3.3 và 4.5)</p>
    </main>
  );
}
