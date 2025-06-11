import React from 'react';

const BudgetItem = ({ 
  budget, 
  onEdit, 
  onDelete, 
  onDuplicate, 
  onArchive, 
  onRestore 
}) => {
  const {
    id,
    name,
    description,
    amount,
    spent,
    remaining,
    category,
    categoryIcon,
    categoryColor,
    progress,
    isOverBudget,
    alertTriggered,
    status
  } = budget;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value).replace('TZS', 'Tsh');
  };

  const getProgressColor = () => {
    if (isOverBudget) return 'bg-red-500';
    if (progress >= 80) return 'bg-orange-500';
    if (progress >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getIconBgColor = () => {
    if (!categoryColor) return 'bg-gray-100 text-gray-500';
    const colorMap = {
      '#8B5CF6': 'bg-purple-100 text-purple-500',
      '#3B82F6': 'bg-blue-100 text-blue-500',
      '#F59E0B': 'bg-yellow-100 text-yellow-600',
      '#10B981': 'bg-green-100 text-green-500',
      '#EF4444': 'bg-red-100 text-red-500',
      '#6366F1': 'bg-indigo-100 text-indigo-500',
      '#EC4899': 'bg-pink-100 text-pink-500',
      '#6B7280': 'bg-gray-100 text-gray-500',
      '#9CA3AF': 'bg-gray-100 text-gray-400'
    };
    return colorMap[categoryColor] || 'bg-gray-100 text-gray-500';
  };

  return (
    <div className="p-4 border-b border-gray-200 last:border-b-0">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <div className={`rounded-full p-2 mr-3 ${getIconBgColor()}`}>
            <i className={categoryIcon || 'fas fa-folder'}></i>
          </div>
          <div>
            <h3 className="font-medium flex items-center">
              {name}
              {status === 'archived' && (
                <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                  Archived
                </span>
              )}
              {alertTriggered && (
                <i className="fas fa-exclamation-triangle text-orange-500 ml-2" title="Alert triggered"></i>
              )}
            </h3>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
        </div>
        <div className="text-right">
          <p className={`font-medium ${isOverBudget ? 'text-red-500' : ''}`}>
            {formatCurrency(spent)} / {formatCurrency(amount)}
          </p>
          <p className={`text-xs ${isOverBudget ? 'text-red-500' : 'text-gray-500'}`}>
            {Math.round(progress)}% used
          </p>
        </div>
      </div>
      
      <div className="progress-bar bg-gray-200 mb-2">
        <div 
          className={`progress-fill ${getProgressColor()}`} 
          style={{ width: `${Math.min(progress, 100)}%` }}
        ></div>
      </div>
      
      {isOverBudget && (
        <div className="bg-red-50 text-red-500 text-xs p-2 rounded mb-2">
          <i className="fas fa-exclamation-triangle mr-1"></i>
          You've exceeded this budget by {formatCurrency(spent - amount)}
        </div>
      )}
      
      <div className="flex justify-end space-x-3">
        {status !== 'archived' && (
          <>
            <button 
              onClick={() => onEdit(budget)}
              className="text-xs text-blue-500 hover:underline"
            >
              Edit
            </button>
            <button 
              onClick={() => onDuplicate(budget)}
              className="text-xs text-green-500 hover:underline"
            >
              Duplicate
            </button>
            <button 
              onClick={() => onArchive(id)}
              className="text-xs text-gray-500 hover:underline"
            >
              Archive
            </button>
          </>
        )}
        {status === 'archived' && (
          <button 
            onClick={() => onRestore(id)}
            className="text-xs text-blue-500 hover:underline"
          >
            Restore
          </button>
        )}
        <button 
          onClick={() => onDelete(id)}
          className="text-xs text-red-500 hover:underline"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default BudgetItem;