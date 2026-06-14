import {
    CalendarCheck,
    CalendarDays,
    ClipboardList,
    DollarSign,
    Home,
    LogOut,
    Users,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/button";

const navItems = [
  { title: "Dashboard", path: "/", Icon: Home },
  { title: "Students", path: "/students", Icon: Users },
  { title: "Attendance", path: "/attendance", Icon: CalendarCheck },
  { title: "Grades", path: "/grades", Icon: ClipboardList },
  { title: "Fees", path: "/fees", Icon: DollarSign },
  { title: "Schedule", path: "/schedule", Icon: CalendarDays },
];

export function Sidebar() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <aside className="flex min-h-full w-full flex-col border-b border-border bg-background px-4 py-4 sm:h-screen sm:w-72 sm:border-b-0 sm:border-r sm:px-4 sm:py-6">
      <div className="mb-6 px-2 sm:mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Navigation
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map(({ title, path, Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted hover:text-foreground"
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {title}
          </NavLink>
        ))}
      </nav>

      <div className="mt-6 rounded-xl border border-border bg-card p-4 sm:mt-8">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Signed in as
        </p>
        <p className="mt-2 truncate text-sm font-medium text-foreground">
          {user?.email ?? "Not signed in"}
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-4 w-full gap-2"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
