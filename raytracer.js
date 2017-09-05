class RayTracer {
  constructor(scene, width, height) {
    this.scene = scene;
    this.width = width;
    this.height = height;
  }

  castToPlane(x, y) {
    const alpha = x / this.width;
    const beta = y / this.height;
    const dAlpha = 1 / this.width;
    const dBeta = 1 / this.height;

    const rays = [];

    // BLERP x 4
    let top = vLerp(this.scene.imgPlane.topLeft, this.scene.imgPlane.topRight, alpha)
    let bot = vLerp(this.scene.imgPlane.bottomLeft, this.scene.imgPlane.bottomRight, alpha)
    let p = vLerp(top, bot, beta);
    let rayDirection = vSub(p, this.scene.camera);
    rays.push(new Ray(p, rayDirection));

    top = vLerp(this.scene.imgPlane.topLeft, this.scene.imgPlane.topRight, alpha)
    bot = vLerp(this.scene.imgPlane.bottomLeft, this.scene.imgPlane.bottomRight, alpha)
    p = vLerp(top, bot, beta + dBeta / 2);
    rayDirection = vSub(p, this.scene.camera);
    rays.push(new Ray(p, rayDirection));

    top = vLerp(this.scene.imgPlane.topLeft, this.scene.imgPlane.topRight, alpha + dAlpha / 2)
    bot = vLerp(this.scene.imgPlane.bottomLeft, this.scene.imgPlane.bottomRight, alpha + dAlpha / 2)
    p = vLerp(top, bot, beta);
    rayDirection = vSub(p, this.scene.camera);
    rays.push(new Ray(p, rayDirection));

    top = vLerp(this.scene.imgPlane.topLeft, this.scene.imgPlane.topRight, alpha + dAlpha / 2)
    bot = vLerp(this.scene.imgPlane.bottomLeft, this.scene.imgPlane.bottomRight, alpha + dAlpha / 2)
    p = vLerp(top, bot, beta + dBeta / 2);
    rayDirection = vSub(p, this.scene.camera);
    rays.push(new Ray(p, rayDirection));

    return rays;

  }

  traceRay(ray, numBounces) {  // (Ray, int) -> Color
    // If no intersection, color pixel black
    let color = new Color(0, 0, 0);

    // Pointer to Sphere, to find surface normal
    // after getting smallest t
    let intersectedSphere = false;

    // INTERSECTION?
    const t = this.scene.objects.reduce((accumT, sphere) => {
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

        const refColor = this.traceRay(refRay, numBounces - 1);

        color = cAdd(color, cScale(refColor, intersectedSphere.material.reflectiveness));
      }

      // PHONG
      // AMBIENT
      const ambientTerm = cScale(this.scene.iA, intersectedSphere.material.ambient);
      color = cAdd(color, ambientTerm);

      this.scene.lights.forEach((light) => {
        // CHECK SHADOWS
        const shadowRay = new Ray(
          intersectPoint,
          vSub(light.location, intersectPoint)
        );

        for (let i = 0; i < this.scene.objects.length; i++) {
          const shadowT = intersectRaySphere(shadowRay, this.scene.objects[i]);
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
          const view = vSub(this.scene.camera, intersectPoint);
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

