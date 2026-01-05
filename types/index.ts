export interface CloudinaryImage {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  tags?: string[];
  context?: {
    custom?: {
      alt?: string;
      caption?: string;
    };
  };
}

export interface PortfolioImage extends CloudinaryImage {
  category?: string;
  alt?: string;
  caption?: string;
}

export interface Category {
  id: string;
  name: string;
  count?: number;
}

