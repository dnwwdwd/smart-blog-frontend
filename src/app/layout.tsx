import '@ant-design/v5-patch-for-react-19';
import "./globals.css";
import {AntdRegistry} from '@ant-design/nextjs-registry';
import BasicLayout from "@/layouts/BasicLayout";

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body>
        <AntdRegistry>
            <BasicLayout>
                {children}
            </BasicLayout>
        </AntdRegistry>
        </body>
        </html>
    );
}
