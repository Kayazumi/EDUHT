// [CHUNG] Kiểu dữ liệu CSDL Supabase · sinh tự động bằng npm run db:types, không sửa tay

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Database = any;

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];
