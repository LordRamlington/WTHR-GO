import { SevereAlert } from '../types/weather';

class PushNotificationService {
  private notifiedAlertIds: Set<string> = new Set();
  private audioContext: AudioContext | null = null;

  constructor() {
    // Restore seen alert IDs from sessionStorage to prevent spamming on reload
    try {
      const stored = sessionStorage.getItem('auracast_notified_alerts');
      if (stored) {
        this.notifiedAlertIds = new Set(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  public getPermissionStatus(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  public async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) return false;
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (err) {
      console.warn('Notification permission request error:', err);
      return false;
    }
  }

  public playAlertSound(): void {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.audioContext) {
        this.audioContext = new AudioCtx();
      }
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      const now = this.audioContext.currentTime;
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(659.25, now); // E5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
      osc.frequency.setValueAtTime(783.99, now + 0.25); // G5

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(this.audioContext.destination);

      osc.start(now);
      osc.stop(now + 0.5);
    } catch (err) {
      console.warn('Audio feedback failed:', err);
    }
  }

  public vibrateDevice(pattern: number[] = [200, 100, 200, 100, 300]): void {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // ignore
      }
    }
  }

  public sendSevereAlertNotification(alert: SevereAlert, options: { vibrate?: boolean; sound?: boolean } = {}): boolean {
    if (this.notifiedAlertIds.has(alert.id)) {
      return false;
    }

    this.notifiedAlertIds.add(alert.id);
    try {
      sessionStorage.setItem('auracast_notified_alerts', JSON.stringify(Array.from(this.notifiedAlertIds)));
    } catch {
      // ignore
    }

    if (options.vibrate !== false) {
      this.vibrateDevice();
    }
    if (options.sound !== false) {
      this.playAlertSound();
    }

    if (this.isSupported() && Notification.permission === 'granted') {
      try {
        const notif = new Notification(`⚠️ ${alert.title}`, {
          body: `${alert.headline}\n${alert.instruction}`,
          icon: '/icon.svg',
          badge: '/icon.svg',
          tag: alert.id,
          requireInteraction: alert.severity === 'extreme',
        });

        notif.onclick = () => {
          window.focus();
          notif.close();
        };
        return true;
      } catch (err) {
        console.warn('Native notification failed:', err);
      }
    }

    return false;
  }
}

export const pushNotificationService = new PushNotificationService();
