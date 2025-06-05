import React from 'react'

const MainContent = ({children}) => {
  return (
    <div className="flex-1 h-full overflow-hidden">
      <div className="h-full overflow-y-auto overflow-x-hidden bg-gray-50">
        <div className="p-4 md:p-8 min-h-full">
          {children}
        </div>
      </div>
    </div>
  )
}

export default MainContent
