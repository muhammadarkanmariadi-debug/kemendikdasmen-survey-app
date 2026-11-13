import MenuList from "../menuList";
import InstansiTemplate from "@/components/template-instansi";

export const metadata = {
  title: "Dashboard | Direktorat SMK",
  description: "Created by IT SMK Telkom Malang",
};

type PropsLayout = {
  children: React.ReactNode;
};

const RootLayout = ({ children }: PropsLayout) => {
  return (
    <InstansiTemplate title="Dashboard" id="dashboard" menuList={MenuList}>
      {children}
    </InstansiTemplate>
  );
};

export default RootLayout;