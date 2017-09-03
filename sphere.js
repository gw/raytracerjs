class Sphere {
    // Vector, scalar, Color, Material
    constructor(center, radius, material) {
        this.center = center;
        this.radius = radius;
        this.material = material;
    }
}

function getSurfaceNormal(sphere, point) {  // (Sphere, Vector) -> Vector (unit)
    const direction = vSub(point, sphere.center);
    return vScale(direction, 1 / vLength(direction));
}