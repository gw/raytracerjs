// TODO
// Add new shapes
// Investigate stretching with shapes towards edge of image

// Init image
const WIDTH = 256 * 2;
const HEIGHT = 192 * 2;

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
const camera = new Vector(0, 0, 1);

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

// Render
for (let y = 0; y < HEIGHT; y++) {
  for (let x = 0; x < WIDTH; x++) {
    let ray = rayFromXY(imgPlane, camera, x, y, WIDTH, HEIGHT);

    let color = new Color(0, 0, 0);  // Default to black

    const t = spheres.reduce((accumT, sphere) => {
      const newT = intersectRaySphere(ray, sphere);

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