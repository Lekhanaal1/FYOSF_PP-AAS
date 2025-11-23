/**
 * Template Method Pattern - Head First Design Patterns
 * Defines the skeleton of an algorithm in a method, deferring some steps to subclasses
 */

export abstract class ReportGenerator {
  // Template method - defines the algorithm structure
  public generateReport(data: any): string {
    this.validateData(data);
    const processedData = this.processData(data);
    const formattedContent = this.formatContent(processedData);
    const finalReport = this.addMetadata(formattedContent);
    return finalReport;
  }

  // Steps that must be implemented by subclasses
  protected abstract processData(data: any): any;
  protected abstract formatContent(data: any): string;

  // Optional steps with default implementations
  protected validateData(data: any): void {
    if (!data) {
      throw new Error('Data is required');
    }
  }

  protected addMetadata(content: string): string {
    return `${content}\n\n---\nGenerated: ${new Date().toISOString()}`;
  }
}

export class ExecutiveSummaryGenerator extends ReportGenerator {
  protected processData(data: any): any {
    return {
      title: data.title || 'Executive Summary',
      summary: data.summary || '',
      keyPoints: data.keyPoints || []
    };
  }

  protected formatContent(data: any): string {
    let content = `# ${data.title}\n\n${data.summary}\n\n`;
    if (data.keyPoints.length > 0) {
      content += '## Key Points:\n';
      data.keyPoints.forEach((point: string, index: number) => {
        content += `${index + 1}. ${point}\n`;
      });
    }
    return content;
  }
}

export class EvidenceGenerator extends ReportGenerator {
  protected processData(data: any): any {
    return {
      title: data.title || 'Evidence',
      sources: data.sources || [],
      findings: data.findings || []
    };
  }

  protected formatContent(data: any): string {
    let content = `# ${data.title}\n\n`;
    
    if (data.sources.length > 0) {
      content += '## Sources:\n';
      data.sources.forEach((source: string, index: number) => {
        content += `${index + 1}. ${source}\n`;
      });
      content += '\n';
    }

    if (data.findings.length > 0) {
      content += '## Findings:\n';
      data.findings.forEach((finding: string, index: number) => {
        content += `${index + 1}. ${finding}\n`;
      });
    }

    return content;
  }
}

