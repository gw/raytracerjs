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
const WIDTH = 256 * 6;
const HEIGHT = 192 * 6;
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
  iA: new Color(0.6, 0.6, 0.6),  // Ambient intensity
  objects: [
    // Small yellow
    new Sphere(
      new Vector(-0.9, 0.2, 0.4),
      0.1,
      new Material(
        new Color(0.2, 0.1, 0.1),  // Ambient
        new Color(0.9, 0.9, 0.2),  // Diffuse
        new Color(0.7, 0.7, 0.7),  // Specular
        new Color(0.1, 0.1, 0.2),  // Reflectiveness
        20                         // Shininess
      )
    ),
    // Medium blue
    new Sphere(
      new Vector(-0.5, -0.7, 0.4),
      0.2,
      new Material(
        new Color(0.1, 0.1, 0.2),  // Ambient
        new Color(0.3, 0.1, 0.6),  // Diffuse
        new Color(0.7, 0.7, 0.7),  // Specular
        new Color(0.3, 0.3, 0.7),  // Reflectiveness
        50                         // Shininess
      )
    ),
    // Small blue
    new Sphere(
      new Vector(-0.1, -0.2, 0.2),
      0.05,
      new Material(
        new Color(0.1, 0.1, 0.1),  // Ambient
        new Color(0.5, 0.5, 0.9),  // Diffuse
        new Color(0.7, 0.7, 0.7),  // Specular
        new Color(0.1, 0.1, 0.2),  // Reflectiveness
        20                         // Shininess
      )
    ),
    // Red
    new Sphere(
      new Vector(-0.6, 0.4, -0.5),
      0.8,
      new Material(
        new Color(0.1, 0.1, 0.1),  // Ambient
        new Color(0.7, 0.4, 0.4),  // Diffuse
        new Color(0.7, 0.7, 0.7),  // Specular
        new Color(0.9, 0.7, 0.7),  // Reflectiveness
        200                         // Shininess
      )
    ),
    // Green
    new Sphere(
      new Vector(1.1, -0.6, -0.5),
      0.6,
      new Material(
        new Color(0.1, 0.2, 0.1),  // Ambient
        new Color(0.1, 0.4, 0.1),  // Diffuse
        new Color(0.9, 0.9, 0.9),  // Specular
        new Color(0.8, 0.9, 0.8),  // Reflectiveness
        200                         // Shininess
      )
    ),
    // Big blue
    new Sphere(
      new Vector(1.6, 1.2, -3.5),
      1,
      new Material(
        new Color(0.1, 0.2, 0.6),  // Ambient
        new Color(0.1, 0.2, 0.6),  // Diffuse
        new Color(0.9, 0.9, 0.9),  // Specular
        new Color(0.8, 0.9, 0.8),  // Reflectiveness
        200                         // Shininess
      )
    ),
  ],
  lights: [
    new Light(
      new Vector(-3, -0.5, 1),
      new Color(0.8, 0.3, 0.3),
      new Color(0.8, 0.8, 0.8)
    ),
    new Light(
      new Vector(3, 2, 1),
      new Color(0.6, 0.2, 0.7),
      new Color(0.8, 0.8, 0.8)
    ),
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