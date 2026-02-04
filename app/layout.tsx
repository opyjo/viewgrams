import type { Metadata } from "next";
import { Fraunces, Space_Grotesk } from "next/font/google";
import Providers from "./providers";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    variable: "--font-body",
});

const fraunces = Fraunces({
    subsets: ["latin"],
    variable: "--font-display",
});

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
            <body className={`${spaceGrotesk.variable} ${fraunces.variable} antialiased selection:bg-amber-200 selection:text-slate-950`}>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
