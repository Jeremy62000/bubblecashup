import { ListChecks, ShoppingBag, Sparkles, Trophy } from "lucide-react";
import { NavLink } from "react-router";

const TABS = [
  { to: "/play", label: "Jouer", icon: Sparkles },
  { to: "/defis", label: "Défis", icon: ListChecks },
  { to: "/shop", label: "Boutique", icon: ShoppingBag },
  { to: "/succes", label: "Succès", icon: Trophy },
];

export function BottomNav() {
  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/15 bg-[#241050]/75 p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-bold transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-[0_4px_20px_rgba(168,85,247,0.55)]"
                  : "text-violet-200/70 hover:bg-white/10 hover:text-white active:scale-95"
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