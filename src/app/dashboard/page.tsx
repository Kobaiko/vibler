'use client'

import React from 'react'
import { Breadcrumb, useBreadcrumbs } from '@/components/navigation'
import { Card, CardHeader, CardContent } from '@/components/ui'
import { 
  StatCard, 
  ProgressBar, 
  CircularProgress,
  CustomLineChart,
  CustomPieChart,
  DataTable,
  StatusBadge,
  ActivityTimeline,
  QuickActions
} from '@/components/dashboard'
import { usePathname } from 'next/navigation'
import { 
  Users, 
  Target, 
  DollarSign,
  Zap,
  Plus,
  Settings,
  BarChart3
} from 'lucide-react'

// Sample data for demonstrations
const chartData = [
  { name: 'Jan', conversions: 65, leads: 80, revenue: 4000 },
  { name: 'Feb', conversions: 78, leads: 95, revenue: 5200 },
  { name: 'Mar', conversions: 89, leads: 110, revenue: 6100 },
  { name: 'Apr', conversions: 95, leads: 125, revenue: 7300 },
  { name: 'May', conversions: 112, leads: 140, revenue: 8500 },
  { name: 'Jun', conversions: 128, leads: 155, revenue: 9800 },
]

const pieData = [
  { name: 'Email Campaigns', value: 35 },
  { name: 'Social Media', value: 25 },
  { name: 'Direct Traffic', value: 20 },
  { name: 'Paid Ads', value: 15 },
  { name: 'Referrals', value: 5 },
]

const tableData = [
  { 
    id: 1, 
    name: 'E-commerce Funnel', 
    status: 'Active', 
    conversions: 124, 
    created: '2024-06-01',
    performance: 85
  },
  { 
    id: 2, 
    name: 'Lead Magnet Campaign', 
    status: 'Paused', 
    conversions: 89, 
    created: '2024-06-05',
    performance: 72
  },
  { 
    id: 3, 
    name: 'Product Launch Sequence', 
    status: 'Active', 
    conversions: 156, 
    created: '2024-06-10',
    performance: 91
  },
  { 
    id: 4, 
    name: 'Newsletter Signup Flow', 
    status: 'Draft', 
    conversions: 0, 
    created: '2024-06-12',
    performance: 0
  },
]

const activities = [
  {
    id: '1',
    type: 'created' as const,
    title: 'New funnel created',
    description: 'E-commerce checkout optimization funnel',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    user: { name: 'John Doe' }
  },
  {
    id: '2',
    type: 'completed' as const,
    title: 'Campaign analysis finished',
    description: 'Lead magnet performance report generated',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    user: { name: 'Sarah Smith' }
  },
  {
    id: '3',
    type: 'updated' as const,
    title: 'Funnel updated',
    description: 'Product launch sequence conversion rate improved',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    user: { name: 'Mike Johnson' }
  },
  {
    id: '4',
    type: 'shared' as const,
    title: 'Report shared',
    description: 'Monthly performance dashboard shared with team',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    user: { name: 'Emily Davis' }
  },
]

const quickActions = [
  {
    id: '1',
    title: 'Create New Funnel',
    description: 'Build a new marketing funnel from scratch',
    icon: <Plus className="w-5 h-5" />,
    onClick: () => console.log('Create funnel'),
    variant: 'primary' as const
  },
  {
    id: '2',
    title: 'Generate ICP',
    description: 'Create ideal customer persona',
    icon: <Users className="w-5 h-5" />,
    onClick: () => console.log('Generate ICP'),
    variant: 'success' as const
  },
  {
    id: '3',
    title: 'View Analytics',
    description: 'Detailed performance metrics',
    icon: <BarChart3 className="w-5 h-5" />,
    onClick: () => console.log('View analytics'),
    variant: 'default' as const
  },
  {
    id: '4',
    title: 'Campaign Settings',
    description: 'Configure automation rules',
    icon: <Settings className="w-5 h-5" />,
    onClick: () => console.log('Campaign settings'),
    variant: 'default' as const
  },
]

type TableRowType = {
  id: number
  name: string
  status: string
  conversions: number
  created: string
  performance: number
}

const tableColumns: Array<{
  key: keyof TableRowType
  title: string
  sortable?: boolean
  render?: (value: TableRowType[keyof TableRowType], row: TableRowType) => React.ReactNode
}> = [
  {
    key: 'name',
    title: 'Funnel Name',
    sortable: true,
  },
  {
    key: 'status',
    title: 'Status',
    render: (value) => (
      <StatusBadge 
        status={String(value)} 
        variant={
          value === 'Active' ? 'success' : 
          value === 'Paused' ? 'warning' : 
          'default'
        } 
      />
    ),
  },
  {
    key: 'conversions',
    title: 'Conversions',
    sortable: true,
  },
  {
    key: 'performance',
    title: 'Performance',
    render: (value) => (
      <div className="w-20">
        <ProgressBar 
          value={Number(value)} 
          variant={Number(value) > 80 ? 'success' : Number(value) > 60 ? 'warning' : 'error'}
          size="sm" 
          showValue 
        />
      </div>
    ),
  },
  {
    key: 'created',
    title: 'Created',
    sortable: true,
  },
]

export default function DashboardPage() {
  const pathname = usePathname()
  const breadcrumbItems = useBreadcrumbs(pathname)

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} className="mb-6" />

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-secondary-900 mb-2">
          Dashboard
        </h1>
        <p className="text-secondary-600">
          Welcome back! Here&apos;s an overview of your marketing automation.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Leads"
          value="2,847"
          icon={<Users className="w-6 h-6" />}
          trend={{ value: 12.3, label: 'vs last month' }}
          variant="primary"
        />
        <StatCard
          title="Conversion Rate"
          value="8.2%"
          icon={<Target className="w-6 h-6" />}
          trend={{ value: 5.1, label: 'vs last month' }}
          variant="success"
        />
        <StatCard
          title="Revenue"
          value="$48,950"
          icon={<DollarSign className="w-6 h-6" />}
          trend={{ value: -2.4, label: 'vs last month' }}
          variant="warning"
        />
        <StatCard
          title="Active Funnels"
          value="14"
          icon={<Zap className="w-6 h-6" />}
          trend={{ value: 18.7, label: 'vs last month' }}
          variant="default"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <CustomLineChart
          title="Performance Overview"
          subtitle="Monthly trends for key metrics"
          data={chartData}
          lines={[
            { dataKey: 'conversions', name: 'Conversions', color: '#2563eb' },
            { dataKey: 'leads', name: 'Leads', color: '#16a34a' },
          ]}
        />
        
        <CustomPieChart
          title="Traffic Sources"
          subtitle="Lead generation breakdown"
          data={pieData}
        />
      </div>

      {/* Progress and Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader 
            title="Monthly Goals" 
            subtitle="Track your progress this month" 
          />
          <CardContent className="space-y-4">
            <ProgressBar
              label="Lead Generation"
              value={75}
              variant="primary"
              showValue
            />
            <ProgressBar
              label="Conversion Rate"
              value={88}
              variant="success"
              showValue
            />
            <ProgressBar
              label="Revenue Target"
              value={62}
              variant="warning"
              showValue
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader 
            title="Overall Performance" 
            subtitle="This month&apos;s summary" 
          />
          <CardContent className="flex justify-center">
            <CircularProgress
              value={78}
              variant="primary"
              size={120}
            />
          </CardContent>
        </Card>

        <QuickActions
          actions={quickActions}
          title="Quick Actions"
          subtitle="Common tasks"
          columns={1}
        />
      </div>

      {/* Table and Activity Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <DataTable
            title="Active Funnels"
            subtitle="Manage your marketing funnels"
            data={tableData}
            columns={tableColumns}
            onRowClick={(row) => console.log('Row clicked:', row)}
          />
        </div>
        
        <ActivityTimeline
          activities={activities}
          maxItems={8}
        />
      </div>
    </div>
  )
} 