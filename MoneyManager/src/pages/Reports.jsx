import React from 'react'

const Reports = () => {
  return (
  <>
  <section id="reports" className="mb-12">
  <div
    className="flex flex-col md:flex-row md:items-center md:justify-between mb-6"
  >
    <h2 className="text-2xl font-bold navy-text mb-2 md:mb-0">Financial Reports</h2>
    <div className="flex space-x-2">
      <select
        className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        <option value="this-month">This Month</option>
        <option value="last-month">Last Month</option>
        <option value="last-3-months">Last 3 Months</option>
        <option value="last-6-months">Last 6 Months</option>
        <option value="this-year">This Year</option>
        <option value="custom">Custom Range</option>
      </select>
      <button
        className="orange-bg text-white rounded-md px-3 py-1 text-sm hover:bg-opacity-90"
      >
        <i className="fas fa-download mr-2"></i> Export Report
      </button>
    </div>
  </div>

  {/* Report Cards */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center mb-4">
        <div className="rounded-full p-2 light-blue-bg navy-text mr-3">
          <i className="fas fa-chart-pie"></i>
        </div>
        <h3 className="text-lg font-semibold navy-text">Expense Analysis</h3>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Breakdown of your expenses by category.
      </p>
      <button
        className="w-full navy-bg text-white rounded-md py-2 text-sm hover:bg-opacity-90"
      >
        View Report
      </button>
    </div>

    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center mb-4">
        
        <div className="rounded-full p-2 light-blue-bg bg-opacity-20 orange-text mr-3">
          <i className="fas fa-chart-line"></i>
        </div>

        <h3 className="text-lg font-semibold navy-text">Income vs Expenses</h3>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Compare your income and expenses over time.
      </p>
      <button
        className="w-full navy-bg text-white rounded-md py-2 text-sm hover:bg-opacity-90"
      >
        View Report
      </button>
    </div>

    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center mb-4">
        <div className="rounded-full p-2 bg-green-100 text-green-500 mr-3">
          <i className="fas fa-piggy-bank"></i>
        </div>
        <h3 className="text-lg font-semibold navy-text">Savings Report</h3>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Track your saving habits and progress over time.
      </p>
      <button
        className="w-full navy-bg text-white rounded-md py-2 text-sm hover:bg-opacity-90"
      >
        View Report
      </button>
    </div>
  </div>

 
  <div className="bg-white rounded-lg shadow overflow-hidden">
    <div className="p-4 navy-bg text-white">
      <h3 className="font-semibold">Available Reports</h3>
    </div>
    <div className="p-0">
      <div className="table-responsive">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
                Report Name
              </th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
                Date Range
              </th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
                Generated On
              </th>
              <th
                className="py-3 px-4 text-center text-sm font-medium text-gray-700"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200 hover:bg-gray-50">
              <td className="py-3 px-4 text-sm">Monthly Expense Summary</td>
              <td className="py-3 px-4 text-sm">Jun 1 - Jun 30, 2023</td>
              <td className="py-3 px-4 text-sm">Jul 3, 2023</td>
              <td className="py-3 px-4 text-sm text-center">
                <button className="text-blue-500 hover:text-blue-700 mx-1">
                  <i className="fas fa-eye"></i>
                </button>
                <button className="text-green-500 hover:text-green-700 mx-1">
                  <i className="fas fa-download"></i>
                </button>
              </td>
            </tr>
            <tr className="border-b border-gray-200 hover:bg-gray-50">
              <td className="py-3 px-4 text-sm">Income vs Expense Report</td>
              <td className="py-3 px-4 text-sm">Apr 1 - Jun 30, 2023</td>
              <td className="py-3 px-4 text-sm">Jul 2, 2023</td>
              <td className="py-3 px-4 text-sm text-center">
                <button className="text-blue-500 hover:text-blue-700 mx-1">
                  <i className="fas fa-eye"></i>
                </button>
                <button className="text-green-500 hover:text-green-700 mx-1">
                  <i className="fas fa-download"></i>
                </button>
              </td>
            </tr>
            <tr className="border-b border-gray-200 hover:bg-gray-50">
              <td className="py-3 px-4 text-sm">Yearly Budget Analysis</td>
              <td className="py-3 px-4 text-sm">Jan 1 - Jun 30, 2023</td>
              <td className="py-3 px-4 text-sm">Jul 1, 2023</td>
              <td className="py-3 px-4 text-sm text-center">
                <button className="text-blue-500 hover:text-blue-700 mx-1">
                  <i className="fas fa-eye"></i>
                </button>
                <button className="text-green-500 hover:text-green-700 mx-1">
                  <i className="fas fa-download"></i>
                </button>
              </td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="py-3 px-4 text-sm">Category Spending Report</td>
              <td className="py-3 px-4 text-sm">May 1 - May 31, 2023</td>
              <td className="py-3 px-4 text-sm">Jun 3, 2023</td>
              <td className="py-3 px-4 text-sm text-center">
                <button className="text-blue-500 hover:text-blue-700 mx-1">
                  <i className="fas fa-eye"></i>
                </button>
                <button className="text-green-500 hover:text-green-700 mx-1">
                  <i className="fas fa-download"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</section>
  </>
  )
}

export default Reports
