export const metadata = {
    title: "Upload Dokumen Pendukung",
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