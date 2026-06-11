export const MAX_IMAGE_SIZE = 4 * 1024 * 1024; // 4MB
export const MAX_IMAGES_PER_PRODUCT = 4;
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/svg+xml",
] as const;
export const ALLOWED_IMAGE_EXTENSIONS = ["svg", "png", "jpg", "jpeg"] as const;
export const PRODUCTS_PER_PAGE = 10;
