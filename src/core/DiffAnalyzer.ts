/**
 * Core diff analysis module for AutoPR
 * Analyzes git diffs and extracts meaningful information
 */

export interface DiffAnalysis {
  summary: string;
  filesChanged: number;
  additions: number;
  deletions: number;
  keyChanges: string[];
  languageBreakdown: Record<string, number>;
}

export interface FileChange {
  filename: string;
  additions: number;
  deletions: number;
  language: string;
}

export class DiffAnalyzer {
  private readonly LANGUAGE_EXTENSIONS: Record<string, string> = {
    '.js': 'JavaScript',
    '.ts': 'TypeScript',
    '.py': 'Python',
    '.go': 'Go',
    '.rs': 'Rust',
    '.java': 'Java',
    '.cpp': 'C++',
    '.cs': 'C#',
    '.rb': 'Ruby',
    '.php': 'PHP',
    '.html': 'HTML',
    '.css': 'CSS',
    '.json': 'JSON',
    '.md': 'Markdown',
    '.yaml': 'YAML',
    '.yml': 'YAML'
  };

  async analyze(diff: string): Promise<DiffAnalysis> {
    if (!diff.trim()) {
      return {
        summary: 'No changes detected',
        filesChanged: 0,
        additions: 0,
        deletions: 0,
        keyChanges: [],
        languageBreakdown: {}
      };
    }

    const fileChanges = this.parseDiff(diff);
    const stats = this.calculateStats(fileChanges);
    const keyChanges = this.extractKeyChanges(fileChanges);
    const languageBreakdown = this.getLanguageBreakdown(fileChanges);

    // Generate a basic summary
    const summary = this.generateSummary(stats, languageBreakdown);

    return {
      summary,
      filesChanged: fileChanges.length,
      additions: stats.additions,
      deletions: stats.deletions,
      keyChanges,
      languageBreakdown
    };
  }

  private parseDiff(diff: string): FileChange[] {
    const lines = diff.split('\n');
    const fileChanges: FileChange[] = [];
    let currentFile: string | null = null;
    let currentAdditions = 0;
    let currentDeletions = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check for diff --git format (new style)
      if (line.startsWith('diff --git a/')) {
        // Save previous file if exists
        if (currentFile !== null) {
          fileChanges.push({
            filename: currentFile,
            additions: currentAdditions,
            deletions: currentDeletions,
            language: this.detectLanguage(currentFile)
          });
          currentAdditions = 0;
          currentDeletions = 0;
        }
        // Extract filename from the last part after space
        const parts = line.split(' ');
        if (parts.length >= 3) {
          currentFile = parts[parts.length - 1].replace('b/', '');
        }
        continue;
      }

      // Check for new unified diff format (--- a/ filename)
      // Only process if we haven't already set currentFile from diff --git
      if (line.startsWith('--- a/') && currentFile === null) {
        // Extract filename
        const match = line.match(/--- a\/(.+)/);
        if (match) {
          currentFile = match[1];
        }
        continue;
      }

      // Check for +++ b/ (this confirms the file change started above)
      if (line.startsWith('+++ b/') && currentFile !== null) {
        // This is just confirmation, no need to process
        continue;
      }

      // Count additions and deletions
      if (currentFile !== null) {
        if (line.startsWith('+') && !line.startsWith('+++')) {
          currentAdditions++;
        } else if (line.startsWith('-') && !line.startsWith('---')) {
          currentDeletions++;
        }
      }
    }

    // Don't forget to add the last file
    if (currentFile !== null) {
      fileChanges.push({
        filename: currentFile,
        additions: currentAdditions,
        deletions: currentDeletions,
        language: this.detectLanguage(currentFile)
      });
    }

    return fileChanges;
  }

  private detectLanguage(filename: string): string {
    const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
    return this.LANGUAGE_EXTENSIONS[ext] || 'Unknown';
  }

  private calculateStats(fileChanges: FileChange[]): { additions: number; deletions: number } {
    let totalAdditions = 0;
    let totalDeletions = 0;

    for (const change of fileChanges) {
      totalAdditions += change.additions;
      totalDeletions += change.deletions;
    }

    return { additions: totalAdditions, deletions: totalDeletions };
  }

  private extractKeyChanges(fileChanges: FileChange[]): string[] {
    // Sort by total changes (additions + deletions)
    const sortedChanges = [...fileChanges].sort(
      (a, b) => (b.additions + b.deletions) - (a.additions + a.deletions)
    );

    // Return top 5 most changed files
    return sortedChanges.slice(0, 5).map(change => 
      `${change.filename} (+${change.additions}, -${change.deletions})`
    );
  }

  private getLanguageBreakdown(fileChanges: FileChange[]): Record<string, number> {
    const breakdown: Record<string, number> = {};

    for (const change of fileChanges) {
      if (breakdown[change.language]) {
        breakdown[change.language] += change.additions + change.deletions;
      } else {
        breakdown[change.language] = change.additions + change.deletions;
      }
    }

    return breakdown;
  }

  private generateSummary(stats: { additions: number; deletions: number }, languageBreakdown: Record<string, number>): string {
    const totalChanges = stats.additions + stats.deletions;
    const languages = Object.keys(languageBreakdown).filter(lang => lang !== 'Unknown');
    
    let summary = `This PR contains ${totalChanges} lines of changes `;
    if (languages.length > 0) {
      summary += `across ${languages.join(', ')} `;
    }
    summary += `(${stats.additions} additions, ${stats.deletions} deletions).`;

    return summary;
  }
}
