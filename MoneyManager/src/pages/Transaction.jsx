import React from 'react'

const Transaction = () => {
  return (
    <>
    <section id="transactions" className="mb-12">
  <div
    className="flex flex-col md:flex-row md:items-center md:justify-between mb-6"
  >
    <h2 className="text-2xl font-bold navy-text mb-2 md:mb-0">Transactions</h2>
    <div className="flex space-x-2">
      <button
        className="orange-bg text-white rounded-md px-3 py-1 text-sm hover:bg-opacity-90"
      >
        <i className="fas fa-plus mr-2"></i> Add Transaction
      </button>
    </div>
  </div>

  {/* Filters and Search */}
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
    <div className="col-span-1">
      <label className="block text-sm text-gray-600 mb-1">Transaction Type</label>
      <select
        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        <option value="all">All Transactions</option>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>
    </div>
    <div className="col-span-1">
      <label className="block text-sm text-gray-600 mb-1">Category</label>
      <select
        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        <option value="all">All Categories</option>
        <option value="housing">Housing</option>
        <option value="food">Food & Dining</option>
        <option value="transportation">Transportation</option>
        <option value="entertainment">Entertainment</option>
        <option value="shopping">Shopping</option>
        <option value="income">Income</option>
      </select>
    </div>
    <div className="col-span-1">
      <label className="block text-sm text-gray-600 mb-1">Date Range</label>
      <select
        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        <option value="this-month">This Month</option>
        <option value="last-month">Last Month</option>
        <option value="last-3-months">Last 3 Months</option>
        <option value="custom">Custom Range</option>
      </select>
    </div>
    <div className="col-span-1">
      <label className="block text-sm text-gray-600 mb-1">Search</label>
      <div className="relative">
        <input
          type="text"
          placeholder="Search transactions..."
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pl-8"
        />
        <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
      </div>
    </div>
  </div>

  {/* Transactions Table */}
  <div className="bg-white rounded-lg shadow overflow-hidden">
    <div className="table-responsive">
      <table className="w-full">
        <thead className="navy-bg text-white">
          <tr>
            <th className="py-3 px-4 text-left">Date</th>
            <th className="py-3 px-4 text-left">Description</th>
            <th className="py-3 px-4 text-left">Category</th>
            <th className="py-3 px-4 text-right">Amount</th>
            <th className="py-3 px-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-200 hover:bg-gray-50">
            <td className="py-3 px-4 text-sm">Jul 18, 2023</td>
            <td className="py-3 px-4">
              <div className="flex items-center">
                <div
                  className="rounded-full p-1.5 bg-red-100 text-red-500 mr-2 text-xs"
                >
                  <i className="fas fa-shopping-cart"></i>
                </div>
                <span className="text-sm">Grocery Shopping</span>
              </div>
            </td>
            <td className="py-3 px-4 text-sm">Food & Dining</td>
            <td className="py-3 px-4 text-sm text-red-500 text-right">-$84.32</td>
            <td className="py-3 px-4 text-center">
              <button className="text-blue-500 hover:text-blue-700 mx-1">
                <i className="fas fa-edit"></i>
              </button>
              <button className="text-red-500 hover:text-red-700 mx-1">
                <i className="fas fa-trash"></i>
              </button>
            </td>
          </tr>
          <tr className="border-b border-gray-200 hover:bg-gray-50">
            <td className="py-3 px-4 text-sm">Jul 15, 2023</td>
            <td className="py-3 px-4">
              <div className="flex items-center">
                <div
                  className="rounded-full p-1.5 bg-green-100 text-green-500 mr-2 text-xs"
                >
                  <i className="fas fa-building"></i>
                </div>
                <span className="text-sm">Salary Deposit</span>
              </div>
            </td>
            <td className="py-3 px-4 text-sm">Income</td>
            <td className="py-3 px-4 text-sm text-green-500 text-right">
              +$2,850.00
            </td>
            <td className="py-3 px-4 text-center">
              <button className="text-blue-500 hover:text-blue-700 mx-1">
                <i className="fas fa-edit"></i>
              </button>
              <button className="text-red-500 hover:text-red-700 mx-1">
                <i className="fas fa-trash"></i>
              </button>
            </td>
          </tr>
          <tr className="border-b border-gray-200 hover:bg-gray-50">
            <td className="py-3 px-4 text-sm">Jul 14, 2023</td>
            <td className="py-3 px-4">
              <div className="flex items-center">
                <div
                  className="rounded-full p-1.5 orange-bg bg-opacity-20 orange-text mr-2 text-xs"
                >
                  <i className="fas fa-utensils"></i>
                </div>
                <span className="text-sm">Restaurant</span>
              </div>
            </td>
            <td className="py-3 px-4 text-sm">Food & Dining</td>
            <td className="py-3 px-4 text-sm text-red-500 text-right">-$52.75</td>
            <td className="py-3 px-4 text-center">
              <button className="text-blue-500 hover:text-blue-700 mx-1">
                <i className="fas fa-edit"></i>
              </button>
              <button className="text-red-500 hover:text-red-700 mx-1">
                <i className="fas fa-trash"></i>
              </button>
            </td>
          </tr>
          <tr className="border-b border-gray-200 hover:bg-gray-50">
            <td className="py-3 px-4 text-sm">Jul 13, 2023</td>
            <td className="py-3 px-4">
              <div className="flex items-center">
                <div
                  className="rounded-full p-1.5 light-blue-bg navy-text mr-2 text-xs"
                >
                  <i className="fas fa-tshirt"></i>
                </div>
                <span className="text-sm">Clothing Store</span>
              </div>
            </td>
            <td className="py-3 px-4 text-sm">Shopping</td>
            <td className="py-3 px-4 text-sm text-red-500 text-right">-$128.50</td>
            <td className="py-3 px-4 text-center">
              <button className="text-blue-500 hover:text-blue-700 mx-1">
                <i className="fas fa-edit"></i>
              </button>
              <button className="text-red-500 hover:text-red-700 mx-1">
                <i className="fas fa-trash"></i>
              </button>
            </td>
          </tr>
          <tr className="border-b border-gray-200 hover:bg-gray-50">
            <td className="py-3 px-4 text-sm">Jul 10, 2023</td>
            <td className="py-3 px-4">
              <div className="flex items-center">
                <div
                  className="rounded-full p-1.5 bg-yellow-100 text-yellow-600 mr-2 text-xs"
                >
                  <i className="fas fa-car"></i>
                </div>
                <span className="text-sm">Fuel</span>
              </div>
            </td>
            <td className="py-3 px-4 text-sm">Transportation</td>
            <td className="py-3 px-4 text-sm text-red-500 text-right">-$45.20</td>
            <td className="py-3 px-4 text-center">
              <button className="text-blue-500 hover:text-blue-700 mx-1">
                <i className="fas fa-edit"></i>
              </button>
              <button className="text-red-500 hover:text-red-700 mx-1">
                <i className="fas fa-trash"></i>
              </button>
            </td>
          </tr>
          <tr className="border-b border-gray-200 hover:bg-gray-50">
            <td className="py-3 px-4 text-sm">Jul 5, 2023</td>
            <td className="py-3 px-4">
              <div className="flex items-center">
                <div
                  className="rounded-full p-1.5 bg-blue-100 text-blue-500 mr-2 text-xs"
                >
                  <i className="fas fa-film"></i>
                </div>
                <span className="text-sm">Cinema</span>
              </div>
            </td>
            <td className="py-3 px-4 text-sm">Entertainment</td>
            <td className="py-3 px-4 text-sm text-red-500 text-right">-$24.99</td>
            <td className="py-3 px-4 text-center">
              <button className="text-blue-500 hover:text-blue-700 mx-1">
                <i className="fas fa-edit"></i>
              </button>
              <button className="text-red-500 hover:text-red-700 mx-1">
                <i className="fas fa-trash"></i>
              </button>
            </td>
          </tr>
          <tr className="border-b border-gray-200 hover:bg-gray-50">
            <td className="py-3 px-4 text-sm">Jul 1, 2023</td>
            <td className="py-3 px-4">
              <div className="flex items-center">
                <div
                  className="rounded-full p-1.5 bg-purple-100 text-purple-500 mr-2 text-xs"
                >
                  <i className="fas fa-home"></i>
                </div>
                <span className="text-sm">Rent Payment</span>
              </div>
            </td>
            <td className="py-3 px-4 text-sm">Housing</td>
            <td className="py-3 px-4 text-sm text-red-500 text-right">-$850.00</td>
            <td className="py-3 px-4 text-center">
              <button className="text-blue-500 hover:text-blue-700 mx-1">
                <i className="fas fa-edit"></i>
              </button>
              <button className="text-red-500 hover:text-red-700 mx-1">
                <i className="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>


    <div
      className="py-3 px-4 border-t border-gray-200 flex items-center justify-between"
    >
      <div className="text-sm text-gray-500">Showing 1-7 of 42 transactions</div>
      <div className="flex space-x-1">
        <button
          className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
        >
          Previous
        </button>
        <button className="px-3 py-1 navy-bg text-white rounded-md text-sm">
          1
        </button>
        <button className="px-3 py-1 border border-gray-300 rounded-md text-sm">
          2
        </button>
        <button className="px-3 py-1 border border-gray-300 rounded-md text-sm">
          3
        </button>
        <button className="px-3 py-1 border border-gray-300 rounded-md text-sm">
          Next
        </button>
      </div>
    </div>
  </div>
</section>
    </>
  )
}

export default Transaction
