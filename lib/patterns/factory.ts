/**
 * Factory Pattern - Head First Design Patterns
 * Creates objects without specifying the exact class of object that will be created
 */

export enum ReportType {
  EXECUTIVE_SUMMARY = 'EXECUTIVE_SUMMARY',
  BACKGROUND = 'BACKGROUND',
  EVIDENCE = 'EVIDENCE',
  FULL_REPORT = 'FULL_REPORT'
}

export interface Report {
  id: string;
  type: ReportType;
  title: string;
  content: string;
  generate(): string;
}

export class ExecutiveSummaryReport implements Report {
  constructor(
    public id: string,
    public type: ReportType,
    public title: string,
    public content: string
  ) {}

  generate(): string {
    return `
# Executive Summary

**Title:** ${this.title}

${this.content}

---
*Generated: ${new Date().toLocaleString()}*
    `.trim();
  }
}

export class BackgroundReport implements Report {
  constructor(
    public id: string,
    public type: ReportType,
    public title: string,
    public content: string
  ) {}

  generate(): string {
    return `
# Background

**Title:** ${this.title}

${this.content}

---
*Generated: ${new Date().toLocaleString()}*
    `.trim();
  }
}

export class EvidenceReport implements Report {
  constructor(
    public id: string,
    public type: ReportType,
    public title: string,
    public content: string
  ) {}

  generate(): string {
    return `
# Evidence

**Title:** ${this.title}

${this.content}

---
*Generated: ${new Date().toLocaleString()}*
    `.trim();
  }
}

export class FullReport implements Report {
  constructor(
    public id: string,
    public type: ReportType,
    public title: string,
    public content: string,
    private executiveSummary: string,
    private background: string,
    private evidence: string
  ) {}

  generate(): string {
    return `
# Federal Youth Online Safety Framework (FYOSF)

**Title:** ${this.title}

## Executive Summary
${this.executiveSummary}

## Background
${this.background}

## Evidence
${this.evidence}

---
*Generated: ${new Date().toLocaleString()}*
    `.trim();
  }
}

export class ReportFactory {
  static createReport(
    type: ReportType,
    id: string,
    title: string,
    content: string,
    additionalData?: {
      executiveSummary?: string;
      background?: string;
      evidence?: string;
    }
  ): Report {
    switch (type) {
      case ReportType.EXECUTIVE_SUMMARY:
        return new ExecutiveSummaryReport(id, type, title, content);
      
      case ReportType.BACKGROUND:
        return new BackgroundReport(id, type, title, content);
      
      case ReportType.EVIDENCE:
        return new EvidenceReport(id, type, title, content);
      
      case ReportType.FULL_REPORT:
        if (!additionalData) {
          throw new Error('Full report requires additional data');
        }
        return new FullReport(
          id,
          type,
          title,
          content,
          additionalData.executiveSummary || '',
          additionalData.background || '',
          additionalData.evidence || ''
        );
      
      default:
        throw new Error(`Unknown report type: ${type}`);
    }
  }
}

