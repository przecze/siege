import Unit from './unit';

class Infantry extends Unit {
  constructor(scene, x, y) {
    super(scene, x, y, 'infantry', 100, 1);
  }
}

export default Infantry;

