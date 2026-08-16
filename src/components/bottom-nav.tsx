import { ShoppingBag, Sparkles } from "lucide-react";
import { NavLink } from "react-router";

const TABS = [
  { to: "/play", label: "Jouer", icon: Sparkles },
  { to: "/shop", label: "Boutique", icon: ShoppingBag },
];

export function BottomNav() {
  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/70 bg-white/65 p-1.5 shadow-xl shadow-indigo-900/10 backdrop-blur-2xl">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow-md shadow-indigo-500/30"
                  : "text-slate-500 hover:bg-white/70 hover:text-indigo-600 active:scale-95"
              }`
            }
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}