import MenuList from "@/app/admin/menuList";
import ManagerTemplate from "@/components/template";

export const metadata = {
  title: "Jenis Responden | Direktorat SMK",
  description: "Create by IT SMK Telkom Malang",
};

type PropsLayout = {
  children: React.ReactNode;
};

const RootLayout = ({ children }: PropsLayout) => {
  return (
    <ManagerTemplate title="Jenis Responden" id="instansi" menuList={MenuList}>
      {children}
    </ManagerTemplate>
  );
};

export default RootLayout;