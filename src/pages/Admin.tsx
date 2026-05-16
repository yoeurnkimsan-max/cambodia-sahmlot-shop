import { useMemo, useState } from "react";
import { AdminShell, AdminSection } from "@/components/admin/AdminShell";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AdminOrders } from "@/components/admin/AdminOrders";
import { AdminProducts } from "@/components/admin/AdminProducts";
import { AdminCustomers } from "@/components/admin/AdminCustomers";
import { AdminSettings } from "@/components/admin/AdminSettings";
import { useOrders } from "@/context/OrdersContext";

const Admin = () => {
  const [section, setSection] = useState<AdminSection>("dashboard");
  const { orders } = useOrders();

  const badges = useMemo(
    () => ({
      orders: orders.filter((o) => o.status === "pending").length,
    }),
    [orders],
  );

  return (
    <AdminShell active={section} onChange={setSection} badges={badges}>
      {section === "dashboard" && <AdminDashboard onJumpToOrders={() => setSection("orders")} />}
      {section === "orders" && <AdminOrders />}
      {section === "products" && <AdminProducts />}
      {section === "customers" && <AdminCustomers />}
      {section === "settings" && <AdminSettings />}
    </AdminShell>
  );
};

export default Admin;
