import { useState } from 'react'
import { Layout } from './components/layout/Layout'
import { ToastContainer } from './components/ui'
import { 
  Dashboard, 
  DashboardPage,
  CustomersPage, 
  OrdersPage, 
  QuotesPage,
  SamplesPage,
  QcPage,
  FollowUpsPage
} from './pages'

type Page = 'dashboard' | 'customers' | 'orders' | 'quotes' | 'samples' | 'qc' | 'followups' | 'analytics'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />
      case 'customers':
        return <CustomersPage />
      case 'orders':
        return <OrdersPage />
      case 'quotes':
        return <QuotesPage />
      case 'samples':
        return <SamplesPage />
      case 'qc':
        return <QcPage />
      case 'followups':
        return <FollowUpsPage />
      case 'analytics':
        return <DashboardPage />
      default:
        return <Dashboard onNavigate={setCurrentPage} />
    }
  }

  return (
    <>
      <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
        {renderPage()}
      </Layout>
      <ToastContainer />
    </>
  )
}

export default App
