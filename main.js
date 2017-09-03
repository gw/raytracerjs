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

// Add spheres, with some materials
const spheres = [
  new Sphere(
    new Vector(4.2, 0, -4),
    1,
    new Material(
      new Color(0.2, 0.8, 0.3),
      new Color(0.2, 0.8, 0.8),
      new Color(0.2, 0.9, 0.9),
    50)
  ),
  new Sphere(
    new Vector(-3.5, 0, -4),
    1,
    new Material(
      new Color(0.2, 0.8, 0.3),
      new Color(0.2, 0.8, 0.3),
      new Color(0.2, 0.9, 0.3),
    500)
  ),
  new Sphere(
    new Vector(0, 1.2, -4),
    2,
    new Material(
      new Color(0.9, 0.1, 0.3),
      new Color(0.9, 0.2, 0.3),
      new Color(0.8, 0.1, 0.3),
    20)
  ),
  // new Sphere(
  //   new Vector(0, -2, -40),
  //   2,
  //   new Material(
  //     new Color(0.9, 0.1, 0.3),
  //     new Color(0.9, 0.2, 0.3),
  //     new Color(0.8, 0.1, 0.3),
  //   20)
  // ),
];

// Add lights
const ambientLight = new Color(0.4, 0.2, 0.2);
const lights = [
  // new Light(
  //   new Vector(1, 1, -5),
  //   new Color(0.5, 0.5, 0.5),
  //   new Color(0.5, 0.5, 0.5)
  // ),
  new Light(
    new Vector(3, 0, -1),
    new Color(0.5, 0.5, 0.5),
    new Color(0.5, 0.5, 0.5)
  )
]

// Render
for (let y = 0; y < HEIGHT; y++) {
  for (let x = 0; x < WIDTH; x++) {
    // Cast ray from the camera to the point on the
    // image plane corresponding to the current pixel
    let ray = rayFromXY(imgPlane, camera, x, y, WIDTH, HEIGHT);

    // If no intersection, color pixel black
    let color = new Color(0, 0, 0);

    // Pointer to Sphere, to find surface normal
    // after getting smallest t
    let intersectedSphere = false;

    // LOOP
    const t = spheres.reduce((accumT, sphere) => {
      // Get closest intersection of the cast ray with a sphere
      const newT = intersectRaySphere(ray, sphere);

      if (newT >= 0 && newT < accumT) {
        // New smallest valid intersection
        intersectedSphere = sphere;
        return newT;
      }

      return accumT;
    }, Infinity);

    // LIGHTING
    if (intersectedSphere) {
      // Get surface normal
      const intersectPoint = vAdd(
        ray.origin,
        vScale(ray.direction, t)
      );
      const surfaceNormal = getSurfaceNormal(intersectedSphere, intersectPoint);

      // Ambient
      const ambientTerm = cScale(ambientLight, intersectedSphere.material.ambient);
      color = cAdd(color, ambientTerm);

      // Diffuse
      lights.forEach((light) => {
        // Get unit vector L
        const l = vSub(light.location, intersectPoint);
        const lUnit = vScale(l, 1 / vLength(l));

        // Interpret angle b/w light vector and normal, and use it
        // to calculate the diffuse component
        const dotNormalLight = vDotProduct(lUnit, surfaceNormal);

        if (dotNormalLight > 0) {
          const diffuseTerm = cScaleS(
            cScale(intersectedSphere.material.diffuse, light.diffuse),
            dotNormalLight
          );

          color = cAdd(color, diffuseTerm);

          // SPECULAR
          const reflectance = vSub(vScale(surfaceNormal, 2 * dotNormalLight), lUnit);

          // View unit
          const view = vSub(camera, intersectPoint);
          const viewUnit = vScale(view, 1 / vLength(view));

          const dotViewReflect = vDotProduct(viewUnit, reflectance);
          const specularTerm = cScaleS(
            cScale(intersectedSphere.material.specular, light.specular),
            Math.pow(dotViewReflect, intersectedSphere.material.shininess)
          );

          color = cAdd(color, specularTerm);
        }
      });
    }

    // CLAMP
    color.r = Math.max(Math.min(color.r, 1), 0);
    color.g = Math.max(Math.min(color.g, 1), 0);
    color.b = Math.max(Math.min(color.b, 1), 0);

    image.putPixel(x, y, {
      r: color.r * 255,
      g: color.g * 255,
      b: color.b * 255
    });
  }
}

image.renderInto(document.querySelector('body'));