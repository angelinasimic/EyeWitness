import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Satellite, 
  Globe, 
  AlertTriangle, 
  Brain, 
  Activity 
} from 'lucide-react';
import { cn } from '../utils/cn';

interface LayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Satellites', href: '/satellites', icon: Satellite },
  { name: 'Situational Picture', href: '/situational-picture', icon: Globe },
  { name: 'Alerts', href: '/alerts', icon: AlertTriangle },
  { name: 'Decisions', href: '/decisions', icon: Brain },
];

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-space-400" />
              <h1 className="ml-2 text-xl font-bold text-white">
                EyeWitness
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-300">Connected</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-gray-800 border-r border-gray-700 min-h-screen">
          <div className="p-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={cn(
                        'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-space-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      )}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
