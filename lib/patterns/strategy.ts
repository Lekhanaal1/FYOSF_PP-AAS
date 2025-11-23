/**
 * Strategy Pattern - Head First Design Patterns
 * Defines a family of algorithms, encapsulates each one, and makes them interchangeable
 */

export interface ContentFilterStrategy {
  filter(content: string): string;
  getName(): string;
}

export class BasicFilterStrategy implements ContentFilterStrategy {
  filter(content: string): string {
    // Basic HTML sanitization
    return content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .trim();
  }

  getName(): string {
    return 'Basic Filter';
  }
}

export class StrictFilterStrategy implements ContentFilterStrategy {
  filter(content: string): string {
    // More aggressive filtering
    const basic = new BasicFilterStrategy().filter(content);
    return basic
      .replace(/javascript:/gi, '')
      .replace(/<iframe/gi, '&lt;iframe')
      .replace(/<object/gi, '&lt;object')
      .replace(/<embed/gi, '&lt;embed');
  }

  getName(): string {
    return 'Strict Filter';
  }
}

export class ContentFilter {
  private strategy: ContentFilterStrategy;

  constructor(strategy: ContentFilterStrategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy: ContentFilterStrategy): void {
    this.strategy = strategy;
  }

  filterContent(content: string): string {
    return this.strategy.filter(content);
  }

  getCurrentStrategy(): string {
    return this.strategy.getName();
  }
}

