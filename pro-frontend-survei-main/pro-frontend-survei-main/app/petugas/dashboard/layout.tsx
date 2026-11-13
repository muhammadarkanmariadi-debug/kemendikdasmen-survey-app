import MenuList from "../menuList";
import PetugasTemplate from "@/components/template-petugas";

export const metadata = {
  title: "Dashboard | Direktorat SMK",
  description: "Created by IT SMK Telkom Malang",
};

type PropsLayout = {
  children: React.ReactNode;
};

const RootLayout = ({ children }: PropsLayout) => {
  return (
    <PetugasTemplate title="Dashboard" id="dashboard" menuList={MenuList}>
      {children}
    </PetugasTemplate>
  );
};

export default RootLayout;