export class AudioPlayer {
    private static instance: AudioPlayer;
    private audio: HTMLAudioElement | null = null;
    private currentPath: string | null = null;
    public onProgress: (currentTime: number, duration: number) => void = () => {};
    public onStateChange: (isPlaying: boolean, path: string | null) => void = () => {};

    private constructor() {}

    public static getInstance(): AudioPlayer {
        if (!AudioPlayer.instance) {
            AudioPlayer.instance = new AudioPlayer();
        }
        return AudioPlayer.instance;
    }

    public play(path: string) {
        if (this.currentPath === path && this.audio) {
            this.audio.play();
            return;
        }

        if (this.audio) {
            this.audio.pause();
        }

        this.currentPath = path;
        
        // In a real CEP extension, loading absolute paths might require a custom protocol or just standard file:///
        const uri = 'file:///' + path.replace(/\\/g, '/');
        
        this.audio = new Audio(uri);
        this.audio.addEventListener('timeupdate', () => {
            if (this.audio) {
                this.onProgress(this.audio.currentTime, this.audio.duration || 0);
            }
        });
        
        this.audio.addEventListener('play', () => this.onStateChange(true, this.currentPath));
        this.audio.addEventListener('pause', () => this.onStateChange(false, this.currentPath));
        this.audio.addEventListener('ended', () => this.onStateChange(false, this.currentPath));

        this.audio.play().catch(e => {
           console.error("Audio playback error:", e);
           // Fallback for browser testing (CORS/local file restrictions)
           console.log("Mocking playback for:", path);
           this.onStateChange(true, this.currentPath);
        });
    }

    public pause() {
        if (this.audio) {
            this.audio.pause();
        }
    }

    public toggle(path: string) {
        if (path && this.currentPath !== path) {
            this.play(path);
        } else if (this.audio) {
            if (this.audio.paused) this.audio.play();
            else this.audio.pause();
        }
    }
    
    public getCurrentPath() {
        return this.currentPath;
    }
}

export const player = AudioPlayer.getInstance();
