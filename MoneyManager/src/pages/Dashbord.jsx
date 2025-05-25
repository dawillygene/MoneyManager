import React from 'react'

const Dashbord = () => {
  return (
   <>
<section id="dashboard" className="mb-12">
  <div
    className="flex flex-col md:flex-row md:items-center md:justify-between mb-6"
  >
    <h2 className="text-2xl font-bold navy-text mb-2 md:mb-0">Dashboard</h2>
    <div className="flex space-x-2">
      <button
        className="bg-white border border-gray-300 rounded-md px-3 py-1 text-sm flex items-center hover:bg-gray-50"
      >
        <i className="fas fa-calendar-alt mr-2"></i> July 2023
      </button>
      <button
        className="orange-bg text-white rounded-md px-3 py-1 text-sm flex items-center hover:bg-opacity-90"
      >
        <i className="fas fa-download mr-2"></i> Export
      </button>
    </div>
  </div>


  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
 
    <div
      className="bg-white rounded-lg shadow p-5 border-l-4 border-blue-500 transition-all hover:shadow-md"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500">Current Balance</p>
          <h3 className="text-2xl font-bold navy-text mt-1">$12,750.85</h3>
          <p className="text-xs text-green-500 flex items-center mt-2">
            <i className="fas fa-arrow-up mr-1"></i> 8.2% from last month
          </p>
        </div>
        <div className="rounded-full p-2 bg-blue-100 text-blue-500">
          <i className="fas fa-wallet text-lg"></i>
        </div>
      </div>
    </div>


    <div
      className="bg-white rounded-lg shadow p-5 border-l-4 border-green-500 transition-all hover:shadow-md"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500">Monthly Income</p>
          <h3 className="text-2xl font-bold navy-text mt-1">$5,240.00</h3>
          <p className="text-xs text-green-500 flex items-center mt-2">
            <i className="fas fa-arrow-up mr-1"></i> 3.1% from last month
          </p>
        </div>
        <div className="rounded-full p-2 bg-green-100 text-green-500">
          <i className="fas fa-arrow-down text-lg"></i>
        </div>
      </div>
    </div>

   
    <div
      className="bg-white rounded-lg shadow p-5 border-l-4 orange-border transition-all hover:shadow-md"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500">Monthly Expenses</p>
          <h3 className="text-2xl font-bold navy-text mt-1">$2,184.32</h3>
          <p className="text-xs text-red-500 flex items-center mt-2">
            <i className="fas fa-arrow-up mr-1"></i> 12.5% from last month
          </p>
        </div>
        <div className="rounded-full p-2 bg-orange-100 text-orange">
          <i className="fas fa-arrow-up text-lg"></i>
        </div>
      </div>
    </div>

    <div
      className="bg-white rounded-lg shadow p-5 border-l-4 border-purple-500 transition-all hover:shadow-md"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500">Total Savings</p>
          <h3 className="text-2xl font-bold navy-text mt-1">$28,350.00</h3>
          <p className="text-xs text-green-500 flex items-center mt-2">
            <i className="fas fa-arrow-up mr-1"></i> 4.3% from last month
          </p>
        </div>
        <div className="rounded-full p-2 bg-purple-100 text-purple-500">
          <i className="fas fa-piggy-bank text-lg"></i>
        </div>
      </div>
    </div>
  </div>

  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
   
    <div className="bg-white rounded-lg shadow p-4 col-span-1">
      <h3 className="text-lg font-semibold mb-4 navy-text">Expenses by Category</h3>
      <div className="chart-container">
        <div className="chart-placeholder">
          <div className="text-center">
          
            <div
              className="w-40 h-40 mx-auto rounded-full border-8 border-gray-200 relative"
            >
              <div
                className="absolute inset-0 rounded-full border-8 border-t-orange border-r-light-blue border-b-navy border-l-green-400"
                style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 100%, 0 100%, 0 0)' }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-medium">Categories</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full orange-bg mr-2"></div>
          <span className="text-xs">Housing (38%)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full light-blue-bg mr-2"></div>
          <span className="text-xs">Food (24%)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full navy-bg mr-2"></div>
          <span className="text-xs">Transport (18%)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-400 mr-2"></div>
          <span className="text-xs">Others (20%)</span>
        </div>
      </div>
    </div>

  
    <div className="bg-white rounded-lg shadow p-4 col-span-1 lg:col-span-2">
      <h3 className="text-lg font-semibold mb-4 navy-text">Monthly Cash Flow</h3>
      <div className="chart-container">
        <div className="chart-placeholder">
        
          <div className="w-full h-full px-4">
            <div className="h-full flex items-end">
              <div
                className="border-b border-gray-300 w-full absolute bottom-8"
              ></div>
              <div className="h-full w-full flex items-end justify-between">
                <div className="flex flex-col items-center">
                  <div className="flex space-x-1">
                    <div
                      className="w-8 bg-green-400 rounded-t"
                      style={{ height: '80px' }}
                    ></div>
                    <div
                      className="w-8 orange-bg rounded-t"
                      style={{ height: '40px' }}
                    ></div>
                  </div>
                  <span className="text-xs mt-2">Jan</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex space-x-1">
                    <div
                      className="w-8 bg-green-400 rounded-t"
                      style={{ height: '100px' }}
                    ></div>
                    <div
                      className="w-8 orange-bg rounded-t"
                      style={{ height: '60px' }}
                    ></div>
                  </div>
                  <span className="text-xs mt-2">Feb</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex space-x-1">
                    <div
                      className="w-8 bg-green-400 rounded-t"
                      style={{ height: '90px' }}
                    ></div>
                    <div
                      className="w-8 orange-bg rounded-t"
                      style={{ height: '45px' }}
                    ></div>
                  </div>
                  <span className="text-xs mt-2">Mar</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex space-x-1">
                    <div
                      className="w-8 bg-green-400 rounded-t"
                      style={{ height: '110px' }}
                    ></div>
                    <div
                      className="w-8 orange-bg rounded-t"
                      style={{ height: '65px' }}
                    ></div>
                  </div>
                  <span className="text-xs mt-2">Apr</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex space-x-1">
                    <div
                      className="w-8 bg-green-400 rounded-t"
                      style={{ height: '85px' }}
                    ></div>
                    <div
                      className="w-8 orange-bg rounded-t"
                      style={{ height: '55px' }}
                    ></div>
                  </div>
                  <span className="text-xs mt-2">May</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex space-x-1">
                    <div
                      className="w-8 bg-green-400 rounded-t"
                      style={{ height: '105px' }}
                    ></div>
                    <div
                      className="w-8 orange-bg rounded-t"
                      style={{ height: '70px' }}
                    ></div>
                  </div>
                  <span className="text-xs mt-2">Jun</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-center space-x-4">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-400 mr-2"></div>
          <span className="text-xs">Income</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full orange-bg mr-2"></div>
          <span className="text-xs">Expenses</span>
        </div>
      </div>
    </div>
  </div>

  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold navy-text">Budget Progress</h3>
        <button className="text-sm text-gray-500 hover:text-gray-700">
          <i className="fas fa-ellipsis-v"></i>
        </button>
      </div>

   
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium">Housing</span>
          <span className="text-sm">$850 / $1000</span>
        </div>
        <div className="progress-bar bg-gray-200">
          <div className="progress-fill bg-blue-500" style={{ width: '85%' }}></div>
        </div>
      </div>

     
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium">Food & Dining</span>
          <span className="text-sm">$420 / $500</span>
        </div>
        <div className="progress-bar bg-gray-200">
          <div className="progress-fill light-blue-bg" style={{ width: '84%' }}></div>
        </div>
      </div>


      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium">Transportation</span>
          <span className="text-sm">$120 / $300</span>
        </div>
        <div className="progress-bar bg-gray-200">
          <div className="progress-fill navy-bg" style={{ width: '40%' }}></div>
        </div>
      </div>

     
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium">Entertainment</span>
          <span className="text-sm text-red-500">$320 / $200</span>
        </div>
        <div className="progress-bar bg-gray-200">
          <div className="progress-fill orange-bg" style={{ width: '100%' }}></div>
        </div>
        <div className="text-xs text-red-500 mt-1">
          <i className="fas fa-exclamation-circle mr-1"></i> 60% over budget
        </div>
      </div>

    
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium">Shopping</span>
          <span className="text-sm">$180 / $300</span>
        </div>
        <div className="progress-bar bg-gray-200">
          <div className="progress-fill bg-green-500" style={{ width: '60%' }}></div>
        </div>
      </div>
    </div>

    
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold navy-text">Recent Transactions</h3>
        <a href="#transactions" className="text-sm text-blue-500 hover:underline"
          >View All</a
        >
      </div>

      <div className="space-y-3">
   
        <div
          className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition-all"
        >
          <div className="rounded-full p-2 bg-red-100 text-red-500 mr-3">
            <i className="fas fa-shopping-cart"></i>
          </div>
          <div className="flex-grow">
            <h4 className="text-sm font-medium">Grocery Shopping</h4>
            <p className="text-xs text-gray-500">Today, 2:34 PM</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-red-500">-$84.32</p>
            <p className="text-xs text-gray-500">Food & Dining</p>
          </div>
        </div>

        
        <div
          className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition-all"
        >
          <div className="rounded-full p-2 bg-green-100 text-green-500 mr-3">
            <i className="fas fa-building"></i>
          </div>
          <div className="flex-grow">
            <h4 className="text-sm font-medium">Salary Deposit</h4>
            <p className="text-xs text-gray-500">Jul 15, 2023</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-green-500">+$2,850.00</p>
            <p className="text-xs text-gray-500">Income</p>
          </div>
        </div>

       
        <div
          className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition-all"
        >
          <div
            className="rounded-full p-2 orange-bg bg-opacity-20 orange-text mr-3"
          >
            <i className="fas fa-utensils"></i>
          </div>
          <div className="flex-grow">
            <h4 className="text-sm font-medium">Restaurant</h4>
            <p className="text-xs text-gray-500">Jul 14, 2023</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-red-500">-$52.75</p>
            <p className="text-xs text-gray-500">Food & Dining</p>
          </div>
        </div>

      
        <div
          className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition-all"
        >
          <div className="rounded-full p-2 light-blue-bg navy-text mr-3">
            <i className="fas fa-tshirt"></i>
          </div>
          <div className="flex-grow">
            <h4 className="text-sm font-medium">Clothing Store</h4>
            <p className="text-xs text-gray-500">Jul 13, 2023</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-red-500">-$128.50</p>
            <p className="text-xs text-gray-500">Shopping</p>
          </div>
        </div>

      
        <div
          className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition-all"
        >
          <div className="rounded-full p-2 bg-purple-100 text-purple-500 mr-3">
            <i className="fas fa-home"></i>
          </div>
          <div className="flex-grow">
            <h4 className="text-sm font-medium">Rent Payment</h4>
            <p className="text-xs text-gray-500">Jul 1, 2023</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-red-500">-$850.00</p>
            <p className="text-xs text-gray-500">Housing</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
   </>
  )
}

export default Dashbord
