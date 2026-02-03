import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Mermaid Studio | Pro Diagram Generator",
    description: "Create, render and save professional Mermaid diagrams in real-time.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.className} antialiased selection:bg-blue-100 selection:text-blue-900`}>
                {children}
            </body>
        </html>
    );
}
