import { Category } from "../common";

export interface IPost {
  title: string;
  link: string;
  author: string;
  hashtags: string[] | null;
  imgSrc: string | null;
  views: number;
  liked: number;
  created: number;
  category: Category;
}
