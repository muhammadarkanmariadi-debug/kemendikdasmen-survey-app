import React from "react";
import Link from "next/link";

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  active?: boolean;
}

const MenuItem = ({ icon, label, path, active }: MenuItemProps) => {
  return (
    <Link
      href={path}
      className={`group px-3.5 py-2.5 text-xs md:text-sm font-medium rounded-xl flex items-center gap-3 transition-all ${
        active
          ? "bg-[#0B5C9E] text-white shadow-sm shadow-blue-900/15 font-semibold"
          : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
      }`}
    >
      <span className={`shrink-0 ${active ? "text-[#FFB703]" : "text-slate-400 group-hover:text-[#0B5C9E]"}`}>
        {icon}
      </span>
      <span className="flex-1 truncate">{label}</span>
      {active && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#FFB703] shrink-0" />
      )}
    </Link>
  );
};

export default MenuItem;
