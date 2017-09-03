// Cast a ray from a camera to a point on an image plane,
// given an image height/width and x,y coords in the image,
// with (0, 0) being at the top left of the image
function rayFromXY(imgPlane, camera, x, y, w, h) {  // -> Ray
  const alpha = x / w;
  const beta = y / h;

  // BLERP
  const top = vLerp(imgPlane.topLeft, imgPlane.topRight, alpha)
  const bot = vLerp(imgPlane.bottomLeft, imgPlane.bottomRight, alpha)
  const p = vLerp(top, bot, beta);

  const rayDirection = vSub(p, camera);

  return new Ray(p, rayDirection);
}

// Find smallest scalar t such that o + td
// intersects with the given Sphere, where o
// and d are the Vectors that represent the origin
// and direction of the Ray, respectively.
// Returns -1 if no intersection.
// 0 is valid, as that means that the intersection point
// lies directly on the image plane (b/c the origin of the Ray
// is p, see above)
function intersectRaySphere(ray, sphere) {  // (Ray, Sphere) -> int
  // at**2 + bt + c = 0

  // a, (len(d)**2), squared length of ray's direction
  const a = vDotProduct(ray.direction, ray.direction);

  // b, 2<c', d>, 2 times dot product of vector from ray
  // origin to sphere center and ray direction
  const cPrime = vSub(ray.origin, sphere.center);
  const b = 2 * vDotProduct(cPrime, ray.direction);

  // c, len(c')**2 - r**2, squared length of vector from
  // ray origin to sphere center - radius squared
  const c = vDotProduct(cPrime, cPrime) - Math.pow(sphere.radius, 2);

  // Discriminant, b**2 - 4ac
  const discriminant = Math.pow(b, 2) - (4*a*c);

  if (discriminant < 0) {
    // t can't be real number
    return -1;
  }

  // t is negative or positive
  // Apply quadratic formula:
  // t = (-b +- sqrt(d)) / 2a
  const tPlus = (-b + Math.sqrt(discriminant)) / (2 * a);
  const tMinus = (-b - Math.sqrt(discriminant)) / (2 * a);

  if (tPlus < 0 && tMinus < 0) {
    // Both intersections are before image plane
    return -1;
  }

  // At least one t is positive
  // We want to return the smallest positive one, as
  // that represents the visible intersection, of which
  // there may be 0, 1, or 2 with spheres, which mean
  // no intersection, 1 intersection (tangent), and 2
  // intersections, respectively
  return Math.min(
    Math.max(tPlus, 0),
    Math.max(tMinus, 0)
  );
}

