import MenuList from "@/app/admin/menuList";
import ManagerTemplate from "@/components/template";

export const metadata = {
  title: "Detail Kuesioner | Direktorat SMK",
  description: "Create by IT SMK Telkom Malang",
};

type PropsLayout = {
  children: React.ReactNode;
};

const RootLayout = ({ children }: PropsLayout) => {
  return (
    <ManagerTemplate title="Detail Kuesioner" id="kuesioner" menuList={MenuList}>
      {children}
    </ManagerTemplate>
  );
};

export default RootLayout;