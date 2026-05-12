interface GridBlock { color: string; }
interface GridLike { cols: number; rows: number; grid: GridBlock[][]; }

interface PatternData {
  unit: string;
  pattern: string[][];
}

interface MatchedPattern {
  unit: string;
  position: { row: number; col: number };
  pattern: string[][];
  size: { width: number; height: number };
}

export class PatternMatcher {
  private grid: GridLike;
  private patterns: PatternData[] = [];

  constructor(grid: GridLike) {
    this.grid = grid;
  }

  setPatterns(patterns: PatternData[]): void {
    this.patterns = patterns;
  }

  matchPatterns(): MatchedPattern[] {
    const matched: MatchedPattern[] = [];
    const startingPoints = [
      { row: 4, col: 0 },
      { row: 4, col: 2 },
      { row: 4, col: 4 },
    ];

    for (const startPoint of startingPoints) {
      const atPoint: MatchedPattern[] = [];

      for (const pattern of this.patterns) {
        const patternWidth = pattern.pattern[0].length;
        const patternHeight = pattern.pattern.length;
        if (
          startPoint.col + patternWidth <= this.grid.cols &&
          startPoint.row - patternHeight >= 0 &&
          this.checkPattern(startPoint, pattern)
        ) {
          atPoint.push({
            unit: pattern.unit,
            position: { row: startPoint.row, col: startPoint.col },
            pattern: pattern.pattern,
            size: { width: patternWidth, height: patternHeight },
          });
        }
      }

      if (atPoint.length > 0) {
        atPoint.sort((a, b) => b.pattern[0].length - a.pattern[0].length);
        matched.push(atPoint[0]);
        startPoint.col += atPoint[0].pattern[0].length;
      }
    }

    return matched;
  }

  private checkPattern(startPoint: { row: number; col: number }, pattern: PatternData): boolean {
    for (let row = 0; row < pattern.pattern.length; row++) {
      for (let col = 0; col < pattern.pattern[row].length; col++) {
        if (pattern.pattern[row][col] !== this.grid.grid[startPoint.row - row][startPoint.col + col].color) {
          return false;
        }
      }
    }
    return true;
  }
}
