import { Timestamp } from "firebase/firestore";

export interface IPostState {
  id: string;
  title?: string;
  content?: string;
  isPublic?: boolean;
  authorUid?: string;
  createdAt?: string | null | Timestamp;
  updatedAt?: string | null | Timestamp;
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
