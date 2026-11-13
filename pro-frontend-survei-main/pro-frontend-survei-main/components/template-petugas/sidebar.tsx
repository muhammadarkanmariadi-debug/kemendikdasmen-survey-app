"use client";

import { ReactNode, useEffect, useState } from "react";
import MenuItem from "./menuItem";
import { usePathname, useRouter } from "next/navigation";
import { FiArrowLeft, FiLogOut, FiMenu, FiUser, FiMapPin } from "react-icons/fi";
import { BASE_API_URL, TOKEN_KEY_PETUGAS } from "@/global";
import { getCookie, removeCookie } from "@/helper/client-cookie";
import Image from "next/image";

type MenuType = {
  id: string;
  icon: ReactNode;
  path: string;
  label: string;
};

type ManagerProp = {
  children: ReactNode;
  id: string;
  title: string;
  menuList: MenuType[];
};

export const getUser = async () => {
  const token = getCookie(TOKEN_KEY_PETUGAS) || "";
  if (!token) return null;

  try {
    const res = await fetch(`${BASE_API_URL}/petugas/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.data;
  } catch (err) {
    console.error("Failed to fetch user", err);
    return null;
  }
};

const Sidebar = ({ children, title, menuList }: ManagerProp) => {
  const pathname = usePathname();
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);
  const [nama_user, setNamaUser] = useState<string>("");
  const router = useRouter();

  const handleLogout = () => {
    removeCookie(TOKEN_KEY_PETUGAS);
    router.replace(`/`);
  };

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getUser();
      if (user?.nama_user) {
        setNamaUser(user.nama_user);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="w-full min-h-screen flex bg-[#F8FAFC]">
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpenMobile ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-slate-50 p-1.5 rounded-xl border border-slate-200 shrink-0">
              <Image
                alt="Logo Kemendikbud"
                width={36}
                height={36}
                src="/images/logo_jenama_primer.png"
                className="object-contain"
              />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 leading-tight">
                Direktorat SMK
              </h2>
              <span className="text-[10px] uppercase font-bold text-[#FFB703] tracking-wider block">
                Kemendikbudristek
              </span>
            </div>
          </div>
          <button
            className="md:hidden text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            onClick={() => setIsOpenMobile(false)}
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Role Badge Indicator */}
        <div className="px-5 py-3 bg-indigo-50/50 border-b border-indigo-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-indigo-900">
            <FiMapPin className="w-3.5 h-3.5 text-indigo-600" />
            <span className="font-semibold text-indigo-950 text-[11px]">Petugas Lapangan</span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
            FIELD MODE
          </span>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3 py-1 block">
            Menu Petugas
          </span>
          {menuList.map((menu) => (
            <MenuItem
              key={menu.id}
              icon={menu.icon}
              label={menu.label}
              path={menu.path}
              active={
                pathname === menu.path || pathname.startsWith(menu.path + "/")
              }
            />
          ))}
        </nav>

        {/* Bottom User & Logout */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={handleLogout}
            className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-all flex items-center gap-2.5 cursor-pointer"
          >
            <FiLogOut className="w-4 h-4" />
            <span>Keluar Sistem</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Top Navbar Header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
              onClick={() => setIsOpenMobile(true)}
            >
              <FiMenu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-snug">
                {title}
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Portal Wawancara Lapangan Penjaminan Mutu SMK
              </p>
            </div>
          </div>

          {/* User Profile Pill */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700">
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">
                <FiUser className="w-3.5 h-3.5" />
              </div>
              <span className="hidden sm:inline">{nama_user || "Petugas"}</span>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Sidebar;
