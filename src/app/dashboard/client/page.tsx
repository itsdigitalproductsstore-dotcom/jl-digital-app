import Link from "next/link";
import { ArrowRight, Package, CreditCard, MessageSquare, Clock } from "lucide-react";

const orders = [
  {
    id: "ORD-001",
    service: "Funnel Architecture",
    package: "Pro",
    status: "in-progress",
    price: 2497,
    date: "2024-01-15",
  },
  {
    id: "ORD-002",
    service: "Paid Advertising",
    package: "Enterprise",
    status: "pending",
    price: 7497,
    date: "2024-01-20",
  },
];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  "in-progress": "bg-blue-500/20 text-blue-400",
  completed: "bg-green-500/20 text-green-400",
  "payment-required": "bg-red-500/20 text-red-400",
};

export default function ClientDashboard() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none noise-overlay z-0"></div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        <header className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-bold">Welcome back</h1>
            <p className="text-gray-400">Manage your orders and track progress</p>
          </div>
          <Link
            href="/services"
            className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            New Order <ArrowRight className="w-5 h-5" />
          </Link>
        </header>

        <div className="grid lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 rounded-3xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Active Orders</p>
                <p className="text-2xl font-bold">2</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 rounded-3xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Pending Payments</p>
                <p className="text-2xl font-bold">1</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 rounded-3xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Spent</p>
                <p className="text-2xl font-bold">$2,497</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 rounded-3xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Your Orders</h2>
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-700 hover:border-gray-500 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-bold">{order.service}</p>
                    <p className="text-sm text-gray-400">
                      {order.package} • {order.id}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <span className={`px-3 py-1 rounded-full text-sm ${statusColors[order.status]}`}>
                    {order.status.replace("-", " ")}
                  </span>
                  <span className="font-bold">${order.price}</span>
                  <button className="text-gray-400 hover:text-white transition-colors">
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 rounded-3xl p-8">
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/services"
              className="p-4 rounded-xl border border-gray-700 hover:border-gray-500 transition-colors text-center"
            >
              <Package className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="font-semibold">Browse Services</p>
            </Link>
            <button className="p-4 rounded-xl border border-gray-700 hover:border-gray-500 transition-colors text-center">
              <CreditCard className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="font-semibold">Make Payment</p>
            </button>
            <button className="p-4 rounded-xl border border-gray-700 hover:border-gray-500 transition-colors text-center">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="font-semibold">Contact Support</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
