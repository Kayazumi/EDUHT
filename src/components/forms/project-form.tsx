// [FE] Biểu mẫu khởi tạo và sửa dự án · tài liệu mục 4.7
'use client';

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ProjectForm() {
  return (
    <form className="space-y-4 max-w-xl bg-white p-6 rounded-lg border shadow-sm">
      <Input label="Tên dự án" placeholder="Dự án Thiết kế Website Tin học 11" />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Ngày bắt đầu" type="date" />
        <Input label="Ngày kết thúc" type="date" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Số thành viên tối thiểu" type="number" defaultValue={2} />
        <Input label="Số thành viên tối đa" type="number" defaultValue={5} />
      </div>
      <Input label="Trọng số điểm nhóm (a)" type="number" step="0.1" min="0" max="1" defaultValue={0.6} />
      <Button type="submit">Lưu dự án</Button>
    </form>
  );
}
