export function insertAtPlayhead(filepath: string) {
    // @ts-ignore
    if (typeof window.CSInterface === "undefined" && typeof CSInterface === "undefined") {
        console.log("Mock insert at playhead: ", filepath);
        return;
    }
    // @ts-ignore
    const cs = new CSInterface();
    const escapedPath = filepath.replace(/\\/g, '\\\\');
    cs.evalScript(`$._SFXStudio.insertAudioAtPlayhead("${escapedPath}")`, (res: string) => {
        if (res !== "Success") {
            console.error("Insertion failed:", res);
        }
    });
}
