import React, { useState, useMemo } from 'react';
import { Sidebar } from '@/components/Sidebar';
import AdminMobileProfile from '@/components/AdminMobileProfile';
import { Card, Badge } from '@/components/common';
import { SkeletonModelDetail } from '@/components/Skeleton';
import { useGetPredictionsOverview } from '@/hooks/useQueries';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Clock,
  Users,
  Layers,
  CheckCircle,
  XCircle,
  Shield,
  BarChart3,
  Target,
  Zap,
  Calendar,
  Filter,
  Search,
  Info,
  RefreshCw,
  UserX,
  ChevronDown,
  ArrowRight,
  ShieldAlert,
  Award,
  ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';

export const PredictionsPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'attrition' | 'leave' | 'workforce'>('attrition');
  const [horizonDays, setHorizonDays] = useState<number>(14);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedHubFilter, setSelectedHubFilter] = useState<string>('all');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('all');
  const [selectedEmployeeModal, setSelectedEmployeeModal] = useState<any | null>(null);

  // Fetch full predictive suite
  const { data: overviewData, isLoading, isError, refetch, isFetching } = useGetPredictionsOverview(horizonDays);

  const attrition = overviewData?.attrition;
  const leaveDemand = overviewData?.leave_demand;
  const staffingRisk = overviewData?.staffing_risk;

  // Filtered employee predictions
  const filteredEmployees = useMemo(() => {
    if (!attrition?.employee_predictions) return [];
    return attrition.employee_predictions.filter((emp: any) => {
      const matchSearch =
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchTerm.toLowerCase());
      const matchHub = selectedHubFilter === 'all' || emp.hub === selectedHubFilter;
      const matchRisk = selectedRiskFilter === 'all' || emp.risk_level.toLowerCase() === selectedRiskFilter.toLowerCase();
      return matchSearch && matchHub && matchRisk;
    });
  }, [attrition, searchTerm, selectedHubFilter, selectedRiskFilter]);

  // Extract unique hubs for filtering
  const uniqueHubs = useMemo(() => {
    if (!attrition?.employee_predictions) return [];
    const hubs = new Set<string>();
    attrition.employee_predictions.forEach((emp: any) => {
      if (emp.hub) hubs.add(emp.hub);
    });
    return Array.from(hubs);
  }, [attrition]);

  // Calculate peak leave day
  const peakDay = useMemo(() => {
    if (!leaveDemand?.daily_forecasts || leaveDemand.daily_forecasts.length === 0) return null;
    return [...leaveDemand.daily_forecasts].sort((a: any, b: any) => b.predicted_leave_count - a.predicted_leave_count)[0];
  }, [leaveDemand]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans">
      {/* Sidebar - Desktop Fixed / Mobile Drawer */}
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Content Area: Indented on desktop with lg:ml-64 so it fits beside the fixed sidebar */}
      <div className="lg:ml-64 flex flex-col min-h-screen">
        {/* Mobile Header / Profile (only visible on mobile: block md:hidden) */}
        <AdminMobileProfile />

        {/* Desktop Sticky Header */}
        <header className="hidden md:flex sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-6 py-4 items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Predictive Workforce Intelligence
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                <Sparkles size={11} /> ML Production Engine
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Multi-variable Empirical Models: Resignation Probabilities, Leave Demand & Staffing Deficit Syntheses
            </p>
          </div>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300 disabled:opacity-50"
            title="Refresh Predictions"
          >
            <RefreshCw size={16} className={isFetching ? 'animate-spin text-blue-600' : ''} />
          </button>
        </header>

        {/* Tab & Horizon Navigation Bar - Responsive Sticky Header */}
        <div className="sticky top-0 md:top-auto z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 py-2.5 sm:py-3 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            {/* Scrollable Tabs on Mobile */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1">
              <button
                onClick={() => setActiveTab('attrition')}
                className={`shrink-0 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'attrition'
                    ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <UserX size={14} className="shrink-0" />
                <span>1. Attrition Risk</span>
              </button>

              <button
                onClick={() => setActiveTab('leave')}
                className={`shrink-0 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'leave'
                    ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Calendar size={14} className="shrink-0" />
                <span>2. Leave Demand</span>
              </button>

              <button
                onClick={() => setActiveTab('workforce')}
                className={`shrink-0 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'workforce'
                    ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <ShieldAlert size={14} className="shrink-0" />
                <span>3. Staffing Risk</span>
              </button>
            </div>

            {/* Horizon Filter for Leave & Workforce Tabs */}
            {(activeTab === 'leave' || activeTab === 'workforce') && (
              <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">Horizon:</span>
                <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-0.5">
                  {[7, 14, 30].map((d) => (
                    <button
                      key={d}
                      onClick={() => setHorizonDays(d)}
                      className={`px-2.5 py-1 text-[11px] sm:text-xs font-semibold rounded-md transition-all ${
                        horizonDays === d
                          ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      {d} Days
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Dashboard Content */}
        <main className="flex-1 p-3 sm:p-5 lg:p-6 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto pb-32 lg:pb-10 overflow-x-hidden">
          {/* Skeleton Loading State */}
          {isLoading ? (
            <SkeletonModelDetail />
          ) : isError ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 rounded-2xl space-y-3">
              <AlertTriangle className="mx-auto text-red-500" size={36} />
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Failed to Load Predictive Analytics Data
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Could not connect to the machine learning predictions API. Verify backend server status and try again.
              </p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* ======================================================== */}
              {/* TAB 1: EMPLOYEE RESIGNATION / ATTRITION RISK */}
              {/* ======================================================== */}
              {activeTab === 'attrition' && attrition && (
                <div className="space-y-4 sm:space-y-6 animate-fadeIn">
                  {/* Top Summary Stats (2x2 on mobile, 4 in row on desktop) */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-5 shadow-xs space-y-1">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Workforce
                        </span>
                        <Users size={15} className="text-blue-500 shrink-0" />
                      </div>
                      <div className="text-xl sm:text-2xl font-bold font-mono text-slate-800 dark:text-white">
                        {attrition.total_analyzed}
                      </div>
                      <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                        Active staff evaluated
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-5 shadow-xs space-y-1">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] sm:text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">
                          High Risk
                        </span>
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
                      </div>
                      <div className="text-xl sm:text-2xl font-bold font-mono text-red-600 dark:text-red-400">
                        {attrition.high_risk_count}
                      </div>
                      <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                        {attrition.total_analyzed > 0
                          ? `${Math.round((attrition.high_risk_count / attrition.total_analyzed) * 100)}% of workforce`
                          : 'Prob. ≥ 60%'}
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-5 shadow-xs space-y-1">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] sm:text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                          Medium Risk
                        </span>
                        <AlertTriangle size={15} className="text-amber-500 shrink-0" />
                      </div>
                      <div className="text-xl sm:text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
                        {attrition.medium_risk_count}
                      </div>
                      <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                        Watchlist (30%–59%)
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-5 shadow-xs space-y-1">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] sm:text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                          Top Model
                        </span>
                        <Award size={15} className="text-emerald-500 shrink-0" />
                      </div>
                      <div className="text-sm sm:text-base font-bold text-slate-800 dark:text-white truncate">
                        {attrition.model_name}
                      </div>
                      <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                        Ensemble Classifier
                      </div>
                    </div>
                  </div>

                  {/* Benchmark & Feature Importance */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Model Evaluation Comparison */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 space-y-3 sm:space-y-4 shadow-xs">
                      <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
                        <h2 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                          <BarChart3 size={15} className="text-blue-500" />
                          Model Performance Comparison
                        </h2>
                        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                          Classification benchmark on company validation dataset
                        </p>
                      </div>

                      <div className="overflow-x-auto -mx-1 sm:mx-0">
                        <table className="w-full text-xs text-left min-w-[340px]">
                          <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                              <th className="py-2 px-2.5">Model</th>
                              <th className="py-2 px-2 text-right">Accuracy</th>
                              <th className="py-2 px-2 text-right">Precision</th>
                              <th className="py-2 px-2 text-right">Recall</th>
                              <th className="py-2 px-2 text-right">F1</th>
                              <th className="py-2 px-2 text-right">ROC-AUC</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {attrition.model_evaluations?.map((m: any, idx: number) => {
                              const isTop = m.model_name === attrition.model_name;
                              return (
                                <tr
                                  key={idx}
                                  className={`transition-colors ${
                                    isTop ? 'bg-blue-50/50 dark:bg-blue-950/20 font-medium' : ''
                                  }`}
                                >
                                  <td className="py-2 px-2.5 flex items-center gap-1.5">
                                    {isTop && <CheckCircle size={12} className="text-blue-600 shrink-0" />}
                                    <span className={isTop ? 'text-blue-600 dark:text-blue-400 font-bold' : ''}>
                                      {m.model_name}
                                    </span>
                                  </td>
                                  <td className="py-2 px-2 text-right font-mono">{(m.accuracy * 100).toFixed(1)}%</td>
                                  <td className="py-2 px-2 text-right font-mono">{(m.precision * 100).toFixed(1)}%</td>
                                  <td className="py-2 px-2 text-right font-mono">{(m.recall * 100).toFixed(1)}%</td>
                                  <td className="py-2 px-2 text-right font-mono">{(m.f1_score * 100).toFixed(1)}%</td>
                                  <td className="py-2 px-2 text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                                    {(m.roc_auc * 100).toFixed(1)}%
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Feature Importance Chart */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 space-y-3 sm:space-y-4 shadow-xs">
                      <div>
                        <h2 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                          <Target size={15} className="text-indigo-500" />
                          Key Predictive Variables & Impact
                        </h2>
                        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                          Feature weights explaining attrition probability
                        </p>
                      </div>

                      <div className="h-52 sm:h-56">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            layout="vertical"
                            data={attrition.global_feature_importance?.slice(0, 6) || []}
                            margin={{ top: 5, right: 15, left: 45, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                            <XAxis
                              type="number"
                              tick={{ fontSize: 10 }}
                              unit="%"
                              tickFormatter={(v) => `${Math.round(v * 100)}`}
                            />
                            <YAxis
                              type="category"
                              dataKey="label"
                              tick={{ fontSize: 10 }}
                              width={85}
                            />
                            <Tooltip
                              formatter={(value: any) => [`${(Number(value) * 100).toFixed(1)}% weight`, 'Impact']}
                              contentStyle={{ borderRadius: 8, fontSize: 11 }}
                            />
                            <Bar dataKey="importance" fill="#3B82F6" radius={[0, 4, 4, 0]}>
                              {attrition.global_feature_importance?.slice(0, 6).map((_: any, index: number) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={index === 0 ? '#2563EB' : index === 1 ? '#3B82F6' : '#60A5FA'}
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Employee Risk Table */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
                    <div className="p-3.5 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <h2 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                          <Zap size={15} className="text-amber-500" />
                          Individual Employee Resignation Predictions
                        </h2>
                        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                          Predictions test multiple variables (Age ≥ 18 eligibility, overtime, tenure, absences)
                        </p>
                      </div>

                      {/* Filters */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Search Input */}
                        <div className="relative flex-1 sm:flex-initial">
                          <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Search employee..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-48 pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>

                        {/* Hub Filter */}
                        <select
                          value={selectedHubFilter}
                          onChange={(e) => setSelectedHubFilter(e.target.value)}
                          className="py-1.5 px-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none"
                        >
                          <option value="all">All Hubs</option>
                          {uniqueHubs.map((h) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>

                        {/* Risk Filter */}
                        <select
                          value={selectedRiskFilter}
                          onChange={(e) => setSelectedRiskFilter(e.target.value)}
                          className="py-1.5 px-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none"
                        >
                          <option value="all">All Risks</option>
                          <option value="high">High Risk</option>
                          <option value="medium">Medium Risk</option>
                          <option value="low">Low Risk</option>
                        </select>
                      </div>
                    </div>

                    <div className="overflow-x-auto -mx-1 sm:mx-0">
                      <table className="w-full text-xs text-left min-w-[640px]">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                            <th className="py-2.5 px-3">Employee</th>
                            <th className="py-2.5 px-3">Hub & Role</th>
                            <th className="py-2.5 px-2">Age/Tenure</th>
                            <th className="py-2.5 px-2">OT Hours</th>
                            <th className="py-2.5 px-2">Attendance</th>
                            <th className="py-2.5 px-3">Resignation Prob.</th>
                            <th className="py-2.5 px-3">Primary Factor</th>
                            <th className="py-2.5 px-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {filteredEmployees.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="py-8 text-center text-slate-500">
                                No matching employee risk predictions found.
                              </td>
                            </tr>
                          ) : (
                            filteredEmployees.map((emp: any) => {
                              const isHigh = emp.risk_level === 'High';
                              const isMed = emp.risk_level === 'Medium';
                              return (
                                <tr
                                  key={emp.employee_id}
                                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                                >
                                  <td className="py-2.5 px-3">
                                    <div className="font-semibold text-slate-800 dark:text-slate-100">
                                      {emp.name}
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-mono">{emp.code}</div>
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <div className="text-slate-700 dark:text-slate-300 font-medium">{emp.hub || 'HQ'}</div>
                                    <div className="text-[10px] text-slate-500">{emp.role}</div>
                                  </td>
                                  <td className="py-2.5 px-2 font-mono">
                                    <div>{emp.age} yrs</div>
                                    <div className="text-[10px] text-slate-500">{emp.tenure_years}y ten.</div>
                                  </td>
                                  <td className="py-2.5 px-2 font-mono">
                                    <span
                                      className={
                                        emp.overtime_hours > 20
                                          ? 'text-red-500 font-semibold'
                                          : 'text-slate-700 dark:text-slate-300'
                                      }
                                    >
                                      {emp.overtime_hours}h
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-2 font-mono">
                                    <span
                                      className={
                                        emp.attendance_rate < 85
                                          ? 'text-amber-500 font-semibold'
                                          : 'text-slate-700 dark:text-slate-300'
                                      }
                                    >
                                      {emp.attendance_rate}%
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <div className="flex items-center gap-1.5">
                                      <div className="w-16 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                        <div
                                          className={`h-full rounded-full ${
                                            isHigh ? 'bg-red-500' : isMed ? 'bg-amber-500' : 'bg-emerald-500'
                                          }`}
                                          style={{ width: `${Math.min(100, emp.resignation_probability_pct)}%` }}
                                        />
                                      </div>
                                      <span
                                        className={`font-mono font-bold text-xs ${
                                          isHigh ? 'text-red-600' : isMed ? 'text-amber-600' : 'text-emerald-600'
                                        }`}
                                      >
                                        {emp.resignation_probability_pct}%
                                      </span>
                                    </div>
                                    <div className="mt-0.5">
                                      <span
                                        className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-semibold ${
                                          isHigh
                                            ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400'
                                            : isMed
                                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                                            : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                                        }`}
                                      >
                                        {emp.risk_level} Risk
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 text-[11px]">
                                    {emp.primary_factor}
                                  </td>
                                  <td className="py-2.5 px-3 text-right">
                                    <button
                                      onClick={() => setSelectedEmployeeModal(emp)}
                                      className="px-2 py-1 text-[11px] rounded bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold transition"
                                    >
                                      Inspect
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Academic Disclaimer Callout */}
                  <div className="p-3.5 sm:p-4 rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400">
                    <Info size={15} className="text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        Methodology Standards:{' '}
                      </span>
                      {attrition.academic_disclaimer}
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 2: LEAVE DEMAND FORECASTING */}
              {/* ======================================================== */}
              {activeTab === 'leave' && leaveDemand && (
                <div className="space-y-4 sm:space-y-6 animate-fadeIn">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-5 shadow-xs space-y-1">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Horizon
                        </span>
                        <Calendar size={15} className="text-indigo-500 shrink-0" />
                      </div>
                      <div className="text-xl sm:text-2xl font-bold font-mono text-slate-800 dark:text-white">
                        {leaveDemand.days_ahead || leaveDemand.horizon_days || horizonDays} Days
                      </div>
                      <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                        Forecast window
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-5 shadow-xs space-y-1">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] sm:text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                          Forecasted Leaves
                        </span>
                        <TrendingUp size={15} className="text-blue-500 shrink-0" />
                      </div>
                      <div className="text-xl sm:text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
                        {leaveDemand.predicted_leave_requests ?? leaveDemand.total_predicted_leaves ?? 0}
                      </div>
                      <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                        Expected across all hubs
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-5 shadow-xs space-y-1">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] sm:text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                          Peak Date
                        </span>
                        <Clock size={15} className="text-amber-500 shrink-0" />
                      </div>
                      <div className="text-sm sm:text-lg font-bold text-slate-800 dark:text-white truncate">
                        {peakDay ? `${peakDay.date}` : 'N/A'}
                      </div>
                      <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                        Highest volume ({peakDay?.predicted_leave_count ?? 0} req)
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-5 shadow-xs space-y-1">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] sm:text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                          Algorithm
                        </span>
                        <Sparkles size={15} className="text-purple-500 shrink-0" />
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white truncate">
                        Poisson Regression
                      </div>
                      <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                        Multi-factor calibrated
                      </div>
                    </div>
                  </div>

                  {/* Daily Forecast Timeline with 95% Confidence Interval */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 space-y-3 sm:space-y-4 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <h2 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                          <TrendingUp size={15} className="text-blue-500" />
                          Daily Leave Forecast (with 95% Confidence Interval)
                        </h2>
                        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                          Expected daily leave requests considering weekend proximity and historical demand
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1.5 text-blue-600 font-medium">
                          <span className="w-2.5 h-0.5 bg-blue-600 rounded" /> Expected
                        </span>
                        <span className="flex items-center gap-1.5 text-slate-400">
                          <span className="w-2.5 h-2 bg-blue-100 dark:bg-blue-900/40 rounded" /> 95% Range
                        </span>
                      </div>
                    </div>

                    <div className="h-60 sm:h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={leaveDemand.daily_forecasts || []}
                          margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="colorExpected" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                            </linearGradient>
                            <linearGradient id="colorCi" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#93C5FD" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#93C5FD" stopOpacity={0.05} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                          <XAxis
                            dataKey="date"
                            tick={{ fontSize: 10 }}
                            tickFormatter={(val) => {
                              const d = new Date(val);
                              return `${d.getMonth() + 1}/${d.getDate()}`;
                            }}
                          />
                          <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-lg shadow-lg text-xs space-y-1">
                                    <div className="font-bold text-slate-800 dark:text-slate-100">
                                      {data.date} ({data.day_of_week})
                                    </div>
                                    <div className="text-blue-600 font-semibold">
                                      Expected: {data.predicted_leave_count} leaves
                                    </div>
                                    <div className="text-slate-400">
                                      95% Range: [{data.lower_ci} – {data.upper_ci}]
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="upper_ci"
                            stroke="transparent"
                            fill="url(#colorCi)"
                          />
                          <Area
                            type="monotone"
                            dataKey="predicted_leave_count"
                            stroke="#2563EB"
                            strokeWidth={2}
                            fill="url(#colorExpected)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Hub Breakdown & Role Breakdown */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* By Hub */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 space-y-3 sm:space-y-4 shadow-xs">
                      <h2 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <Users size={15} className="text-indigo-500" />
                        Predicted Leave Volume by Hub
                      </h2>
                      <div className="h-52 sm:h-56">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={leaveDemand.hub_leave_demand || []}
                            margin={{ top: 10, right: 10, left: -25, bottom: 20 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                            <XAxis
                              dataKey="hub"
                              tick={{ fontSize: 9 }}
                              angle={-20}
                              textAnchor="end"
                            />
                            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                            <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} />
                            <Bar dataKey="expected_leaves" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Expected Leaves" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* By Role */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 space-y-3 sm:space-y-4 shadow-xs">
                      <h2 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <Layers size={15} className="text-purple-500" />
                        Predicted Leave Volume by Role
                      </h2>
                      <div className="h-52 sm:h-56">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={leaveDemand.role_leave_demand || []}
                            margin={{ top: 10, right: 10, left: -25, bottom: 20 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                            <XAxis
                              dataKey="role"
                              tick={{ fontSize: 9 }}
                              angle={-20}
                              textAnchor="end"
                            />
                            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                            <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} />
                            <Bar dataKey="expected_leaves" fill="#8B5CF6" radius={[4, 4, 0, 0]} name="Expected Leaves" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Operational Drivers */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {leaveDemand.key_drivers?.map((driver: any, i: number) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5 shadow-xs"
                      >
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                          <Zap size={14} className="text-amber-500 shrink-0" />
                          {driver.factor}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{driver.impact}</p>
                      </div>
                    ))}
                  </div>

                  {/* Disclaimer */}
                  <div className="p-3.5 sm:p-4 rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400">
                    <Info size={15} className="text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        Operational Guidance:{' '}
                      </span>
                      {leaveDemand.academic_disclaimer}
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 3: WORKFORCE STAFFING RISK & RESOURCE GAP */}
              {/* ======================================================== */}
              {activeTab === 'workforce' && staffingRisk && (
                <div className="space-y-4 sm:space-y-6 animate-fadeIn">
                  {/* Synthesis Equation Card */}
                  <div className="bg-gradient-to-r from-blue-900/95 to-indigo-900/95 text-white rounded-2xl p-4 sm:p-6 shadow-md">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
                      <div>
                        <div className="text-[10px] sm:text-xs uppercase tracking-wider text-blue-200 font-semibold mb-1">
                          Quantitative Synthesis Equation
                        </div>
                        <div className="text-xs sm:text-base font-mono font-bold tracking-tight break-words">
                          Active ({staffingRisk.total_active_workers}) − [Attrition Loss ({staffingRisk.total_predicted_attrition}) + Leave Absenteeism ({staffingRisk.total_predicted_leave})] = Available ({staffingRisk.total_estimated_available})
                        </div>
                        <div className="text-[11px] sm:text-xs text-blue-200/80 mt-1">
                          Required Demand: {staffingRisk.total_required_workers} workers | Net Gap:{' '}
                          <span
                            className={
                              staffingRisk.total_staffing_gap < 0
                                ? 'text-red-300 font-bold'
                                : 'text-emerald-300 font-bold'
                            }
                          >
                            {staffingRisk.total_staffing_gap > 0 ? `+${staffingRisk.total_staffing_gap}` : staffingRisk.total_staffing_gap}{' '}
                            workers
                          </span>
                        </div>
                      </div>

                      <div className="self-start md:self-auto shrink-0">
                        <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs font-bold uppercase tracking-wider">
                          Overall Risk:{' '}
                          <span
                            className={
                              staffingRisk.overall_risk === 'High' || staffingRisk.overall_risk === 'CRITICAL'
                                ? 'text-red-300'
                                : staffingRisk.overall_risk === 'Medium' || staffingRisk.overall_risk === 'MODERATE'
                                ? 'text-amber-300'
                                : 'text-emerald-300'
                            }
                          >
                            {staffingRisk.overall_risk}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary Stat Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-5 shadow-xs space-y-1">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Active Staff
                        </span>
                        <Users size={15} className="text-blue-500 shrink-0" />
                      </div>
                      <div className="text-xl sm:text-2xl font-bold font-mono text-slate-800 dark:text-white">
                        {staffingRisk.total_active_workers}
                      </div>
                      <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                        Across all active hubs
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-5 shadow-xs space-y-1">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] sm:text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                          Absenteeism
                        </span>
                        <Calendar size={15} className="text-amber-500 shrink-0" />
                      </div>
                      <div className="text-xl sm:text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
                        {staffingRisk.total_predicted_leave}
                      </div>
                      <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                        +{staffingRisk.total_predicted_attrition} attritions
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-5 shadow-xs space-y-1">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] sm:text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                          Available
                        </span>
                        <Target size={15} className="text-indigo-500 shrink-0" />
                      </div>
                      <div className="text-xl sm:text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
                        {staffingRisk.total_estimated_available}
                      </div>
                      <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                        Effective staff count
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-5 shadow-xs space-y-1">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
                          Resource Gap
                        </span>
                        <ShieldAlert
                          size={15}
                          className={staffingRisk.total_staffing_gap < 0 ? 'text-red-500' : 'text-emerald-500'}
                        />
                      </div>
                      <div
                        className={`text-xl sm:text-2xl font-bold font-mono ${
                          staffingRisk.total_staffing_gap < 0 ? 'text-red-600' : 'text-emerald-600'
                        }`}
                      >
                        {staffingRisk.total_staffing_gap > 0
                          ? `+${staffingRisk.total_staffing_gap}`
                          : staffingRisk.total_staffing_gap}
                      </div>
                      <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                        {staffingRisk.total_staffing_gap < 0 ? 'Deficit Shortage' : 'Surplus Buffer'}
                      </div>
                    </div>
                  </div>

                  {/* Hub-by-Hub Staffing Analysis Table */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
                    <div className="p-3.5 sm:p-5 border-b border-slate-200 dark:border-slate-800">
                      <h2 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <Shield size={15} className="text-blue-500" />
                        Hub-by-Hub Staffing Shortage & Resource Gap Breakdown
                      </h2>
                      <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                        Quantitative comparison of Required vs Available headcount across logistic delivery centers
                      </p>
                    </div>

                    <div className="overflow-x-auto -mx-1 sm:mx-0">
                      <table className="w-full text-xs text-left min-w-[620px]">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                            <th className="py-2.5 px-3">Hub Name</th>
                            <th className="py-2.5 px-2 text-right">Active</th>
                            <th className="py-2.5 px-2 text-right">Leaves</th>
                            <th className="py-2.5 px-2 text-right">Attrition</th>
                            <th className="py-2.5 px-2 text-right">Available</th>
                            <th className="py-2.5 px-2 text-right">Required</th>
                            <th className="py-2.5 px-3 text-center">Net Gap</th>
                            <th className="py-2.5 px-3">Status & Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {staffingRisk.hub_records?.map((record: any, idx: number) => {
                            const isShortage = record.staffing_gap < 0;
                            const isCritical = record.status === 'Critical Shortage';
                            return (
                              <tr
                                key={idx}
                                className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                                  isCritical ? 'bg-red-50/30 dark:bg-red-950/20' : ''
                                }`}
                              >
                                <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-100">
                                  {record.hub}
                                </td>
                                <td className="py-2.5 px-2 text-right font-mono">{record.active_workers}</td>
                                <td className="py-2.5 px-2 text-right font-mono text-amber-600">
                                  -{record.predicted_leave}
                                </td>
                                <td className="py-2.5 px-2 text-right font-mono text-red-500">
                                  -{record.predicted_attrition}
                                </td>
                                <td className="py-2.5 px-2 text-right font-mono font-semibold text-slate-800 dark:text-slate-200">
                                  {record.estimated_available}
                                </td>
                                <td className="py-2.5 px-2 text-right font-mono text-slate-500">
                                  {record.required_workers}
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <span
                                    className={`inline-block px-2 py-0.5 rounded font-mono font-bold text-xs ${
                                      isShortage
                                        ? 'bg-red-100 dark:bg-red-950/70 text-red-600 dark:text-red-400'
                                        : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400'
                                    }`}
                                  >
                                    {record.staffing_gap > 0 ? `+${record.staffing_gap}` : record.staffing_gap}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3">
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                        isCritical
                                          ? 'bg-red-600 text-white'
                                          : record.status === 'Tight Capacity'
                                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                                          : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                                      }`}
                                    >
                                      {record.status}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                                    {record.recommended_action}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Staffing Risk Matrix (Leave Demand vs Workload) */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 space-y-3 sm:space-y-4 shadow-xs">
                    <div>
                      <h2 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <Layers size={15} className="text-indigo-500" />
                        Staffing Risk Interaction Matrix (Leave Demand vs Workload)
                      </h2>
                      <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                        Operational synthesis modeling risk across fluctuating delivery demand and worker absenteeism
                      </p>
                    </div>

                    <div className="overflow-x-auto -mx-1 sm:mx-0">
                      <table className="w-full text-xs border border-slate-200 dark:border-slate-800 text-center min-w-[420px]">
                        <thead>
                          <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                            <th className="p-2.5 border border-slate-200 dark:border-slate-800 text-left">
                              Leave Demand \ Workload
                            </th>
                            <th className="p-2.5 border border-slate-200 dark:border-slate-800">Low Workload</th>
                            <th className="p-2.5 border border-slate-200 dark:border-slate-800">Medium Workload</th>
                            <th className="p-2.5 border border-slate-200 dark:border-slate-800">High Workload</th>
                          </tr>
                        </thead>
                        <tbody>
                          {['Low', 'Medium', 'High'].map((leaveLevel) => (
                            <tr key={leaveLevel}>
                              <td className="p-2.5 font-bold text-left bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                                {leaveLevel} Leave
                              </td>
                              {['Low', 'Medium', 'High'].map((workloadLevel) => {
                                const cell = staffingRisk.matrix_cells?.find(
                                  (c: any) => c.leave_demand === leaveLevel && c.workload === workloadLevel
                                );
                                const isActive = cell?.active_case;
                                const isCrit = cell?.risk?.includes('Critical');
                                const isHigh = cell?.risk?.includes('High');
                                const isMed = cell?.risk?.includes('Medium');
                                return (
                                  <td
                                    key={workloadLevel}
                                    className={`p-2.5 sm:p-3 border border-slate-200 dark:border-slate-800 font-semibold transition-all ${
                                      isActive ? 'ring-2 ring-blue-500 scale-[1.01] shadow-sm font-bold' : ''
                                    } ${
                                      isCrit
                                        ? 'bg-red-100/90 dark:bg-red-950/40 text-red-700 dark:text-red-400'
                                        : isHigh
                                        ? 'bg-amber-100/80 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                                        : isMed
                                        ? 'bg-yellow-100/60 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400'
                                        : 'bg-emerald-100/60 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                                    }`}
                                  >
                                    <div className="flex flex-col items-center gap-0.5">
                                      <span>{cell?.risk || 'Balanced'}</span>
                                      {isActive && (
                                        <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.2 rounded-full font-bold">
                                          Current Status
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Disclaimer */}
                  <div className="p-3.5 sm:p-4 rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400">
                    <Info size={15} className="text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        Workforce Allocation Disclaimer:{' '}
                      </span>
                      {staffingRisk.academic_disclaimer}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Employee Prediction Detail Modal */}
      {selectedEmployeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  {selectedEmployeeModal.name}
                </h3>
                <p className="text-[11px] text-slate-500 font-mono">
                  {selectedEmployeeModal.code} • {selectedEmployeeModal.role} ({selectedEmployeeModal.hub})
                </p>
              </div>
              <button
                onClick={() => setSelectedEmployeeModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <XCircle size={18} />
              </button>
            </div>

            {/* Probability Badge */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-500">Resignation Probability</div>
                <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white">
                  {selectedEmployeeModal.resignation_probability_pct}%
                </div>
              </div>
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                  selectedEmployeeModal.risk_level === 'High'
                    ? 'bg-red-500 text-white'
                    : selectedEmployeeModal.risk_level === 'Medium'
                    ? 'bg-amber-500 text-white'
                    : 'bg-emerald-500 text-white'
                }`}
              >
                {selectedEmployeeModal.risk_level} Risk
              </span>
            </div>

            {/* Contributing Factors Breakdown */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Contributing Factor Decomposition
              </h4>
              <div className="space-y-2">
                {selectedEmployeeModal.top_contributing_factors?.map((factor: any, i: number) => {
                  const isInc = factor.direction === 'Increases Risk';
                  return (
                    <div
                      key={i}
                      className="p-2.5 sm:p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center text-xs"
                    >
                      <div className="flex items-center gap-2">
                        {isInc ? (
                          <AlertTriangle size={13} className="text-red-500 shrink-0" />
                        ) : (
                          <CheckCircle size={13} className="text-emerald-500 shrink-0" />
                        )}
                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] sm:text-xs">
                          {factor.factor}
                        </span>
                      </div>
                      <span
                        className={`font-mono font-bold text-[11px] sm:text-xs shrink-0 ${
                          isInc ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {factor.contribution > 0 ? `+${factor.contribution}%` : `${factor.contribution}%`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedEmployeeModal(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictionsPage;
