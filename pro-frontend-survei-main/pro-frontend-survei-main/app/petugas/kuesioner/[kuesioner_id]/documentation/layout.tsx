export const metadata = {
    title: "Upload Dokumentasi Pengisian Kuesioner",
    description: "Create by IT SMK Telkom Malang",
};

type PropsLayout = {
    children: React.ReactNode;
};

const RootLayout = ({ children }: PropsLayout) => {
    return (
        <div>
            {children}
        </div>
    );
};

export default RootLayout;