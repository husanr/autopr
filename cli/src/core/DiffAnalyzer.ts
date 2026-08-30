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

    const lines = diff.split('\n');
    const fileChanges: Array<{ filename: string; additions: number; deletions: number }> = [];
    let currentFile: string | null = null;
    let currentAdditions = 0;
    let currentDeletions = 0;

    for (const line of lines) {
      // Check for file header (diff --git format)
      if (line.startsWith('diff --git')) {
        // Save previous file if exists
        if (currentFile !== null) {
          fileChanges.push({
            filename: currentFile,
            additions: currentAdditions,
            deletions: currentDeletions
          });
        }
        
        // Extract filename from the last part after space
        const parts = line.split(' ');
        if (parts.length >= 3) {
          currentFile = parts[parts.length - 1].replace('b/', '');
          currentAdditions = 0;
          currentDeletions = 0;
        }
      }
      // Count additions and deletions (skip header lines)
      else if (currentFile !== null && !line.startsWith('@@') && 
               !line.startsWith('index ') && !line.startsWith('---') && 
               !line.startsWith('+++')) {
        if (line.startsWith('+')) {
          currentAdditions++;
        } else if (line.startsWith('-')) {
          currentDeletions++;
        }
      }
    }

    // Add the last file if it exists
    if (currentFile !== null) {
      fileChanges.push({
        filename: currentFile,
        additions: currentAdditions,
        deletions: currentDeletions
      });
    }

    if (fileChanges.length === 0) {
      return {
        summary: 'No changes detected',
        filesChanged: 0,
        additions: 0,
        deletions: 0,
        keyChanges: [],
        languageBreakdown: {}
      };
    }

    const stats = this.calculateStats(fileChanges);
    const keyChanges = this.extractKeyChanges(fileChanges);
    const languageBreakdown = this.getLanguageBreakdown(fileChanges);
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

  private calculateStats(fileChanges: Array<{ filename: string; additions: number; deletions: number }>): { additions: number; deletions: number } {
    let totalAdditions = 0;
    let totalDeletions = 0;

    for (const change of fileChanges) {
      totalAdditions += change.additions;
      totalDeletions += change.deletions;
    }

    return { additions: totalAdditions, deletions: totalDeletions };
  }

  private extractKeyChanges(fileChanges: Array<{ filename: string; additions: number; deletions: number }>): string[] {
    // Sort by total changes (additions + deletions)
    const sortedChanges = [...fileChanges].sort(
      (a, b) => (b.additions + b.deletions) - (a.additions + a.deletions)
    );

    // Return top 5 most changed files
    return sortedChanges.slice(0, 5).map(change => 
      `${change.filename} (+${change.additions}, -${change.deletions})`
    );
  }

  private getLanguageBreakdown(fileChanges: Array<{ filename: string; additions: number; deletions: number }>): Record<string, number> {
    const breakdown: Record<string, number> = {};

    for (const change of fileChanges) {
      const ext = change.filename.substring(change.filename.lastIndexOf('.')).toLowerCase();
      const language = this.LANGUAGE_EXTENSIONS[ext] || 'Unknown';
      
      if (breakdown[language]) {
        breakdown[language] += change.additions + change.deletions;
      } else {
        breakdown[language] = change.additions + change.deletions;
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