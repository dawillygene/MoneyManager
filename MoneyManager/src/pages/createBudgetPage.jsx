import React, { useState } from "react";
import CreateBudgetForm from "../components/CreateBudgetForm";

const CreateBudgetPage = () => {
  const [showCreate, setShowCreate] = useState(true); // Start with modal open

  const handleCreateBudget = (data) => {
    setShowCreate(false);
    // Optionally redirect or show a success message
  };

  const handleClose = () => {
    setShowCreate(false);
    // You might want to navigate back to budgets page here
    // For example: navigate('/budgets')
  };

  return (
    <div className="min-h-screen light-grey-bg flex items-center justify-center py-12 px-2">
      {/* Page content when modal is closed */}
      {!showCreate && (
        <div className="text-center">
          <h1 className="text-3xl font-bold navy-text mb-4">
            Budget Management
          </h1>
          <p className="text-gray-600 mb-6">
            Your budget has been created successfully!
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="orange-bg text-white px-6 py-2 rounded-lg hover:opacity-90 transition"
          >
            Create Another Budget
          </button>
        </div>
      )}

      {/* Modal */}
      {showCreate && (
        <div
          className="modal-backdrop fixed inset-0 z-[9999] flex items-center justify-center"
          onClick={(e) => {
            // Close modal when clicking on backdrop, but not on the modal content
            if (e.target === e.currentTarget) {
              handleClose();
            }
          }}
        >
          <CreateBudgetForm
            onSubmit={handleCreateBudget}
            onClose={handleClose}
          />
        </div>
      )}
    </div>
  );
};

export default CreateBudgetPage;