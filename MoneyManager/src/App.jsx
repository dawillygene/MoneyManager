import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Navigation from "./layouts/Navigation"
import SideBar from "./layouts/Sidebar"
import MainContent from "./layouts/MainContent"
import Dashbord from "./pages/Dashbord"
import Transaction from "./pages/Transaction"
import Budgets from "./pages/Budgets"
import Goals from "./pages/Goals"
import Reports from "./pages/Reports"
import RegistrationPage from "./pages/RegistrationPage"
import LoginPage from "./pages/LoginPage"
import AuthLayout from "./layouts/AuthLayout"

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth routes - NO sidebar or navigation */}
        <Route element={<AuthLayout />}>
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Main app routes - WITH sidebar and navigation */}
        <Route
          path="*"
          element={
            <>
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
            </>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
