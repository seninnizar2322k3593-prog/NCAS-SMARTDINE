'use client'

/**
 * Admin Reports Page
 * Generate sales reports and analytics
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminNav from '@/components/AdminNav'
import { supabase } from '@/services/supabase'

export default function ReportsPage() {
  const router = useRouter()
  const [admin, setAdmin] = useState(null)
  const [reportType, setReportType] = useState('daily')
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    // Check authentication
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      router.push('/auth/login')
      return
    }

    const user = JSON.parse(userStr)
    if (user.type !== 'admin') {
      router.push('/auth/login')
      return
    }

    setAdmin(user)
  }, [router])

  // Generate report
  const generateReport = async () => {
    setLoading(true)
    try {
      if (reportType === 'daily') {
        await generateDailyReport()
      } else if (reportType === 'weekly') {
        await generateWeeklyReport()
      } else if (reportType === 'top-items') {
        await generateTopItemsReport()
      }
    } catch (err) {
      console.error('Error generating report:', err)
      alert('Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  // Generate daily sales report
  const generateDailyReport = async () => {
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .gte('created_at', dateRange.startDate)
      .lte('created_at', dateRange.endDate + 'T23:59:59')

    const totalOrders = orders?.length || 0
    const totalRevenue = orders?.reduce((sum, o) => sum + parseFloat(o.total_amount), 0) || 0
    const completedOrders = orders?.filter(o => o.ticket_printed).length || 0

    setReportData({
      type: 'Daily Sales Report',
      period: `${dateRange.startDate} to ${dateRange.endDate}`,
      totalOrders,
      totalRevenue,
      completedOrders,
      pendingOrders: totalOrders - completedOrders,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
    })
  }

  // Generate weekly report
  const generateWeeklyReport = async () => {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 7)

    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    const totalOrders = orders?.length || 0
    const totalRevenue = orders?.reduce((sum, o) => sum + parseFloat(o.total_amount), 0) || 0

    // Group by day
    const dayWiseData = {}
    orders?.forEach(order => {
      const day = order.created_at.split('T')[0]
      if (!dayWiseData[day]) {
        dayWiseData[day] = { orders: 0, revenue: 0 }
      }
      dayWiseData[day].orders++
      dayWiseData[day].revenue += parseFloat(order.total_amount)
    })

    setReportData({
      type: 'Weekly Sales Report',
      period: `${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
      totalOrders,
      totalRevenue,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      dayWiseData
    })
  }

  // Generate top/least sold items report
  const generateTopItemsReport = async () => {
    const { data: orders } = await supabase
      .from('orders')
      .select('items')
      .eq('payment_status', 'paid')

    // Count item sales
    const itemCounts = {}
    orders?.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          if (!itemCounts[item.name]) {
            itemCounts[item.name] = { count: 0, revenue: 0 }
          }
          itemCounts[item.name].count += item.quantity
          itemCounts[item.name].revenue += parseFloat(item.price) * item.quantity
        })
      }
    })

    // Sort by count
    const sortedItems = Object.entries(itemCounts)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)

    const topItems = sortedItems.slice(0, 5)
    const leastItems = sortedItems.slice(-5).reverse()

    setReportData({
      type: 'Most & Least Sold Items',
      topItems,
      leastItems,
      totalItems: sortedItems.length
    })
  }

  if (!admin) {
    return <div className="flex-center" style={{ minHeight: '100vh' }}>
      <div className="spinner"></div>
    </div>
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <AdminNav />
      
      <div className="container" style={{ paddingTop: '2rem' }}>
        <h1 style={{ marginBottom: '2rem' }}>Reports & Analytics</h1>

        {/* Report Configuration */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3>Generate Report</h3>
          
          <div className="grid grid-3" style={{ marginTop: '1rem' }}>
            {/* Report Type */}
            <div className="form-group">
              <label className="form-label">Report Type</label>
              <select
                className="form-input"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="daily">Daily Sales Report</option>
                <option value="weekly">Weekly Sales Report</option>
                <option value="top-items">Top/Least Sold Items</option>
              </select>
            </div>

            {/* Date Range (for daily report) */}
            {reportType === 'daily' && (
              <>
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                  />
                </div>
              </>
            )}
          </div>

          <button
            className="btn btn-primary"
            onClick={generateReport}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>

        {/* Report Results */}
        {reportData && (
          <div className="card">
            <h2>{reportData.type}</h2>
            {reportData.period && (
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Period: {reportData.period}
              </p>
            )}

            {/* Daily/Weekly Report */}
            {(reportType === 'daily' || reportType === 'weekly') && (
              <>
                <div className="grid grid-4" style={{ marginBottom: '2rem' }}>
                  <div className="stats-card">
                    <div className="stats-number">{reportData.totalOrders}</div>
                    <div className="stats-label">Total Orders</div>
                  </div>

                  <div className="stats-card">
                    <div className="stats-number" style={{ color: 'var(--success-color)' }}>
                      ₹{reportData.totalRevenue.toFixed(2)}
                    </div>
                    <div className="stats-label">Total Revenue</div>
                  </div>

                  {reportData.completedOrders !== undefined && (
                    <div className="stats-card">
                      <div className="stats-number" style={{ color: 'var(--primary-color)' }}>
                        {reportData.completedOrders}
                      </div>
                      <div className="stats-label">Completed</div>
                    </div>
                  )}

                  <div className="stats-card">
                    <div className="stats-number" style={{ color: 'var(--warning-color)' }}>
                      ₹{reportData.averageOrderValue.toFixed(2)}
                    </div>
                    <div className="stats-label">Avg Order Value</div>
                  </div>
                </div>

                {/* Day-wise breakdown for weekly report */}
                {reportData.dayWiseData && (
                  <div>
                    <h3>Day-wise Breakdown</h3>
                    <div className="table-container">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Orders</th>
                            <th>Revenue</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(reportData.dayWiseData).map(([date, data]) => (
                            <tr key={date}>
                              <td>{new Date(date).toLocaleDateString('en-IN')}</td>
                              <td>{data.orders}</td>
                              <td>₹{data.revenue.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Top/Least Items Report */}
            {reportType === 'top-items' && (
              <div className="grid grid-2">
                {/* Top 5 Items */}
                <div>
                  <h3 style={{ color: 'var(--success-color)' }}>🏆 Top 5 Most Sold Items</h3>
                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Rank</th>
                          <th>Item</th>
                          <th>Quantity Sold</th>
                          <th>Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.topItems.length === 0 ? (
                          <tr>
                            <td colSpan="4" style={{ textAlign: 'center' }}>No data available</td>
                          </tr>
                        ) : (
                          reportData.topItems.map((item, idx) => (
                            <tr key={idx}>
                              <td>#{idx + 1}</td>
                              <td><strong>{item.name}</strong></td>
                              <td>{item.count}</td>
                              <td>₹{item.revenue.toFixed(2)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Least 5 Items */}
                <div>
                  <h3 style={{ color: 'var(--danger-color)' }}>📉 Least Sold Items</h3>
                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Rank</th>
                          <th>Item</th>
                          <th>Quantity Sold</th>
                          <th>Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.leastItems.length === 0 ? (
                          <tr>
                            <td colSpan="4" style={{ textAlign: 'center' }}>No data available</td>
                          </tr>
                        ) : (
                          reportData.leastItems.map((item, idx) => (
                            <tr key={idx}>
                              <td>#{idx + 1}</td>
                              <td><strong>{item.name}</strong></td>
                              <td>{item.count}</td>
                              <td>₹{item.revenue.toFixed(2)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
