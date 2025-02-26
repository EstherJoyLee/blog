import { Timestamp } from "firebase/firestore";

export interface IPostState {
  id: string;
  title?: string;
  content?: string;
  imageUrl?: string;
  isPublic?: boolean;
  authorUid?: string;
  createdAt?: Timestamp;
  folderId?: string;
}

export interface IFolderProps {
  folders: {
    id: string;
    name: string;
    authorUid: string;
    blogUrl: string;
  }[];
  selectedFolder?: string | null;
  postsByFolder?: Record<string, IPostState[]>;
  searchQuery?: string;
}
