/**
 * Singleton Pattern - Head First Design Patterns
 * Ensures a class has only one instance and provides a global point of access to it
 */

export class ConfigurationManager {
  private static instance: ConfigurationManager;
  private config: Map<string, any>;

  private constructor() {
    this.config = new Map();
    this.loadDefaultConfig();
  }

  public static getInstance(): ConfigurationManager {
    if (!ConfigurationManager.instance) {
      ConfigurationManager.instance = new ConfigurationManager();
    }
    return ConfigurationManager.instance;
  }

  private loadDefaultConfig(): void {
    this.config.set('appName', 'Federal Youth Online Safety Framework');
    this.config.set('appVersion', '1.0.0');
    this.config.set('maxReportLength', 10000);
    this.config.set('defaultFilterStrategy', 'basic');
    this.config.set('sessionTimeout', 3600000); // 1 hour
  }

  public get(key: string): any {
    return this.config.get(key);
  }

  public set(key: string, value: any): void {
    this.config.set(key, value);
  }

  public getAll(): Record<string, any> {
    return Object.fromEntries(this.config);
  }
}

