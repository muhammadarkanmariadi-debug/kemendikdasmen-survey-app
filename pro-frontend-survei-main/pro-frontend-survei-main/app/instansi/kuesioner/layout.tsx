import InstansiTemplate from "@/components/template-instansi";
import MenuList from "../menuList";


export const metadata = {
  title: "Daftar Kuesioner",
  description: "Create by IT SMK Telkom Malang",
};

type PropsLayout = {
  children: React.ReactNode;
};

const RootLayout = ({ children }: PropsLayout) => {
  return (
    <InstansiTemplate title="Daftar Kuesioner" id="kuesioner" menuList={MenuList}>
      {children}
    </InstansiTemplate>
  );
};

export default RootLayout;