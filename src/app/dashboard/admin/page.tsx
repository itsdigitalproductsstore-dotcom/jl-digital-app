import AdminDashboardClient from "./AdminDashboardClient";
import { getFAQItems } from "@/app/actions";

export default function AdminDashboardPage() {
    return <AdminDashboardClient initialFaqs={[]} />;
}
