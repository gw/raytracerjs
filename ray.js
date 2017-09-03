class Ray {
    // Vector, Vector
    constructor(origin, direction) {
        this.origin = origin;
        this.direction = direction;
    }

    // TODO this is duplicated on Vector
    length() {
        const x = this.direction.x;
        const y = this.direction.y;
        return Math.sqrt(Math.pow(x, 2), Math.pow(y, 2));
    }
}