// TODO
// Add new shapes
// Investigate stretching with shapes towards edge of image
// Refraction, Snell's Law
// Soft shadows, lights as region
// Focal point, camera as region

// Init image
const WIDTH = 256 * 2;
const HEIGHT = 192 * 2;

const image = new Image(WIDTH, HEIGHT);
document.image = image;

// Init image plane
const imgPlane = new ImgPlane(
  new Vector(-1, 0.75,  1),
  new Vector(1, 0.75,   1),
  new Vector(-1, -0.75, 1),
  new Vector(1, -0.75,  1)
)

// Init camera
const camera = new Vector(0, 0, 2);

// Add spheres, with some materials
const spheres = [
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
];

// Add lights
const ambientLight = new Color(0.3, 0.3, 0.3);
const lights = [
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

// Render
for (let y = 0; y < HEIGHT; y++) {
  for (let x = 0; x < WIDTH; x++) {
    // Cast ray from the camera to the point on the
    // image plane corresponding to the current pixel
    const rays = rayFromXY(imgPlane, camera, x, y, WIDTH, HEIGHT);

    const colors = [];

    rays.forEach(ray => {
      colors.push(traceRay(ray, 3));
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



function traceRay(ray, numBounces) {  // (Ray, int) -> Color
  // If no intersection, color pixel black
  let color = new Color(0, 0, 0);

  // Pointer to Sphere, to find surface normal
  // after getting smallest t
  let intersectedSphere = false;

  // INTERSECTION?
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

  if (intersectedSphere) {
    // Get surface normal
    const intersectPoint = vAdd(
      ray.origin,
      vScale(ray.direction, t)
    );
    const surfaceNormal = getSurfaceNormal(intersectedSphere, intersectPoint);

    // REFLECTIONS
    if (numBounces > 0) {
      // View unit vector
      const refViewV = vScale(ray.direction, -1);
      const refViewVUnit = vScale(refViewV, 1 / vLength(refViewV));

      // Reflectance unit vector
      const dotRefViewUnitNormal = vDotProduct(refViewVUnit, surfaceNormal);
      const refV = vSub(vScale(surfaceNormal, 2 * dotRefViewUnitNormal), refViewVUnit);

      // Reflectance ray
      let refRay = new Ray(
        vAdd(intersectPoint, vScale(refV, 0.0001)),
        refV
      );

      const refColor = traceRay(refRay, numBounces - 1);

      color = cAdd(color, cScale(refColor, intersectedSphere.material.reflectiveness));
    }

    // PHONG
    // AMBIENT
    const ambientTerm = cScale(ambientLight, intersectedSphere.material.ambient);
    color = cAdd(color, ambientTerm);

    lights.forEach((light) => {
      // CHECK SHADOWS
      const shadowRay = new Ray(
        intersectPoint,
        vSub(light.location, intersectPoint)
      );

      for (let i = 0; i < spheres.length; i++) {
        const shadowT = intersectRaySphere(shadowRay, spheres[i]);
        if (0.00001 < shadowT && shadowT < 1) {
          // In shadow, don't add diffuse / specular
          return;
        }
      }

      // DIFFUSE
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

  return color;
}