class Vector {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    // TODO this is duplicated on Ray
    length() {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));
    }

    add(vec) {
        return new Vector(
            this.x + vec.x,
            this.y + vec.y,
            this.z + vec.z
        );
    }

    sub(vec) {
        return new Vector(
            this.x - vec.x,
            this.y - vec.y,
            this.z - vec.z
        );
    }

    scale(scalar) {
        return new Vector(
            scalar * this.x,
            scalar * this.y,
            scalar * this.z
        );
    }

    // p E [0, 1]
    // p is ratio of vector between this and vec,
    // starting from this
    lerp(p, vec) {
        return this.scale(1 - p).add(vec.scale(p));
    }

    dotProduct(vec) {
        return this.x * vec.x +
            this.y * vec.y +
            this.z * vec.z;
    }
}