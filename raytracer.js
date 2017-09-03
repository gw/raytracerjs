// TODO
// Add new shapes
// Investigate stretching with shapes towards edge of image

const WIDTH = 256 * 0.5;
const HEIGHT = 192 * 0.5;

const image = new Image(WIDTH, HEIGHT);
document.image = image;

// Init image plane
const imgPlane = new ImgPlane(
  new Vector(-1, 0.75, 0),
  new Vector(1, 0.75, 0),
  new Vector(-1, -0.75, 0),
  new Vector(1, -0.75, 0)
)

// Init camera
const cam = new Vector(0, 0, 1);

// Add some colors
const red = new Color(1, 0, 0);
const blue = new Color(0, 0, 1);
const green = new Color(0, 1, 0);

// Add spheres
const spheres = [
  new Sphere(
    new Vector(4.2, 0, -4),
    1,
    red
  ),
  new Sphere(
    new Vector(-3.5, 0, -4),
    1,
    blue
  ),
  new Sphere(
    new Vector(0, 1.2, -4),
    2,
    green
  ),
];

// RAYTRACE
function rayFromXY(x, y) {
  const alpha = x / WIDTH;
  const beta = y / HEIGHT;

  // BLERP
  const top = imgPlane.topLeft.lerp(alpha, imgPlane.topRight);
  const bot = imgPlane.bottomLeft.lerp(alpha, imgPlane.bottomRight);
  const p = top.lerp(beta, bot);

  const rayDirection = p.sub(cam);

  return new Ray(p, rayDirection);
}

// RAY-SPHERE INTERSECTIONS
// Ray, Sphere -> dbl
// Returns 0 if no intersection
function interRaySphere(ray, sphere) {
  // at**2 + bt + c = 0

  // a, (len(d)**2), squared length of ray's direction
  const a = Math.pow(ray.direction.length(), 2);

  // b, 2<c', d>, 2 times dot product of vector from ray
  // origin to sphere center and ray direction
  const cPrime = ray.origin.sub(sphere.center);
  const b = 2 * cPrime.dotProduct(ray.direction);

  // c, len(c')**2 - r**2, squared length of vector from
  // ray origin to sphere center - radius squared
  const c = Math.pow(cPrime.length(), 2) - Math.pow(sphere.radius, 2);

  // Discriminant, b**2 - 4ac
  const discriminant = Math.pow(b, 2) - (4*a*c);

  // t can't be real number
  if (discriminant < 0) {
    return -1;
  }

  // t is negative or positive
  // Apply quadratic formula:
  // t = (-b +- sqrt(d)) / 2a
  const tPlus = (-b + Math.sqrt(discriminant)) / (2 * a);
  const tMinus = (-b - Math.sqrt(discriminant)) / (2 * a);

  // One t may be negative while other is positive
  return Math.min(
    Math.max(tPlus, 0),
    Math.max(tMinus, 0)
  );
}

// Render
for (let y = 0; y < HEIGHT; y++) {
  for (let x = 0; x < WIDTH; x++) {
    let ray = rayFromXY(x, y);

    let color = new Color(0, 0, 0);  // Default to black

    const t = spheres.reduce((accumT, sphere) => {
      const newT = interRaySphere(ray, sphere);

      // Intersection!
      if (newT >= 0 && newT < accumT) {
        color = sphere.color;
        return newT;
      }

      return accumT;
    }, Infinity);

    image.putPixel(x, y, {
      r: color.r * 255,
      g: color.g * 255,
      b: color.b * 255
    });
  }
}

image.renderInto(document.querySelector('body'));
