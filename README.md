# Money Manager - Personal Finance Management System

**Authors:** 
- @FransiskaMatiko
- @dawillygene

## 📋 Project Overview

Money Manager is a comprehensive personal finance management web application built with React and Vite. It provides users with powerful tools to track expenses, manage budgets, set financial goals, and generate insightful reports about their financial health.

## ✨ Features

### 🏠 Dashboard
- **Financial Overview**: Real-time summary of total balance, monthly income, and expenses
- **Recent Transactions**: Quick view of latest financial activities
- **Budget Progress**: Visual progress bars showing spending against budget limits
- **Goal Tracking**: Monitor progress towards financial objectives
- **Monthly Trends**: Interactive charts displaying spending patterns

### 💰 Transaction Management
- **Add Transactions**: Record income and expenses with detailed categorization
- **Transaction History**: Comprehensive list with filtering and search capabilities
- **Categories**: Organize transactions by type (Housing, Food, Transportation, Entertainment, etc.)
- **Advanced Filters**: Filter by date range, category, transaction type, and search terms
- **Export Options**: Generate reports and export transaction data

### 📊 Budget Management
- **Create Budgets**: Set spending limits for different categories
- **Budget Tracking**: Real-time monitoring of budget usage with visual indicators
- **Budget Categories**: 
  - Housing (Rent, utilities, maintenance)
  - Food & Dining (Groceries, restaurants)
  - Transportation (Fuel, public transit)
  - Entertainment (Movies, subscriptions)
  - Shopping (Clothes, accessories)
  - Healthcare (Medical expenses, insurance)
- **Budget Alerts**: Visual warnings when approaching or exceeding budget limits
- **Monthly Budget Overview**: Comprehensive view of all budget categories

### 🎯 Goal Setting
- **Financial Goals**: Set and track various financial objectives
- **Goal Categories**: Savings, debt reduction, investment targets
- **Progress Tracking**: Visual progress indicators and milestone tracking
- **Goal Management**: Create, edit, and delete financial goals

### 📈 Reports & Analytics
- **Spending Analysis**: Detailed breakdown of expenses by category
- **Income vs Expenses**: Comparative analysis of financial inflows and outflows
- **Trend Analysis**: Monthly and yearly spending patterns
- **Visual Charts**: Interactive graphs and charts for better data visualization

### 🔐 Authentication System
- **User Registration**: Secure account creation with form validation
- **User Login**: Secure authentication system
- **Session Management**: Persistent user sessions
- **Form Validation**: Client-side validation for all forms

## 🏗️ Technical Architecture

### Frontend Framework
- **React 19.1.0**: Modern React with hooks and functional components
- **Vite 6.3.5**: Fast build tool and development server
- **React Router DOM 7.6.1**: Client-side routing and navigation

### UI/UX Libraries
- **Framer Motion 12.16.0**: Smooth animations and transitions
- **Font Awesome**: Comprehensive icon library
- **Custom CSS**: Responsive design with mobile-first approach

### Development Tools
- **ESLint**: Code linting and quality assurance
- **Axios 1.9.0**: HTTP client for API communications
- **Tailwind CSS**: Utility-first CSS framework integration

### Design System
- **Color Palette**:
  - Navy Blue (#0A2342): Primary brand color
  - Light Blue (#8ECAE6): Secondary accent color
  - Orange (#F2994A): Action and highlight color
  - Light Grey (#F5F7FA): Background and neutral tones

## 📁 Project Structure

```
MoneyManager/
├── public/
│   └── vite.svg                    # Vite logo
├── src/
│   ├── components/                 # Reusable UI components
│   │   ├── AddFundsForm.jsx       # Form for adding funds
│   │   ├── AddGoalForm.jsx        # Goal creation form
│   │   ├── AddTransactionForm.jsx # Transaction entry form
│   │   ├── CreateBudgetForm.jsx   # Budget creation form
│   │   ├── LoginForm.jsx          # User authentication form
│   │   └── RegistrationForm.jsx   # User registration form
│   ├── layouts/                    # Layout components
│   │   ├── AuthLayout.jsx         # Authentication pages layout
│   │   ├── MainContent.jsx        # Main content wrapper
│   │   ├── Navigation.jsx         # Top navigation bar
│   │   └── Sidebar.jsx            # Side navigation menu
│   ├── pages/                      # Page components
│   │   ├── Budgets.jsx            # Budget management page
│   │   ├── createBudgetPage.jsx   # Budget creation page
│   │   ├── Dashbord.jsx           # Main dashboard
│   │   ├── Goals.jsx              # Goals management page
│   │   ├── LoginPage.jsx          # User login page
│   │   ├── RegistrationPage.jsx   # User registration page
│   │   ├── Reports.jsx            # Analytics and reports
│   │   └── Transaction.jsx        # Transaction management
│   ├── App.jsx                     # Main application component
│   ├── index.css                   # Global styles and CSS variables
│   └── main.jsx                    # Application entry point
├── eslint.config.js                # ESLint configuration
├── index.html                      # HTML template
├── package.json                    # Project dependencies
├── vite.config.js                  # Vite configuration
└── README.md                       # Project documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js (version 18 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd MoneyManager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Preview production build**
   ```bash
   npm run preview
   ```

### Available Scripts

- `npm run dev`: Start development server with hot reload
- `npm run build`: Create production build
- `npm run lint`: Run ESLint for code quality checks
- `npm run preview`: Preview production build locally

## 🎨 Design Features

### Responsive Design
- **Mobile-First**: Optimized for mobile devices with responsive breakpoints
- **Cross-Platform**: Works seamlessly on desktop, tablet, and mobile
- **Touch-Friendly**: Optimized touch interactions for mobile users

### User Experience
- **Intuitive Navigation**: Clear sidebar navigation with active state indicators
- **Modal Interactions**: Smooth modal dialogs for forms and actions
- **Loading States**: Visual feedback during data operations
- **Form Validation**: Real-time validation with helpful error messages

### Accessibility
- **Keyboard Navigation**: Full keyboard accessibility support
- **Screen Reader Support**: ARIA labels and semantic HTML
- **Focus Management**: Proper focus handling in modals and forms
- **Color Contrast**: High contrast ratios for better readability

## 🔧 Key Components

### Forms
- **AddTransactionForm**: Modal form for recording income/expenses
- **CreateBudgetForm**: Budget creation with category selection
- **AddGoalForm**: Financial goal setting interface
- **LoginForm & RegistrationForm**: User authentication forms

### Layout Components
- **Navigation**: Top navigation bar with user profile and notifications
- **Sidebar**: Main navigation menu with active page indicators
- **MainContent**: Content wrapper with proper spacing and scrolling

### Page Components
- **Dashboard**: Central hub showing financial overview
- **Budgets**: Budget management with visual progress tracking
- **Transactions**: Transaction history with advanced filtering
- **Goals**: Financial goal setting and progress tracking
- **Reports**: Analytics dashboard with charts and insights

## 📊 Data Management

### Transaction Categories
- Food & Dining
- Income
- Shopping
- Transportation
- Entertainment
- Housing
- Healthcare
- Other

### Budget Categories
- Housing (Rent, utilities, maintenance)
- Food & Dining (Groceries, restaurants, takeout)
- Transportation (Fuel, public transit, maintenance)
- Entertainment (Movies, events, subscriptions)
- Shopping (Clothes, accessories, gifts)
- Healthcare (Medicine, doctor visits, insurance)

## 🎯 Future Enhancements

### Planned Features
- **Bank Integration**: Connect with bank accounts for automatic transaction import
- **Advanced Analytics**: More detailed financial insights and predictions
- **Bill Reminders**: Automated reminders for recurring payments
- **Investment Tracking**: Portfolio management and investment monitoring
- **Multi-Currency Support**: Support for different currencies
- **Export Options**: PDF reports and CSV data export
- **Mobile App**: Native mobile application development

### Technical Improvements
- **TypeScript Migration**: Convert to TypeScript for better type safety
- **Backend Integration**: Full-stack implementation with database
- **Real-time Updates**: WebSocket integration for live data updates
- **Offline Support**: Progressive Web App (PWA) capabilities
- **Performance Optimization**: Code splitting and lazy loading

## 🤝 Contributing

We welcome contributions to improve Money Manager! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/new-feature`
3. **Commit changes**: `git commit -m 'Add new feature'`
4. **Push to branch**: `git push origin feature/new-feature`
5. **Submit a Pull Request**

### Development Guidelines
- Follow the existing code style and conventions
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors & Contributors

- **Fransiska Matiko** (@FransiskaMatiko) - Project Lead & Frontend Developer
- **ELIA WILLIAM MARIKI** (@dawillygene) - Frontend Developer & UI/UX Designer

## 📞 Contact

For questions, suggestions, or support:
- Create an issue in the GitHub repository
- Contact the development team through GitHub

---

**Money Manager** - Take control of your finances with style and simplicity. 💰✨
