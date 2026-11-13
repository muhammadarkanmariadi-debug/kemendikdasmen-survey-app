import PetugasTemplate from "@/components/template-petugas";
import MenuList from "../menuList";


export const metadata = {
  title: "Histori Pengisian Kuesioner",
  description: "Create by IT SMK Telkom Malang",
};

type PropsLayout = {
  children: React.ReactNode;
};

const RootLayout = ({ children }: PropsLayout) => {
  return (
    <PetugasTemplate title="Histori Pengisian Kuesioner" id="kuesioner" menuList={MenuList}>
      {children}
    </PetugasTemplate>
  );
};

export default RootLayout;