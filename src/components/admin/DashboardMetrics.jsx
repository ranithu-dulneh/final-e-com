import { useState, useEffect } from "react";
import { db } from "../../firebase";
import { ref, get } from "firebase/database";
import { TrendingUp, Users, ShoppingBag, DollarSign, Package, Truck, CheckCircle, RotateCcw } from "lucide-react";


// eslint-disable-next-line no-unused-vars
const MetricCard = ({ title, value, icon: Icon, subtitle }) => (
  <div className="bg-white p-6 shadow-sm border border-gray-100 rounded-sm">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</h3>
      <div className="p-2 bg-gray-50 rounded-sm">
        <Icon size={20} className="text-gray-400" />
      </div>
    </div>
    <p className="text-2xl font-serif text-gray-900">{value}</p>
    {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}
  </div>
);

const DashboardMetrics = () => {
  const [timeFilter, setTimeFilter] = useState("Today"); // 'Today', 'This Month', 'This Year', 'Custom'
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const [metrics, setMetrics] = useState({
    visits: 0,
    salesAmount: 0,
    ordersCount: 0,

    // Categorization
    pending: 0,
    dispatched: 0,
    delivered: 0,
    returned: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();

        let customStartTime = 0;
        let customEndTime = Infinity;
        if (timeFilter === 'Custom' && customStart && customEnd) {
            customStartTime = new Date(customStart).getTime();
            customEndTime = new Date(customEnd).getTime() + 86399999; // end of day
        }

        const isWithinFilter = (timestamp) => {
            if (timeFilter === 'Today') return timestamp >= startOfDay;
            if (timeFilter === 'This Month') return timestamp >= startOfMonth;
            if (timeFilter === 'This Year') return timestamp >= startOfYear;
            if (timeFilter === 'Custom') return timestamp >= customStartTime && timestamp <= customEndTime;
            return true;
        };

        // Fetch Orders
        const ordersSnap = await get(ref(db, 'orders'));
        let salesAmount = 0;
        let ordersCount = 0;
        let pending = 0;
        let dispatched = 0;
        let delivered = 0;
        let returned = 0;

        if (ordersSnap.exists()) {
            const ordersData = ordersSnap.val();
            Object.values(ordersData).forEach(order => {
                const orderTime = new Date(order.createdAt).getTime();
                if (isWithinFilter(orderTime)) {
                    salesAmount += parseFloat(order.totalAmount || 0);
                    ordersCount++;

                    // Count statuses
                    const status = order.status || '';
                    if (status.toLowerCase().includes('pending')) pending++;
                    else if (status.toLowerCase().includes('dispatched')) dispatched++;
                    else if (status.toLowerCase().includes('delivered')) delivered++;
                    else if (status.toLowerCase().includes('returned')) returned++;
                }
            });
        }

        // Fetch Analytics for Visits
        const analyticsSnap = await get(ref(db, 'analytics'));
        let visits = 0;
        if (analyticsSnap.exists()) {
            const data = analyticsSnap.val();
            if (data.visits && data.visits.daily) {
                Object.entries(data.visits.daily).forEach(([dateStr, count]) => {
                    const dateObj = new Date(dateStr);
                    // Add timezone offset so it matches local dates
                    const visitTime = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()).getTime();
                    if (isWithinFilter(visitTime)) {
                        visits += count;
                    }
                });
            }
        }

        setMetrics({
            visits,
            salesAmount,
            ordersCount,
            pending,
            dispatched,
            delivered,
            returned
        });

      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeFilter, customStart, customEnd]);


  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-gray-100 pb-4">
        <h2 className="text-xl font-serif">Dashboard</h2>
        <div className="flex flex-wrap items-center gap-4">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="border-gray-300 rounded-sm focus:border-gold-500 focus:ring-1 focus:ring-gold-500 p-2 border text-sm"
          >
            <option value="Today">Today</option>
            <option value="This Month">This Month</option>
            <option value="This Year">This Year</option>
            <option value="Custom">Custom</option>
          </select>

          {timeFilter === 'Custom' && (
            <div className="flex items-center gap-2">
                <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="border-gray-300 rounded-sm p-2 border text-sm"
                />
                <span className="text-gray-500">-</span>
                <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="border-gray-300 rounded-sm p-2 border text-sm"
                />
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="p-4 text-center text-gray-500">Loading dashboard metrics...</div>
      ) : (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <MetricCard
                title="Sales"
                value={`Rs. ${metrics.salesAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                icon={DollarSign}
                subtitle={`${timeFilter} filter applied`}
            />
            <MetricCard
                title="Orders"
                value={metrics.ordersCount}
                icon={ShoppingBag}
                subtitle={`${timeFilter} filter applied`}
            />
            <MetricCard
                title="Site Visits"
                value={metrics.visits}
                icon={Users}
                subtitle={`${timeFilter} filter applied`}
            />
            </div>

            <h3 className="text-lg font-serif mb-4 mt-8">Order Categorization ({timeFilter})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <MetricCard title="Pending" value={metrics.pending} icon={Package} />
                <MetricCard title="Dispatched" value={metrics.dispatched} icon={Truck} />
                <MetricCard title="Delivered" value={metrics.delivered} icon={CheckCircle} />
                <MetricCard title="Returned" value={metrics.returned} icon={RotateCcw} />
            </div>
        </>
      )}
    </div>
  );
};

export default DashboardMetrics;
