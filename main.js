// IDEAS
// Add new shapes
// Investigate stretching with shapes towards edge of image
// Refraction, Snell's Law
// Soft shadows, lights as region
// Focal point, camera as region

// TODO
// Add a second triple type for Phong constants instead of re-using Color
// Make ray intersection methods on each object


// The in-browser canvas
const WIDTH = 256 * 2;
const HEIGHT = 192 * 2;
const image = new Image(WIDTH, HEIGHT);
document.image = image;

const SCENE = {
  // Think of as our virtual camera sensor. Whatever gets captured
  // on this sensor gets transferred to the in-browser canvas, so it
  // ought to have the same aspect ratio or else it will look skewed.
  imgPlane: {
    topLeft: new Vector(-1, 0.75, 1),
    topRight: new Vector(1, 0.75, 1),
    bottomLeft: new Vector(-1, -0.75, 1),
    bottomRight: new Vector(1, -0.75, 1),
  },
  camera: new Vector(0, 0, 2),  // The origin of rays
  iA: new Color(0.3, 0.3, 0.3),  // Ambient intensity
  objects: [
    new Sphere(
      new Vector(2.7, 2, -1),
      1,
      new Material(
        new Color(0.2, 0.8, 0.3),  // Ambient
        new Color(0.3, 0.3, 0.3),  // Diffuse
        new Color(0.2, 0.9, 0.9),  // Specular
        new Color(0.6, 0.6, 0.6),  // Reflectiveness
        50                         // Shininess
      )
    ),
    new Sphere(
      new Vector(-3.8, 0, -11),
      1,
      new Material(
        new Color(0.2, 0.8, 0.3),
        new Color(0.3, 0.3, 0.3),
        new Color(0.2, 0.9, 0.3),
        new Color(0.6, 0.6, 0.6),
        500
      )
    ),
    new Sphere(
      new Vector(0, 1.2, -10),
      2.5,
      new Material(
        new Color(0.9, 0.1, 0.3),
        new Color(0.3, 0.3, 0.3),
        new Color(0.8, 0.1, 0.3),
        new Color(0.6, 0.6, 0.6),
        20
      )
    ),
    new Sphere(
      new Vector(-6, -3, -10),
      2.5,
      new Material(
        new Color(0.3, 0.3, 0.9),
        new Color(0.3, 0.3, 0.3),
        new Color(0.3, 0.1, 0.9),
        new Color(0.3, 0.6, 0.9),
        200
      )
    ),
    new Sphere(
      new Vector(10, 8, -80),
      30,
      new Material(
        new Color(1, 0.7, 0),
        new Color(0.8, 0.5, 0),
        new Color(1, 0.7, 0),
        new Color(1, 0.7, 0),
        200
      )
    ),
  ],
  lights: [
    new Light(
      new Vector(5, 2, 5),
      new Color(0.5, 0.5, 0.5),
      new Color(0.5, 0.5, 0.5)
    ),
    new Light(
      new Vector(0, -10, 5),
      new Color(0.5, 0.5, 0.5),
      new Color(0.5, 0.5, 0.5)
    )
  ]
}

const rayTracer = new RayTracer(SCENE, WIDTH, HEIGHT);

// Render
for (let y = 0; y < HEIGHT; y++) {
  for (let x = 0; x < WIDTH; x++) {
    // Cast ray from the camera to the point on the
    // image plane corresponding to the current pixel
    const rays = rayTracer.castToPlane(x, y);

    const colors = [];

    rays.forEach(ray => {
      colors.push(rayTracer.traceRay(ray, 3));
    })

    const color = colors.reduce((accumC, color) => {
      return cAdd(accumC, color);
    })

    image.putPixel(x, y, {
      r: (color.r / colors.length) * 255,
      g: (color.g / colors.length) * 255,
      b: (color.b / colors.length) * 255
    });
  }
}

image.renderInto(document.querySelector('body'));