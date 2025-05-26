import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
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
    <Router>
      <Navigation />
      <div className="flex flex-col md:flex-row min-h-screen">
        <SideBar />
        <MainContent>
          <Routes>
            <Route path="/" element={<Dashbord />} />
            <Route path="/dashboard" element={<Dashbord />} />
            <Route path="/transactions" element={<Transaction />} />
            <Route path="/budgets" element={<Budgets />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </MainContent>
      </div>
    </Router>
  )
}

export default App
