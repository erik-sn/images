
export interface IImage {
  id: number;
  filePath: string;
  imgUrl: string;
  included: boolean;
}

export interface ISearch {
  id: number;
  name: string;
  url: string;
  successCount: number;
  failureCount: number;
  images: IImage[];
}
