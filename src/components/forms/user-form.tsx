// [FE] Biểu mẫu người dùng · tài liệu mục 4.7
'use client';

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function UserForm() {
  return (
    <form className="space-y-4 max-w-lg bg-white p-6 rounded-lg border shadow-sm">
      <Input label="Tên đăng nhập" placeholder="hs.nguyenvana" />
      <Input label="Họ và tên" placeholder="Nguyễn Văn A" />
      <Button type="submit">Lưu thông tin</Button>
    </form>
  );
}
