import Sidebar from "@/components/template/sidebar";
import MenuList from "../menuList";

type PropsLayout = {
    children: React.ReactNode
}

const DokumenLayout = ({ children }: PropsLayout) => {
    return (
        <Sidebar
            id="pengaturanDokumen"
            title="Pengaturan Kop Surat & Dokumen Resmi"
            menuList={MenuList}
        >
            {children}
        </Sidebar>
    );
};

export default DokumenLayout;
