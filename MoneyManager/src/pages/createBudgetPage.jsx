import React from "react";
import CreateBudgetForm from "../components/CreateBudgetForm";

const CreateBudgetPage = () => {
  const handleCreateBudget = (data) => {
    // You can send data to backend or update state here
    console.log("Budget created:", data);
    // Optionally redirect or show a success message
  };

  return (
    <div className="min-h-screen bg-[var(--light-blue)] flex items-center justify-center py-12 px-2">
      <CreateBudgetForm onSubmit={handleCreateBudget} />
    </div>
  );
};

export default CreateBudgetPage;