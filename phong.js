// Phong illumination calculations for a given visible point on an object
class Phong {
  constructor(scene, obj, intersect) {
    this.scene = scene;
    this.obj = obj;
    this.intersect = intersect;

    this.normal = obj.getSurfaceNormal(intersect);
  }

  ambientTerm() {  // -> Color
    return cScale(this.scene.iA, this.obj.material.ambient);
  }

  diffuseTerm() {  // -> Color
    if (this.dotNormalLight < 0) {
      return new Color(0, 0, 0);
    }

    return cScaleS(
      cScale(this.obj.material.diffuse, this.light.diffuse),
      this.dotNormalLight
    );
  }

  specularTerm() {  // -> Color
    if (this.dotNormalLight < 0) {
      return new Color(0, 0, 0);
    }

    const reflectance = vSub(vScale(this.normal, 2 * this.dotNormalLight), this.lUnit);

    // View unit
    const view = vSub(this.scene.camera, this.intersect);
    const viewUnit = vScale(view, 1 / vLength(view));

    const dotViewReflect = vDotProduct(viewUnit, reflectance);

    return cScaleS(
      cScale(this.obj.material.specular, this.light.specular),
      Math.pow(dotViewReflect, this.obj.material.shininess)
    );
  }

  isInShadow() {  // -> Boolean
    const shadowRay = new Ray(  // intersection --> light
      this.intersect,
      vSub(this.light.location, this.intersect)
    );

    for (let i = 0; i < this.scene.objects.length; i++) {
      const shadowT = this.scene.objects[i].intersectRay(shadowRay);
      if (0.00001 < shadowT && shadowT < 1) {
        // In shadow, don't add diffuse / specular
        return true;
      }
    }

    return false;
  }

  // Dot product of surface normal with normalized light vector
  get dotNormalLight() {  // -> dbl
    return vDotProduct(this.lUnit, this.normal);
  }

  // Normalized light vector
  get lUnit() {  // Vector
    const l = vSub(this.light.location, this.intersect);
    return vScale(l, 1 / vLength(l));
  }

  set light(light) {
    this._light = light;
  }

  get light() {
    if (!this._light) {
      throw new Error("Phong instance has no light source set.");
    }
    return this._light;
  }
}