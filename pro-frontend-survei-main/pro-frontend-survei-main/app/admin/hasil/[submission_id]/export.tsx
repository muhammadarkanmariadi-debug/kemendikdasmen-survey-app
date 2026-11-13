"use client";

import { useState } from "react";
import html2pdf from "html2pdf.js";

export default function PdfFromUrl({ submission_id }: { submission_id: string }) {
    const [loading, setLoading] = useState(false);

    const handleDownload = async () => {
        setLoading(true);

        // Example: get HTML from another route in your Next.js app
        const res = await fetch(`/submission?submission_id=${submission_id}`);
        const html = await res.text();

        // Create a hidden container
        const container = document.createElement("div");
        container.innerHTML = html;
        document.body.appendChild(container);

        const opt = {
            margin: 10,
            filename: `Kuisioner - ${new Date().getTime()}`,
            image: { type: "jpeg" as const, quality: 0.98 },
            html2canvas: { scale: 1 },
            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
            pagebreak: { mode: ["css", "legacy"] },
        };

        await html2pdf().from(container).set(opt).save();

        // cleanup
        document.body.removeChild(container);
        setLoading(false);
    };

    return (
        <div>
            <button
                onClick={handleDownload}
                disabled={loading}
                className="bg-blue-500 text-white px-4 py-2 rounded"
            >
                {loading ? "Generating..." : "Download PDF"}
            </button>
        </div>
    );
}
