import { Users, CheckCircle, Clock, AlertCircle } from "lucide-react";

const assignedClients = [
  {
    id: "CL-001",
    name: "John Smith",
    company: "TechStart Inc",
    service: "Funnel Architecture",
    status: "in-progress",
    lastUpdate: "2 hours ago",
  },
  {
    id: "CL-002",
    name: "Sarah Johnson",
    company: "Beauty Brand",
    service: "Paid Advertising",
    status: "pending-review",
    lastUpdate: "1 day ago",
  },
  {
    id: "CL-003",
    name: "Mike Davis",
    company: "Fitness Pro",
    service: "Content Production",
    status: "in-progress",
    lastUpdate: "3 hours ago",
  },
  {
    id: "CL-004",
    name: "Emily Chen",
    company: "E-Shop Plus",
    service: "Workflow Automation",
    status: "awaiting-payment",
    lastUpdate: "5 hours ago",
  },
];

const statusConfig: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  "in-progress": { color: "bg-blue-500/20 text-blue-400", icon: Clock, label: "In Progress" },
  "pending-review": { color: "bg-yellow-500/20 text-yellow-400", icon: AlertCircle, label: "Pending Review" },
  "awaiting-payment": { color: "bg-red-500/20 text-red-400", icon: AlertCircle, label: "Awaiting Payment" },
  completed: { color: "bg-green-500/20 text-green-400", icon: CheckCircle, label: "Completed" },
};

export default function StaffDashboard() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none noise-overlay z-0"></div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        <header className="mb-12">
          <h1 className="text-3xl font-bold">Staff Panel</h1>
          <p className="text-gray-400">Manage your assigned clients and tasks</p>
        </header>

        <div className="grid lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 rounded-3xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Assigned Clients</p>
                <p className="text-2xl font-bold">4</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 rounded-3xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">In Progress</p>
                <p className="text-2xl font-bold">2</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 rounded-3xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Pending Review</p>
                <p className="text-2xl font-bold">1</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 rounded-3xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Awaiting Payment</p>
                <p className="text-2xl font-bold">1</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 rounded-3xl p-8">
          <h2 className="text-2xl font-bold mb-6">Assigned Clients</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-4 px-4 text-gray-400 font-medium">Client</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-medium">Service</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-medium">Status</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-medium">Last Update</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignedClients.map((client) => {
                  const config = statusConfig[client.status];
                  const StatusIcon = config.icon;
                  
                  return (
                    <tr key={client.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-bold">{client.name}</p>
                          <p className="text-sm text-gray-400">{client.company}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-300">{client.service}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${config.color}`}>
                          <StatusIcon className="w-4 h-4" />
                          {config.label}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-400">{client.lastUpdate}</td>
                      <td className="py-4 px-4">
                        <button className="text-white hover:text-gray-300 transition-colors text-sm font-semibold">
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
