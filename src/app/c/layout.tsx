import { CSidebar } from "@/components/layout/CSidebar";

export default function CLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <CSidebar />
      <main className="flex-1 p-6 overflow-auto bg-gray-50">{children}</main>
    </div>
  );
}
