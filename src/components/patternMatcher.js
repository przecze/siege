class PatternMatcher {
  constructor(grid) {
    this.grid = grid;
    this.patterns = [];
  }

    matchPatterns() {
    const matchedPatterns = [];

    // Legal starting points
    const startingPoints = [
      { row: 4, col: 0 },
      { row: 4, col: 2 },
      { row: 4, col: 4 },
    ];

    for (const startPoint of startingPoints) {
      const matchedPatternsAtPoint = [];

      for (const pattern of this.patterns) {
        const patternWidth = pattern.pattern[0].length;
        const patternHeight = pattern.pattern.length;
        // Check if pattern width fits in the remaining grid space
        if (
          startPoint.col + patternWidth <= this.grid.cols &&
          startPoint.row - patternHeight >= 0
        ) {
          if (this.checkPattern(startPoint, pattern)) {
            matchedPatternsAtPoint.push({
              unit: pattern.unit,
              position: { row: startPoint.row, col: startPoint.col },
              pattern: pattern.pattern,
              size: { width: patternWidth, height: patternHeight },
            });
          }
        }
      }

      // If multiple patterns are matched at the current starting point,
      // prioritize the one with the largest width
      if (matchedPatternsAtPoint.length > 0) {
        matchedPatternsAtPoint.sort((a, b) => {
          return b.pattern[0].length - a.pattern[0].length;
        });

        matchedPatterns.push(matchedPatternsAtPoint[0]);
        startPoint.col += matchedPatternsAtPoint[0].pattern[0].length;
      }
    }

    return matchedPatterns;
  }

  checkPattern(startPoint, pattern) {
    for (let row = 0; row < pattern.pattern.length; row++) {
      for (let col = 0; col < pattern.pattern[row].length; col++) {
        const patternColor = pattern.pattern[row][col];
        const gridColor = this.grid.grid[startPoint.row - row][startPoint.col + col].color;

        if (patternColor !== gridColor) {
          return false;
        }
      }
    }

    return true;
  }


  setPatterns(patterns) {
    this.patterns = patterns;
  }
}

export default PatternMatcher;
