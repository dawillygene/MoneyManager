import Navigation from "./layouts/Navigation"
import SideBar from "./layouts/Sidebar"
import MainContent from "./layouts/MainContent"
import Dashbord from "./pages/Dashbord"
import Transaction from "./pages/Transaction"
import Budgets from "./pages/Budgets"
import Goals from "./pages/Goals"
import Reports from "./pages/Reports"


function App() {


  return (
    <>
      <Navigation />
      <div className="flex flex-col md:flex-row min-h-screen">
        <SideBar />
        <MainContent>
           {/* <Dashbord /> */}
            {/* <Transaction /> */}     
        {/* <Budgets /> */}
{/* <Goals /> */}
        <Reports />
        </MainContent>
      </div>

    </>
  )
}

export default App
