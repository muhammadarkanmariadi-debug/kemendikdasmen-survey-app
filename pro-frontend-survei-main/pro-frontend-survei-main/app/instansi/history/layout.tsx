import InstansiTemplate from "@/components/template-instansi";
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
    <InstansiTemplate title="Histori Pengisian Kuesioner" id="kuesioner" menuList={MenuList}>
      {children}
    </InstansiTemplate>
  );
};

export default RootLayout;