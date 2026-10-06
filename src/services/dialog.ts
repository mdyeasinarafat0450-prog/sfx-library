export function selectFolder(): Promise<string | null> {
    return new Promise((resolve) => {
        // @ts-ignore
        if (typeof window.cep !== 'undefined') {
            // @ts-ignore
            const result = window.cep.fs.showOpenDialog(false, true, "Select Sound Library Folder", "");
            if (result.err === 0 && result.data && result.data.length > 0) {
                resolve(result.data[0]);
            } else {
                resolve(null);
            }
        } else {
            const mock = prompt("Enter a local folder path to scan (Mock for browser):", "D:\\Sound Library");
            resolve(mock);
        }
    });
}
