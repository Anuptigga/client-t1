import { useState } from 'react';
import { 
  Users, ChefHat, ShoppingBag, TrendingUp, CheckCircle, XCircle, Loader2, IndianRupee, ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageShell from '../../../components/layout/PageShell.jsx';
import Button from '../../../components/ui/Button.jsx';
import { 
  useGetOverviewStatsQuery, 
  useGetKitchensQuery, 
  useModerateKitchenMutation,
  useGetUsersQuery,
  useGetGlobalOrdersQuery
} from '../adminApi.js';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  
  return (
    <PageShell>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-surface-800 mb-6 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary-500" />
          Admin Dashboard
        </h1>

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-2 mb-8 pb-2 scrollbar-hide">
          {['overview', 'kitchens', 'users', 'orders'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-white text-surface-600 hover:bg-surface-50 border border-surface-200'
              }`}
            >
              <span className="capitalize">{tab}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="animate-fade-in">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'kitchens' && <KitchensTab />}
          {activeTab === 'users' && <UsersTab />}
          {activeTab === 'orders' && <OrdersTab />}
        </div>
      </div>
    </PageShell>
  );
}

function OverviewTab() {
  const { data, isLoading } = useGetOverviewStatsQuery();
  const stats = data?.data;

  if (isLoading) return <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>;

  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={stats?.users || 0} icon={<Users />} color="text-blue-500" bg="bg-blue-50" />
        <StatCard title="Active Kitchens" value={stats?.kitchens || 0} icon={<ChefHat />} color="text-orange-500" bg="bg-orange-50" />
        <StatCard title="Completed Orders" value={stats?.completedOrders || 0} icon={<ShoppingBag />} color="text-green-500" bg="bg-green-50" />
        <StatCard title="Platform Revenue" value={`₹${stats?.platformRevenue?.toFixed(2) || 0}`} icon={<IndianRupee />} color="text-purple-500" bg="bg-purple-50" />
      </div>

      {/* Quick Actions / Pending Approvals */}
      <div className="bg-white rounded-2xl border border-surface-100 p-6 shadow-soft">
        <h3 className="font-bold text-surface-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary-500" />
          Pending Kitchen Approvals
        </h3>
        <PendingKitchensList />
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, bg }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-surface-100 shadow-soft flex items-center gap-4">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${bg} ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-surface-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-surface-800">{value}</p>
      </div>
    </div>
  );
}

function PendingKitchensList() {
  const { data, isLoading } = useGetKitchensQuery({ status: 'pending', limit: 5 });
  const [moderateKitchen] = useModerateKitchenMutation();
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const handleApprove = async (id) => {
    try {
      await moderateKitchen({ id, isApproved: true }).unwrap();
      toast.success('Kitchen approved');
    } catch (err) {
      toast.error('Failed to approve kitchen');
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) return toast.error('Please enter a rejection reason');
    try {
      await moderateKitchen({ id: rejectingId, isApproved: false, reason: rejectReason.trim() }).unwrap();
      toast.success('Kitchen rejected and deleted');
      setRejectingId(null);
      setRejectReason('');
    } catch (err) {
      toast.error('Failed to reject kitchen');
    }
  };

  const kitchens = data?.data?.kitchens || [];

  if (isLoading) return <div className="py-4"><Loader2 className="w-6 h-6 text-primary-500 animate-spin" /></div>;
  if (kitchens.length === 0) return <p className="text-sm text-surface-500 py-4">No pending approvals.</p>;

  return (
    <>
      <div className="divide-y divide-surface-100">
        {kitchens.map((k) => (
          <div key={k._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-surface-800">{k.name}</p>
              <p className="text-xs text-surface-500 mb-2">Owner: {k.owner?.name} ({k.owner?.email})</p>
              
              {/* Display KYC Documents */}
              {k.kycDetails?.documentUrl ? (
                <div className="mt-2">
                  <a
                    href={k.kycDetails.documentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors border border-blue-200"
                  >
                    📄 View KYC Document
                  </a>
                </div>
              ) : (
                <p className="text-xs text-red-500 font-medium mt-1">No KYC document uploaded</p>
              )}
            </div>
            
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" onClick={() => { setRejectingId(k._id); setRejectReason(''); }} className="text-red-600 hover:bg-red-50 border-red-200 py-1.5 px-3">
                <XCircle className="w-4 h-4 mr-1" /> Reject
              </Button>
              <Button onClick={() => handleApprove(k._id)} className="bg-green-600 hover:bg-green-700 text-white py-1.5 px-3">
                <CheckCircle className="w-4 h-4 mr-1" /> Approve
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Rejection Reason Modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
            <h3 className="text-lg font-bold text-surface-800 mb-2">Reject Kitchen</h3>
            <p className="text-sm text-surface-500 mb-4">
              Please provide a reason for rejection. The kitchen owner will see this reason and can re-apply from scratch.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="e.g. Documents are blurry, missing FSSAI license..."
              className="w-full px-4 py-3 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none"
            />
            <div className="flex gap-3 mt-4 justify-end">
              <Button variant="outline" onClick={() => setRejectingId(null)} className="py-1.5 px-4">
                Cancel
              </Button>
              <Button onClick={handleRejectConfirm} className="bg-red-600 hover:bg-red-700 text-white py-1.5 px-4">
                <XCircle className="w-4 h-4 mr-1" /> Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function KitchensTab() {
  const { data, isLoading } = useGetKitchensQuery({ page: 1, limit: 50 });
  const kitchens = data?.data?.kitchens || [];

  if (isLoading) return <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>;

  return (
    <div className="bg-white rounded-2xl border border-surface-100 shadow-soft overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[600px]">
          <thead className="bg-surface-50 text-surface-500">
            <tr>
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Owner</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Documents</th>
              <th className="px-6 py-3 font-medium">Rating</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {kitchens.map((k) => (
              <tr key={k._id} className="hover:bg-surface-50 transition-colors">
                <td className="px-6 py-4 font-medium text-surface-800">{k.name}</td>
                <td className="px-6 py-4 text-surface-600">{k.owner?.name}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    k.isApproved ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {k.isApproved ? 'Approved' : 'Pending'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {k.kycDetails?.documentUrl ? (
                    <a
                      href={k.kycDetails.documentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium hover:bg-blue-100 border border-blue-200 inline-block"
                    >
                      View PDF
                    </a>
                  ) : (
                    <span className="text-xs text-surface-400">None</span>
                  )}
                </td>
                <td className="px-6 py-4 text-surface-600 flex items-center gap-1">{k.rating?.average?.toFixed(1) || '0.0'} ({k.rating?.count || 0})</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UsersTab() {
  const { data, isLoading } = useGetUsersQuery({ page: 1, limit: 50 });
  const users = data?.data?.users || [];

  if (isLoading) return <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>;

  return (
    <div className="bg-white rounded-2xl border border-surface-100 shadow-soft overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-surface-50 text-surface-500">
          <tr>
            <th className="px-6 py-3 font-medium">Name</th>
            <th className="px-6 py-3 font-medium">Email</th>
            <th className="px-6 py-3 font-medium">Role</th>
            <th className="px-6 py-3 font-medium">Joined</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-100">
          {users.map((u) => (
            <tr key={u._id} className="hover:bg-surface-50 transition-colors">
              <td className="px-6 py-4 font-medium text-surface-800">{u.name}</td>
              <td className="px-6 py-4 text-surface-600">{u.email}</td>
              <td className="px-6 py-4 capitalize text-surface-600">{u.role}</td>
              <td className="px-6 py-4 text-surface-500">{new Date(u.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OrdersTab() {
  const { data, isLoading } = useGetGlobalOrdersQuery({ page: 1, limit: 50 });
  const orders = data?.data?.orders || [];

  if (isLoading) return <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>;

  return (
    <div className="bg-white rounded-2xl border border-surface-100 shadow-soft overflow-hidden">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-surface-50 text-surface-500">
          <tr>
            <th className="px-6 py-3 font-medium">Order ID</th>
            <th className="px-6 py-3 font-medium">Kitchen</th>
            <th className="px-6 py-3 font-medium">Buyer</th>
            <th className="px-6 py-3 font-medium">Status</th>
            <th className="px-6 py-3 font-medium">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-100">
          {orders.map((o) => (
            <tr key={o._id} className="hover:bg-surface-50 transition-colors">
              <td className="px-6 py-4 text-surface-500 text-xs font-mono">{o._id}</td>
              <td className="px-6 py-4 font-medium text-surface-800">{o.kitchen?.name}</td>
              <td className="px-6 py-4 text-surface-600">{o.buyer?.name}</td>
              <td className="px-6 py-4">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                  ['completed', 'delivered'].includes(o.status) ? 'bg-green-100 text-green-700' :
                  o.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {o.status.replace('_', ' ')}
                </span>
              </td>
              <td className="px-6 py-4 font-medium text-surface-800">₹{o.total?.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
