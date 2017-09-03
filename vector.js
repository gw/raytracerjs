class Vector {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

// Get length of a Vector
function vLength(vector) {  // -> int
    return Math.sqrt(
        vDotProduct(vector, vector)
    )
}

// Add two Vectors
function vAdd(vector1, vector2) {  // -> Vector
    return new Vector(
        vector1.x + vector2.x,
        vector1.y + vector2.y,
        vector1.z + vector2.z
    );
}

// Subtract two Vectors
function vSub(vector1, vector2) {  // -> Vector
    return new Vector(
        vector1.x - vector2.x,
        vector1.y - vector2.y,
        vector1.z - vector2.z
    );
}

// Scale a Vector by a scalar
function vScale(vector, scalar) {  // -> Vector
    return new Vector(
        scalar * vector.x,
        scalar * vector.y,
        scalar * vector.z
    );
}

// Linearly interpret two vectors given a percentage
// p E [0, 1] that indicates how far you are from vector1
function vLerp(vector1, vector2, p) {  // -> Vector
    return vAdd(vScale(vector1, 1 - p), vScale(vector2, p));
}

// Get the dot product of two vectors
function vDotProduct(vector1, vector2) {  // -> int
    return vector1.x * vector2.x +
           vector1.y * vector2.y +
           vector1.z * vector2.z;
}