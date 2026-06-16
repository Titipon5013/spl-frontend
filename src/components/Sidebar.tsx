import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  Landmark,
  X,
} from 'lucide-react';
import { navigationItems } from '../config/navigation';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();

  const handleLogout = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    localStorage.removeItem('token');
    navigate('/');
  };

  const groups = [
    { id: 'operations', label: 'Operations' },
    { id: 'records', label: 'Records' },
    { id: 'access', label: 'Access' },
  ] as const;

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/45 md:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col justify-between border-r border-[var(--pp-line)] bg-white transition-transform duration-200 ease-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        
        <div>
          <div className="flex h-18 items-center justify-between border-b border-[var(--pp-line)] px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-[var(--pp-radius)] bg-[var(--pp-blue-deep)] p-2">
                <Landmark className="text-white" size={22} />
              </div>
              <div>
                <h1 className="text-base font-bold leading-tight text-[var(--pp-ink)]">ParkPilot</h1>
                <p className="text-xs font-medium text-[var(--pp-muted)]">CAMT Field Ops</p>
              </div>
            </div>
            <button
              className="rounded-[var(--pp-radius)] p-2 text-[var(--pp-muted)] hover:bg-[var(--pp-surface-muted)] hover:text-[var(--pp-ink)] md:hidden"
              onClick={() => setIsOpen(false)}
              aria-label="Close navigation"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="max-h-[calc(100vh-154px)] overflow-y-auto p-3" aria-label="Admin navigation">
            {groups.map((group) => (
              <div key={group.id} className="mb-4 last:mb-0">
                <p className="px-3 pb-1 text-xs font-semibold text-[var(--pp-muted)]">{group.label}</p>
                <div className="space-y-1">
                  {navigationItems
                    .filter((item) => item.group === group.id)
                    .map((item) => (
                      <NavLink
                        key={item.name}
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) =>
                          `flex min-h-10 items-center gap-3 rounded-[var(--pp-radius)] px-3 py-2 text-sm font-semibold transition-colors ${
                            isActive
                              ? 'border border-[#b7d0eb] bg-[var(--pp-blue-soft)] text-[var(--pp-blue-deep)]'
                              : 'text-[var(--pp-muted)] hover:bg-[var(--pp-surface-muted)] hover:text-[var(--pp-ink)]'
                          }`
                        }
                      >
                        {item.icon}
                        <span>{item.name}</span>
                      </NavLink>
                    ))}
                </div>
              </div>
            ))}
          </nav>
        </div>

        <div className="border-t border-[var(--pp-line)] bg-white p-3">
          <button 
            onClick={handleLogout}
            className="flex min-h-10 w-full items-center gap-3 rounded-[var(--pp-radius)] px-3 py-2 text-sm font-semibold text-[var(--pp-muted)] transition-colors hover:bg-[var(--pp-danger-soft)] hover:text-[var(--pp-danger)]"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
