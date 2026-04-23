import { Outlet } from "react-router";

export const CustomerLayout = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <main className="mx-auto max-x-7xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};
