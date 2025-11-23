/**
 * Decorator Pattern - Head First Design Patterns
 * Attaches additional responsibilities to an object dynamically
 */

export interface ReportComponent {
  generate(): string;
  getCost(): number;
}

export class BaseReport implements ReportComponent {
  constructor(
    private content: string,
    private baseCost: number = 0
  ) {}

  generate(): string {
    return this.content;
  }

  getCost(): number {
    return this.baseCost;
  }
}

export abstract class ReportDecorator implements ReportComponent {
  constructor(protected component: ReportComponent) {}

  generate(): string {
    return this.component.generate();
  }

  getCost(): number {
    return this.component.getCost();
  }
}

export class EncryptionDecorator extends ReportDecorator {
  generate(): string {
    const content = this.component.generate();
    // Simulated encryption - in production, use proper encryption
    return `[ENCRYPTED]${Buffer.from(content).toString('base64')}[/ENCRYPTED]`;
  }

  getCost(): number {
    return this.component.getCost() + 5;
  }
}

export class CompressionDecorator extends ReportDecorator {
  generate(): string {
    const content = this.component.generate();
    // Simulated compression - in production, use proper compression
    return `[COMPRESSED]${content.substring(0, Math.floor(content.length * 0.7))}[/COMPRESSED]`;
  }

  getCost(): number {
    return this.component.getCost() + 3;
  }
}

export class FormattingDecorator extends ReportDecorator {
  generate(): string {
    const content = this.component.generate();
    return `\n${'='.repeat(50)}\n${content}\n${'='.repeat(50)}\n`;
  }

  getCost(): number {
    return this.component.getCost() + 2;
  }
}

