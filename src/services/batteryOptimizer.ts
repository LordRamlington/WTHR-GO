import { BatteryStatus } from '../types/weather';

class BatteryOptimizerService {
  private battery: unknown = null;
  private batteryListeners: Array<(status: BatteryStatus) => void> = [];

  constructor() {
    this.init();
  }

  private async init() {
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      try {
        const getBattery = (navigator as unknown as { getBattery: () => Promise<unknown> }).getBattery;
        const b = await getBattery.call(navigator);
        this.battery = b;

        const notify = () => {
          const status = this.getBatteryStatus();
          if (status) {
            this.batteryListeners.forEach((listener) => listener(status));
          }
        };

        const bEventTarget = b as EventTarget;
        bEventTarget.addEventListener('levelchange', notify);
        bEventTarget.addEventListener('chargingchange', notify);
      } catch {
        // Battery API not permitted or unsupported
      }
    }
  }

  public getBatteryStatus(): BatteryStatus | null {
    if (!this.battery) return null;
    const b = this.battery as {
      charging?: boolean;
      chargingTime?: number;
      dischargingTime?: number;
      level?: number;
    };
    return {
      charging: Boolean(b.charging),
      chargingTime: b.chargingTime ?? 0,
      dischargingTime: b.dischargingTime ?? 0,
      level: b.level ?? 1,
    };
  }

  public onBatteryChange(callback: (status: BatteryStatus) => void): () => void {
    this.batteryListeners.push(callback);
    const initial = this.getBatteryStatus();
    if (initial) callback(initial);
    return () => {
      this.batteryListeners = this.batteryListeners.filter((cb) => cb !== callback);
    };
  }

  public shouldSuggestPowerSaver(): boolean {
    const status = this.getBatteryStatus();
    if (!status) return false;
    return !status.charging && status.level <= 0.2;
  }
}

export const batteryOptimizer = new BatteryOptimizerService();
