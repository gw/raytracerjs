class Color {
    // [0,1]
    constructor(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }
}

// Scale a Color by a reflective constant (also a Color)
function cScale(color, rgbScale) {  // (Color, Color) -> Color
    return new Color(
        color.r * rgbScale.r,
        color.g * rgbScale.g,
        color.b * rgbScale.b
    );
}

// Scale a Color by an integer scalar
function cScaleS(color, scalar) {  // (Color, int) -> Color
    return new Color(
        color.r * scalar,
        color.g * scalar,
        color.b * scalar
    );
}

// Add two Colors, component-wise
function cAdd(color, rgbAdd) {  // (Color, Color) -> Color
    return new Color(
        color.r + rgbAdd.r,
        color.g + rgbAdd.g,
        color.b + rgbAdd.b
    );
}
