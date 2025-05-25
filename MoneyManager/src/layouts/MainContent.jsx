import React from 'react'

const MainContent = ({children}) => {
  return (
 <div className="flex-grow overflow-auto p-4 md:p-8 bg-gray-50">
   
     {children}
 
 </div>
  )
}

export default MainContent
