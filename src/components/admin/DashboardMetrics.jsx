import { useState, useEffect } from "react";
import { db } from "../../firebase";
import { ref, get } from "firebase/database";
import { TrendingUp, Users, ShoppingBag, DollarSign } from "lucide-react";

const DashboardMetrics = () => {
  const [metrics, setMetrics] = useState({
    totalVisits: 0,
    todayVisits: 0,
    totalSalesAmount: 0,
    totalOrders: 0,
    todaySalesAmount: 0,
    monthlySalesAmount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const currentMonth = today.substring(0, 7);

        const snapshot = await get(ref(db, 'analytics'));

        let fetchedMetrics = {
          totalVisits: 0,
          todayVisits: 0,
          totalSalesAmount: 0,
          totalOrders: 0,
          todaySalesAmount: 0,
          monthlySalesAmount: 0,
        };

        if (snapshot.exists()) {
          const data = snapshot.val();

          if (data.visits) {
            fetchedMetrics.totalVisits = data.visits.total || 0;
            if (data.visits.daily && data.visits.daily[today]) {
              fetchedMetrics.todayVisits = data.visits.daily[today];
            }
          }

          if (data.sales) {
            if (data.sales.total) {
              fetchedMetrics.totalSalesAmount = data.sales.total.amount || 0;
              fetchedMetrics.totalOrders = data.sales.total.count || 0;
            }
            if (data.sales.daily && data.sales.daily[today]) {
              fetchedMetrics.todaySalesAmount = data.sales.daily[today].amount || 0;
            }
            if (data.sales.monthly && data.sales.monthly[currentMonth]) {
              fetchedMetrics.monthlySalesAmount = data.sales.monthly[currentMonth].amount || 0;
            }
          }
        }

        // As a fallback/initialisation, let's also fetch orders directly to get total orders count
        // if sales tracking was just implemented
        if (fetchedMetrics.totalOrders === 0) {
            const ordersSnap = await get(ref(db, 'orders'));
            if (ordersSnap.exists()) {
                fetchedMetrics.totalOrders = Object.keys(ordersSnap.val()).length;
            }
        }

        setMetrics(fetchedMetrics);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="p-4 text-center">Loading dashboard metrics...</div>;
  }

  const MetricCard = ({ title, value, icon: Icon, subtitle }) => (
    <div className="bg-white p-6 shadow-sm border border-gray-100 rounded-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">{title}</h3>
        <div className="p-2 bg-gray-50 rounded-full">
          <Icon className="text-gold-600" size={20} />
        </div>
      </div>
      <p className="text-3xl font-serif text-gray-900">{value}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-2">{subtitle}</p>}
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <MetricCard
        title="Total Sales"
        value={`Rs. ${metrics.totalSalesAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        icon={DollarSign}
        subtitle={`Rs. ${metrics.monthlySalesAmount.toLocaleString()} this month`}
      />
      <MetricCard
        title="Today's Sales"
        value={`Rs. ${metrics.todaySalesAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        icon={TrendingUp}
      />
      <MetricCard
        title="Total Orders"
        value={metrics.totalOrders}
        icon={ShoppingBag}
      />
      <MetricCard
        title="Site Visits"
        value={metrics.totalVisits}
        icon={Users}
        subtitle={`${metrics.todayVisits} visits today`}
      />
    </div>
  );
};

export default DashboardMetrics;
