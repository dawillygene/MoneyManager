import React, { useState } from "react";
import CreateBudgetForm from "../components/CreateBudgetForm";

const Budgets = () => {
  const [showCreate, setShowCreate] = useState(false);

  const handleCreateBudget = (data) => {
    // Handle the new budget data here (e.g., send to backend or update state)
    console.log("New budget:", data);
    setShowCreate(false); // Close modal after submit
  };

  return (
    <section id="budgets" className="mb-12 relative">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-2xl font-bold navy-text mb-2 md:mb-0">Budget Management</h2>
        <div className="flex space-x-2">
          <button
            className="orange-bg text-white rounded-md px-3 py-1 text-sm hover:bg-opacity-90"
            onClick={() => setShowCreate(true)}
          >
            <i className="fas fa-plus mr-2"></i> Create Budget
          </button>
        </div>
      </div>

      {/* Budget Overview Card */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border-r border-gray-200 pr-4">
            <h3 className="text-sm text-gray-500 mb-1">Total Budget for July</h3>
            <p className="text-2xl font-bold navy-text">$2,500.00</p>
            <div className="mt-2 text-xs">
              <span className="text-blue-500">
                <i className="fas fa-arrow-up mr-1"></i> 12% from last month
              </span>
            </div>
          </div>
          <div className="md:border-r border-gray-200 pr-4 md:px-4">
            <h3 className="text-sm text-gray-500 mb-1">Spent So Far</h3>
            <p className="text-2xl font-bold navy-text">$1,490.00</p>
            <div className="mt-2 text-xs">
              <span className="text-green-500">59.6% of total budget</span>
            </div>
          </div>
          <div className="md:px-4">
            <h3 className="text-sm text-gray-500 mb-1">Remaining</h3>
            <p className="text-2xl font-bold navy-text">$1,010.00</p>
            <div className="mt-2 text-xs">
              <span className="text-gray-500">18 days left in month</span>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500" style={{ width: '59.6%' }}></div>
          </div>
        </div>
      </div>

      {/* Budget Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div>
          <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
            {/* Housing Budget */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <div className="rounded-full p-2 bg-purple-100 text-purple-500 mr-3">
                    <i className="fas fa-home"></i>
                  </div>
                  <div>
                    <h3 className="font-medium">Housing</h3>
                    <p className="text-xs text-gray-500">
                      Rent, utilities, maintenance
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">$850 / $1000</p>
                  <p className="text-xs text-gray-500">85% used</p>
                </div>
              </div>
              <div className="progress-bar bg-gray-200">
                <div className="progress-fill bg-purple-500" style={{ width: '85%' }}></div>
              </div>
              <div className="flex justify-end mt-2">
                <button className="text-xs text-blue-500 hover:underline mr-3">
                  Edit
                </button>
                <button className="text-xs text-red-500 hover:underline">Delete</button>
              </div>
            </div>

            {/* Food Budget */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <div className="rounded-full p-2 light-blue-bg navy-text mr-3">
                    <i className="fas fa-utensils"></i>
                  </div>
                  <div>
                    <h3 className="font-medium">Food & Dining</h3>
                    <p className="text-xs text-gray-500">
                      Groceries, restaurants, takeout
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">$420 / $500</p>
                  <p className="text-xs text-gray-500">84% used</p>
                </div>
              </div>
              <div className="progress-bar bg-gray-200">
                <div className="progress-fill light-blue-bg" style={{ width: '84%' }}></div>
              </div>
              <div className="flex justify-end mt-2">
                <button className="text-xs text-blue-500 hover:underline mr-3">
                  Edit
                </button>
                <button className="text-xs text-red-500 hover:underline">Delete</button>
              </div>
            </div>

            {/* Transportation Budget */}
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <div className="rounded-full p-2 bg-yellow-100 text-yellow-600 mr-3">
                    <i className="fas fa-car"></i>
                  </div>
                  <div>
                    <h3 className="font-medium">Transportation</h3>
                    <p className="text-xs text-gray-500">
                      Fuel, public transit, maintenance
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">$120 / $300</p>
                  <p className="text-xs text-gray-500">40% used</p>
                </div>
              </div>
              <div className="progress-bar bg-gray-200">
                <div className="progress-fill bg-yellow-500" style={{ width: '40%' }}></div>
              </div>
              <div className="flex justify-end mt-2">
                <button className="text-xs text-blue-500 hover:underline mr-3">
                  Edit
                </button>
                <button className="text-xs text-red-500 hover:underline">Delete</button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div>
          <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
            {/* Entertainment Budget */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <div className="rounded-full p-2 bg-blue-100 text-blue-500 mr-3">
                    <i className="fas fa-film"></i>
                  </div>
                  <div>
                    <h3 className="font-medium">Entertainment</h3>
                    <p className="text-xs text-gray-500">
                      Movies, events, subscriptions
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-red-500">$320 / $200</p>
                  <p className="text-xs text-red-500">160% used</p>
                </div>
              </div>
              <div className="progress-bar bg-gray-200">
                <div className="progress-fill orange-bg" style={{ width: '100%' }}></div>
              </div>
              <div className="bg-red-50 text-red-500 text-xs p-2 rounded mt-2">
                <i className="fas fa-exclamation-triangle mr-1"></i> You've exceeded
                this budget by $120.00
              </div>
              <div className="flex justify-end mt-2">
                <button className="text-xs text-blue-500 hover:underline mr-3">
                  Edit
                </button>
                <button className="text-xs text-red-500 hover:underline">Delete</button>
              </div>
            </div>

            {/* Shopping Budget */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <div className="rounded-full p-2 bg-green-100 text-green-500 mr-3">
                    <i className="fas fa-shopping-bag"></i>
                  </div>
                  <div>
                    <h3 className="font-medium">Shopping</h3>
                    <p className="text-xs text-gray-500">Clothes, accessories, gifts</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">$180 / $300</p>
                  <p className="text-xs text-gray-500">60% used</p>
                </div>
              </div>
              <div className="progress-bar bg-gray-200">
                <div className="progress-fill bg-green-500" style={{ width: '60%' }}></div>
              </div>
              <div className="flex justify-end mt-2">
                <button className="text-xs text-blue-500 hover:underline mr-3">
                  Edit
                </button>
                <button className="text-xs text-red-500 hover:underline">Delete</button>
              </div>
            </div>

            {/* Healthcare Budget */}
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <div className="rounded-full p-2 bg-red-100 text-red-500 mr-3">
                    <i className="fas fa-heartbeat"></i>
                  </div>
                  <div>
                    <h3 className="font-medium">Healthcare</h3>
                    <p className="text-xs text-gray-500">
                      Medicine, doctor visits, insurance
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">$50 / $200</p>
                  <p className="text-xs text-gray-500">25% used</p>
                </div>
              </div>
              <div className="progress-bar bg-gray-200">
                <div className="progress-fill bg-red-500" style={{ width: '25%' }}></div>
              </div>
              <div className="flex justify-end mt-2">
                <button className="text-xs text-blue-500 hover:underline mr-3">
                  Edit
                </button>
                <button className="text-xs text-red-500 hover:underline">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
          <div className="w-full max-w-2xl mx-auto my-8">
            <CreateBudgetForm
              onSubmit={handleCreateBudget}
              onClose={() => setShowCreate(false)}
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default Budgets;
