class RayTracer {
  constructor(scene, width, height) {
    this.scene = scene;
    this.width = width;
    this.height = height;
  }

  // Cast a set of rays from the camera to the image plane
  // given a set of (x, y) coordinates on the drawing canvas
  castToPlane(x, y) {
    const alpha = x / this.width;
    const beta = y / this.height;
    const dAlpha = 1 / this.width;
    const dBeta = 1 / this.height;

    const rays = [];

    // BLERP x 4, for supersampling
    let top = vLerp(this.scene.imgPlane.topLeft, this.scene.imgPlane.topRight, alpha)
    let bot = vLerp(this.scene.imgPlane.bottomLeft, this.scene.imgPlane.bottomRight, alpha)
    let p = vLerp(top, bot, beta);
    let rayDirection = vSub(p, this.scene.camera);
    rays.push(new Ray(p, rayDirection));

    top = vLerp(this.scene.imgPlane.topLeft, this.scene.imgPlane.topRight, alpha)
    bot = vLerp(this.scene.imgPlane.bottomLeft, this.scene.imgPlane.bottomRight, alpha)
    p = vLerp(top, bot, beta + dBeta / 2);  // Half beta step
    rayDirection = vSub(p, this.scene.camera);
    rays.push(new Ray(p, rayDirection));

    top = vLerp(this.scene.imgPlane.topLeft, this.scene.imgPlane.topRight, alpha + dAlpha / 2)  // Half alpha steps
    bot = vLerp(this.scene.imgPlane.bottomLeft, this.scene.imgPlane.bottomRight, alpha + dAlpha / 2)
    p = vLerp(top, bot, beta);
    rayDirection = vSub(p, this.scene.camera);
    rays.push(new Ray(p, rayDirection));

    top = vLerp(this.scene.imgPlane.topLeft, this.scene.imgPlane.topRight, alpha + dAlpha / 2)  // Half alpha steps
    bot = vLerp(this.scene.imgPlane.bottomLeft, this.scene.imgPlane.bottomRight, alpha + dAlpha / 2)
    p = vLerp(top, bot, beta + dBeta / 2);  // Half beta step
    rayDirection = vSub(p, this.scene.camera);
    rays.push(new Ray(p, rayDirection));

    return rays;
  }

  // Calculate the color of a given point on the image plane,
  // given a ray cast from the camera to the inage plane
  traceRay(ray, numBounces) {  // (Ray, int) -> Color
    let {t, objIndex} = nearestIntersect(this.scene.objects, ray);

    // If no object intersection, color pixel black.
    // Nothing to see!
    let color = new Color(0, 0, 0);
    if (objIndex === null) return color;

    const obj = this.scene.objects[objIndex];

    const intersectPoint = vAdd(
      ray.origin,
      vScale(ray.direction, t)
    );

    const phong = new Phong(this.scene, obj, intersectPoint);

    // Add ambient term outside of lights loop b/c
    // we don't want to add the ambient term once
    // for each light
    color = cAdd(color, phong.ambientTerm());

    // Phong illumination
    this.scene.lights.forEach(light => {
      phong.light = light;
      if (phong.isInShadow()) return;
      color = cAdd(color, phong.diffuseTerm());
      color = cAdd(color, phong.specularTerm());
    });

    // Reflections
    if (numBounces > 0) {
      // Invert + normalize incoming ray
      const refViewV = vScale(ray.direction, -1);
      const refViewVUnit = vScale(refViewV, 1 / vLength(refViewV));

      // Reflect incoming ray
      const surfaceNormal = obj.getSurfaceNormal(intersectPoint);
      const dotRefViewUnitNormal = vDotProduct(refViewVUnit, surfaceNormal);
      const refV = vSub(vScale(surfaceNormal, 2 * dotRefViewUnitNormal), refViewVUnit);

      const refRay = new Ray(
        vAdd(intersectPoint, vScale(refV, 0.0001)),  // Avoid self-reflection
        refV
      );

      const refColor = this.traceRay(refRay, numBounces - 1);

      color = cAdd(color, cScale(refColor, obj.material.reflectiveness));
    }

    // Clamp to [0, 1]
    color.r = Math.max(Math.min(color.r, 1), 0);
    color.g = Math.max(Math.min(color.g, 1), 0);
    color.b = Math.max(Math.min(color.b, 1), 0);

    return color;
  }
}

// Given a Ray and an array of objects, find the smallest `t`
// such that the Vector <Ray.origin + t(Ray.direction)> intersects with
// one of the objects.
// Returns `t` and the index of the intersected object within the object
// array. If no intersection, returns {Infinity, null};
function nearestIntersect(objects, ray) {  // ([objects], Ray) -> {dbl, dbl}
  let objIndex = null;

  const t = objects.reduce((oldT, obj, i) => {
    // Get closest intersection of the cast ray with a sphere
    const newT = obj.intersectRay(ray);

    if (newT >= 0 && newT < oldT) {
      // New smallest valid intersection
      objIndex = i;
      return newT;
    }

    return oldT;
  }, Infinity);

  return {t, objIndex};
}