interface DataRepo {
  commit?: {
    author?: {
      name: string;
      email: string;
      date: string;
    };
    committer?: object;
    message?: string;
    tree?: object;
  };
  author?: object;
  committer?: object;
  parents?: object[];
  url?: string;
  comment_count?: number;
  verification?: object;
  payload?: string;
}

type GetRepo = (owner: string, repo: string) => Promise<DataRepo>;

export type { DataRepo, GetRepo };
